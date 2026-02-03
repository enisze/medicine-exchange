import Link from "next/link";
import { ListingsRepository } from "@/db/repositories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Box, Package, Building2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { ListingsSearch } from "@/components/listings/listings-search";
import { Pagination } from "@/components/ui/pagination";

interface ListingsPageProps {
	searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
	const { q: search, page: pageParam } = await searchParams;
	const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

	const { items: activeListings, pagination } = await ListingsRepository.getActiveListings({
		search,
		page,
		limit: 9,
	});

	return (
		<ConditionalLayout>
			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-foreground">Verfügbare Medikamente</h1>
						<p className="text-muted-foreground mt-1">
							Durchsuchen Sie aktuelle Angebote von Krankenhäusern
						</p>
					</div>
					<div className="w-full sm:w-72">
						<ListingsSearch />
					</div>
				</div>

				{activeListings.length === 0 ? (
					<Card className="bg-card border-border">
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Box className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium text-foreground">Keine Angebote gefunden</h3>
							<p className="text-muted-foreground mt-1">
								{search
									? `Keine Ergebnisse für "${search}"`
									: "Aktuell sind keine Angebote verfügbar"}
							</p>
						</CardContent>
					</Card>
				) : (
					<>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{activeListings.map((listing) => (
								<Link key={listing.id} href={`/listings/${listing.id}`}>
									<Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between gap-3">
												<div className="flex items-center gap-3">
													<div className="p-2.5 rounded-lg bg-primary/10">
														<Package className="h-5 w-5 text-primary" />
													</div>
													<div>
														<CardTitle className="text-base font-medium line-clamp-1">
															{listing.title}
														</CardTitle>
														<div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
															<Building2 className="h-3 w-3" />
															{listing.sellerName}
														</div>
													</div>
												</div>
												<Badge variant="secondary" className="bg-primary/10 text-primary">
													{listing.quantity - listing.reservedQuantity} {listing.unit}
												</Badge>
											</div>
										</CardHeader>
										<CardContent className="pb-4">
											{listing.description && (
												<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
													{listing.description}
												</p>
											)}
											<div className="flex items-center gap-1 text-xs text-muted-foreground">
												<Calendar className="h-3 w-3" />
												Ablauf: {format(listing.expiryDate, "dd.MM.yyyy", {
													locale: de,
												})}
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>

						<Pagination
							currentPage={pagination.page}
							totalPages={pagination.totalPages}
							baseUrl="/listings"
							searchParams={{ q: search }}
						/>
					</>
				)}
			</div>
		</ConditionalLayout>
	);
}
