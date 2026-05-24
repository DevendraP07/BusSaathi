"use client";

import { Bus, MapPin, Pencil, Route, Save, User, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export function RouteDetailClient({ routeId }: { routeId: string }) {
	const [editing, setEditing] = useState(false);
	const [status, setStatus] = useState<"active" | "inactive" | "suspended">(
		"active",
	);
	const [busId, setBusId] = useState("");
	const [driverId, setDriverId] = useState("");
	const [departureTime, setDepartureTime] = useState("");

	const { data: route, isLoading } = api.route.getById.useQuery({ routeId });
	const { data: buses } = api.bus.list.useQuery({});
	const { data: drivers } = api.admin.listUsersByRole.useQuery({
		role: "driver",
	});
	const utils = api.useUtils();

	useEffect(() => {
		if (route) {
			setStatus(route.status as "active" | "inactive" | "suspended");
			setBusId(route.busId ?? "");
			setDriverId(route.driverId ?? "");
			setDepartureTime(route.departureTime);
		}
	}, [route]);

	const update = api.route.update.useMutation({
		onSuccess: () => {
			toast.success("Route updated!");
			setEditing(false);
			void utils.route.getById.invalidate({ routeId });
		},
		onError: (e) => toast.error(e.message),
	});

	if (isLoading) return <Skeleton className="h-96" />;
	if (!route) return <p className="text-muted-foreground">Route not found.</p>;

	return (
		<div className="max-w-2xl space-y-5">
			<PageHeader
				actions={
					<div className="flex gap-2">
						{!editing ? (
							<Button
								className="gap-1"
								onClick={() => setEditing(true)}
								size="sm"
								variant="outline"
							>
								<Pencil className="h-4 w-4" />
								Edit
							</Button>
						) : (
							<>
								<Button
									className="gap-1"
									onClick={() => setEditing(false)}
									size="sm"
									variant="outline"
								>
									<X className="h-4 w-4" />
									Cancel
								</Button>
								<Button
									className="gap-1 bg-[oklch(0.18_0.04_250)] text-white"
									disabled={update.isPending}
									onClick={() =>
										update.mutate({
											routeId,
											status,
											busId: busId === "none" || !busId ? undefined : busId,
											driverId:
												driverId === "none" || !driverId ? undefined : driverId,
											departureTime,
										})
									}
									size="sm"
								>
									<Save className="h-4 w-4" />
									{update.isPending ? "Saving..." : "Save"}
								</Button>
							</>
						)}
					</div>
				}
				description={`Code: ${route.routeCode}`}
				icon={Route}
				title={route.name}
			/>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Route Info</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-4">
					{editing ? (
						<>
							<div className="space-y-1.5">
								<Label className="text-xs">Status</Label>
								<Select
									onValueChange={(v) => setStatus(v as typeof status)}
									value={status}
								>
									<SelectTrigger className="h-8">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="suspended">Suspended</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Departure Time</Label>
								<Input
									className="h-8"
									onChange={(e) => setDepartureTime(e.target.value)}
									type="time"
									value={departureTime}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Assign Bus</Label>
								<Select onValueChange={setBusId} value={busId}>
									<SelectTrigger className="h-8">
										<SelectValue placeholder="Select bus" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None</SelectItem>
										{buses?.map((b) => (
											<SelectItem key={b.id} value={b.id}>
												{b.registrationNumber}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Assign Driver</Label>
								<Select onValueChange={setDriverId} value={driverId}>
									<SelectTrigger className="h-8">
										<SelectValue placeholder="Select driver" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None</SelectItem>
										{drivers?.map((d) => (
											<SelectItem key={d.id} value={d.id}>
												{d.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</>
					) : (
						<>
							<div>
								<p className="text-muted-foreground text-xs">Status</p>
								<StatusBadge status={route.status} />
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Type</p>
								<StatusBadge status={route.routeType} />
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Departure</p>
								<p className="font-semibold text-sm">{route.departureTime}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">ETA</p>
								<p className="font-semibold text-sm">
									{route.estimatedArrival ?? "—"}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">From</p>
								<p className="font-semibold text-sm">{route.startLocation}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">To</p>
								<p className="font-semibold text-sm">{route.endLocation}</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{route.bus && (
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
							<Bus className="h-5 w-5" />
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Assigned Bus</p>
							<p className="font-semibold">
								{route.bus.registrationNumber} · Cap: {route.bus.capacity}
							</p>
						</div>
						<StatusBadge className="ml-auto" status={route.bus.status} />
					</CardContent>
				</Card>
			)}

			{route.driver && (
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-600">
							<User className="h-5 w-5" />
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Assigned Driver</p>
							<p className="font-semibold">
								{route.driver.name} · {route.driver.phone ?? "No phone"}
							</p>
						</div>
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
					{route.stops.map((stop) => (
						<div
							className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5"
							key={stop.id}
						>
							<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-[10px] text-amber-700">
								{stop.stopOrder}
							</div>
							<div className="flex-1">
								<p className="font-medium text-sm">{stop.stopName}</p>
								{stop.landmark && (
									<p className="text-muted-foreground text-xs">
										{stop.landmark}
									</p>
								)}
							</div>
							{stop.pickupTime && (
								<span className="text-muted-foreground text-xs">
									{stop.pickupTime}
								</span>
							)}
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Users className="h-4 w-4" />
						Allocated Students ({route.allocations.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1.5">
					{route.allocations.length === 0 ? (
						<p className="py-4 text-center text-muted-foreground text-sm">
							No students allocated yet
						</p>
					) : (
						route.allocations.map((alloc) => (
							<div
								className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5"
								key={alloc.id}
							>
								<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-xs">
									{alloc.student.name.charAt(0)}
								</div>
								<div className="flex-1">
									<p className="font-medium text-sm">{alloc.student.name}</p>
									<p className="text-muted-foreground text-xs">
										{alloc.student.className} {alloc.student.section}
									</p>
								</div>
								<StatusBadge status={alloc.status} />
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
