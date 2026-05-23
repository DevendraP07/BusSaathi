"use client";

import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/shared/notification-bell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
	title?: string;
	notifHref: string;
	onMenuClick?: () => void;
	className?: string;
}

export function Navbar({
	title,
	notifHref,
	onMenuClick,
	className,
}: NavbarProps) {
	return (
		<header
			className={cn(
				"flex h-14 items-center justify-between gap-3 border-b bg-background px-4",
				className,
			)}
		>
			<div className="flex items-center gap-2">
				{onMenuClick && (
					<Button
						className="h-8 w-8 md:hidden"
						onClick={onMenuClick}
						size="icon"
						variant="ghost"
					>
						<Menu className="h-5 w-5" />
					</Button>
				)}
				{title && (
					<p className="font-semibold text-muted-foreground text-sm">{title}</p>
				)}
			</div>
			<div className="flex items-center gap-1">
				<NotificationBell notifHref={notifHref} />
			</div>
		</header>
	);
}
