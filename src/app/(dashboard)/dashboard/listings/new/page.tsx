import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { ListingForm } from "@/components/listings/listing-form";

export default async function NewListingPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session?.user?.role !== "SELLER") {
		redirect("/dashboard");
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<Link
				href="/dashboard/listings"
				className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="h-4 w-4" />
				Zurück zu Meine Angebote
			</Link>
			<ListingForm />
		</div>
	);
}
