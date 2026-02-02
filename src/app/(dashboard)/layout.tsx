import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/");
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
