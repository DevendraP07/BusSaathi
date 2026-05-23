"use client";

import { Bus, Clock, Route, User } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function ParentRouteClient() {
	const [selectedStudentId, setSelectedStudentId] = useState<string>("");
	const { data: students } = api.student.myStudents.useQuery();

	const firstStudent = students?.[0];
	const activeStudentId = selectedStudentId || firstStudent?.id || "";

	const { data: allocation } = api.route.myChildRoute.useQuery(
		{ studentId: activeStudentId },
		{ enabled: !!activeStudentId },
	);

	return (
		<div className="space-y-6">
			<PageHeader
				description="View your child's assigned bus route and stop timings"
				icon={Route}
				title="Route & Schedule"
			/>

			{students && students.length > 1 && (
				<div className="max-w-xs space-y-1.5">
					<Label>Select Child</Label>
					<Select onValueChange={setSelectedStudentId} value={activeStudentId}>
						<SelectTrigger>
							<SelectValue placeholder="Choose child" />
						</SelectTrigger>
						<SelectContent>
							{students.map((s) => (
								<SelectItem key={s.id} value={s.id}>
									{s.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{!allocation ? (
				<EmptyState
					description="Your child has not been allocated to a route yet. Apply for transport first."
					icon={Route}
					title="No route allocated"
				/>
			) : (
				<div className="space-y-5">
					{/* Route Info */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center justify-between text-sm">
								{allocation.route.name}
								<StatusBadge status={allocation.route.status} />
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div>
									<p className="mb-0.5 text-muted-foreground text-xs">
										Route Code
									</p>
									<p className="font-medium">{allocation.route.routeCode}</p>
								</div>
								<div>
									<p className="mb-0.5 text-muted-foreground text-xs">Type</p>
									<StatusBadge status={allocation.route.routeType} />
								</div>
								<div>
									<p className="mb-0.5 text-muted-foreground text-xs">
										Departure
									</p>
									<p className="flex items-center gap-1 font-medium">
										<Clock className="h-3.5 w-3.5" />
										{allocation.route.departureTime}
									</p>
								</div>
								<div>
									<p className="mb-0.5 text-muted-foreground text-xs">
										Est. Arrival
									</p>
									<p className="font-medium">
										{allocation.route.estimatedArrival ?? "—"}
									</p>
								</div>
							</div>

							{allocation.route.bus && (
								<div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
									<Bus className="h-4 w-4 text-blue-600" />
									<span className="font-medium text-blue-700 text-sm">
										{allocation.route.bus.registrationNumber}
									</span>
									<span className="ml-auto text-blue-500 text-xs">
										Capacity: {allocation.route.bus.capacity}
									</span>
								</div>
							)}
							{allocation.route.driver && (
								<div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
									<User className="h-4 w-4 text-green-600" />
									<span className="font-medium text-green-700 text-sm">
										{allocation.route.driver.name}
									</span>
									<span className="ml-auto text-green-500 text-xs">
										{allocation.route.driver.phone ?? ""}
									</span>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Your Stops */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">Your Child's Stops</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 font-bold text-amber-700 text-xs">
									P
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Pickup Stop</p>
									<p className="font-semibold text-sm">
										{allocation.pickupStop?.stopName ?? "—"}
									</p>
									{allocation.pickupStop?.pickupTime && (
										<p className="text-amber-700 text-xs">
											{allocation.pickupStop.pickupTime}
										</p>
									)}
								</div>
							</div>
							<div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-200 font-bold text-green-700 text-xs">
									D
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Drop Stop</p>
									<p className="font-semibold text-sm">
										{allocation.dropStop?.stopName ?? "—"}
									</p>
									{allocation.dropStop?.dropTime && (
										<p className="text-green-700 text-xs">
											{allocation.dropStop.dropTime}
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* All Stops Timeline */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">Full Route Stops</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="relative space-y-0">
								{allocation.route.stops.map((stop, i) => {
									const isPickup = stop.id === allocation.pickupStopId;
									const isDrop = stop.id === allocation.dropStopId;
									const isLast = i === allocation.route.stops.length - 1;
									return (
										<div className="flex items-start gap-3" key={stop.id}>
											<div className="flex flex-col items-center">
												<div
													className={cn(
														"flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-bold text-[10px]",
														isPickup
															? "border-amber-500 bg-amber-100 text-amber-700"
															: isDrop
																? "border-green-500 bg-green-100 text-green-700"
																: "border-muted-foreground/30 bg-muted text-muted-foreground",
													)}
												>
													{stop.stopOrder}
												</div>
												{!isLast && (
													<div className="mt-1 mb-1 min-h-[20px] w-px flex-1 bg-border" />
												)}
											</div>
											<div className="min-w-0 pb-4">
												<p
													className={cn(
														"font-medium text-sm",
														(isPickup || isDrop) &&
															"text-[oklch(0.18_0.04_250)]",
													)}
												>
													{stop.stopName}
												</p>
												{stop.landmark && (
													<p className="text-muted-foreground text-xs">
														{stop.landmark}
													</p>
												)}
												{stop.pickupTime && (
													<p className="text-muted-foreground text-xs">
														Pick: {stop.pickupTime}
													</p>
												)}
												{isPickup && (
													<span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-[10px] text-amber-700">
														YOUR PICKUP
													</span>
												)}
												{isDrop && (
													<span className="rounded bg-green-100 px-2 py-0.5 font-semibold text-[10px] text-green-700">
														YOUR DROP
													</span>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
