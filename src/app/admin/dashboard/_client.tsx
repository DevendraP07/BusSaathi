"use client";

import {
	AlertTriangle,
	Bus,
	Route,
	Shield,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

export function AdminClient() {
	const { data: stats, isLoading } = api.dashboard.adminStats.useQuery();

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
				description="Full system overview and control"
				icon={Shield}
				title="Admin Dashboard"
			/>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatsCard
					accent="amber"
					icon={Users}
					title="Total Users"
					value={stats.totalUsers}
				/>
				<StatsCard
					accent="blue"
					icon={Users}
					title="Parents"
					value={stats.usersByRole.parent}
				/>
				<StatsCard
					accent="green"
					icon={Users}
					title="Drivers"
					value={stats.usersByRole.driver}
				/>
				<StatsCard
					accent="purple"
					icon={Users}
					title="Managers"
					value={stats.usersByRole.manager}
				/>
				<StatsCard
					accent="amber"
					description={`${stats.totalRoutes} total`}
					icon={Route}
					title="Active Routes"
					value={stats.activeRoutes}
				/>
				<StatsCard
					accent="blue"
					description={`${stats.totalBuses} total`}
					icon={Bus}
					title="Active Buses"
					value={stats.activeBuses}
				/>
				<StatsCard
					accent="green"
					icon={TrendingUp}
					title="Monthly Revenue"
					value={`₹${stats.monthlyRevenue}`}
				/>
				<StatsCard
					accent={stats.openIssues > 0 ? "red" : "green"}
					icon={AlertTriangle}
					title="Open Issues"
					value={stats.openIssues}
				/>
			</div>

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				{/* Recent Users */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between text-sm">
							Recent Users
							<Link
								className="font-normal text-amber-600 text-xs hover:underline"
								href="/admin/users"
							>
								View all
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{stats.recentUsers.map((u) => (
							<div
								className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5"
								key={u.id}
							>
								<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-xs">
									{u.name.charAt(0)}
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm">{u.name}</p>
									<p className="truncate text-muted-foreground text-xs">
										{u.email}
									</p>
								</div>
								<StatusBadge status={u.role ?? "parent"} />
							</div>
						))}
					</CardContent>
				</Card>

				{/* Recent Issues */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between text-sm">
							Open Issues
							<Link
								className="font-normal text-amber-600 text-xs hover:underline"
								href="/admin/users"
							>
								View all
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{stats.recentIssues.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No open issues 🎉
							</p>
						) : (
							stats.recentIssues.map((issue) => (
								<div
									className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
									key={issue.id}
								>
									<div>
										<p className="font-medium text-sm">{issue.title}</p>
										<p className="text-muted-foreground text-xs">
											{issue.reporter?.name ?? "—"} ·{" "}
											{formatDate(issue.createdAt)}
										</p>
									</div>
									<StatusBadge status={issue.priority} />
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>

			{/* Role breakdown */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">User Role Distribution</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{Object.entries(stats.usersByRole).map(([role, count]) => {
							const total = stats.totalUsers || 1;
							const pct = Math.round((count / total) * 100);
							return (
								<div className="space-y-2" key={role}>
									<div className="flex items-center justify-between text-sm">
										<span className="font-medium capitalize">{role}s</span>
										<span className="font-bold">{count}</span>
									</div>
									<div className="h-2 rounded-full bg-muted">
										<div
											className="h-2 rounded-full bg-amber-500 transition-all"
											style={{ width: `${pct}%` }}
										/>
									</div>
									<p className="text-muted-foreground text-xs">
										{pct}% of total
									</p>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
