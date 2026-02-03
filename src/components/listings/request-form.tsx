"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { createRequest } from "@/actions/requests";
import { createRequestSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

interface RequestFormProps {
	listingId: string;
	maxQuantity: number;
	unit: string;
}

export function RequestForm({ listingId, maxQuantity, unit }: RequestFormProps) {
	const formSchema = useMemo(
		() =>
			createRequestSchema.extend({
				quantity: z
					.number()
					.int()
					.positive("Menge muss positiv sein")
					.max(maxQuantity, `Maximal ${maxQuantity} ${unit} verfügbar`),
			}),
		[maxQuantity, unit]
	);

	const { form, handleSubmitWithAction, resetFormAndAction, action } = useHookFormAction(
		createRequest,
		zodResolver(formSchema),
		{
			formProps: {
				defaultValues: {
					listingId,
					quantity: 1,
				},
			},
			actionProps: {
				onSuccess: () => {
					toast.success("Anfrage erfolgreich gestellt");
					resetFormAndAction();
				},
				onError: (error) => {
					toast.error(error.error.serverError || "Anfrage fehlgeschlagen");
				},
			},
		}
	);

	return (
		<Form {...form}>
			<form onSubmit={handleSubmitWithAction} className="space-y-4">
				<FormField
					control={form.control}
					name="quantity"
					render={({ field: { onChange, ...field } }) => (
						<FormItem>
							<FormLabel>Menge ({unit})</FormLabel>
							<FormControl>
								<Input
									type="number"
									min={1}
									max={maxQuantity}
									onChange={(e) => onChange(e.target.valueAsNumber)}
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Maximal {maxQuantity} {unit} verfügbar
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={action.isPending}>
					{action.isPending ? "Wird gesendet..." : "Anfrage senden"}
				</Button>
			</form>
		</Form>
	);
}
