"use client";

import { Bus, CheckCircle2, MapPin, PlayCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function DriverTripClient() {
	const { data: todayTrip, isLoading } = api.trip.todayTrip.useQuery();
	const utils = api.useUtils();

	const startTrip = api.trip.start.useMutation({
		onSuccess: () => {
			toast.success("Trip started! Attendance records initialized.");
			void utils.trip.todayTrip.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});
	const completeTrip = api.trip.complete.useMutation({
		onSuccess: () => {
			toast.success("Trip completed!");
			void utils.trip.todayTrip.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});
	const markAttendance = api.trip.markAttendance.useMutation({
		onSuccess: () => {
			void utils.trip.todayTrip.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	if (isLoading) return <Skeleton className="h-96" />;

	if (!todayTrip) {
		return (
			<div className="space-y-6">
				<PageHeader icon={Bus} title="Today's Trip" />
				<EmptyState
					description="You don't have a trip assigned for today. Contact your manager."
					icon={Bus}
					title="No trip scheduled today"
				/>
			</div>
		);
	}

	const canStart = todayTrip.status === "scheduled";
	const canComplete =
		todayTrip.status === "started" || todayTrip.status === "ongoing";
	const isActive = canStart || canComplete;

	return (
		<div className="space-y-5">
			<PageHeader
				actions={
					<div className="flex gap-2">
						{canStart && (
							<Button
								className="gap-1 bg-green-600 text-white hover:bg-green-700"
								disabled={startTrip.isPending}
								onClick={() => startTrip.mutate({ tripId: todayTrip.id })}
								size="sm"
							>
								<PlayCircle className="h-4 w-4" />
								{startTrip.isPending ? "Starting..." : "Start Trip"}
							</Button>
						)}
						{canComplete && (
							<Button
								className="gap-1 bg-blue-600 text-white hover:bg-blue-700"
								disabled={completeTrip.isPending}
								onClick={() => completeTrip.mutate({ tripId: todayTrip.id })}
								size="sm"
							>
								<CheckCircle2 className="h-4 w-4" />
								{completeTrip.isPending ? "Completing..." : "Complete"}
							</Button>
						)}
					</div>
				}
				description={`Ref: ${todayTrip.tripRef}`}
				icon={Bus}
				title="Today's Trip"
			/>

			{/* Trip Info */}
			<Card>
				<CardContent className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
					{[
						{
							label: "Status",
							value: <StatusBadge status={todayTrip.status} />,
						},
						{ label: "Route", value: todayTrip.route?.name ?? "—" },
						{ label: "Bus", value: todayTrip.bus?.registrationNumber ?? "—" },
						{
							label: "Students",
							value: `${todayTrip.route?.allocations?.length ?? 0} allocated`,
						},
					].map((item) => (
						<div key={item.label}>
							<p className="mb-1 text-muted-foreground text-xs">{item.label}</p>
							<div className="font-semibold text-sm">{item.value}</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Route Stops */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<MapPin className="h-4 w-4" />
						Route Stops
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-1">
						{todayTrip.route?.stops.map((stop, _i) => (
							<div
								className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5"
								key={stop.id}
							>
								<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-[10px] text-amber-700">
									{stop.stopOrder}
								</div>
								<div className="min-w-0 flex-1">
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
					</div>
				</CardContent>
			</Card>

			{/* Attendance */}
			{todayTrip.attendances && todayTrip.attendances.length > 0 && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-sm">
							<Users className="h-4 w-4" />
							Student Attendance
							<span className="ml-auto font-normal text-muted-foreground text-xs">
								{
									todayTrip.attendances.filter(
										(a) => a.boardingStatus === "boarded",
									).length
								}
								/{todayTrip.attendances.length} boarded
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{todayTrip.attendances.map((att) => (
							<div
								className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
								key={att.id}
							>
								<div className="flex items-center gap-3">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-xs">
										{att.student.name.charAt(0)}
									</div>
									<div>
										<p className="font-medium text-sm">{att.student.name}</p>
										<div className="mt-0.5 flex gap-2">
											<StatusBadge status={att.boardingStatus ?? "absent"} />
										</div>
									</div>
								</div>
								{isActive && (
									<div className="flex gap-1.5">
										<Button
											className={cn(
												"h-7 text-xs",
												att.boardingStatus === "boarded"
													? "bg-green-600 text-white hover:bg-green-700"
													: "bg-muted hover:bg-green-50",
											)}
											disabled={markAttendance.isPending}
											onClick={() =>
												markAttendance.mutate({
													attendanceId: att.id,
													boardingStatus: "boarded",
												})
											}
											size="sm"
										>
											Boarded
										</Button>
										<Button
											className={cn(
												"h-7 text-xs",
												att.boardingStatus === "absent"
													? "border-red-300 text-red-600"
													: "",
											)}
											disabled={markAttendance.isPending}
											onClick={() =>
												markAttendance.mutate({
													attendanceId: att.id,
													boardingStatus: "absent",
												})
											}
											size="sm"
											variant="outline"
										>
											Absent
										</Button>
									</div>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{todayTrip.status === "started" && todayTrip.attendances.length === 0 && (
				<div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
					<p className="font-medium text-blue-700 text-sm">
						Trip started — no students allocated to this route yet.
					</p>
				</div>
			)}
		</div>
	);
}
