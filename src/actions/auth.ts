"use server";

import { UsersRepository } from "@/db/repositories";
import { updateRoleSchema } from "@/lib/validations";
import { authActionClient } from "@/lib/safe-action";

export const updateUserRole = authActionClient
	.schema(updateRoleSchema)
	.action(async ({ parsedInput, ctx }) => {
		await UsersRepository.updateRole({
			id: ctx.user.id,
			role: parsedInput.role,
		});

		return { success: true };
	});
