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
import { Plus, Box, AlertTriangle } from "lucide-react";
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
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Meine Angebote</h1>
					<p className="text-muted-foreground">
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
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Titel</TableHead>
								<TableHead>Menge</TableHead>
								<TableHead>Ablaufdatum</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Aktionen</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{myListings.map((listing) => {
								const isExpired = isPast(listing.expiryDate);
								return (
									<TableRow key={listing.id}>
										<TableCell className="font-medium">
											{listing.title}
										</TableCell>
										<TableCell>
											{listing.quantity} {listing.unit}
										</TableCell>
										<TableCell>
											<span className={isExpired ? "text-destructive" : ""}>
												{format(listing.expiryDate, "dd.MM.yyyy", { locale: de })}
											</span>
											{isExpired && (
												<AlertTriangle className="inline-block ml-2 h-4 w-4 text-destructive" />
											)}
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
		return <Badge variant="destructive">Abgelaufen</Badge>;
	}

	const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
		DRAFT: "outline",
		ACTIVE: "default",
		SOLD: "secondary",
		EXPIRED: "destructive",
		CANCELLED: "destructive",
	};

	const labels: Record<string, string> = {
		DRAFT: "Entwurf",
		ACTIVE: "Aktiv",
		SOLD: "Verkauft",
		EXPIRED: "Abgelaufen",
		CANCELLED: "Storniert",
	};

	return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
}
