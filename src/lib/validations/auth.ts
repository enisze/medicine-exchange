import { z } from "zod";
import { userRoleSchema, userInsertSchema } from "@/db/zod";

export const loginSchema = z.object({
	email: z.string().email("Ungültige E-Mail-Adresse"),
	password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
});

export const registerSchema = loginSchema.extend({
	name: z.string().min(1, "Name erforderlich"),
	role: userRoleSchema,
});

export const setInitialRoleSchema = z.object({
	email: z.string().email(),
	role: userRoleSchema,
});

export const updateRoleSchema = userInsertSchema
	.pick({ role: true })
	.required();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SetInitialRoleInput = z.infer<typeof setInitialRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
