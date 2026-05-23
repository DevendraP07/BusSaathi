"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

type StudentRow = {
	id: string;
	name: string;
	rollNumber: string | null;
	className: string | null;
	section: string | null;
	parent: { name: string; phone: string | null };
	allocations: { status: string; route: { name: string } }[];
};

export function ManagerClient() {
	const { data: students, isLoading } = api.student.listAll.useQuery({});

	const columns: Column<StudentRow>[] = [
		{
			key: "name",
			header: "Student",
			cell: (r) => (
				<div className="flex items-center gap-2.5">
					<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-xs">
						{r.name.charAt(0)}
					</div>
					<div>
						<p className="font-medium text-sm">{r.name}</p>
						<p className="text-muted-foreground text-xs">
							{r.rollNumber ? `Roll: ${r.rollNumber}` : ""}
						</p>
					</div>
				</div>
			),
		},
		{
			key: "class",
			header: "Class",
			cell: (r) => (
				<span className="text-sm">
					{r.className ?? "—"} {r.section ?? ""}
				</span>
			),
		},
		{
			key: "parent",
			header: "Parent",
			cell: (r) => (
				<div>
					<p className="text-sm">{r.parent.name}</p>
					<p className="text-muted-foreground text-xs">
						{r.parent.phone ?? "—"}
					</p>
				</div>
			),
		},
		{
			key: "route",
			header: "Route",
			cell: (r) => {
				const active = r.allocations.find((a) => a.status === "active");
				return active ? (
					<span className="font-medium text-green-700 text-sm">
						{active.route.name}
					</span>
				) : (
					<span className="text-amber-600 text-xs">Not Allocated</span>
				);
			},
		},
		{
			key: "status",
			header: "Allocation",
			cell: (r) => {
				const active = r.allocations.find((a) => a.status === "active");
				return <StatusBadge status={active ? "active" : "inactive"} />;
			},
		},
		{
			key: "actions",
			header: "",
			cell: (r) => (
				<Button asChild className="h-7 text-xs" size="sm" variant="outline">
					<Link href={`/manager/students/${r.id}`}>Manage</Link>
				</Button>
			),
		},
	];

	return (
		<div className="space-y-6">
			<PageHeader
				description="Manage all students and route allocations"
				icon={Users}
				title="Students"
			/>
			<DataTable
				columns={columns}
				data={(students ?? []) as StudentRow[]}
				emptyDescription="Students will appear here once parents register and add their children"
				emptyTitle="No students found"
				isLoading={isLoading}
				searchKeys={["name", "rollNumber"]}
				searchPlaceholder="Search students..."
			/>
		</div>
	);
}
