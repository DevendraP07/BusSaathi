"use client";

import { UserCheck, Users, UserX } from "lucide-react";
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
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

type UserRow = {
	id: string;
	name: string;
	email: string;
	role: string;
	phone: string | null;
	isActive: boolean;
	createdAt: Date;
};

export function AdminClient() {
	const [roleFilter, setRoleFilter] = useState<
		"parent" | "driver" | "manager" | "admin" | "all"
	>("all");

	const { data: users, isLoading } = api.admin.listUsers.useQuery({
		role: roleFilter === "all" ? undefined : roleFilter,
	});
	const utils = api.useUtils();

	const suspend = api.admin.suspendUser.useMutation({
		onSuccess: () => {
			toast.success("User suspended");
			void utils.admin.listUsers.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});
	const activate = api.admin.activateUser.useMutation({
		onSuccess: () => {
			toast.success("User activated");
			void utils.admin.listUsers.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	const columns: Column<UserRow>[] = [
		{
			key: "name",
			header: "User",
			cell: (r) => (
				<div className="flex items-center gap-2.5">
					<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-xs">
						{r.name.charAt(0)}
					</div>
					<div className="min-w-0">
						<p className="truncate font-medium text-sm">{r.name}</p>
						<p className="truncate text-muted-foreground text-xs">{r.email}</p>
					</div>
				</div>
			),
		},
		{
			key: "role",
			header: "Role",
			cell: (r) => <StatusBadge status={r.role} />,
		},
		{
			key: "phone",
			header: "Phone",
			cell: (r) => <span className="text-sm">{r.phone ?? "—"}</span>,
		},
		{
			key: "joined",
			header: "Joined",
			cell: (r) => (
				<span className="text-muted-foreground text-xs">
					{formatDate(r.createdAt)}
				</span>
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
				<div className="flex gap-1">
					<Button asChild className="h-7 text-xs" size="sm" variant="outline">
						<Link href={`/admin/users/${r.id}`}>View</Link>
					</Button>
					{r.isActive ? (
						<ConfirmDialog
							confirmLabel="Suspend"
							description={`Suspend ${r.name}? They will lose access to the platform.`}
							onConfirm={() => suspend.mutate({ userId: r.id })}
							title="Suspend User?"
							trigger={
								<Button
									className="h-7 w-7 text-destructive hover:text-destructive"
									size="icon"
									variant="ghost"
								>
									<UserX className="h-3.5 w-3.5" />
								</Button>
							}
							variant="destructive"
						/>
					) : (
						<Button
							className="h-7 w-7 text-green-600"
							onClick={() => activate.mutate({ userId: r.id })}
							size="icon"
							variant="ghost"
						>
							<UserCheck className="h-3.5 w-3.5" />
						</Button>
					)}
				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			<PageHeader
				description="Manage all platform users and their roles"
				icon={Users}
				title="User Management"
			/>
			<DataTable
				columns={columns}
				data={(users ?? []) as UserRow[]}
				emptyTitle="No users found"
				isLoading={isLoading}
				searchKeys={["name", "email"]}
				searchPlaceholder="Search users..."
				toolbar={
					<Select
						onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
						value={roleFilter}
					>
						<SelectTrigger className="h-8 w-36 text-xs">
							<SelectValue placeholder="All Roles" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							<SelectItem value="parent">Parents</SelectItem>
							<SelectItem value="driver">Drivers</SelectItem>
							<SelectItem value="manager">Managers</SelectItem>
							<SelectItem value="admin">Admins</SelectItem>
						</SelectContent>
					</Select>
				}
			/>
		</div>
	);
}
