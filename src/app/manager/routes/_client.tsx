"use client";

import { Bus, Pencil, Plus, Route, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

type RouteRow = {
	id: string;
	name: string;
	routeCode: string;
	routeType: string;
	status: string;
	departureTime: string;
	bus: { registrationNumber: string } | null;
	driver: { name: string } | null;
	allocations: unknown[];
	stops: unknown[];
};

export function ManagerClient() {
	const [statusFilter, setStatusFilter] = useState<
		"active" | "inactive" | "suspended" | "all"
	>("all");
	const [typeFilter, setTypeFilter] = useState<
		"morning" | "evening" | "full_day" | "all"
	>("all");

	const { data: routes, isLoading } = api.route.listAll.useQuery({
		status: statusFilter === "all" ? undefined : statusFilter,
		routeType: typeFilter === "all" ? undefined : typeFilter,
	});

	const utils = api.useUtils();

	const remove = api.route.remove.useMutation({
		onSuccess: () => {
			toast.success("Route removed");
			void utils.route.listAll.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	const columns: Column<RouteRow>[] = [
		{
			key: "name",
			header: "Route",
			cell: (r) => (
				<div>
					<p className="font-semibold text-sm">{r.name}</p>
					<p className="font-mono text-muted-foreground text-xs">
						{r.routeCode}
					</p>
				</div>
			),
		},
		{
			key: "type",
			header: "Type",
			cell: (r) => <StatusBadge status={r.routeType} />,
		},
		{
			key: "departure",
			header: "Departure",
			cell: (r) => (
				<span className="font-medium text-sm">{r.departureTime}</span>
			),
		},
		{
			key: "bus",
			header: "Bus",
			cell: (r) =>
				r.bus ? (
					<span className="flex items-center gap-1 text-sm">
						<Bus className="h-3.5 w-3.5 text-muted-foreground" />
						{r.bus.registrationNumber}
					</span>
				) : (
					<span className="text-muted-foreground text-xs">Not assigned</span>
				),
		},
		{
			key: "driver",
			header: "Driver",
			cell: (r) =>
				r.driver ? (
					<span className="text-sm">{r.driver.name}</span>
				) : (
					<span className="text-muted-foreground text-xs">Not assigned</span>
				),
		},
		{
			key: "students",
			header: "Students",
			cell: (r) => (
				<span className="flex items-center gap-1 text-sm">
					<Users className="h-3.5 w-3.5 text-muted-foreground" />
					{r.allocations.length}
				</span>
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
						<Link href={`/manager/routes/${r.id}`}>
							<Pencil className="h-3.5 w-3.5" />
						</Link>
					</Button>
					<ConfirmDialog
						confirmLabel="Remove"
						description={`This will deactivate route "${r.name}". Students allocated to this route will need reallocation.`}
						onConfirm={() => remove.mutate({ routeId: r.id })}
						title="Remove Route?"
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
						<Link href="/manager/routes/new">
							<Plus className="h-4 w-4" />
							New Route
						</Link>
					</Button>
				}
				description="Manage all bus routes, stops and assignments"
				icon={Route}
				title="Routes"
			/>
			<DataTable
				columns={columns}
				data={(routes ?? []) as RouteRow[]}
				emptyDescription="Create your first bus route to get started"
				emptyTitle="No routes found"
				isLoading={isLoading}
				searchKeys={["name", "routeCode"]}
				searchPlaceholder="Search routes..."
				toolbar={
					<div className="flex gap-2">
						<Select
							onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
							value={statusFilter}
						>
							<SelectTrigger className="h-8 w-32 text-xs">
								<SelectValue placeholder="All Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
								<SelectItem value="suspended">Suspended</SelectItem>
							</SelectContent>
						</Select>
						<Select
							onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
							value={typeFilter}
						>
							<SelectTrigger className="h-8 w-32 text-xs">
								<SelectValue placeholder="All Types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="morning">Morning</SelectItem>
								<SelectItem value="evening">Evening</SelectItem>
								<SelectItem value="full_day">Full Day</SelectItem>
							</SelectContent>
						</Select>
					</div>
				}
			/>
		</div>
	);
}
