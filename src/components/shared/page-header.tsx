import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	description?: string;
	icon?: LucideIcon;
	actions?: React.ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	description,
	icon: Icon,
	actions,
	className,
}: PageHeaderProps) {
	return (
		<div
			className={cn("mb-6 flex items-start justify-between gap-4", className)}
		>
			<div className="flex min-w-0 items-center gap-3">
				{Icon && (
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
						<Icon className="h-5 w-5" />
					</div>
				)}
				<div className="min-w-0">
					<h1 className="truncate font-bold text-foreground text-xl">
						{title}
					</h1>
					{description && (
						<p className="mt-0.5 text-muted-foreground text-sm">
							{description}
						</p>
					)}
				</div>
			</div>
			{actions && (
				<div className="flex shrink-0 items-center gap-2">{actions}</div>
			)}
		</div>
	);
}
