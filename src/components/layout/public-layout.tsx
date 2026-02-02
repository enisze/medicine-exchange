import Link from "next/link";
import { Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicLayoutProps {
	children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container flex h-16 items-center justify-between px-4">
					<Link href="/" className="flex items-center gap-2">
						<Package2 className="h-6 w-6" />
						<span className="font-semibold">MedExchange</span>
					</Link>
					<Link href="/">
						<Button variant="outline">Anmelden</Button>
					</Link>
				</div>
			</header>
			<main className="container px-4 py-8">{children}</main>
		</div>
	);
}
