import { z } from "zod";
import { requestInsertSchema } from "@/db/zod";

export const createRequestSchema = requestInsertSchema.pick({
	listingId: true,
	quantity: true,
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
