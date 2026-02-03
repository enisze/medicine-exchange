import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { eq } from "drizzle-orm";

export const UsersRepository = {
	getByEmail: async (email: string) => {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email));
		return user ?? null;
	},

	getById: async (id: string) => {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, id));
		return user ?? null;
	},

	getRoleById: async (id: string) => {
		const [user] = await db
			.select({ role: users.role })
			.from(users)
			.where(eq(users.id, id));
		return user?.role ?? null;
	},

	updateRole: async (params: { id: string; role: UserRole }) => {
		await db
			.update(users)
			.set({ role: params.role, updatedAt: new Date() })
			.where(eq(users.id, params.id));
	},

	updateRoleByEmail: async (params: { email: string; role: UserRole }) => {
		await db
			.update(users)
			.set({ role: params.role, updatedAt: new Date() })
			.where(eq(users.email, params.email));
	},
};
