import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ListingsRepository, RequestsRepository } from "@/db/repositories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Package,
	ShoppingCart,
	Plus,
	Clock,
	Box,
	CheckCircle,
	Archive,
} from "lucide-react";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const user = session!.user;
	const isSeller = user.role === "SELLER";

	// Fetch statistics based on role
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
				<h1 className="text-2xl font-bold">Willkommen, {user.name}</h1>
				<p className="text-muted-foreground">
					{isSeller
						? "Verwalten Sie Ihre Medikamentenangebote"
						: "Finden Sie Medikamente von anderen Krankenhäusern"}
				</p>
			</div>

			{isSeller && sellerStats && sellerRequestStats && (
				<>
					{/* Inventory Overview */}
					<div>
						<h2 className="text-lg font-semibold mb-3">Bestandsübersicht</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Aktive Angebote
									</CardTitle>
									<Package className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{sellerStats.activeListings}
									</div>
									<p className="text-xs text-muted-foreground">
										von {sellerStats.totalListings} gesamt
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Gesamtbestand
									</CardTitle>
									<Box className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{sellerStats.totalInventory}
									</div>
									<p className="text-xs text-muted-foreground">
										Einheiten in aktiven Angeboten
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Reserviert
									</CardTitle>
									<Clock className="h-4 w-4 text-yellow-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-yellow-600">
										{sellerStats.reservedInventory}
									</div>
									<p className="text-xs text-muted-foreground">
										Einheiten in Anfragen
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Verfügbar
									</CardTitle>
									<CheckCircle className="h-4 w-4 text-green-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-green-600">
										{sellerStats.availableInventory}
									</div>
									<p className="text-xs text-muted-foreground">
										Einheiten frei zur Anfrage
									</p>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Request Statistics */}
					<div>
						<h2 className="text-lg font-semibold mb-3">Anfragen</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Offene Anfragen
									</CardTitle>
									<ShoppingCart className="h-4 w-4 text-yellow-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{sellerRequestStats.pendingRequests}
									</div>
									<p className="text-xs text-muted-foreground">
										{sellerRequestStats.pendingQuantity} Einheiten angefragt
									</p>
									<Link href="/dashboard/requests">
										<Button variant="link" className="px-0 text-sm">
											Anfragen verwalten
										</Button>
									</Link>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Genehmigt
									</CardTitle>
									<CheckCircle className="h-4 w-4 text-green-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-green-600">
										{sellerRequestStats.approvedRequests}
									</div>
									<p className="text-xs text-muted-foreground">
										{sellerRequestStats.approvedQuantity} Einheiten verkauft
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Abgelehnt
									</CardTitle>
									<Archive className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{sellerRequestStats.rejectedRequests}
									</div>
									<p className="text-xs text-muted-foreground">
										Anfragen abgelehnt
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Schnellaktionen
									</CardTitle>
									<Plus className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent className="space-y-2">
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
					{/* Buyer Request Statistics */}
					<div>
						<h2 className="text-lg font-semibold mb-3">Meine Anfragen</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Ausstehend
									</CardTitle>
									<Clock className="h-4 w-4 text-yellow-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-yellow-600">
										{buyerStats.pendingRequests}
									</div>
									<p className="text-xs text-muted-foreground">
										{buyerStats.pendingQuantity} Einheiten reserviert
									</p>
									<Link href="/dashboard/requests">
										<Button variant="link" className="px-0 text-sm">
											Status anzeigen
										</Button>
									</Link>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Genehmigt
									</CardTitle>
									<CheckCircle className="h-4 w-4 text-green-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-green-600">
										{buyerStats.approvedRequests}
									</div>
									<p className="text-xs text-muted-foreground">
										{buyerStats.approvedQuantity} Einheiten erhalten
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Abgelehnt
									</CardTitle>
									<Archive className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{buyerStats.rejectedRequests}
									</div>
									<p className="text-xs text-muted-foreground">
										Anfragen nicht erfüllt
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										Gesamt
									</CardTitle>
									<ShoppingCart className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{buyerStats.totalRequests}
									</div>
									<p className="text-xs text-muted-foreground">
										Anfragen insgesamt
									</p>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Quick Actions for Buyer */}
					<div>
						<h2 className="text-lg font-semibold mb-3">Schnellaktionen</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<Card>
								<CardContent className="pt-6">
									<Link href="/listings">
										<Button className="w-full">
											<Package className="h-4 w-4 mr-2" />
											Angebote durchsuchen
										</Button>
									</Link>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="pt-6">
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
