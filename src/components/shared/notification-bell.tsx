"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

interface NotificationBellProps {
	notifHref: string;
}

export function NotificationBell({ notifHref }: NotificationBellProps) {
	const { data: countData } = api.notification.unreadCount.useQuery(undefined, {
		refetchInterval: 30000,
	});
	const { data: notifications } = api.notification.myNotifications.useQuery({
		isRead: false,
		limit: 5,
	});
	const utils = api.useUtils();
	const markRead = api.notification.markRead.useMutation({
		onSuccess: () => {
			void utils.notification.unreadCount.invalidate();
			void utils.notification.myNotifications.invalidate();
		},
	});

	const count = countData?.count ?? 0;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="relative" size="icon" variant="ghost">
					<Bell className="h-5 w-5" />
					{count > 0 && (
						<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 font-bold text-[10px] text-white">
							{count > 9 ? "9+" : count}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Notifications</span>
					{count > 0 && (
						<span className="font-normal text-amber-600 text-xs">
							{count} unread
						</span>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{notifications && notifications.length > 0 ? (
					notifications.map((notif) => (
						<DropdownMenuItem
							className={cn(
								"flex cursor-pointer flex-col items-start gap-0.5 py-2.5",
								!notif.isRead && "bg-amber-50",
							)}
							key={notif.id}
							onClick={() => {
								if (!notif.isRead)
									markRead.mutate({ notificationId: notif.id });
							}}
						>
							<span className="font-medium text-sm leading-tight">
								{notif.title}
							</span>
							<span className="line-clamp-2 text-muted-foreground text-xs leading-snug">
								{notif.message}
							</span>
							<span className="mt-0.5 text-[10px] text-muted-foreground">
								{formatDateTime(notif.createdAt)}
							</span>
						</DropdownMenuItem>
					))
				) : (
					<div className="py-6 text-center text-muted-foreground text-sm">
						No new notifications
					</div>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link
						className="w-full justify-center text-center font-medium text-amber-600 text-sm"
						href={notifHref}
					>
						View all notifications
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
