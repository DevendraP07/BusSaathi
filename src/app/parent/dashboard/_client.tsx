"use client";

import {
	AlertCircle,
	Bell,
	CheckCircle2,
	CreditCard,
	Navigation,
	Route,
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
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function ParentDashboardClient() {
	const { data: stats, isLoading } = api.dashboard.parentStats.useQuery();

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
				</div>
				<Skeleton className="h-64" />
			</div>
		);
	}

	if (!stats) return null;

	const overdueDues = stats.pendingDuesAmount !== "0.00";

	return (
		<div className="space-y-6">
			<PageHeader
				actions={
					<Button
						asChild
						className="bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
						size="sm"
					>
						<Link href="/parent/students/new">+ Add Child</Link>
					</Button>
				}
				description="Manage your children's transport and fee payments"
				icon={Users}
				title="Parent Dashboard"
			/>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatsCard
					accent="amber"
					icon={Users}
					title="My Children"
					value={stats.totalChildren}
				/>
				<StatsCard
					accent="blue"
					description="On a route"
					icon={Route}
					title="Allocated"
					value={stats.childrenAllocated}
				/>
				<StatsCard
					accent={overdueDues ? "red" : "green"}
					icon={CreditCard}
					title="Pending Dues"
					value={`₹${stats.pendingDuesAmount}`}
				/>
				<StatsCard
					accent="green"
					icon={CheckCircle2}
					title="Total Paid"
					value={`₹${stats.totalPaidAmount}`}
				/>
			</div>

			{/* Overdue alert */}
			{stats.pendingDuesCount > 0 && (
				<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
					<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
					<div>
						<p className="font-semibold text-red-700 text-sm">
							You have {stats.pendingDuesCount} pending fee payment
							{stats.pendingDuesCount > 1 ? "s" : ""}
						</p>
						<p className="mt-0.5 text-red-600 text-xs">
							Total due: ₹{stats.pendingDuesAmount}
						</p>
					</div>
					<Button
						asChild
						className="ml-auto shrink-0 bg-red-600 text-white hover:bg-red-700"
						size="sm"
					>
						<Link href="/parent/fees">Pay Now</Link>
					</Button>
				</div>
			)}

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				{/* Children & Routes */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between font-semibold text-sm">
							My Children
							<Link
								className="font-normal text-amber-600 text-xs hover:underline"
								href="/parent/students"
							>
								View all
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{stats.children.length === 0 ? (
							<p className="py-6 text-center text-muted-foreground text-sm">
								No children added yet.{" "}
								<Link
									className="text-amber-600 hover:underline"
									href="/parent/students/new"
								>
									Add one →
								</Link>
							</p>
						) : (
							stats.children.map((child) => {
								const alloc = child.allocations[0];
								return (
									<div
										className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
										key={child.id}
									>
										<div className="flex items-center gap-3">
											<div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-sm">
												{child.name.charAt(0)}
											</div>
											<div>
												<p className="font-medium text-sm">{child.name}</p>
												<p className="text-muted-foreground text-xs">
													{child.className} {child.section}
												</p>
											</div>
										</div>
										<div className="text-right">
											{alloc ? (
												<>
													<p className="font-medium text-green-700 text-xs">
														{alloc.route.name}
													</p>
													<p className="text-[10px] text-muted-foreground">
														{alloc.pickupStop?.stopName ?? "—"}
													</p>
												</>
											) : (
												<Link
													className="text-amber-600 text-xs hover:underline"
													href="/parent/transport"
												>
													Apply for route
												</Link>
											)}
										</div>
									</div>
								);
							})
						)}
					</CardContent>
				</Card>

				{/* Recent Payments */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between font-semibold text-sm">
							Recent Payments
							<Link
								className="font-normal text-amber-600 text-xs hover:underline"
								href="/parent/fees"
							>
								View all
							</Link>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{stats.recentPayments.length === 0 ? (
							<p className="py-6 text-center text-muted-foreground text-sm">
								No payments yet
							</p>
						) : (
							stats.recentPayments.map((p) => (
								<div
									className="flex items-center justify-between rounded-lg border px-3 py-2.5"
									key={p.id}
								>
									<div>
										<p className="font-medium text-sm">{p.student.name}</p>
										<p className="text-muted-foreground text-xs">
											{p.feeStructure.name} · {formatDate(p.createdAt)}
										</p>
									</div>
									<div className="flex items-center gap-2 text-right">
										<span className="font-semibold text-sm">₹{p.amount}</span>
										<StatusBadge status={p.paymentStatus} />
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="font-semibold text-sm">Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
						{[
							{
								href: "/parent/track",
								icon: Navigation,
								label: "Track Bus",
								color: "text-blue-600 bg-blue-50",
							},
							{
								href: "/parent/fees",
								icon: CreditCard,
								label: "Pay Fees",
								color: "text-green-600 bg-green-50",
							},
							{
								href: "/parent/route",
								icon: Route,
								label: "View Route",
								color: "text-amber-600 bg-amber-50",
							},
							{
								href: "/parent/notifications",
								icon: Bell,
								label: "Notifications",
								color: "text-purple-600 bg-purple-50",
							},
						].map((a) => (
							<Link
								className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-shadow hover:shadow-md"
								href={a.href}
								key={a.href}
							>
								<div
									className={cn(
										"flex h-10 w-10 items-center justify-center rounded-xl",
										a.color,
									)}
								>
									<a.icon className="h-5 w-5" />
								</div>
								<span className="font-semibold text-xs">{a.label}</span>
							</Link>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
