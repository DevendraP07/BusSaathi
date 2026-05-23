"use client";

import { ClipboardCheck } from "lucide-react";
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
} from "@/components/ui/dialog";
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

export function ManagerClient() {
	const [filterStatus, setFilterStatus] = useState<
		"pending" | "approved" | "rejected" | "all"
	>("all");
	const [reviewRef, setReviewRef] = useState<string | null>(null);
	const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">(
		"approved",
	);
	const [reviewNote, setReviewNote] = useState("");

	const { data: requests, isLoading } = api.transportRequest.listAll.useQuery({
		status: filterStatus === "all" ? undefined : filterStatus,
	});
	const utils = api.useUtils();

	const review = api.transportRequest.review.useMutation({
		onSuccess: () => {
			toast.success("Request reviewed!");
			setReviewRef(null);
			setReviewNote("");
			void utils.transportRequest.listAll.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	return (
		<div className="space-y-6">
			<PageHeader
				actions={
					<Select
						onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}
						value={filterStatus}
					>
						<SelectTrigger className="h-8 w-36 text-xs">
							<SelectValue placeholder="All Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="approved">Approved</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
						</SelectContent>
					</Select>
				}
				description="Review and approve parent transport registration requests"
				icon={ClipboardCheck}
				title="Transport Requests"
			/>

			{isLoading ? (
				<p className="text-muted-foreground text-sm">Loading...</p>
			) : !requests?.length ? (
				<EmptyState
					description="Transport registration requests from parents will appear here."
					icon={ClipboardCheck}
					title="No requests found"
				/>
			) : (
				<div className="space-y-3">
					{requests.map((req) => (
						<Card key={req.requestRef}>
							<CardContent className="p-4">
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1 space-y-1.5">
										<div className="flex flex-wrap items-center gap-2">
											<p className="font-semibold text-sm">{req.studentName}</p>
											<span className="text-muted-foreground text-xs">
												by {req.parentName}
											</span>
											<StatusBadge status={req.status} />
										</div>
										<p className="font-mono text-muted-foreground text-xs">
											{req.requestRef} · {formatDate(req.createdAt)}
										</p>
										<p className="text-sm">
											Pickup:{" "}
											<span className="font-medium">
												{req.preferredPickupStop}
											</span>{" "}
											→ Drop:{" "}
											<span className="font-medium">
												{req.preferredDropStop}
											</span>
										</p>
										{req.notes && (
											<p className="text-muted-foreground text-xs italic">
												Note: {req.notes}
											</p>
										)}
										{req.reviewNote && (
											<p
												className={`font-medium text-xs ${req.status === "rejected" ? "text-red-600" : "text-green-600"}`}
											>
												Manager: {req.reviewNote}
											</p>
										)}
									</div>
									{req.status === "pending" && (
										<Button
											className="shrink-0 bg-amber-500 text-white hover:bg-amber-600"
											onClick={() => setReviewRef(req.requestRef)}
											size="sm"
										>
											Review
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog
				onOpenChange={(o) => {
					if (!o) setReviewRef(null);
				}}
				open={!!reviewRef}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Review Transport Request</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<Label>Decision</Label>
							<Select
								onValueChange={(v) => setReviewStatus(v as typeof reviewStatus)}
								value={reviewStatus}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="approved">Approve</SelectItem>
									<SelectItem value="rejected">Reject</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Note to Parent</Label>
							<Textarea
								onChange={(e) => setReviewNote(e.target.value)}
								placeholder="Add a note..."
								rows={3}
								value={reviewNote}
							/>
						</div>
						<div className="flex gap-2">
							<Button
								className="flex-1"
								onClick={() => setReviewRef(null)}
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								className={`flex-1 text-white ${reviewStatus === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
								disabled={review.isPending}
								onClick={() =>
									reviewRef &&
									review.mutate({
										requestRef: reviewRef,
										status: reviewStatus,
										reviewNote: reviewNote || undefined,
									})
								}
							>
								{review.isPending
									? "Submitting..."
									: reviewStatus === "approved"
										? "Approve"
										: "Reject"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
