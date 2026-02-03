import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
	users,
	listings,
	requests,
	userRoleEnum,
	listingStatusEnum,
	requestStatusEnum,
} from "./schema";

export const userRoleSchema = createSelectSchema(userRoleEnum);
export const listingStatusSchema = createSelectSchema(listingStatusEnum);
export const requestStatusSchema = createSelectSchema(requestStatusEnum);

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
