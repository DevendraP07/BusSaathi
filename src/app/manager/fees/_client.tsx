"use client";

import { CreditCard, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

type FeeStructureRow = {
	id: string;
	name: string;
	feeType: string;
	amount: string;
	isActive: boolean;
	effectiveFrom: Date;
	route: { name: string } | null;
};

export function ManagerClient() {
	const { data: structures, isLoading } = api.fee.listStructures.useQuery({});
	const utils = api.useUtils();

	const toggleActive = api.fee.updateStructure.useMutation({
		onSuccess: () => {
			toast.success("Updated!");
			void utils.fee.listStructures.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	const columns: Column<FeeStructureRow>[] = [
		{
			key: "name",
			header: "Fee Name",
			cell: (r) => <span className="font-semibold text-sm">{r.name}</span>,
		},
		{
			key: "type",
			header: "Type",
			cell: (r) => <StatusBadge status={r.feeType} />,
		},
		{
			key: "route",
			header: "Route",
			cell: (r) => (
				<span className="text-sm">{r.route?.name ?? "All Routes"}</span>
			),
		},
		{
			key: "amount",
			header: "Amount",
			cell: (r) => <span className="font-bold text-sm">₹{r.amount}</span>,
		},
		{
			key: "from",
			header: "Effective From",
			cell: (r) => (
				<span className="text-sm">{formatDate(r.effectiveFrom)}</span>
			),
		},
		{
			key: "status",
			header: "Status",
			cell: (r) => <StatusBadge status={r.isActive ? "active" : "inactive"} />,
		},
		{
			key: "actions",
			header: "",
			cell: (r) => (
				<Button
					className="h-7 text-xs"
					onClick={() =>
						toggleActive.mutate({ structureId: r.id, isActive: !r.isActive })
					}
					size="sm"
					variant="outline"
				>
					{r.isActive ? "Deactivate" : "Activate"}
				</Button>
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
						<Link href="/manager/fees/structure">
							<Plus className="h-4 w-4" />
							New Structure
						</Link>
					</Button>
				}
				description="Manage transport fee configurations"
				icon={CreditCard}
				title="Fee Structures"
			/>
			<DataTable
				columns={columns}
				data={(structures ?? []) as FeeStructureRow[]}
				emptyDescription="Create fee structures to start collecting transport fees"
				emptyTitle="No fee structures"
				isLoading={isLoading}
				searchKeys={["name"]}
				searchPlaceholder="Search fee structures..."
			/>
		</div>
	);
}
