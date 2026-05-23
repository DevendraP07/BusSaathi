"use client";

import {
	AlertTriangle,
	Bus,
	CreditCard,
	LayoutDashboard,
	Route,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

export function ManagerClient() {
	const { data: stats, isLoading } = api.dashboard.managerStats.useQuery();

	if (isLoading)
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
				</div>
			</div>
		);
	if (!stats) return null;

	return (
		<div className="space-y-6">
			<PageHeader
				actions={
					<div className="flex gap-2">
						<Button asChild size="sm" variant="outline">
							<Link href="/manager/routes/new">+ Route</Link>
						</Button>
						<Button
							asChild
							className="bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
							size="sm"
						>
							<Link href="/manager/buses/new">+ Bus</Link>
						</Button>
					</div>
				}
				description="Transport operations overview"
				icon={LayoutDashboard}
				title="Manager Dashboard"
			/>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatsCard
					accent="amber"
					icon={Route}
					title="Active Routes"
					value={stats.activeRoutesCount}
				/>
				<StatsCard
					accent="blue"
					icon={Bus}
					title="Active Buses"
					value={stats.activeBusesCount}
				/>
				<StatsCard
					accent="indigo"
					icon={Users}
					title="Total Students"
					value={stats.totalStudentsCount}
				/>
				<StatsCard
					accent="green"
					icon={Users}
					title="Allocated"
					value={stats.allocatedStudentsCount}
				/>
				<StatsCard
					accent="amber"
					description={`${stats.todayTripsCompleted} completed`}
					icon={Bus}
					title="Today's Trips"
					value={stats.todayTripsCount}
				/>
				<StatsCard
					accent="green"
					icon={TrendingUp}
					title="Monthly Revenue"
					value={`₹${stats.monthlyRevenue}`}
				/>
				<StatsCard
					accent={stats.openIssuesCount > 0 ? "red" : "green"}
					icon={AlertTriangle}
					title="Open Issues"
					value={stats.openIssuesCount}
				/>
				<StatsCard
					accent={stats.overduePaymentsCount > 0 ? "red" : "green"}
					icon={CreditCard}
					title="Overdue Payments"
					value={stats.overduePaymentsCount}
				/>
			</div>

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				{/* Today's Trips */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between text-sm">
							Today's Trips
							<Link
								className="font-normal text-amber-600 text-xs hover:underline"
								href="/manager/tracking"
							>
								Live View
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{stats.todayTrips.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No trips today
							</p>
						) : (
							stats.todayTrips.map((t) => (
								<div
									className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
									key={t.id}
								>
									<div>
										<p className="font-medium text-sm">
											{t.route?.name ?? "—"}
										</p>
										<p className="text-muted-foreground text-xs">
											{t.driver?.name ?? "No driver"}
										</p>
									</div>
									<StatusBadge status={t.status} />
								</div>
							))
						)}
					</CardContent>
				</Card>

				{/* Open Issues */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between text-sm">
							Recent Issues
							<Link
								className="font-normal text-amber-600 text-xs hover:underline"
								href="/manager/issues"
							>
								View all
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{stats.recentOpenIssues.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No open issues
							</p>
						) : (
							stats.recentOpenIssues.map((issue) => (
								<div
									className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
									key={issue.id}
								>
									<div>
										<p className="font-medium text-sm">{issue.title}</p>
										<p className="text-muted-foreground text-xs">
											{issue.reporter?.name ?? "Unknown"}
										</p>
									</div>
									<StatusBadge status={issue.priority} />
								</div>
							))
						)}
					</CardContent>
				</Card>

				{/* Pending Payments */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between text-sm">
							Pending Payments
							<Link
								className="font-normal text-amber-600 text-xs hover:underline"
								href="/manager/fees/payments"
							>
								View all
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{stats.recentPendingPayments.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No pending payments
							</p>
						) : (
							stats.recentPendingPayments.map((p) => (
								<div
									className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
									key={p.id}
								>
									<div>
										<p className="font-medium text-sm">
											{p.student?.name ?? "—"}
										</p>
										<p className="text-muted-foreground text-xs">
											Due: {formatDate(p.dueDate)}
										</p>
									</div>
									<span className="font-semibold text-sm">₹{p.amount}</span>
								</div>
							))
						)}
					</CardContent>
				</Card>

				{/* Route Overview */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between text-sm">
							Routes Overview
							<Link
								className="font-normal text-amber-600 text-xs hover:underline"
								href="/manager/routes"
							>
								Manage
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{stats.routes.slice(0, 5).map((r) => (
							<div
								className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
								key={r.id}
							>
								<div>
									<p className="font-medium text-sm">{r.name}</p>
									<p className="text-muted-foreground text-xs">
										{r.allocations?.length ?? 0} students ·{" "}
										{r.bus ? r.bus.registrationNumber : "No bus"}
									</p>
								</div>
								<StatusBadge status={r.status} />
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
