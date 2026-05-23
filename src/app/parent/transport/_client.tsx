"use client";

import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

export function TransportRequestClient() {
	const [open, setOpen] = useState(false);
	const [studentId, setStudentId] = useState("");
	const [preferredRouteId, setPreferredRouteId] = useState("");
	const [preferredPickupStop, setPreferredPickupStop] = useState("");
	const [preferredDropStop, setPreferredDropStop] = useState("");
	const [notes, setNotes] = useState("");

	const { data: students } = api.student.myStudents.useQuery();
	const { data: routes } = api.route.listActive.useQuery({});
	const { data: requests, isLoading } =
		api.transportRequest.myRequests.useQuery();
	const utils = api.useUtils();

	const submit = api.transportRequest.submit.useMutation({
		onSuccess: () => {
			toast.success("Transport request submitted successfully!");
			setOpen(false);
			setStudentId("");
			setPreferredRouteId("");
			setPreferredPickupStop("");
			setPreferredDropStop("");
			setNotes("");
			void utils.transportRequest.myRequests.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!studentId || !preferredPickupStop || !preferredDropStop) {
			toast.error("Please fill all required fields");
			return;
		}
		submit.mutate({
			studentId,
			preferredRouteId: preferredRouteId || undefined,
			preferredPickupStop,
			preferredDropStop,
			notes: notes || undefined,
		});
	}

	const selectedRoute = routes?.find((r) => r.id === preferredRouteId);

	return (
		<div className="space-y-6">
			<PageHeader
				actions={
					<Dialog onOpenChange={setOpen} open={open}>
						<DialogTrigger asChild>
							<Button
								className="gap-1 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
								size="sm"
							>
								<Plus className="h-4 w-4" />
								New Request
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle>Apply for Transport</DialogTitle>
							</DialogHeader>
							<form className="space-y-4 pt-2" onSubmit={handleSubmit}>
								<div className="space-y-1.5">
									<Label>
										Select Child <span className="text-destructive">*</span>
									</Label>
									<Select onValueChange={setStudentId} value={studentId}>
										<SelectTrigger>
											<SelectValue placeholder="Choose child" />
										</SelectTrigger>
										<SelectContent>
											{students?.map((s) => (
												<SelectItem key={s.id} value={s.id}>
													{s.name} — {s.className} {s.section}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label>Preferred Route</Label>
									<Select
										onValueChange={setPreferredRouteId}
										value={preferredRouteId}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select route (optional)" />
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
									<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs">
										<p className="mb-1 font-semibold">
											Route: {selectedRoute.name}
										</p>
										<p>
											Departure: {selectedRoute.departureTime} ·{" "}
											{selectedRoute.startLocation} →{" "}
											{selectedRoute.endLocation}
										</p>
										<p className="mt-1 font-medium">
											Stops:{" "}
											{selectedRoute.stops.map((s) => s.stopName).join(" → ")}
										</p>
									</div>
								)}
								<div className="space-y-1.5">
									<Label>
										Preferred Pickup Stop{" "}
										<span className="text-destructive">*</span>
									</Label>
									<Input
										onChange={(e) => setPreferredPickupStop(e.target.value)}
										placeholder="e.g. Gandhi Nagar Bus Stop"
										value={preferredPickupStop}
									/>
								</div>
								<div className="space-y-1.5">
									<Label>
										Preferred Drop Stop{" "}
										<span className="text-destructive">*</span>
									</Label>
									<Input
										onChange={(e) => setPreferredDropStop(e.target.value)}
										placeholder="e.g. School Main Gate"
										value={preferredDropStop}
									/>
								</div>
								<div className="space-y-1.5">
									<Label>Additional Notes</Label>
									<Textarea
										onChange={(e) => setNotes(e.target.value)}
										placeholder="Any special requirements..."
										rows={3}
										value={notes}
									/>
								</div>
								<div className="flex gap-2 pt-1">
									<Button
										className="flex-1"
										onClick={() => setOpen(false)}
										type="button"
										variant="outline"
									>
										Cancel
									</Button>
									<Button
										className="flex-1 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
										disabled={submit.isPending}
										type="submit"
									>
										{submit.isPending ? "Submitting..." : "Submit Request"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				}
				description="Apply for school bus transport for your children"
				icon={ClipboardList}
				title="Transport Registration"
			/>

			{isLoading ? (
				<p className="text-muted-foreground text-sm">Loading requests...</p>
			) : !requests?.length ? (
				<EmptyState
					description="Apply for school bus transport for your children."
					icon={ClipboardList}
					title="No transport requests yet"
				/>
			) : (
				<div className="space-y-3">
					{requests
						.filter((r): r is NonNullable<typeof r> => r !== null)
						.map((req) => (
							<Card key={req.requestRef}>
								<CardContent className="p-4">
									<div className="flex items-start justify-between gap-3">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<p className="font-semibold text-sm">
													{req.studentName}
												</p>
												<StatusBadge status={req.status} />
											</div>
											<p className="text-muted-foreground text-xs">
												Ref: {req.requestRef}
											</p>
											<p className="text-muted-foreground text-xs">
												Pickup: {req.preferredPickupStop} → Drop:{" "}
												{req.preferredDropStop}
											</p>
											{req.preferredRouteId && (
												<p className="text-muted-foreground text-xs">
													Preferred Route ID: {req.preferredRouteId}
												</p>
											)}
											{req.notes && (
												<p className="text-muted-foreground text-xs italic">
													Note: {req.notes}
												</p>
											)}
											{req.reviewNote && (
												<p
													className={`font-medium text-xs ${req.status === "rejected" ? "text-red-600" : "text-green-600"}`}
												>
													Manager note: {req.reviewNote}
												</p>
											)}
										</div>
										<p className="shrink-0 text-muted-foreground text-xs">
											{formatDate(req.createdAt)}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
				</div>
			)}
		</div>
	);
}
