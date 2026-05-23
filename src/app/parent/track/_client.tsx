"use client";

import { Bus, Clock, MapPin, Navigation, RefreshCw } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function TrackBusClient() {
	const [selectedStudentId, setSelectedStudentId] = useState("");
	const { data: students } = api.student.myStudents.useQuery();
	const firstStudent = students?.[0];
	const activeStudentId = selectedStudentId || firstStudent?.id || "";

	const {
		data: tracking,
		isLoading,
		refetch,
		isFetching,
	} = api.tracking.getBusLocation.useQuery(
		{ studentId: activeStudentId },
		{ enabled: !!activeStudentId, refetchInterval: 30000 },
	);

	return (
		<div className="space-y-6">
			<PageHeader
				actions={
					<Button
						className="gap-1"
						disabled={isFetching}
						onClick={() => void refetch()}
						size="sm"
						variant="outline"
					>
						<RefreshCw
							className={cn("h-4 w-4", isFetching && "animate-spin")}
						/>
						Refresh
					</Button>
				}
				description="Real-time bus location and estimated arrival"
				icon={Navigation}
				title="Track Bus"
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

			{!activeStudentId ? (
				<EmptyState
					description="Add a child first to track their bus."
					icon={Navigation}
					title="No children found"
				/>
			) : isLoading ? (
				<p className="text-muted-foreground text-sm">
					Loading tracking info...
				</p>
			) : !tracking ? (
				<EmptyState
					description="Your child is not allocated to a route yet."
					icon={Navigation}
					title="No tracking data"
				/>
			) : (
				<div className="space-y-4">
					{/* Status Banner */}
					<div
						className={cn(
							"flex items-center gap-3 rounded-xl border p-4",
							tracking.hasActiveTrip
								? "border-green-200 bg-green-50"
								: "border-amber-200 bg-amber-50",
						)}
					>
						<div
							className={cn(
								"flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
								tracking.hasActiveTrip ? "bg-green-100" : "bg-amber-100",
							)}
						>
							<Bus
								className={cn(
									"h-5 w-5",
									tracking.hasActiveTrip ? "text-green-600" : "text-amber-600",
								)}
							/>
						</div>
						<div>
							<p
								className={cn(
									"font-semibold text-sm",
									tracking.hasActiveTrip ? "text-green-800" : "text-amber-800",
								)}
							>
								{tracking.hasActiveTrip ? "Bus is Active" : "Bus is Inactive"}
							</p>
							<p
								className={cn(
									"text-xs",
									tracking.hasActiveTrip ? "text-green-600" : "text-amber-600",
								)}
							>
								{tracking.message ?? "Trip in progress"}
							</p>
						</div>
						{tracking.hasActiveTrip && (
							<Badge className="ml-auto animate-pulse bg-green-600 text-white">
								LIVE
							</Badge>
						)}
					</div>

					{/* ETA Card */}
					{tracking.estimatedArrival && (
						<Card className="border-amber-200 bg-amber-50">
							<CardContent className="flex items-center gap-4 p-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-200">
									<Clock className="h-6 w-6 text-amber-700" />
								</div>
								<div>
									<p className="font-medium text-amber-600 text-xs">
										Estimated Arrival at Your Stop
									</p>
									<p className="font-black text-2xl text-amber-700">
										{tracking.estimatedArrival}
									</p>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Location Info */}
					{tracking.location && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">Current Location</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{/* Simulated map placeholder */}
								<div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-blue-100 to-green-100">
									<div
										className="absolute inset-0 opacity-20"
										style={{
											backgroundImage:
												"repeating-linear-gradient(0deg, transparent, transparent 30px, #94a3b8 30px, #94a3b8 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, #94a3b8 30px, #94a3b8 31px)",
										}}
									/>
									<div className="relative flex flex-col items-center gap-2">
										<div className="relative">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 shadow-lg">
												<Bus className="h-5 w-5 text-white" />
											</div>
											<div className="absolute -inset-1 animate-ping rounded-full bg-amber-500/30" />
										</div>
										<div className="rounded-lg bg-white/90 px-3 py-1.5 text-center shadow backdrop-blur-sm">
											<p className="font-semibold text-foreground text-xs">
												Bus Location
											</p>
											<p className="text-[10px] text-muted-foreground">
												{tracking.location.latitude},{" "}
												{tracking.location.longitude}
											</p>
										</div>
									</div>
									{tracking.pickupStop && (
										<div className="absolute bottom-3 left-3 rounded-lg bg-amber-500 px-2 py-1 text-white">
											<div className="flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												<span className="font-semibold text-[10px]">
													{tracking.pickupStop.stopName}
												</span>
											</div>
										</div>
									)}
									<p className="absolute top-2 right-2 rounded bg-white/80 px-2 py-0.5 text-[10px] text-muted-foreground">
										Simulated Map
									</p>
								</div>

								{"speed" in tracking.location && (
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div className="rounded-lg border bg-muted/30 p-2.5">
											<p className="text-muted-foreground text-xs">Speed</p>
											<p className="font-semibold">
												{tracking.location.speed} km/h
											</p>
										</div>
										<div className="rounded-lg border bg-muted/30 p-2.5">
											<p className="text-muted-foreground text-xs">Status</p>
											<p className="font-semibold capitalize">
												{tracking.location.status}
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Driver & Bus Info */}
					{tracking.hasActiveTrip && (
						<div className="grid grid-cols-2 gap-3">
							{tracking.driver && (
								<Card>
									<CardContent className="flex items-center gap-3 p-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 text-sm">
											{(tracking.driver as { name: string }).name.charAt(0)}
										</div>
										<div className="min-w-0">
											<p className="text-muted-foreground text-xs">Driver</p>
											<p className="truncate font-medium text-sm">
												{(tracking.driver as { name: string }).name}
											</p>
										</div>
									</CardContent>
								</Card>
							)}
							{tracking.bus && (
								<Card>
									<CardContent className="flex items-center gap-3 p-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
											<Bus className="h-4 w-4" />
										</div>
										<div className="min-w-0">
											<p className="text-muted-foreground text-xs">Bus</p>
											<p className="truncate font-medium text-sm">
												{
													(tracking.bus as { registrationNumber: string })
														.registrationNumber
												}
											</p>
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					)}

					{/* Stops Progress */}
					{tracking.stops && tracking.stops.length > 0 && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">Route Stops</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-1">
									{tracking.stops.map((stop, i) => {
										const isPickup = tracking.pickupStop?.id === stop.id;
										const isDrop = tracking.dropStop?.id === stop.id;
										const isPassed =
											tracking.hasActiveTrip &&
											tracking.location &&
											"currentStopIndex" in tracking.location &&
											i < tracking.location.currentStopIndex;
										return (
											<div
												className={cn(
													"flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
													isPickup
														? "border border-amber-200 bg-amber-50"
														: isDrop
															? "border border-green-200 bg-green-50"
															: isPassed
																? "opacity-50"
																: "",
												)}
												key={stop.id}
											>
												<div
													className={cn(
														"flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-[10px]",
														isPassed
															? "bg-green-200 text-green-700"
															: "bg-muted text-muted-foreground",
													)}
												>
													{isPassed ? "✓" : stop.stopOrder}
												</div>
												<span
													className={cn(
														"font-medium",
														(isPickup || isDrop) && "font-semibold",
													)}
												>
													{stop.stopName}
												</span>
												{stop.pickupTime && (
													<span className="ml-auto text-muted-foreground text-xs">
														{stop.pickupTime}
													</span>
												)}
												{isPickup && (
													<span className="ml-1 rounded bg-amber-200 px-1.5 py-0.5 font-semibold text-[10px] text-amber-800">
														YOUR STOP
													</span>
												)}
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}
