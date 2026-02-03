import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { RequestsRepository } from "@/db/repositories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ShoppingCart, AlertTriangle, Package, Building2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { RequestActions } from "@/components/requests/request-actions";
import { BuyerRequestActions } from "@/components/requests/buyer-request-actions";

export default async function RequestsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const user = session!.user;
	const isSeller = user.role === "SELLER";

	const requestList = isSeller
		? await RequestsRepository.getBySellerId(user.id)
		: await RequestsRepository.getByBuyerId(user.id);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-foreground">
					{isSeller ? "Eingehende Anfragen" : "Meine Anfragen"}
				</h1>
				<p className="text-muted-foreground mt-1">
					{isSeller
						? "Verwalten Sie Anfragen zu Ihren Angeboten"
						: "Verfolgen Sie den Status Ihrer Anfragen"}
				</p>
			</div>

			{requestList.length === 0 ? (
				<Card className="bg-card border-border">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium text-foreground">Keine Anfragen vorhanden</h3>
						<p className="text-muted-foreground mt-1">
							{isSeller ? "Anfragen zu Ihren Angeboten werden hier angezeigt" : "Ihre gestellten Anfragen werden hier angezeigt"}
						</p>
					</CardContent>
				</Card>
			) : (
				<Card className="bg-card border-border">
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow className="border-border hover:bg-transparent">
									<TableHead className="text-muted-foreground">Angebot</TableHead>
									<TableHead className="text-muted-foreground">Menge</TableHead>
									<TableHead className="text-muted-foreground">{isSeller ? "Anfragender" : "Anbieter"}</TableHead>
									<TableHead className="text-muted-foreground">Datum</TableHead>
									<TableHead className="text-muted-foreground">Status</TableHead>
									<TableHead className="text-muted-foreground text-right">Aktionen</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{requestList.map((request) => {
									const insufficientStock =
										request.status === "PENDING" &&
										request.quantity > request.listingQuantity;

									return (
										<TableRow key={request.id} className="border-border">
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-primary/10">
														<Package className="h-4 w-4 text-primary" />
													</div>
													<span className="font-medium text-card-foreground">
														{request.listingTitle}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-card-foreground">
												{request.quantity} {request.listingUnit}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div className="p-1.5 rounded bg-secondary">
														<Building2 className="h-3.5 w-3.5 text-muted-foreground" />
													</div>
													<span className="text-muted-foreground">
														{"buyerName" in request
															? request.buyerName
															: request.sellerName}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground">
												{format(request.createdAt, "dd.MM.yyyy", { locale: de })}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<StatusBadge status={request.status} />
													{insufficientStock && (
														<Badge variant="secondary" className="gap-1 bg-destructive/20 text-destructive">
															<AlertTriangle className="h-3 w-3" />
															Nicht genug
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="text-right">
												{request.status === "PENDING" && (
													isSeller ? (
														<RequestActions
															requestId={request.id}
															insufficientStock={insufficientStock}
														/>
													) : (
														<BuyerRequestActions requestId={request.id} />
													)
												)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		PENDING: "bg-warning/20 text-warning",
		APPROVED: "bg-success/20 text-success",
		REJECTED: "bg-destructive/20 text-destructive",
		CANCELLED: "bg-muted text-muted-foreground",
	};

	const labels: Record<string, string> = {
		PENDING: "Ausstehend",
		APPROVED: "Genehmigt",
		REJECTED: "Abgelehnt",
		CANCELLED: "Storniert",
	};

	return (
		<Badge variant="secondary" className={styles[status] || ""}>
			{labels[status] || status}
		</Badge>
	);
}
