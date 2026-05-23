"use client";

import { Bell, CheckCheck, Dot } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const TYPE_COLORS: Record<string, string> = {
	bus_arrival: "bg-green-100 text-green-700",
	bus_delay: "bg-red-100 text-red-700",
	fee_reminder: "bg-amber-100 text-amber-700",
	payment_confirmed: "bg-green-100 text-green-700",
	route_change: "bg-blue-100 text-blue-700",
	trip_started: "bg-indigo-100 text-indigo-700",
	trip_completed: "bg-green-100 text-green-700",
	issue_reported: "bg-red-100 text-red-700",
	system: "bg-gray-100 text-gray-700",
};

export function ParentNotificationsClient() {
	const { data: notifications, isLoading } =
		api.notification.myNotifications.useQuery({ limit: 50 });
	const utils = api.useUtils();

	const markRead = api.notification.markRead.useMutation({
		onSuccess: () => {
			void utils.notification.myNotifications.invalidate();
			void utils.notification.unreadCount.invalidate();
		},
	});
	const markAllRead = api.notification.markAllRead.useMutation({
		onSuccess: () => {
			toast.success("All marked as read");
			void utils.notification.myNotifications.invalidate();
			void utils.notification.unreadCount.invalidate();
		},
	});

	const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

	return (
		<div className="space-y-6">
			<PageHeader
				actions={
					unread > 0 ? (
						<Button
							className="gap-1"
							disabled={markAllRead.isPending}
							onClick={() => markAllRead.mutate()}
							size="sm"
							variant="outline"
						>
							<CheckCheck className="h-4 w-4" />
							Mark all read
						</Button>
					) : undefined
				}
				description="Stay updated with alerts and reminders"
				icon={Bell}
				title="Notifications"
			/>

			{unread > 0 && (
				<div className="flex items-center gap-2">
					<Badge className="bg-amber-500 text-white">{unread} unread</Badge>
				</div>
			)}

			{isLoading ? (
				<p className="text-muted-foreground text-sm">
					Loading notifications...
				</p>
			) : !notifications?.length ? (
				<EmptyState
					description="You're all caught up! Notifications will appear here."
					icon={Bell}
					title="No notifications"
				/>
			) : (
				<div className="space-y-2">
					{notifications.map((notif) => (
						<Card
							className={cn(
								"cursor-pointer transition-colors hover:shadow-sm",
								!notif.isRead && "border-amber-200 bg-amber-50/50",
							)}
							key={notif.id}
							onClick={() => {
								if (!notif.isRead)
									markRead.mutate({ notificationId: notif.id });
							}}
						>
							<CardContent className="flex items-start gap-3 p-4">
								<div className="mt-0.5 shrink-0">
									{!notif.isRead ? (
										<Dot className="-ml-1 h-5 w-5 text-amber-500" />
									) : (
										<div className="mt-1.5 ml-1.5 h-2 w-2 rounded-full bg-muted" />
									)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-2">
										<p
											className={cn(
												"font-semibold text-sm leading-tight",
												!notif.isRead
													? "text-foreground"
													: "text-muted-foreground",
											)}
										>
											{notif.title}
										</p>
										<span
											className={cn(
												"shrink-0 rounded-full px-2 py-0.5 font-semibold text-[10px]",
												TYPE_COLORS[notif.type] ?? TYPE_COLORS.system,
											)}
										>
											{notif.type.replace(/_/g, " ")}
										</span>
									</div>
									<p className="mt-1 text-muted-foreground text-xs leading-snug">
										{notif.message}
									</p>
									<p className="mt-1.5 text-[10px] text-muted-foreground">
										{formatDateTime(notif.createdAt)}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
