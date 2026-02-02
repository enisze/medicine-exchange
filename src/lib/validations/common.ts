import { z } from "zod";

export const idSchema = z.object({
	id: z.string(),
});

export type IdInput = z.infer<typeof idSchema>;
