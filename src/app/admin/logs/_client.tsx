"use client";

import { ScrollText } from "lucide-react";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateTime } from "@/lib/date";
import { api } from "@/trpc/react";

type LogRow = {
	id: string;
	action: string;
	entity: string;
	entityId: string | null;
	createdAt: Date;
	actor: { name: string; email: string } | null;
	metadata: string | null;
};

export function AdminClient() {
	const { data: logs, isLoading } = api.admin.getLogs.useQuery({ limit: 100 });

	const columns: Column<LogRow>[] = [
		{
			key: "time",
			header: "Time",
			cell: (r) => (
				<span className="font-mono text-muted-foreground text-xs">
					{formatDateTime(r.createdAt)}
				</span>
			),
		},
		{
			key: "actor",
			header: "Actor",
			cell: (r) => (
				<div>
					<p className="font-medium text-sm">{r.actor?.name ?? "System"}</p>
					<p className="text-muted-foreground text-xs">
						{r.actor?.email ?? "—"}
					</p>
				</div>
			),
		},
		{
			key: "action",
			header: "Action",
			cell: (r) => (
				<span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
					{r.action}
				</span>
			),
		},
		{
			key: "entity",
			header: "Entity",
			cell: (r) => (
				<span className="text-sm capitalize">
					{r.entity.replace(/_/g, " ")}
				</span>
			),
		},
		{
			key: "entityId",
			header: "Entity ID",
			cell: (r) => (
				<span className="font-mono text-muted-foreground text-xs">
					{r.entityId ?? "—"}
				</span>
			),
		},
	];

	return (
		<div className="space-y-6">
			<PageHeader
				description="Track all admin actions and system events"
				icon={ScrollText}
				title="System Logs"
			/>
			<DataTable
				columns={columns}
				data={(logs ?? []) as LogRow[]}
				emptyTitle="No logs found"
				isLoading={isLoading}
				pageSize={20}
				searchKeys={["action", "entity"]}
				searchPlaceholder="Search logs..."
			/>
		</div>
	);
}
