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
import { ShoppingCart, AlertTriangle } from "lucide-react";
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
				<h1 className="text-2xl font-bold">
					{isSeller ? "Eingehende Anfragen" : "Meine Anfragen"}
				</h1>
				<p className="text-muted-foreground">
					{isSeller
						? "Verwalten Sie Anfragen zu Ihren Angeboten"
						: "Verfolgen Sie den Status Ihrer Anfragen"}
				</p>
			</div>

			{requestList.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground">Keine Anfragen vorhanden</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Angebot</TableHead>
								<TableHead>Menge</TableHead>
								<TableHead>{isSeller ? "Anfragender" : "Anbieter"}</TableHead>
								<TableHead>Datum</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Aktionen</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{requestList.map((request) => {
								const insufficientStock =
									request.status === "PENDING" &&
									request.quantity > request.listingQuantity;

								return (
									<TableRow key={request.id}>
										<TableCell className="font-medium">
											{request.listingTitle}
										</TableCell>
										<TableCell>
											{request.quantity} {request.listingUnit}
										</TableCell>
										<TableCell>
											{"buyerName" in request
												? request.buyerName
												: request.sellerName}
										</TableCell>
										<TableCell>
											{format(request.createdAt, "dd.MM.yyyy", { locale: de })}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<StatusBadge status={request.status} />
												{insufficientStock && (
													<Badge variant="destructive" className="gap-1">
														<AlertTriangle className="h-3 w-3" />
														Nicht genug Bestand
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
				</Card>
			)}
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
		PENDING: "outline",
		APPROVED: "default",
		REJECTED: "destructive",
		CANCELLED: "secondary",
	};

	const labels: Record<string, string> = {
		PENDING: "Ausstehend",
		APPROVED: "Genehmigt",
		REJECTED: "Abgelehnt",
		CANCELLED: "Storniert",
	};

	return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
}
