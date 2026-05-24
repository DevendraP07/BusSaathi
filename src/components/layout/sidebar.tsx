"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard, Bus, Route, Users, CreditCard, MapPin,
	Bell, User, LogOut, BarChart3, AlertTriangle, FileText,
	ClipboardList, Navigation, UserCheck, Settings, Shield,
	ScrollText, MessageSquarePlus, ClipboardCheck,
} from "lucide-react";
import { authClient } from "@/server/better-auth/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type UserRole = "parent" | "driver" | "manager" | "admin";

interface NavItem {
	label: string;
	href: string;
	icon: React.ElementType;
}

const NAV_CONFIG: Record<UserRole, NavItem[]> = {
	parent: [
		{ label: "Dashboard",       href: "/parent/dashboard",      icon: LayoutDashboard },
		{ label: "My Children",     href: "/parent/students",       icon: Users },
		{ label: "Transport Apply", href: "/parent/transport",      icon: ClipboardList },
		{ label: "Route & Schedule",href: "/parent/route",          icon: Route },
		{ label: "Track Bus",       href: "/parent/track",          icon: Navigation },
		{ label: "Fee Payments",    href: "/parent/fees",           icon: CreditCard },
		{ label: "Notifications",   href: "/parent/notifications",  icon: Bell },
		{ label: "Profile",         href: "/parent/profile",        icon: User },
	],
	driver: [
		{ label: "Dashboard",       href: "/driver/dashboard",      icon: LayoutDashboard },
		{ label: "Today's Trip",    href: "/driver/trip",           icon: Bus },
		{ label: "My Route",        href: "/driver/route",          icon: Route },
		{ label: "Issues",          href: "/driver/issues",         icon: AlertTriangle },
		{ label: "Profile",         href: "/driver/profile",        icon: User },
	],
	manager: [
		{ label: "Dashboard",       href: "/manager/dashboard",     icon: LayoutDashboard },
		{ label: "Routes",          href: "/manager/routes",        icon: Route },
		{ label: "Buses",           href: "/manager/buses",         icon: Bus },
		{ label: "Students",        href: "/manager/students",      icon: Users },
		{ label: "Fee Structures",  href: "/manager/fees",          icon: CreditCard },
		{ label: "Payments",        href: "/manager/fees/payments", icon: FileText },
		{ label: "Live Tracking",   href: "/manager/tracking",      icon: MapPin },
		{ label: "Issues",          href: "/manager/issues",        icon: AlertTriangle },
		{ label: "Requests",        href: "/manager/requests",      icon: ClipboardCheck },
		{ label: "Reports",         href: "/manager/reports",       icon: BarChart3 },
		{ label: "Notifications",   href: "/manager/notifications", icon: MessageSquarePlus },
		{ label: "Profile",         href: "/manager/profile",       icon: User },
	],
	admin: [
		{ label: "Dashboard",       href: "/admin/dashboard",       icon: LayoutDashboard },
		{ label: "Users",           href: "/admin/users",           icon: Users },
		{ label: "System Logs",     href: "/admin/logs",            icon: ScrollText },
		{ label: "Notifications",   href: "/admin/notifications",   icon: Bell },
		{ label: "Settings",        href: "/admin/settings",        icon: Settings },
		{ label: "Profile",         href: "/admin/profile",         icon: User },
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
		<aside className="flex h-screen w-60 flex-col bg-[oklch(0.14_0.03_250)] text-sidebar-foreground overflow-hidden">
			{/* Brand — fixed at top */}
			<div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border shrink-0">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 font-black text-[oklch(0.14_0.03_250)] text-base shrink-0">
					B
				</div>
				<div className="min-w-0">
					<p className="font-black text-white text-base leading-tight">BusSaathi</p>
					<p className={cn("text-[11px] font-medium leading-tight", ROLE_COLORS[role])}>
						{ROLE_LABELS[role]}
					</p>
				</div>
			</div>

			{/* Nav — scrollable middle section */}
			<div className="flex-1 overflow-y-auto px-2 py-3 min-h-0">
				<nav className="space-y-0.5">
					{navItems.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
									isActive
										? "bg-amber-400 text-[oklch(0.14_0.03_250)] font-semibold"
										: "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
								)}
							>
								<item.icon className="h-4 w-4 shrink-0" />
								<span className="truncate">{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			{/* User footer — always visible at bottom */}
			<div className="border-t border-sidebar-border p-3 shrink-0">
				<div className="flex items-center gap-2.5 px-2 py-2 mb-1">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-foreground font-bold text-sm">
						{userName.charAt(0).toUpperCase()}
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium text-white truncate">{userName}</p>
						<p className="text-[11px] text-sidebar-foreground/50 truncate">{userEmail}</p>
					</div>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-400/10 h-8"
					onClick={handleLogout}
				>
					<LogOut className="h-4 w-4" />
					Sign out
				</Button>
			</div>
		</aside>
	);
}