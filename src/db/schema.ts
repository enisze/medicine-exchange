import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["SELLER", "BUYER"]);
export const listingStatusEnum = pgEnum("listing_status", [
	"DRAFT",
	"ACTIVE",
	"SOLD",
	"EXPIRED",
	"CANCELLED",
]);
export const requestStatusEnum = pgEnum("request_status", [
	"PENDING",
	"APPROVED",
	"REJECTED",
	"CANCELLED",
]);

export const users = pgTable("user", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	name: text("name").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	role: userRoleEnum("role").notNull().default("BUYER"),
});

export const sessions = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const listings = pgTable("listing", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	description: text("description"),
	quantity: integer("quantity").notNull(),
	reservedQuantity: integer("reserved_quantity").notNull().default(0),
	unit: text("unit").notNull(),
	expiryDate: timestamp("expiry_date").notNull(),
	status: listingStatusEnum("status").notNull().default("DRAFT"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const requests = pgTable("request", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	listingId: text("listing_id")
		.notNull()
		.references(() => listings.id, { onDelete: "cascade" }),
	buyerId: text("buyer_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	quantity: integer("quantity").notNull(),
	status: requestStatusEnum("status").notNull().default("PENDING"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
	listings: many(listings),
	requests: many(requests),
	sessions: many(sessions),
	accounts: many(accounts),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
	user: one(users, {
		fields: [listings.userId],
		references: [users.id],
	}),
	requests: many(requests),
}));

export const requestsRelations = relations(requests, ({ one }) => ({
	listing: one(listings, {
		fields: [requests.listingId],
		references: [listings.id],
	}),
	buyer: one(users, {
		fields: [requests.buyerId],
		references: [users.id],
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}));

// Inferred types from schema
export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type UserRole = User["role"];

export type Listing = typeof listings.$inferSelect;
export type ListingInsert = typeof listings.$inferInsert;
export type ListingStatus = Listing["status"];

export type Request = typeof requests.$inferSelect;
export type RequestInsert = typeof requests.$inferInsert;
export type RequestStatus = Request["status"];
