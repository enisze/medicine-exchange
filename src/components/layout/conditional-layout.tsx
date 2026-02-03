import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { PublicLayout } from "./public-layout";

interface ConditionalLayoutProps {
	children: React.ReactNode;
}

export async function ConditionalLayout({ children }: ConditionalLayoutProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return <PublicLayout>{children}</PublicLayout>;
	}

	return (
		<SidebarProvider>
			<AppSidebar user={session.user} />
			<SidebarInset>
				<header className="flex h-14 items-center gap-4 border-b px-4 md:hidden">
					<SidebarTrigger />
					<span className="font-semibold">MedExchange</span>
				</header>
				<main className="flex-1 p-4 md:p-6">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
