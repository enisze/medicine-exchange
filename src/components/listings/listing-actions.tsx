"use client";

import { useAction } from "next-safe-action/hooks";
import { publishListing, cancelListing } from "@/actions/listings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, XCircle } from "lucide-react";

interface ListingActionsProps {
	listing: {
		id: string;
		status: string;
	};
}

export function ListingActions({ listing }: ListingActionsProps) {
	const { execute: publish, status: publishStatus } = useAction(publishListing, {
		onSuccess: () => toast.success("Angebot veröffentlicht"),
		onError: (e) => toast.error(e.error.serverError || "Fehler"),
	});

	const { execute: cancel, status: cancelStatus } = useAction(cancelListing, {
		onSuccess: () => toast.success("Angebot storniert"),
		onError: (e) => toast.error(e.error.serverError || "Fehler"),
	});

	const isLoading = publishStatus === "executing" || cancelStatus === "executing";
	const canCancel = listing.status !== "CANCELLED" && listing.status !== "SOLD";

	return (
		<div className="flex items-center justify-end gap-2">
			{listing.status === "DRAFT" && (
				<Button
					size="sm"
					variant="outline"
					onClick={() => publish({ id: listing.id })}
					disabled={isLoading}
				>
					<Eye className="h-4 w-4 mr-1" />
					Veröffentlichen
				</Button>
			)}
			{canCancel && (
				<Button
					size="sm"
					variant="ghost"
					onClick={() => {
						if (confirm("Angebot wirklich stornieren? Alle ausstehenden Anfragen werden abgelehnt.")) {
							cancel({ id: listing.id });
						}
					}}
					disabled={isLoading}
				>
					<XCircle className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
