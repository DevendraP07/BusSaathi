"use client";

import {
	AlertTriangle,
	BarChart3,
	Bus,
	CheckCircle2,
	PlayCircle,
	Route,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

export function DriverDashboardClient() {
	const { data: stats, isLoading } = api.dashboard.driverStats.useQuery();
	const utils = api.useUtils();

	const startTrip = api.trip.start.useMutation({
		onSuccess: () => {
			toast.success("Trip started!");
			void utils.dashboard.driverStats.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});
	const completeTrip = api.trip.complete.useMutation({
		onSuccess: () => {
			toast.success("Trip completed!");
			void utils.dashboard.driverStats.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	if (isLoading)
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
				</div>
			</div>
		);
	if (!stats) return null;

	const todayTrip = stats.todayTrip;
	const canStart = todayTrip?.status === "scheduled";
	const canComplete =
		todayTrip?.status === "started" || todayTrip?.status === "ongoing";

	return (
		<div className="space-y-6">
			<PageHeader
				description="Manage your daily trips and route"
				icon={Bus}
				title="Driver Dashboard"
			/>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatsCard
					accent="amber"
					icon={Bus}
					title="This Month Trips"
					value={stats.monthlyTripsTotal}
				/>
				<StatsCard
					accent="green"
					icon={CheckCircle2}
					title="Completed"
					value={stats.completedTrips}
				/>
				<StatsCard
					accent="blue"
					icon={BarChart3}
					title="Completion Rate"
					value={`${stats.completionRate}%`}
				/>
				<StatsCard
					accent={stats.openIssuesCount > 0 ? "red" : "green"}
					icon={AlertTriangle}
					title="Open Issues"
					value={stats.openIssuesCount}
				/>
			</div>

			{/* Today's Trip */}
			<Card
				className={
					!todayTrip
						? "border-amber-200 bg-amber-50"
						: "border-green-200 bg-green-50"
				}
			>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center justify-between text-sm">
						Today's Trip
						{todayTrip && <StatusBadge status={todayTrip.status} />}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{!todayTrip ? (
						<div className="py-6 text-center">
							<p className="text-muted-foreground text-sm">
								No trip scheduled for today
							</p>
							<p className="mt-1 text-muted-foreground text-xs">
								Contact your manager if this is incorrect
							</p>
						</div>
					) : (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div>
									<p className="text-muted-foreground text-xs">Trip Ref</p>
									<p className="font-mono font-semibold">{todayTrip.tripRef}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Route</p>
									<p className="font-semibold">{todayTrip.route?.name}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Bus</p>
									<p className="font-semibold">
										{todayTrip.bus?.registrationNumber}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Students</p>
									<p className="font-semibold">
										{todayTrip.route?.allocations?.length ?? 0}
									</p>
								</div>
							</div>
							{todayTrip.route?.stops && (
								<div className="rounded-lg border bg-white/60 p-3">
									<p className="mb-2 font-semibold text-muted-foreground text-xs">
										STOPS ({todayTrip.route.stops.length})
									</p>
									<div className="flex flex-wrap gap-1">
										{todayTrip.route.stops.map((s) => (
											<span
												className="rounded border bg-white px-1.5 py-0.5 text-[10px]"
												key={s.id}
											>
												{s.stopName}
											</span>
										))}
									</div>
								</div>
							)}
							<div className="flex gap-2">
								{canStart && (
									<Button
										className="flex-1 gap-2 bg-green-600 text-white hover:bg-green-700"
										disabled={startTrip.isPending}
										onClick={() => startTrip.mutate({ tripId: todayTrip.id })}
									>
										<PlayCircle className="h-4 w-4" />
										{startTrip.isPending ? "Starting..." : "Start Trip"}
									</Button>
								)}
								{canComplete && (
									<Button
										className="flex-1 gap-2 bg-blue-600 text-white hover:bg-blue-700"
										disabled={completeTrip.isPending}
										onClick={() =>
											completeTrip.mutate({ tripId: todayTrip.id })
										}
									>
										<CheckCircle2 className="h-4 w-4" />
										{completeTrip.isPending ? "Completing..." : "Complete Trip"}
									</Button>
								)}
								{(canStart || canComplete) && (
									<Button asChild className="flex-1" variant="outline">
										<Link href="/driver/trip">View Details</Link>
									</Button>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				{/* Assigned Route */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between text-sm">
							Assigned Route
							<Link
								className="font-normal text-amber-600 text-xs hover:underline"
								href="/driver/route"
							>
								View
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{!stats.assignedRoute ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No route assigned
							</p>
						) : (
							<div className="space-y-2 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Route</span>
									<span className="font-semibold">
										{stats.assignedRoute.name}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Type</span>
									<StatusBadge status={stats.assignedRoute.routeType} />
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Departure</span>
									<span className="font-medium">
										{stats.assignedRoute.departureTime}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Bus</span>
									<span className="font-medium">
										{stats.assignedRoute.bus?.registrationNumber ?? "—"}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Stops</span>
									<span className="font-medium">
										{stats.assignedRoute.stops.length}
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Trips */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">Recent Trips</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{stats.recentTrips.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No trips yet
							</p>
						) : (
							stats.recentTrips.map((t) => (
								<div
									className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2"
									key={t.id}
								>
									<div>
										<p className="font-medium text-sm">
											{t.route?.name ?? "—"}
										</p>
										<p className="text-muted-foreground text-xs">
											{formatDate(t.scheduledDate)}
										</p>
									</div>
									<StatusBadge status={t.status} />
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-3 gap-3">
				{[
					{
						href: "/driver/trip",
						icon: Bus,
						label: "Today's Trip",
						color: "text-green-600 bg-green-50",
					},
					{
						href: "/driver/issues/report",
						icon: AlertTriangle,
						label: "Report Issue",
						color: "text-red-600 bg-red-50",
					},
					{
						href: "/driver/profile",
						icon: Route,
						label: "My Profile",
						color: "text-blue-600 bg-blue-50",
					},
				].map((a) => (
					<Link
						className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-shadow hover:shadow-md"
						href={a.href}
						key={a.href}
					>
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.color}`}
						>
							<a.icon className="h-5 w-5" />
						</div>
						<span className="font-semibold text-xs">{a.label}</span>
					</Link>
				))}
			</div>
		</div>
	);
}
