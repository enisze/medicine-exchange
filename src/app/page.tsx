import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Building2 } from "lucide-react";

export default async function HomePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session?.user) {
		redirect("/dashboard");
	}

	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
			<div className="mb-8 text-center">
				<div className="flex items-center justify-center gap-3 mb-4">
					<div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
						<Building2 className="w-7 h-7 text-primary-foreground" />
					</div>
					<h1 className="text-3xl font-bold text-foreground">MedExchange</h1>
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
