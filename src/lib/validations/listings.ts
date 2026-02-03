import { z } from "zod";
import { listingInsertSchema } from "@/db/zod";

export const createListingSchema = listingInsertSchema
	.pick({
		title: true,
		quantity: true,
		unit: true,
	})
	.extend({
		description: z.string().optional(),
		expiryDate: z.string().min(1, "Ablaufdatum erforderlich"),
	});

export type CreateListingInput = z.infer<typeof createListingSchema>;
