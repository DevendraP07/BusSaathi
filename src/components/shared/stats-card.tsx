import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	description?: string;
	trend?: { value: number; label: string };
	accent?: "amber" | "green" | "blue" | "red" | "purple" | "indigo";
	className?: string;
}

const ACCENT_MAP = {
	amber: { icon: "bg-amber-100 text-amber-600", value: "text-amber-600" },
	green: { icon: "bg-green-100 text-green-600", value: "text-green-600" },
	blue: { icon: "bg-blue-100 text-blue-600", value: "text-blue-600" },
	red: { icon: "bg-red-100 text-red-600", value: "text-red-600" },
	purple: { icon: "bg-purple-100 text-purple-600", value: "text-purple-600" },
	indigo: { icon: "bg-indigo-100 text-indigo-600", value: "text-indigo-600" },
};

export function StatsCard({
	title,
	value,
	icon: Icon,
	description,
	trend,
	accent = "amber",
	className,
}: StatsCardProps) {
	const colors = ACCENT_MAP[accent];
	return (
		<Card
			className={cn(
				"border shadow-sm transition-shadow hover:shadow-md",
				className,
			)}
		>
			<CardContent className="p-5">
				<div className="flex items-start justify-between">
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-muted-foreground text-sm">
							{title}
						</p>
						<p className={cn("mt-1 font-bold text-2xl", colors.value)}>
							{value}
						</p>
						{description && (
							<p className="mt-1 text-muted-foreground text-xs">
								{description}
							</p>
						)}
						{trend && (
							<p
								className={cn(
									"mt-1 font-medium text-xs",
									trend.value >= 0 ? "text-green-600" : "text-red-600",
								)}
							>
								{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
								{trend.label}
							</p>
						)}
					</div>
					<div
						className={cn(
							"ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
							colors.icon,
						)}
					>
						<Icon className="h-5 w-5" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
