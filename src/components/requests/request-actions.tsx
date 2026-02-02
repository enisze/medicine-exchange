"use client";

import { useAction } from "next-safe-action/hooks";
import { approveRequest, rejectRequest } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface RequestActionsProps {
	requestId: string;
	insufficientStock?: boolean;
}

export function RequestActions({ requestId, insufficientStock }: RequestActionsProps) {
	const { execute: approve, status: approveStatus } = useAction(approveRequest, {
		onSuccess: () => toast.success("Anfrage genehmigt"),
		onError: (e) => toast.error(e.error.serverError || "Fehler"),
	});

	const { execute: reject, status: rejectStatus } = useAction(rejectRequest, {
		onSuccess: () => toast.success("Anfrage abgelehnt"),
		onError: (e) => toast.error(e.error.serverError || "Fehler"),
	});

	const isLoading = approveStatus === "executing" || rejectStatus === "executing";

	return (
		<div className="flex items-center justify-end gap-2">
			<Button
				size="sm"
				variant="outline"
				onClick={() => approve({ id: requestId })}
				disabled={isLoading || insufficientStock}
				title={insufficientStock ? "Nicht genügend Bestand verfügbar" : undefined}
			>
				<Check className="h-4 w-4 mr-1" />
				Genehmigen
			</Button>
			<Button
				size="sm"
				variant="ghost"
				onClick={() => reject({ id: requestId })}
				disabled={isLoading}
			>
				<X className="h-4 w-4 mr-1" />
				Ablehnen
			</Button>
		</div>
	);
}
