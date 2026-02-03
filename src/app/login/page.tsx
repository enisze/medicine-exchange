import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Package2 } from "lucide-react";

export default async function LoginPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session?.user) {
		redirect("/dashboard");
	}

	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
			<div className="mb-8 text-center">
				<div className="flex items-center justify-center gap-2 mb-4">
					<Package2 className="h-10 w-10" />
					<h1 className="text-3xl font-bold">MedExchange</h1>
				</div>
				<p className="text-muted-foreground max-w-md">
					Plattform für den Austausch überschüssiger Medikamente zwischen
					Krankenhäusern
				</p>
			</div>
			<LoginForm />
		</main>
	);
}
