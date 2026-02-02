import { db } from "@/db";
import { requests, listings, users, type RequestInsert, type RequestStatus } from "@/db/schema";
import { eq, desc, and, count, sum } from "drizzle-orm";

type CreateRequestParams = Pick<RequestInsert, "listingId" | "buyerId" | "quantity">;

export const RequestsRepository = {
	create: async (params: CreateRequestParams) => {
		const [request] = await db
			.insert(requests)
			.values({
				listingId: params.listingId,
				buyerId: params.buyerId,
				quantity: params.quantity,
				status: "PENDING",
			})
			.returning();
		return request;
	},

	getById: async (id: string) => {
		const [request] = await db
			.select()
			.from(requests)
			.where(eq(requests.id, id));
		return request ?? null;
	},

	getByBuyerId: async (buyerId: string) => {
		return db
			.select({
				id: requests.id,
				quantity: requests.quantity,
				status: requests.status,
				createdAt: requests.createdAt,
				listingTitle: listings.title,
				listingUnit: listings.unit,
				listingQuantity: listings.quantity,
				sellerName: users.name,
			})
			.from(requests)
			.innerJoin(listings, eq(requests.listingId, listings.id))
			.innerJoin(users, eq(listings.userId, users.id))
			.where(eq(requests.buyerId, buyerId))
			.orderBy(desc(requests.createdAt));
	},

	getBySellerId: async (sellerId: string) => {
		return db
			.select({
				id: requests.id,
				quantity: requests.quantity,
				status: requests.status,
				createdAt: requests.createdAt,
				listingTitle: listings.title,
				listingUnit: listings.unit,
				listingQuantity: listings.quantity,
				buyerName: users.name,
			})
			.from(requests)
			.innerJoin(listings, eq(requests.listingId, listings.id))
			.innerJoin(users, eq(requests.buyerId, users.id))
			.where(eq(listings.userId, sellerId))
			.orderBy(desc(requests.createdAt));
	},

	updateStatus: async (params: { id: string; status: RequestStatus }) => {
		await db
			.update(requests)
			.set({ status: params.status })
			.where(eq(requests.id, params.id));
	},

	countByBuyerId: async (buyerId: string) => {
		const [result] = await db
			.select({ count: count() })
			.from(requests)
			.where(eq(requests.buyerId, buyerId));
		return result?.count ?? 0;
	},

	countPendingBySellerId: async (sellerId: string) => {
		const [result] = await db
			.select({ count: count() })
			.from(requests)
			.innerJoin(listings, eq(requests.listingId, listings.id))
			.where(and(eq(listings.userId, sellerId), eq(requests.status, "PENDING")));
		return result?.count ?? 0;
	},

	getPendingByListingId: async (listingId: string) => {
		return db
			.select()
			.from(requests)
			.where(
				and(eq(requests.listingId, listingId), eq(requests.status, "PENDING"))
			);
	},

	rejectAllByListingId: async (listingId: string) => {
		await db
			.update(requests)
			.set({ status: "REJECTED" })
			.where(
				and(eq(requests.listingId, listingId), eq(requests.status, "PENDING"))
			);
	},

	getBuyerStats: async (buyerId: string) => {
		// Count by status
		const statusCounts = await db
			.select({
				status: requests.status,
				count: count(),
				totalQuantity: sum(requests.quantity),
			})
			.from(requests)
			.where(eq(requests.buyerId, buyerId))
			.groupBy(requests.status);

		const stats: Record<string, { count: number; quantity: number }> = {};
		for (const row of statusCounts) {
			if (row.status) {
				stats[row.status] = {
					count: row.count,
					quantity: Number(row.totalQuantity ?? 0),
				};
			}
		}

		return {
			totalRequests:
				(stats.PENDING?.count ?? 0) +
				(stats.APPROVED?.count ?? 0) +
				(stats.REJECTED?.count ?? 0),
			pendingRequests: stats.PENDING?.count ?? 0,
			approvedRequests: stats.APPROVED?.count ?? 0,
			rejectedRequests: stats.REJECTED?.count ?? 0,
			pendingQuantity: stats.PENDING?.quantity ?? 0,
			approvedQuantity: stats.APPROVED?.quantity ?? 0,
		};
	},

	getSellerRequestStats: async (sellerId: string) => {
		// Count by status for requests on seller's listings
		const statusCounts = await db
			.select({
				status: requests.status,
				count: count(),
				totalQuantity: sum(requests.quantity),
			})
			.from(requests)
			.innerJoin(listings, eq(requests.listingId, listings.id))
			.where(eq(listings.userId, sellerId))
			.groupBy(requests.status);

		const stats: Record<string, { count: number; quantity: number }> = {};
		for (const row of statusCounts) {
			if (row.status) {
				stats[row.status] = {
					count: row.count,
					quantity: Number(row.totalQuantity ?? 0),
				};
			}
		}

		return {
			totalRequests:
				(stats.PENDING?.count ?? 0) +
				(stats.APPROVED?.count ?? 0) +
				(stats.REJECTED?.count ?? 0),
			pendingRequests: stats.PENDING?.count ?? 0,
			approvedRequests: stats.APPROVED?.count ?? 0,
			rejectedRequests: stats.REJECTED?.count ?? 0,
			pendingQuantity: stats.PENDING?.quantity ?? 0,
			approvedQuantity: stats.APPROVED?.quantity ?? 0,
		};
	},
};
