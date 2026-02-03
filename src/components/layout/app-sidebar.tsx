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
import { Building2, LayoutDashboard, Package, ShoppingCart } from "lucide-react";
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
		<Sidebar className="border-sidebar-border">
			<SidebarHeader className="border-b border-sidebar-border">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/dashboard" className="flex items-center gap-2">
								<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
									<Building2 className="w-5 h-5 text-primary-foreground" />
								</div>
								<span className="font-semibold text-sidebar-foreground">MedExchange</span>
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
											isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
											className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground"
										>
											<Link href={item.href}>
												<item.icon className="size-5" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="border-t border-sidebar-border">
				<UserNav user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
