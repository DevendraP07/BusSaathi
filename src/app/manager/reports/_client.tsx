"use client";

import { BarChart3, Bus, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export function ManagerClient() {
	const { data: feeSummary, isLoading: feeLoading } =
		api.report.feeCollectionSummary.useQuery({});
	const { data: routeUtil } = api.report.routeUtilization.useQuery();
	const { data: tripPerf } = api.report.tripPerformance.useQuery({});
	const { data: allocSummary } = api.report.allocationSummary.useQuery();

	return (
		<div className="space-y-6">
			<PageHeader
				description="Transport operations performance overview"
				icon={BarChart3}
				title="Reports & Analytics"
			/>

			{/* Fee Summary */}
			{feeLoading ? (
				<Skeleton className="h-32" />
			) : (
				feeSummary && (
					<>
						<h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
							Fee Collection
						</h2>
						<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
							<StatsCard
								accent="green"
								icon={TrendingUp}
								title="Total Collected"
								value={`₹${feeSummary.totalCollected}`}
							/>
							<StatsCard
								accent="amber"
								icon={TrendingUp}
								title="Pending Amount"
								value={`₹${feeSummary.totalPending}`}
							/>
							<StatsCard
								accent="blue"
								icon={TrendingUp}
								title="Confirmed Payments"
								value={feeSummary.confirmed}
							/>
							<StatsCard
								accent={feeSummary.pending > 0 ? "red" : "green"}
								icon={TrendingUp}
								title="Defaulters"
								value={feeSummary.pending}
							/>
						</div>
					</>
				)
			)}

			{/* Trip Performance */}
			{tripPerf && (
				<>
					<h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
						Trip Performance
					</h2>
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
						<StatsCard
							accent="amber"
							icon={Bus}
							title="Total Trips"
							value={tripPerf.totalTrips}
						/>
						<StatsCard
							accent="green"
							icon={Bus}
							title="Completed"
							value={tripPerf.completed}
						/>
						<StatsCard
							accent="red"
							icon={Bus}
							title="Cancelled"
							value={tripPerf.cancelled}
						/>
						<StatsCard
							accent="blue"
							icon={BarChart3}
							title="Completion Rate"
							value={`${tripPerf.completionRate}%`}
						/>
					</div>
				</>
			)}

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				{/* Route Utilization */}
				{routeUtil && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">Route Utilization</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{routeUtil.map((r) => (
								<div
									className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5"
									key={r.routeId}
								>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">
											{r.routeName}
										</p>
										<p className="text-muted-foreground text-xs">
											{r.studentsAllocated}/{r.busCapacity} students
										</p>
									</div>
									<div className="shrink-0 text-right">
										<p className="font-bold text-sm">{r.occupancyPercent}%</p>
										<p className="text-muted-foreground text-xs">
											{r.totalTripsCompleted} trips
										</p>
									</div>
									<div className="h-2 w-16 shrink-0 rounded-full bg-muted">
										<div
											className="h-2 rounded-full bg-amber-500"
											style={{ width: `${Math.min(100, r.occupancyPercent)}%` }}
										/>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Allocation Summary */}
				{allocSummary && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center justify-between text-sm">
								Student Allocation
								<span className="font-normal text-muted-foreground text-xs">
									{allocSummary.totalAllocated} total
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{allocSummary.byRoute.map((r) => (
								<div
									className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
									key={r.name}
								>
									<p className="font-medium text-sm">{r.name}</p>
									<div className="flex items-center gap-2">
										<span className="font-bold text-sm">{r.count}</span>
										<span className="text-muted-foreground text-xs">
											students
										</span>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
