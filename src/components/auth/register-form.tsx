"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

export function RegisterForm() {
	const router = useRouter();

	const form = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
			role: "BUYER",
		},
	});

	const isLoading = form.formState.isSubmitting;

	async function onSubmit(data: RegisterInput) {
		try {
			const result = await signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
				role: data.role,
			});
			if (result.error) {
				toast.error(result.error.message || "Registrierung fehlgeschlagen");
				return;
			}

			toast.success("Konto erstellt");
			router.push("/dashboard");
		} catch {
			toast.error("Ein Fehler ist aufgetreten");
		}
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Registrieren</CardTitle>
				<CardDescription>Erstellen Sie ein neues Konto</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Ihr Name oder Krankenhaus" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>E-Mail</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="email@beispiel.de"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Passwort</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="••••••••"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rolle</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="SELLER">
												Verkäufer (Medikamente anbieten)
											</SelectItem>
											<SelectItem value="BUYER">
												Käufer (Medikamente anfragen)
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Laden..." : "Registrieren"}
						</Button>
					</form>
				</Form>
				<div className="mt-4 text-center text-sm">
					<p>
						Bereits ein Konto?{" "}
						<Link href="/login" className="text-primary underline">
							Anmelden
						</Link>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
