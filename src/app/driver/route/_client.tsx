"use client";

import { Bus, MapPin, Route } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";

export function DriverRouteClient() {
	const { data: route, isLoading } = api.route.myRoute.useQuery();

	if (isLoading)
		return <p className="text-muted-foreground text-sm">Loading route...</p>;

	return (
		<div className="space-y-6">
			<PageHeader
				description="Your assigned bus route and stops"
				icon={Route}
				title="My Route"
			/>
			{!route ? (
				<EmptyState
					description="You haven't been assigned a route yet. Contact your transport manager."
					icon={Route}
					title="No route assigned"
				/>
			) : (
				<div className="space-y-5">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center justify-between text-sm">
								{route.name} <StatusBadge status={route.status} />
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-3 text-sm">
							<div>
								<p className="text-muted-foreground text-xs">Code</p>
								<p className="font-semibold">{route.routeCode}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Type</p>
								<StatusBadge status={route.routeType} />
							</div>
							<div>
								<p className="text-muted-foreground text-xs">From</p>
								<p className="font-semibold">{route.startLocation}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">To</p>
								<p className="font-semibold">{route.endLocation}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Departure</p>
								<p className="font-semibold">{route.departureTime}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">ETA</p>
								<p className="font-semibold">{route.estimatedArrival ?? "—"}</p>
							</div>
						</CardContent>
					</Card>

					{route.bus && (
						<Card>
							<CardContent className="flex items-center gap-3 p-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
									<Bus className="h-5 w-5" />
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Assigned Bus</p>
									<p className="font-bold">{route.bus.registrationNumber}</p>
									<p className="text-muted-foreground text-xs">
										{route.bus.model ?? ""} · Capacity: {route.bus.capacity}
									</p>
								</div>
								<StatusBadge className="ml-auto" status={route.bus.status} />
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-sm">
								<MapPin className="h-4 w-4" />
								Stops ({route.stops.length})
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-1.5">
							{route.stops.map((stop, _i) => (
								<div
									className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-3"
									key={stop.id}
								>
									<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-xs">
										{stop.stopOrder}
									</div>
									<div className="flex-1">
										<p className="font-semibold text-sm">{stop.stopName}</p>
										{stop.landmark && (
											<p className="text-muted-foreground text-xs">
												{stop.landmark}
											</p>
										)}
									</div>
									{stop.pickupTime && (
										<span className="font-medium text-muted-foreground text-xs">
											Pick: {stop.pickupTime}
										</span>
									)}
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
