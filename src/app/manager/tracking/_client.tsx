"use client";

import { Bus, MapPin, RefreshCw, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function ManagerClient() {
	const {
		data: liveTrips,
		isLoading,
		refetch,
		isFetching,
	} = api.tracking.liveOverview.useQuery(undefined, { refetchInterval: 30000 });

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
				description="Real-time overview of all active bus trips"
				icon={MapPin}
				title="Live Tracking"
			/>

			{isLoading ? (
				<p className="text-muted-foreground text-sm">Loading live trips...</p>
			) : !liveTrips?.length ? (
				<EmptyState
					description="No buses are currently on the road. Live trip data will appear here when drivers start trips."
					icon={Bus}
					title="No active trips"
				/>
			) : (
				<>
					<div className="mb-2 flex items-center gap-2">
						<Badge className="animate-pulse bg-green-600 text-white">
							{liveTrips.length} LIVE
						</Badge>
						<span className="text-muted-foreground text-sm">
							trips currently active
						</span>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{liveTrips.map((trip) => (
							<Card
								className="border-green-200 bg-green-50/30"
								key={trip.tripId}
							>
								<CardHeader className="pb-2">
									<CardTitle className="flex items-center justify-between text-sm">
										<div className="flex items-center gap-2">
											<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
												<Bus className="h-4 w-4" />
											</div>
											<span className="truncate">
												{trip.route?.name ?? "Unknown Route"}
											</span>
										</div>
										<Badge className="shrink-0 bg-green-600 text-[10px] text-white">
											LIVE
										</Badge>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3 pt-0">
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div>
											<p className="text-muted-foreground text-xs">Bus</p>
											<p className="font-semibold">
												{trip.bus?.registrationNumber ?? "—"}
											</p>
										</div>
										<div>
											<p className="text-muted-foreground text-xs">Driver</p>
											<p className="font-semibold">
												{trip.driver?.name ?? "—"}
											</p>
										</div>
										<div>
											<p className="text-muted-foreground text-xs">Trip Ref</p>
											<p className="font-mono text-xs">{trip.tripRef}</p>
										</div>
										<div>
											<p className="text-muted-foreground text-xs">Students</p>
											<p className="flex items-center gap-1 font-semibold">
												<Users className="h-3 w-3" />
												{trip.studentsOnboard}/{trip.totalStudents} boarded
											</p>
										</div>
									</div>

									{/* Simulated map */}
									<div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-blue-100 to-green-100">
										<div
											className="absolute inset-0 opacity-10"
											style={{
												backgroundImage:
													"repeating-linear-gradient(0deg, transparent, transparent 20px, #94a3b8 20px, #94a3b8 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, #94a3b8 20px, #94a3b8 21px)",
											}}
										/>
										<div className="relative flex flex-col items-center gap-1">
											<div className="relative">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 shadow-lg">
													<Bus className="h-4 w-4 text-white" />
												</div>
												<div className="absolute -inset-1 animate-ping rounded-full bg-amber-500/30" />
											</div>
											<div className="rounded bg-white/90 px-2 py-0.5 text-center font-semibold text-[10px]">
												{trip.location.latitude}, {trip.location.longitude}
											</div>
										</div>
										<p className="absolute top-1.5 right-2 rounded bg-white/70 px-1.5 py-0.5 text-[9px] text-muted-foreground">
											Simulated
										</p>
									</div>

									<div className="flex items-center justify-between text-muted-foreground text-xs">
										<span>Speed: {trip.location.speed} km/h</span>
										<span className="capitalize">
											Status: {trip.location.status}
										</span>
										<span>
											Updated:{" "}
											{new Date(trip.lastUpdated).toLocaleTimeString("en-IN", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</>
			)}
		</div>
	);
}
