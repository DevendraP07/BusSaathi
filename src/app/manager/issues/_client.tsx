"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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

type IssueRow = {
	id: string;
	issueRef: string;
	title: string;
	type: string;
	priority: string;
	status: string;
	createdAt: Date;
	reporter: { name: string } | null;
	route: { name: string } | null;
};

export function ManagerClient() {
	const [resolveId, setResolveId] = useState<string | null>(null);
	const [resolveStatus, setResolveStatus] = useState<
		"in_progress" | "resolved" | "closed"
	>("resolved");
	const [resolveNote, setResolveNote] = useState("");

	const { data: issues, isLoading } = api.issue.listAll.useQuery({});
	const utils = api.useUtils();

	const updateStatus = api.issue.updateStatus.useMutation({
		onSuccess: () => {
			toast.success("Issue updated!");
			setResolveId(null);
			setResolveNote("");
			void utils.issue.listAll.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	const columns: Column<IssueRow>[] = [
		{
			key: "ref",
			header: "Ref",
			cell: (r) => <span className="font-mono text-xs">{r.issueRef}</span>,
		},
		{
			key: "title",
			header: "Issue",
			cell: (r) => (
				<div>
					<p className="font-medium text-sm">{r.title}</p>
					<p className="text-muted-foreground text-xs">
						{r.reporter?.name ?? "—"}
					</p>
				</div>
			),
		},
		{
			key: "type",
			header: "Type",
			cell: (r) => (
				<span className="text-xs capitalize">{r.type.replace(/_/g, " ")}</span>
			),
		},
		{
			key: "priority",
			header: "Priority",
			cell: (r) => <StatusBadge status={r.priority} />,
		},
		{
			key: "status",
			header: "Status",
			cell: (r) => <StatusBadge status={r.status} />,
		},
		{
			key: "date",
			header: "Reported",
			cell: (r) => <span className="text-xs">{formatDate(r.createdAt)}</span>,
		},
		{
			key: "actions",
			header: "",
			cell: (r) =>
				r.status === "open" || r.status === "in_progress" ? (
					<Button
						className="h-7 text-xs"
						onClick={() => setResolveId(r.id)}
						size="sm"
						variant="outline"
					>
						Update
					</Button>
				) : null,
		},
	];

	return (
		<div className="space-y-6">
			<PageHeader
				description="Manage reported transport issues"
				icon={AlertTriangle}
				title="Issues"
			/>

			<DataTable
				columns={columns}
				data={(issues ?? []) as IssueRow[]}
				emptyDescription="All reported issues will appear here"
				emptyTitle="No issues found"
				isLoading={isLoading}
				searchKeys={["issueRef", "title"]}
				searchPlaceholder="Search issues..."
			/>

			<Dialog
				onOpenChange={(o) => {
					if (!o) setResolveId(null);
				}}
				open={!!resolveId}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Issue Status</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<Label>New Status</Label>
							<Select
								onValueChange={(v) =>
									setResolveStatus(v as typeof resolveStatus)
								}
								value={resolveStatus}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="resolved">Resolved</SelectItem>
									<SelectItem value="closed">Closed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Resolution Note</Label>
							<Textarea
								onChange={(e) => setResolveNote(e.target.value)}
								placeholder="Describe what was done..."
								rows={3}
								value={resolveNote}
							/>
						</div>
						<div className="flex gap-2">
							<Button
								className="flex-1"
								onClick={() => setResolveId(null)}
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								className="flex-1 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
								disabled={updateStatus.isPending}
								onClick={() =>
									resolveId &&
									updateStatus.mutate({
										issueId: resolveId,
										status: resolveStatus,
										resolutionNote: resolveNote || undefined,
									})
								}
							>
								{updateStatus.isPending ? "Updating..." : "Update Status"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
