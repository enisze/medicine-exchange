import Link from "next/link";
import { ListingsRepository } from "@/db/repositories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Box } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { ListingsSearch } from "@/components/listings/listings-search";

interface ListingsPageProps {
	searchParams: Promise<{ q?: string }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
	const { q: search } = await searchParams;
	const activeListings = await ListingsRepository.getActiveListings(search);

	return (
		<ConditionalLayout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold">Verfügbare Medikamente</h1>
						<p className="text-muted-foreground">
							Durchsuchen Sie aktuelle Angebote von Krankenhäusern
						</p>
					</div>
					<div className="w-full sm:w-72">
						<ListingsSearch />
					</div>
				</div>

				{activeListings.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Box className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								{search
									? `Keine Angebote für "${search}" gefunden`
									: "Keine Angebote verfügbar"}
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{activeListings.map((listing) => (
							<Link key={listing.id} href={`/listings/${listing.id}`}>
								<Card className="hover:shadow-md transition-shadow h-full">
									<CardHeader>
										<div className="flex items-start justify-between">
											<CardTitle className="text-lg">
												{listing.title}
											</CardTitle>
											<Badge variant="secondary">
												{listing.quantity - listing.reservedQuantity} {listing.unit}
											</Badge>
										</div>
									</CardHeader>
									<CardContent>
										{listing.description && (
											<p className="text-sm text-muted-foreground mb-4 line-clamp-2">
												{listing.description}
											</p>
										)}
										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<span>{listing.sellerName}</span>
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{format(listing.expiryDate, "dd.MM.yyyy", {
													locale: de,
												})}
											</span>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</ConditionalLayout>
	);
}
