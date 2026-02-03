import { db } from "@/db";
import { listings, users, type ListingInsert, type ListingStatus } from "@/db/schema";
import { eq, desc, count, and, gt, sql, ilike, or, sum } from "drizzle-orm";

type CreateListingParams = Pick<ListingInsert, "userId" | "title" | "description" | "quantity" | "unit" | "expiryDate">;

type UpdateQuantityParams = {
	id: string;
	quantity: number;
	status?: ListingStatus;
};

export const ListingsRepository = {
	create: async (params: CreateListingParams) => {
		const [listing] = await db
			.insert(listings)
			.values({
				userId: params.userId,
				title: params.title,
				description: params.description,
				quantity: params.quantity,
				unit: params.unit,
				expiryDate: params.expiryDate,
				status: "DRAFT",
			})
			.returning();
		return listing;
	},

	getById: async (id: string) => {
		const [listing] = await db
			.select()
			.from(listings)
			.where(eq(listings.id, id));
		return listing ?? null;
	},

	getByIdWithSeller: async (id: string) => {
		const [result] = await db
			.select({
				id: listings.id,
				title: listings.title,
				description: listings.description,
				quantity: listings.quantity,
				reservedQuantity: listings.reservedQuantity,
				unit: listings.unit,
				expiryDate: listings.expiryDate,
				status: listings.status,
				userId: listings.userId,
				sellerName: users.name,
			})
			.from(listings)
			.innerJoin(users, eq(listings.userId, users.id))
			.where(eq(listings.id, id));
		return result ?? null;
	},

	getByIdAndUserId: async (params: { id: string; userId: string }) => {
		const [listing] = await db
			.select()
			.from(listings)
			.where(eq(listings.id, params.id));

		if (!listing || listing.userId !== params.userId) {
			return null;
		}
		return listing;
	},

	getActiveListings: async (params?: { search?: string; page?: number; limit?: number }) => {
		const { search, page = 1, limit = 9 } = params ?? {};
		const now = new Date();
		const baseConditions = and(
			eq(listings.status, "ACTIVE"),
			gt(listings.expiryDate, now),
			gt(sql`${listings.quantity} - ${listings.reservedQuantity}`, 0)
		);

		const searchCondition = search
			? or(
					ilike(listings.title, `%${search}%`),
					ilike(listings.description, `%${search}%`)
				)
			: undefined;

		const whereCondition = searchCondition
			? and(baseConditions, searchCondition)
			: baseConditions;

		const offset = (page - 1) * limit;

		const [items, countResult] = await Promise.all([
			db
				.select({
					id: listings.id,
					title: listings.title,
					description: listings.description,
					quantity: listings.quantity,
					reservedQuantity: listings.reservedQuantity,
					unit: listings.unit,
					expiryDate: listings.expiryDate,
					sellerName: users.name,
				})
				.from(listings)
				.innerJoin(users, eq(listings.userId, users.id))
				.where(whereCondition)
				.orderBy(desc(listings.createdAt))
				.limit(limit)
				.offset(offset),
			db
				.select({ count: count() })
				.from(listings)
				.innerJoin(users, eq(listings.userId, users.id))
				.where(whereCondition),
		]);

		const total = countResult[0]?.count ?? 0;
		const totalPages = Math.ceil(total / limit);

		return {
			items,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		};
	},

	getByUserId: async (userId: string) => {
		return db
			.select()
			.from(listings)
			.where(eq(listings.userId, userId))
			.orderBy(desc(listings.createdAt));
	},

	updateStatus: async (params: { id: string; status: ListingStatus }) => {
		await db
			.update(listings)
			.set({ status: params.status, updatedAt: new Date() })
			.where(eq(listings.id, params.id));
	},

	updateQuantity: async (params: UpdateQuantityParams) => {
		const updateData: { quantity: number; updatedAt: Date; status?: ListingStatus } = {
			quantity: params.quantity,
			updatedAt: new Date(),
		};

		if (params.status) {
			updateData.status = params.status;
		}

		await db
			.update(listings)
			.set(updateData)
			.where(eq(listings.id, params.id));
	},

	delete: async (id: string) => {
		await db.delete(listings).where(eq(listings.id, id));
	},

	countByUserId: async (userId: string) => {
		const [result] = await db
			.select({ count: count() })
			.from(listings)
			.where(eq(listings.userId, userId));
		return result?.count ?? 0;
	},

	getSellerStats: async (userId: string) => {
		const now = new Date();

		const statusCounts = await db
			.select({
				status: listings.status,
				count: count(),
			})
			.from(listings)
			.where(eq(listings.userId, userId))
			.groupBy(listings.status);

		const [inventoryStats] = await db
			.select({
				totalQuantity: sum(listings.quantity),
				totalReserved: sum(listings.reservedQuantity),
			})
			.from(listings)
			.where(
				and(
					eq(listings.userId, userId),
					eq(listings.status, "ACTIVE"),
					gt(listings.expiryDate, now)
				)
			);

		const counts: Record<string, number> = {};
		for (const row of statusCounts) {
			if (row.status) counts[row.status] = row.count;
		}

		return {
			totalListings: Object.values(counts).reduce((a, b) => a + b, 0),
			activeListings: counts.ACTIVE ?? 0,
			draftListings: counts.DRAFT ?? 0,
			soldListings: counts.SOLD ?? 0,
			cancelledListings: counts.CANCELLED ?? 0,
			totalInventory: Number(inventoryStats?.totalQuantity ?? 0),
			reservedInventory: Number(inventoryStats?.totalReserved ?? 0),
			availableInventory:
				Number(inventoryStats?.totalQuantity ?? 0) -
				Number(inventoryStats?.totalReserved ?? 0),
		};
	},

	/**
	 * Atomically reserve quantity - returns true if successful.
	 * Uses WHERE clause to prevent race conditions.
	 */
	reserveQuantity: async (params: { id: string; quantity: number }) => {
		const result = await db
			.update(listings)
			.set({
				reservedQuantity: sql`${listings.reservedQuantity} + ${params.quantity}`,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(listings.id, params.id),
					eq(listings.status, "ACTIVE"),
					sql`${listings.quantity} - ${listings.reservedQuantity} >= ${params.quantity}`
				)
			)
			.returning({ id: listings.id });

		return result.length > 0;
	},

	/**
	 * Release reserved quantity (on rejection or cancellation)
	 */
	releaseReservation: async (params: { id: string; quantity: number }) => {
		await db
			.update(listings)
			.set({
				reservedQuantity: sql`${listings.reservedQuantity} - ${params.quantity}`,
				updatedAt: new Date(),
			})
			.where(eq(listings.id, params.id));
	},

	/**
	 * Fulfill reservation (on approval) - decrements both quantity and reservedQuantity.
	 * Atomically transitions to SOLD if quantity reaches 0.
	 */
	fulfillReservation: async (params: { id: string; quantity: number }) => {
		const [updated] = await db
			.update(listings)
			.set({
				quantity: sql`${listings.quantity} - ${params.quantity}`,
				reservedQuantity: sql`${listings.reservedQuantity} - ${params.quantity}`,
				status: sql`CASE WHEN ${listings.quantity} - ${params.quantity} <= 0 THEN 'SOLD' ELSE ${listings.status} END`,
				updatedAt: new Date(),
			})
			.where(eq(listings.id, params.id))
			.returning({
				id: listings.id,
				quantity: listings.quantity,
				reservedQuantity: listings.reservedQuantity,
			});

		return updated;
	},

};
