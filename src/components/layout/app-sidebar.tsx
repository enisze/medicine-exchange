"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "@/lib/auth";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Package2, LayoutDashboard, Package, ShoppingCart } from "lucide-react";
import { UserNav } from "./user-nav";

interface AppSidebarProps {
	user: Session["user"];
}

export function AppSidebar({ user }: AppSidebarProps) {
	const pathname = usePathname();
	const isSeller = user.role === "SELLER";

	const navItems = [
		{
			title: "Dashboard",
			href: "/dashboard",
			icon: LayoutDashboard,
			show: true,
		},
		{
			title: "Angebote",
			href: "/listings",
			icon: Package,
			show: true,
		},
		{
			title: "Meine Angebote",
			href: "/dashboard/listings",
			icon: Package,
			show: isSeller,
		},
		{
			title: "Anfragen",
			href: "/dashboard/requests",
			icon: ShoppingCart,
			show: true,
		},
	];

	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/dashboard">
								<Package2 className="size-6" />
								<span className="font-semibold">MedExchange</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems
								.filter((item) => item.show)
								.map((item) => (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											isActive={pathname === item.href}
										>
											<Link href={item.href}>
												<item.icon className="size-4" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<UserNav user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
