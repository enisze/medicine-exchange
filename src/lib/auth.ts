import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verifications,
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "BUYER",
				input: true,
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
