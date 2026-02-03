"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/lib/validations";
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
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

export function LoginForm() {
	const router = useRouter();

	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const isLoading = form.formState.isSubmitting;

	async function onSubmit(data: LoginInput) {
		try {
			const result = await signIn.email({
				email: data.email,
				password: data.password,
			});
			if (result.error) {
				toast.error(result.error.message || "Login fehlgeschlagen");
				return;
			}
			toast.success("Erfolgreich angemeldet");
			router.push("/dashboard");
		} catch {
			toast.error("Ein Fehler ist aufgetreten");
		}
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Anmelden</CardTitle>
				<CardDescription>Melden Sie sich mit Ihrem Konto an</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Laden..." : "Anmelden"}
						</Button>
					</form>
				</Form>
				<div className="mt-4 text-center text-sm">
					<p>
						Noch kein Konto?{" "}
						<Link href="/register" className="text-primary underline">
							Registrieren
						</Link>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
