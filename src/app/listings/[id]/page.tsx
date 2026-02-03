import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ListingsRepository } from "@/db/repositories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { RequestForm } from "@/components/listings/request-form";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

export default async function ListingDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const listing = await ListingsRepository.getByIdWithSeller(id);

	if (!listing) {
		notFound();
	}

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const isOwner = session?.user?.id === listing.userId;
	const availableQuantity = listing.quantity - listing.reservedQuantity;
	const isExpired = listing.expiryDate <= new Date();
	const canRequest =
		session?.user && !isOwner && listing.status === "ACTIVE" && availableQuantity > 0 && !isExpired;

	return (
		<ConditionalLayout>
			<div className="max-w-2xl mx-auto space-y-6">
				<Link
					href="/listings"
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Zurück zur Übersicht
				</Link>

				<Card>
					<CardHeader>
						<div className="flex items-start justify-between">
							<CardTitle className="text-2xl">{listing.title}</CardTitle>
							<Badge
								variant={listing.status === "ACTIVE" && !isExpired ? "default" : "secondary"}
							>
								{listing.status === "CANCELLED"
									? "Storniert"
									: isExpired
										? "Abgelaufen"
										: listing.status === "ACTIVE"
											? "Verfügbar"
											: listing.status === "SOLD"
												? "Ausverkauft"
												: listing.status}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{listing.description && (
							<p className="text-muted-foreground">{listing.description}</p>
						)}

						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<p className="text-sm text-muted-foreground">Verfügbare Menge</p>
								<p className="text-lg font-semibold">
									{availableQuantity} {listing.unit}
									{listing.reservedQuantity > 0 && (
										<span className="text-sm font-normal text-muted-foreground ml-2">
											({listing.reservedQuantity} reserviert)
										</span>
									)}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Ablaufdatum</p>
								<p className="text-lg font-semibold flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									{format(listing.expiryDate, "dd. MMMM yyyy", { locale: de })}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Anbieter</p>
								<p className="text-lg font-semibold">{listing.sellerName}</p>
							</div>
						</div>

						{canRequest && (
							<div className="pt-4 border-t">
								<h3 className="font-semibold mb-4">Anfrage stellen</h3>
								<RequestForm
									listingId={listing.id}
									maxQuantity={availableQuantity}
									unit={listing.unit}
								/>
							</div>
						)}

						{!session?.user && listing.status === "ACTIVE" && !isExpired && (
							<div className="pt-4 border-t">
								<p className="text-muted-foreground mb-4">
									Melden Sie sich an, um eine Anfrage zu stellen.
								</p>
								<Link href="/">
									<Button>Anmelden</Button>
								</Link>
							</div>
						)}

						{isOwner && (
							<div className="pt-4 border-t">
								<p className="text-muted-foreground">
									Dies ist Ihr eigenes Angebot.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</ConditionalLayout>
	);
}
