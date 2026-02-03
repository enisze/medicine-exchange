import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ListingsRepository, RequestsRepository } from "@/db/repositories";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Package,
	ShoppingCart,
	Plus,
	Clock,
	Box,
	CheckCircle,
	Archive,
	ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const user = session!.user;
	const isSeller = user.role === "SELLER";

	const sellerStats = isSeller
		? await ListingsRepository.getSellerStats(user.id)
		: null;
	const sellerRequestStats = isSeller
		? await RequestsRepository.getSellerRequestStats(user.id)
		: null;
	const buyerStats = !isSeller
		? await RequestsRepository.getBuyerStats(user.id)
		: null;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-foreground">Willkommen, {user.name}</h1>
				<p className="text-muted-foreground mt-1">
					{isSeller
						? "Verwalten Sie Ihre Medikamentenangebote"
						: "Finden Sie Medikamente von anderen Krankenhäusern"}
				</p>
			</div>

			{isSeller && sellerStats && sellerRequestStats && (
				<>
					<div>
						<h2 className="text-lg font-semibold text-foreground mb-3">Bestandsübersicht</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Aktive Angebote
											</p>
											<p className="text-2xl font-semibold text-card-foreground">
												{sellerStats.activeListings}
											</p>
											<p className="text-xs text-muted-foreground">
												von {sellerStats.totalListings} gesamt
											</p>
										</div>
										<div className="p-2.5 rounded-lg bg-primary/10">
											<Package className="h-5 w-5 text-primary" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Gesamtbestand
											</p>
											<p className="text-2xl font-semibold text-card-foreground">
												{sellerStats.totalInventory}
											</p>
											<p className="text-xs text-muted-foreground">
												Einheiten in aktiven Angeboten
											</p>
										</div>
										<div className="p-2.5 rounded-lg bg-secondary">
											<Box className="h-5 w-5 text-muted-foreground" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Reserviert
											</p>
											<p className="text-2xl font-semibold text-warning">
												{sellerStats.reservedInventory}
											</p>
											<p className="text-xs text-muted-foreground">
												Einheiten in Anfragen
											</p>
										</div>
										<div className="p-2.5 rounded-lg bg-warning/10">
											<Clock className="h-5 w-5 text-warning" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Verfügbar
											</p>
											<p className="text-2xl font-semibold text-success">
												{sellerStats.availableInventory}
											</p>
											<p className="text-xs text-muted-foreground">
												Einheiten frei zur Anfrage
											</p>
										</div>
										<div className="p-2.5 rounded-lg bg-success/10">
											<CheckCircle className="h-5 w-5 text-success" />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					<div>
						<h2 className="text-lg font-semibold text-foreground mb-3">Anfragen</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Offene Anfragen
											</p>
											<p className="text-2xl font-semibold text-card-foreground">
												{sellerRequestStats.pendingRequests}
											</p>
											<p className="text-xs text-muted-foreground">
												{sellerRequestStats.pendingQuantity} Einheiten angefragt
											</p>
											<Link
												href="/dashboard/requests"
												className="text-sm text-primary hover:underline flex items-center gap-1"
											>
												Anfragen verwalten
												<ArrowRight className="h-3 w-3" />
											</Link>
										</div>
										<div className="p-2.5 rounded-lg bg-warning/10">
											<ShoppingCart className="h-5 w-5 text-warning" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Genehmigt
											</p>
											<p className="text-2xl font-semibold text-success">
												{sellerRequestStats.approvedRequests}
											</p>
											<p className="text-xs text-muted-foreground">
												{sellerRequestStats.approvedQuantity} Einheiten verkauft
											</p>
										</div>
										<div className="p-2.5 rounded-lg bg-success/10">
											<CheckCircle className="h-5 w-5 text-success" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Abgelehnt
											</p>
											<p className="text-2xl font-semibold text-card-foreground">
												{sellerRequestStats.rejectedRequests}
											</p>
											<p className="text-xs text-muted-foreground">
												Anfragen abgelehnt
											</p>
										</div>
										<div className="p-2.5 rounded-lg bg-secondary">
											<Archive className="h-5 w-5 text-muted-foreground" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border">
								<CardContent className="p-5 space-y-3">
									<p className="text-sm text-muted-foreground">
										Schnellaktionen
									</p>
									<Link href="/dashboard/listings/new">
										<Button size="sm" className="w-full">
											<Plus className="h-4 w-4 mr-2" />
											Neues Angebot
										</Button>
									</Link>
									<Link href="/dashboard/listings">
										<Button size="sm" variant="outline" className="w-full">
											Angebote verwalten
										</Button>
									</Link>
								</CardContent>
							</Card>
						</div>
					</div>
				</>
			)}

			{!isSeller && buyerStats && (
				<>
					<div>
						<h2 className="text-lg font-semibold text-foreground mb-3">Meine Anfragen</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Ausstehend
											</p>
											<p className="text-2xl font-semibold text-warning">
												{buyerStats.pendingRequests}
											</p>
											<p className="text-xs text-muted-foreground">
												{buyerStats.pendingQuantity} Einheiten reserviert
											</p>
											<Link
												href="/dashboard/requests"
												className="text-sm text-primary hover:underline flex items-center gap-1"
											>
												Status anzeigen
												<ArrowRight className="h-3 w-3" />
											</Link>
										</div>
										<div className="p-2.5 rounded-lg bg-warning/10">
											<Clock className="h-5 w-5 text-warning" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Genehmigt
											</p>
											<p className="text-2xl font-semibold text-success">
												{buyerStats.approvedRequests}
											</p>
											<p className="text-xs text-muted-foreground">
												{buyerStats.approvedQuantity} Einheiten erhalten
											</p>
										</div>
										<div className="p-2.5 rounded-lg bg-success/10">
											<CheckCircle className="h-5 w-5 text-success" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Abgelehnt
											</p>
											<p className="text-2xl font-semibold text-card-foreground">
												{buyerStats.rejectedRequests}
											</p>
											<p className="text-xs text-muted-foreground">
												Anfragen nicht erfüllt
											</p>
										</div>
										<div className="p-2.5 rounded-lg bg-secondary">
											<Archive className="h-5 w-5 text-muted-foreground" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<div className="flex items-start justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Gesamt
											</p>
											<p className="text-2xl font-semibold text-card-foreground">
												{buyerStats.totalRequests}
											</p>
											<p className="text-xs text-muted-foreground">
												Anfragen insgesamt
											</p>
										</div>
										<div className="p-2.5 rounded-lg bg-secondary">
											<ShoppingCart className="h-5 w-5 text-muted-foreground" />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					<div>
						<h2 className="text-lg font-semibold text-foreground mb-3">Schnellaktionen</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<Link href="/listings">
										<Button className="w-full">
											<Package className="h-4 w-4 mr-2" />
											Angebote durchsuchen
										</Button>
									</Link>
								</CardContent>
							</Card>
							<Card className="bg-card border-border">
								<CardContent className="p-5">
									<Link href="/dashboard/requests">
										<Button variant="outline" className="w-full">
											<ShoppingCart className="h-4 w-4 mr-2" />
											Meine Anfragen
										</Button>
									</Link>
								</CardContent>
							</Card>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
