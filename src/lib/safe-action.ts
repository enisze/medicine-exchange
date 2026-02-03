import { createSafeActionClient } from "next-safe-action";
import { headers } from "next/headers";
import { auth } from "./auth";

export const actionClient = createSafeActionClient();

export const authActionClient = createSafeActionClient().use(async ({ next }) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		throw new Error("Unauthorized");
	}

	return next({
		ctx: {
			user: session.user,
			session: session.session,
		},
	});
});
