"use client";

import { Bell, Database, Settings, Shield } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SETTINGS_INFO = [
	{
		icon: Shield,
		title: "Authentication",
		items: [
			{ label: "Provider", value: "BetterAuth (Email + Password)" },
			{ label: "Session Expiry", value: "7 days" },
			{ label: "Password Policy", value: "Min 8 chars, 1 uppercase, 1 number" },
			{ label: "Role-Based Access", value: "Enabled", badge: "active" },
		],
	},
	{
		icon: Database,
		title: "Database",
		items: [
			{ label: "Provider", value: "Neon PostgreSQL" },
			{ label: "ORM", value: "DrizzleORM" },
			{ label: "Table Prefix", value: "bussaathi_" },
			{ label: "SSL", value: "Enabled", badge: "active" },
		],
	},
	{
		icon: Bell,
		title: "Notifications",
		items: [
			{ label: "In-App Notifications", value: "Enabled", badge: "active" },
			{ label: "Email Notifications", value: "Coming Soon", badge: "pending" },
			{ label: "SMS Alerts", value: "Coming Soon", badge: "pending" },
		],
	},
];

const BADGE_MAP: Record<string, string> = {
	active: "bg-green-100 text-green-700 border-green-200",
	pending: "bg-amber-100 text-amber-700 border-amber-200",
};

export function AdminClient() {
	return (
		<div className="max-w-2xl space-y-6">
			<PageHeader
				description="Platform configuration and feature status"
				icon={Settings}
				title="System Settings"
			/>

			{SETTINGS_INFO.map((section) => (
				<Card key={section.title}>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-sm">
							<section.icon className="h-4 w-4 text-amber-600" />
							{section.title}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{section.items.map((item) => (
							<div
								className="flex items-center justify-between border-b py-1.5 last:border-b-0"
								key={item.label}
							>
								<span className="text-muted-foreground text-sm">
									{item.label}
								</span>
								<div className="flex items-center gap-2">
									<span className="font-medium text-sm">{item.value}</span>
									{item.badge && (
										<Badge
											className={`text-[10px] ${BADGE_MAP[item.badge] ?? ""}`}
											variant="outline"
										>
											{item.badge}
										</Badge>
									)}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			))}

			<Card className="border-amber-200 bg-amber-50">
				<CardContent className="p-4">
					<p className="mb-1 font-semibold text-amber-800 text-sm">
						Stack Information
					</p>
					<div className="grid grid-cols-2 gap-2 text-amber-700 text-xs">
						{[
							["Framework", "Next.js 15 + TypeScript"],
							["API", "tRPC + Next.js API Routes"],
							["Auth", "BetterAuth"],
							["DB ORM", "DrizzleORM"],
							["UI", "Shadcn/ui + Tailwind CSS"],
							["Package Manager", "Bun"],
						].map(([k, v]) => (
							<div key={k}>
								<span className="text-amber-500">{k}: </span>
								{v}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
