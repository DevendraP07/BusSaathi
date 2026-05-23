"use client";

import { Bus, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

type BusRow = {
	id: string;
	registrationNumber: string;
	model: string | null;
	capacity: number;
	status: string;
	insuranceExpiry: Date | null;
	fitnessCertExpiry: Date | null;
	routes: { name: string }[];
};

export function ManagerClient() {
	const { data: buses, isLoading } = api.bus.list.useQuery({});
	const utils = api.useUtils();
	const remove = api.bus.remove.useMutation({
		onSuccess: () => {
			toast.success("Bus removed");
			void utils.bus.list.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	const columns: Column<BusRow>[] = [
		{
			key: "reg",
			header: "Registration",
			cell: (r) => (
				<span className="font-mono font-semibold text-sm">
					{r.registrationNumber}
				</span>
			),
		},
		{
			key: "model",
			header: "Model",
			cell: (r) => <span className="text-sm">{r.model ?? "—"}</span>,
		},
		{
			key: "capacity",
			header: "Capacity",
			cell: (r) => (
				<span className="font-medium text-sm">{r.capacity} seats</span>
			),
		},
		{
			key: "route",
			header: "Assigned Route",
			cell: (r) =>
				r.routes[0] ? (
					<span className="text-sm">{r.routes[0].name}</span>
				) : (
					<span className="text-muted-foreground text-xs">Unassigned</span>
				),
		},
		{
			key: "insurance",
			header: "Insurance Expiry",
			cell: (r) => (
				<span className="text-sm">{formatDate(r.insuranceExpiry)}</span>
			),
		},
		{
			key: "status",
			header: "Status",
			cell: (r) => <StatusBadge status={r.status} />,
		},
		{
			key: "actions",
			header: "",
			cell: (r) => (
				<div className="flex gap-1">
					<Button asChild className="h-7 w-7" size="icon" variant="ghost">
						<Link href={`/manager/buses/${r.id}`}>
							<Pencil className="h-3.5 w-3.5" />
						</Link>
					</Button>
					<ConfirmDialog
						confirmLabel="Remove"
						description={`Remove bus ${r.registrationNumber}? It will be soft-deleted.`}
						onConfirm={() => remove.mutate({ busId: r.id })}
						title="Remove Bus?"
						trigger={
							<Button
								className="h-7 w-7 text-destructive hover:text-destructive"
								size="icon"
								variant="ghost"
							>
								<Trash2 className="h-3.5 w-3.5" />
							</Button>
						}
						variant="destructive"
					/>
				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			<PageHeader
				actions={
					<Button
						asChild
						className="gap-1 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
						size="sm"
					>
						<Link href="/manager/buses/new">
							<Plus className="h-4 w-4" />
							Add Bus
						</Link>
					</Button>
				}
				description="Manage the school bus fleet"
				icon={Bus}
				title="Buses"
			/>
			<DataTable
				columns={columns}
				data={(buses ?? []) as BusRow[]}
				emptyDescription="Add your first bus to get started"
				emptyTitle="No buses found"
				isLoading={isLoading}
				searchKeys={["registrationNumber", "model"]}
				searchPlaceholder="Search buses..."
			/>
		</div>
	);
}
