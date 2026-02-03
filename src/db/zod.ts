import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users, listings, requests } from "./schema";

export const userRoleSchema = z.enum(["SELLER", "BUYER"]);
export const listingStatusSchema = z.enum([
	"DRAFT",
	"ACTIVE",
	"SOLD",
	"EXPIRED",
	"CANCELLED",
]);
export const requestStatusSchema = z.enum([
	"PENDING",
	"APPROVED",
	"REJECTED",
	"CANCELLED",
]);

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);

export const listingSelectSchema = createSelectSchema(listings);
export const listingInsertSchema = createInsertSchema(listings, {
	title: (schema) => schema.min(1, "Titel erforderlich"),
	quantity: (schema) => schema.positive("Menge muss positiv sein"),
	unit: (schema) => schema.min(1, "Einheit erforderlich"),
});

export const requestSelectSchema = createSelectSchema(requests);
export const requestInsertSchema = createInsertSchema(requests, {
	quantity: (schema) => schema.positive("Menge muss positiv sein"),
});
