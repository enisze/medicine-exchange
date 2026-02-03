import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ListingsRepository } from "@/db/repositories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Package, Building2 } from "lucide-react";
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
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Zurück zur Übersicht
				</Link>

				<Card className="bg-card border-border">
					<CardHeader>
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-center gap-3">
								<div className="p-3 rounded-lg bg-primary/10">
									<Package className="h-6 w-6 text-primary" />
								</div>
								<CardTitle className="text-2xl text-card-foreground">{listing.title}</CardTitle>
							</div>
							<Badge
								variant="secondary"
								className={
									listing.status === "ACTIVE" && !isExpired
										? "bg-success/20 text-success"
										: listing.status === "SOLD"
											? "bg-primary/20 text-primary"
											: "bg-destructive/20 text-destructive"
								}
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
							<div className="p-4 rounded-lg bg-secondary/50 border border-border">
								<p className="text-sm text-muted-foreground mb-1">Verfügbare Menge</p>
								<p className="text-lg font-semibold text-card-foreground">
									{availableQuantity} {listing.unit}
									{listing.reservedQuantity > 0 && (
										<span className="text-sm font-normal text-warning ml-2">
											({listing.reservedQuantity} reserviert)
										</span>
									)}
								</p>
							</div>
							<div className="p-4 rounded-lg bg-secondary/50 border border-border">
								<p className="text-sm text-muted-foreground mb-1">Ablaufdatum</p>
								<p className="text-lg font-semibold text-card-foreground flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									{format(listing.expiryDate, "dd. MMMM yyyy", { locale: de })}
								</p>
							</div>
							<div className="p-4 rounded-lg bg-secondary/50 border border-border sm:col-span-2">
								<p className="text-sm text-muted-foreground mb-1">Anbieter</p>
								<div className="flex items-center gap-2">
									<div className="p-1.5 rounded bg-secondary">
										<Building2 className="h-4 w-4 text-muted-foreground" />
									</div>
									<p className="text-lg font-semibold text-card-foreground">{listing.sellerName}</p>
								</div>
							</div>
						</div>

						{canRequest && (
							<div className="pt-4 border-t border-border">
								<h3 className="font-semibold text-card-foreground mb-4">Anfrage stellen</h3>
								<RequestForm
									listingId={listing.id}
									maxQuantity={availableQuantity}
									unit={listing.unit}
								/>
							</div>
						)}

						{!session?.user && listing.status === "ACTIVE" && !isExpired && (
							<div className="pt-4 border-t border-border">
								<p className="text-muted-foreground mb-4">
									Melden Sie sich an, um eine Anfrage zu stellen.
								</p>
								<Link href="/">
									<Button>Anmelden</Button>
								</Link>
							</div>
						)}

						{isOwner && (
							<div className="pt-4 border-t border-border">
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
