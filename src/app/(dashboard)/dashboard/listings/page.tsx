import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ListingsRepository } from "@/db/repositories";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus, Box, AlertTriangle, Package, Calendar } from "lucide-react";
import { format, isPast } from "date-fns";
import { de } from "date-fns/locale";
import { ListingActions } from "@/components/listings/listing-actions";

export default async function MyListingsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session?.user?.role !== "SELLER") {
		redirect("/dashboard");
	}

	const myListings = await ListingsRepository.getByUserId(session.user.id);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold">Meine Angebote</h1>
					<p className="text-muted-foreground mt-1">
						Verwalten Sie Ihre Medikamentenangebote
					</p>
				</div>
				<Link href="/dashboard/listings/new">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Neues Angebot
					</Button>
				</Link>
			</div>

			{myListings.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Box className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground mb-4">
							Sie haben noch keine Angebote erstellt
						</p>
						<Link href="/dashboard/listings/new">
							<Button>Erstes Angebot erstellen</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<Card className="bg-card border-border">
					<Table>
						<TableHeader>
							<TableRow className="border-border hover:bg-transparent">
								<TableHead className="text-muted-foreground">Titel</TableHead>
								<TableHead className="text-muted-foreground">Menge</TableHead>
								<TableHead className="text-muted-foreground">Ablaufdatum</TableHead>
								<TableHead className="text-muted-foreground">Status</TableHead>
								<TableHead className="text-muted-foreground text-right">Aktionen</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{myListings.map((listing) => {
								const isExpired = isPast(listing.expiryDate);
								return (
									<TableRow key={listing.id} className="border-border">
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="p-2 rounded-lg bg-primary/10">
													<Package className="h-4 w-4 text-primary" />
												</div>
												<span className="font-medium">{listing.title}</span>
											</div>
										</TableCell>
										<TableCell>
											{listing.quantity} {listing.unit}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1.5">
												{isExpired ? (
													<Badge variant="secondary" className="bg-destructive/20 text-destructive text-xs">
														<AlertTriangle className="h-3 w-3 mr-1" />
														Abgelaufen
													</Badge>
												) : (
													<span className="flex items-center gap-1 text-sm text-muted-foreground">
														<Calendar className="h-3 w-3" />
														{format(listing.expiryDate, "dd.MM.yyyy", { locale: de })}
													</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<StatusBadge status={listing.status} isExpired={isExpired} />
										</TableCell>
										<TableCell className="text-right">
											<ListingActions listing={listing} />
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</Card>
			)}
		</div>
	);
}

function StatusBadge({ status, isExpired }: { status: string; isExpired: boolean }) {
	if (isExpired && status === "ACTIVE") {
		return (
			<Badge variant="secondary" className="bg-destructive/20 text-destructive">
				Abgelaufen
			</Badge>
		);
	}

	const styles: Record<string, string> = {
		DRAFT: "bg-muted text-muted-foreground",
		ACTIVE: "bg-success/20 text-success",
		SOLD: "bg-primary/20 text-primary",
		EXPIRED: "bg-destructive/20 text-destructive",
		CANCELLED: "bg-destructive/20 text-destructive",
	};

	const labels: Record<string, string> = {
		DRAFT: "Entwurf",
		ACTIVE: "Aktiv",
		SOLD: "Verkauft",
		EXPIRED: "Abgelaufen",
		CANCELLED: "Storniert",
	};

	return (
		<Badge variant="secondary" className={styles[status] || ""}>
			{labels[status] || status}
		</Badge>
	);
}
