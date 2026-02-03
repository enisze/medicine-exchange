"use server";

import { UsersRepository } from "@/db/repositories";
import { setInitialRoleSchema, updateRoleSchema } from "@/lib/validations";
import { actionClient, authActionClient } from "@/lib/safe-action";

export const setInitialRole = authActionClient
	.schema(setInitialRoleSchema)
	.action(async ({ parsedInput, ctx }) => {
		if (ctx.user.email !== parsedInput.email) {
			throw new Error("Cannot set role for another user");
		}

		if (ctx.user.role !== "BUYER") {
			return { success: true };
		}

		await UsersRepository.updateRole({
			id: ctx.user.id,
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
