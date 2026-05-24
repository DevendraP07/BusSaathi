"use client";

import {
	AlertTriangle,
	BarChart3,
	Bell,
	Bus,
	ClipboardCheck,
	ClipboardList,
	CreditCard,
	FileText,
	LayoutDashboard,
	LogOut,
	MapPin,
	MessageSquarePlus,
	Navigation,
	Route,
	ScrollText,
	Settings,
	User,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/better-auth/client";

type UserRole = "parent" | "driver" | "manager" | "admin";

interface NavItem {
	label: string;
	href: string;
	icon: React.ElementType;
}

const NAV_CONFIG: Record<UserRole, NavItem[]> = {
	parent: [
		{ label: "Dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
		{ label: "My Children", href: "/parent/students", icon: Users },
		{
			label: "Transport Apply",
			href: "/parent/transport",
			icon: ClipboardList,
		},
		{ label: "Route & Schedule", href: "/parent/route", icon: Route },
		{ label: "Track Bus", href: "/parent/track", icon: Navigation },
		{ label: "Fee Payments", href: "/parent/fees", icon: CreditCard },
		{ label: "Notifications", href: "/parent/notifications", icon: Bell },
		{ label: "Profile", href: "/parent/profile", icon: User },
	],
	driver: [
		{ label: "Dashboard", href: "/driver/dashboard", icon: LayoutDashboard },
		{ label: "Today's Trip", href: "/driver/trip", icon: Bus },
		{ label: "My Route", href: "/driver/route", icon: Route },
		{ label: "Issues", href: "/driver/issues", icon: AlertTriangle },
		{ label: "Profile", href: "/driver/profile", icon: User },
	],
	manager: [
		{ label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
		{ label: "Routes", href: "/manager/routes", icon: Route },
		{ label: "Buses", href: "/manager/buses", icon: Bus },
		{ label: "Students", href: "/manager/students", icon: Users },
		{ label: "Fee Structures", href: "/manager/fees", icon: CreditCard },
		{ label: "Payments", href: "/manager/fees/payments", icon: FileText },
		{ label: "Live Tracking", href: "/manager/tracking", icon: MapPin },
		{ label: "Issues", href: "/manager/issues", icon: AlertTriangle },
		{ label: "Requests", href: "/manager/requests", icon: ClipboardCheck },
		{ label: "Reports", href: "/manager/reports", icon: BarChart3 },
		{
			label: "Notifications",
			href: "/manager/notifications",
			icon: MessageSquarePlus,
		},
		{ label: "Profile", href: "/manager/profile", icon: User },
	],
	admin: [
		{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
		{ label: "Users", href: "/admin/users", icon: Users },
		{ label: "System Logs", href: "/admin/logs", icon: ScrollText },
		{ label: "Notifications", href: "/admin/notifications", icon: Bell },
		{ label: "Settings", href: "/admin/settings", icon: Settings },
		{ label: "Profile", href: "/admin/profile", icon: User },
	],
};

const ROLE_LABELS: Record<UserRole, string> = {
	parent: "Parent Portal",
	driver: "Driver Portal",
	manager: "Manager Portal",
	admin: "Admin Portal",
};

const ROLE_COLORS: Record<UserRole, string> = {
	parent: "text-amber-400",
	driver: "text-blue-400",
	manager: "text-green-400",
	admin: "text-red-400",
};

interface SidebarProps {
	role: UserRole;
	userName: string;
	userEmail: string;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
	const pathname = usePathname();
	const navItems = NAV_CONFIG[role] ?? [];

	async function handleLogout() {
		await authClient.signOut();
		window.location.href = "/login";
	}

	return (
		<aside className="flex h-screen w-60 flex-col overflow-hidden bg-[oklch(0.14_0.03_250)] text-sidebar-foreground">
			{/* Brand — fixed at top */}
			<div className="flex shrink-0 items-center gap-3 border-sidebar-border border-b px-4 py-4">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 font-black text-[oklch(0.14_0.03_250)] text-base">
					B
				</div>
				<div className="min-w-0">
					<p className="font-black text-base text-white leading-tight">
						BusSaathi
					</p>
					<p
						className={cn(
							"font-medium text-[11px] leading-tight",
							ROLE_COLORS[role],
						)}
					>
						{ROLE_LABELS[role]}
					</p>
				</div>
			</div>

			{/* Nav — scrollable middle section */}
			<div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
				<nav className="space-y-0.5">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<Link
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-colors",
									isActive
										? "bg-amber-400 font-semibold text-[oklch(0.14_0.03_250)]"
										: "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
								)}
								href={item.href}
								key={item.href}
							>
								<item.icon className="h-4 w-4 shrink-0" />
								<span className="truncate">{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			{/* User footer — always visible at bottom */}
			<div className="shrink-0 border-sidebar-border border-t p-3">
				<div className="mb-1 flex items-center gap-2.5 px-2 py-2">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent font-bold text-sidebar-foreground text-sm">
						{userName.charAt(0).toUpperCase()}
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-sm text-white">
							{userName}
						</p>
						<p className="truncate text-[11px] text-sidebar-foreground/50">
							{userEmail}
						</p>
					</div>
				</div>
				<Button
					className="h-8 w-full justify-start gap-2 text-sidebar-foreground/60 hover:bg-red-400/10 hover:text-red-400"
					onClick={handleLogout}
					size="sm"
					variant="ghost"
				>
					<LogOut className="h-4 w-4" />
					Sign out
				</Button>
			</div>
		</aside>
	);
}
