"use client";

import { useRouter } from "next/navigation";
import type { Session } from "@/lib/auth";
import { signOut } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";
import {
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";

interface UserNavProps {
	user: Session["user"];
}

export function UserNav({ user }: UserNavProps) {
	const router = useRouter();

	async function handleSignOut() {
		await signOut();
		router.push("/");
		router.refresh();
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
					<div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent">
						<User className="size-4" />
					</div>
					<div className="flex flex-col gap-0.5 leading-none">
						<span className="font-medium">{user.name}</span>
						<Badge variant="secondary" className="w-fit text-xs">
							{user.role === "SELLER" ? "Verkäufer" : "Käufer"}
						</Badge>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
			<SidebarMenuItem>
				<SidebarMenuButton onClick={handleSignOut}>
					<LogOut className="size-4" />
					<span>Abmelden</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
