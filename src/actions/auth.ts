"use server";

import { UsersRepository } from "@/db/repositories";
import { setInitialRoleSchema, updateRoleSchema } from "@/lib/validations";
import { actionClient, authActionClient } from "@/lib/safe-action";

export const setInitialRole = actionClient
	.schema(setInitialRoleSchema)
	.action(async ({ parsedInput }) => {
		const user = await UsersRepository.getByEmail(parsedInput.email);

		if (!user) {
			throw new Error("User not found");
		}

		if (user.role !== "BUYER") {
			return { success: true };
		}

		await UsersRepository.updateRoleByEmail({
			email: parsedInput.email,
			role: parsedInput.role,
		});

		return { success: true };
	});

export const updateUserRole = authActionClient
	.schema(updateRoleSchema)
	.action(async ({ parsedInput, ctx }) => {
		await UsersRepository.updateRole({
			id: ctx.user.id,
			role: parsedInput.role,
		});

		return { success: true };
	});
