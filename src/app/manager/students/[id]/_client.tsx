"use client";

import { CreditCard, Route, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

export function StudentDetailClient({ studentId }: { studentId: string }) {
	const [selectedRouteId, setSelectedRouteId] = useState("");
	const [pickupStopId, setPickupStopId] = useState("");
	const [dropStopId, setDropStopId] = useState("");

	const { data: student, isLoading } = api.student.getById.useQuery({
		studentId,
	});
	const { data: routes } = api.route.listActive.useQuery({});
	const utils = api.useUtils();

	const selectedRoute = routes?.find((r) => r.id === selectedRouteId);

	const assign = api.allocation.assign.useMutation({
		onSuccess: () => {
			toast.success("Student allocated to route!");
			void utils.student.getById.invalidate({ studentId });
			setSelectedRouteId("");
			setPickupStopId("");
			setDropStopId("");
		},
		onError: (e) => toast.error(e.message),
	});

	const removeAlloc = api.allocation.remove.useMutation({
		onSuccess: () => {
			toast.success("Allocation removed");
			void utils.student.getById.invalidate({ studentId });
		},
		onError: (e) => toast.error(e.message),
	});

	if (isLoading) return <Skeleton className="h-96" />;
	if (!student)
		return <p className="text-muted-foreground">Student not found.</p>;

	const activeAlloc = student.allocations.find((a) => a.status === "active");

	return (
		<div className="max-w-2xl space-y-5">
			<PageHeader
				description={`${student.className ?? ""} ${student.section ?? ""} · Roll: ${student.rollNumber ?? "—"}`}
				icon={Users}
				title={student.name}
			/>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Student Info</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-3 text-sm">
					<div>
						<p className="text-muted-foreground text-xs">Parent</p>
						<p className="font-semibold">{student.parent.name}</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Parent Phone</p>
						<p className="font-semibold">{student.parent.phone ?? "—"}</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Class</p>
						<p className="font-semibold">
							{student.className ?? "—"} {student.section ?? ""}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Emergency Contact</p>
						<p className="font-semibold">{student.emergencyContact ?? "—"}</p>
					</div>
				</CardContent>
			</Card>

			{/* Current Allocation */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Route className="h-4 w-4" />
						Route Allocation
					</CardTitle>
				</CardHeader>
				<CardContent>
					{activeAlloc ? (
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div>
									<p className="text-muted-foreground text-xs">Route</p>
									<p className="font-semibold">{activeAlloc.route.name}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Status</p>
									<StatusBadge status={activeAlloc.status} />
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Pickup Stop</p>
									<p className="font-semibold">
										{activeAlloc.pickupStop?.stopName ?? "—"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Drop Stop</p>
									<p className="font-semibold">
										{activeAlloc.dropStop?.stopName ?? "—"}
									</p>
								</div>
							</div>
							<ConfirmDialog
								confirmLabel="Remove"
								description={`This will remove ${student.name} from ${activeAlloc.route.name}.`}
								onConfirm={() =>
									removeAlloc.mutate({ allocationId: activeAlloc.id })
								}
								title="Remove allocation?"
								trigger={
									<Button
										className="border-destructive text-destructive hover:bg-destructive/10"
										size="sm"
										variant="outline"
									>
										Remove Allocation
									</Button>
								}
								variant="destructive"
							/>
						</div>
					) : (
						<div className="space-y-4">
							<p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-700 text-sm">
								Student is not allocated to any route. Assign a route below.
							</p>
							<div className="space-y-3">
								<div className="space-y-1.5">
									<Label className="text-xs">Select Route</Label>
									<Select
										onValueChange={(v) => {
											setSelectedRouteId(v);
											setPickupStopId("");
											setDropStopId("");
										}}
										value={selectedRouteId}
									>
										<SelectTrigger>
											<SelectValue placeholder="Choose route" />
										</SelectTrigger>
										<SelectContent>
											{routes?.map((r) => (
												<SelectItem key={r.id} value={r.id}>
													{r.name} ({r.routeCode})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								{selectedRoute && (
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-1.5">
											<Label className="text-xs">Pickup Stop</Label>
											<Select
												onValueChange={setPickupStopId}
												value={pickupStopId}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select stop" />
												</SelectTrigger>
												<SelectContent>
													{selectedRoute.stops.map((s) => (
														<SelectItem key={s.id} value={s.id}>
															{s.stopName}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-1.5">
											<Label className="text-xs">Drop Stop</Label>
											<Select onValueChange={setDropStopId} value={dropStopId}>
												<SelectTrigger>
													<SelectValue placeholder="Select stop" />
												</SelectTrigger>
												<SelectContent>
													{selectedRoute.stops.map((s) => (
														<SelectItem key={s.id} value={s.id}>
															{s.stopName}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								)}
								<Button
									className="bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
									disabled={!selectedRouteId || assign.isPending}
									onClick={() =>
										assign.mutate({
											studentId,
											routeId: selectedRouteId,
											pickupStopId: pickupStopId || undefined,
											dropStopId: dropStopId || undefined,
										})
									}
								>
									{assign.isPending ? "Allocating..." : "Allocate to Route"}
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Fee History */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<CreditCard className="h-4 w-4" />
						Fee Payment History
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{student.feePayments.length === 0 ? (
						<p className="py-4 text-center text-muted-foreground text-sm">
							No payment records yet
						</p>
					) : (
						student.feePayments.slice(0, 5).map((p) => (
							<div
								className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
								key={p.id}
							>
								<div>
									<p className="font-medium text-sm">{p.feeStructure.name}</p>
									<p className="text-muted-foreground text-xs">
										Due: {formatDate(p.dueDate)}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<span className="font-semibold text-sm">₹{p.amount}</span>
									<StatusBadge status={p.paymentStatus} />
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
