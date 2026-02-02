"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { createListing } from "@/actions/listings";
import { createListingSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

export function ListingForm() {
	const router = useRouter();

	const { form, handleSubmitWithAction, action } = useHookFormAction(
		createListing,
		zodResolver(createListingSchema),
		{
			formProps: {
				defaultValues: {
					title: "",
					description: "",
					quantity: 1,
					unit: "Stück",
					expiryDate: "",
				},
			},
			actionProps: {
				onSuccess: () => {
					toast.success("Angebot erstellt");
					router.push("/dashboard/listings");
				},
				onError: (error) => {
					toast.error(error.error.serverError || "Fehler beim Erstellen");
				},
			},
		}
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Neues Angebot erstellen</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={handleSubmitWithAction} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Titel</FormLabel>
									<FormControl>
										<Input placeholder="z.B. Ibuprofen 400mg" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Beschreibung (optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Zusätzliche Informationen..."
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="quantity"
								render={({ field: { onChange, ...field } }) => (
									<FormItem>
										<FormLabel>Menge</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												onChange={(e) => onChange(e.target.valueAsNumber)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="unit"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Einheit</FormLabel>
										<FormControl>
											<Input placeholder="Stück, Packungen, etc." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="expiryDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ablaufdatum</FormLabel>
									<FormControl>
										<Input
											type="date"
											min={new Date().toISOString().split("T")[0]}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex gap-4">
							<Button type="submit" disabled={action.isPending}>
								{action.isPending ? "Wird erstellt..." : "Als Entwurf speichern"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
							>
								Abbrechen
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
