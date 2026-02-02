import { z } from "zod";
import { requestInsertSchema } from "@/db/zod";

// For creating requests - pick only the fields users provide
export const createRequestSchema = requestInsertSchema.pick({
	listingId: true,
	quantity: true,
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
