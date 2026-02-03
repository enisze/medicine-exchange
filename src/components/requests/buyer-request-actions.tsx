"use client";

import { useAction } from "next-safe-action/hooks";
import { cancelRequest } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";

interface BuyerRequestActionsProps {
	requestId: string;
}

export function BuyerRequestActions({ requestId }: BuyerRequestActionsProps) {
	const { execute: cancel, status } = useAction(cancelRequest, {
		onSuccess: () => toast.success("Anfrage storniert"),
		onError: (e) => toast.error(e.error.serverError || "Fehler"),
	});

	const isLoading = status === "executing";

	return (
		<Button
			size="sm"
			variant="ghost"
			onClick={() => cancel({ id: requestId })}
			disabled={isLoading}
		>
			<X className="h-4 w-4 mr-1" />
			Stornieren
		</Button>
	);
}
