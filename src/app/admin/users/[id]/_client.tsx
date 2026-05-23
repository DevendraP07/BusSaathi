"use client";

import { Shield, Trash2, UserCheck, Users, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { formatDate, formatDateTime } from "@/lib/date";
import { api } from "@/trpc/react";

export function UserDetailClient({ userId }: { userId: string }) {
	const router = useRouter();
	const [newRole, setNewRole] = useState<
		"parent" | "driver" | "manager" | "admin"
	>("parent");
	const { data: user, isLoading } = api.admin.getUserById.useQuery({ userId });
	const utils = api.useUtils();

	const updateRole = api.admin.updateUserRole.useMutation({
		onSuccess: () => {
			toast.success("Role updated!");
			void utils.admin.getUserById.invalidate({ userId });
		},
		onError: (e) => toast.error(e.message),
	});
	const suspend = api.admin.suspendUser.useMutation({
		onSuccess: () => {
			toast.success("User suspended");
			void utils.admin.getUserById.invalidate({ userId });
		},
		onError: (e) => toast.error(e.message),
	});
	const activate = api.admin.activateUser.useMutation({
		onSuccess: () => {
			toast.success("User activated");
			void utils.admin.getUserById.invalidate({ userId });
		},
		onError: (e) => toast.error(e.message),
	});
	const deleteUser = api.admin.deleteUser.useMutation({
		onSuccess: () => {
			toast.success("User deleted");
			router.push("/admin/users");
		},
		onError: (e) => toast.error(e.message),
	});

	if (isLoading) return <Skeleton className="h-96 max-w-xl" />;
	if (!user) return <p className="text-muted-foreground">User not found.</p>;

	return (
		<div className="max-w-xl space-y-5">
			<PageHeader description={user.email} icon={Users} title={user.name} />

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Account Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="mb-3 flex items-center gap-4">
						<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 font-black text-2xl text-amber-700">
							{user.name.charAt(0)}
						</div>
						<div>
							<p className="font-bold text-lg">{user.name}</p>
							<p className="text-muted-foreground text-sm">{user.email}</p>
							<div className="mt-1 flex gap-2">
								<StatusBadge status={user.role} />
								<StatusBadge status={user.isActive ? "active" : "inactive"} />
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div>
							<p className="text-muted-foreground text-xs">Phone</p>
							<p className="font-medium">{user.phone ?? "—"}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Address</p>
							<p className="font-medium">{user.address ?? "—"}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Joined</p>
							<p className="font-medium">{formatDate(user.createdAt)}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Last Updated</p>
							<p className="font-medium">{formatDateTime(user.updatedAt)}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Role Management */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Shield className="h-4 w-4" />
						Role Management
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-1.5">
						<Label className="text-xs">Change Role</Label>
						<div className="flex gap-2">
							<Select
								onValueChange={(v) => setNewRole(v as typeof newRole)}
								value={newRole}
							>
								<SelectTrigger className="flex-1">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="parent">Parent</SelectItem>
									<SelectItem value="driver">Driver</SelectItem>
									<SelectItem value="manager">Manager</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
							<ConfirmDialog
								confirmLabel="Update Role"
								description={`Change ${user.name}'s role to "${newRole}"? This will affect their access immediately.`}
								onConfirm={() => updateRole.mutate({ userId, role: newRole })}
								title="Update User Role?"
								trigger={
									<Button className="shrink-0" size="sm" variant="outline">
										Update Role
									</Button>
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Driver Profile */}
			{user.driverProfile && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">Driver Profile</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-2 gap-3 text-sm">
						<div>
							<p className="text-muted-foreground text-xs">License No.</p>
							<p className="font-semibold">
								{user.driverProfile.licenseNumber}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Expiry</p>
							<p className="font-semibold">
								{formatDate(user.driverProfile.licenseExpiry)}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Experience</p>
							<p className="font-semibold">
								{user.driverProfile.experience ?? "—"} years
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Verified</p>
							<StatusBadge
								status={user.driverProfile.isVerified ? "active" : "pending"}
							/>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Actions */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Account Actions</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					{user.isActive ? (
						<ConfirmDialog
							confirmLabel="Suspend"
							description={`Suspend ${user.name}? They will lose platform access immediately.`}
							onConfirm={() => suspend.mutate({ userId })}
							title="Suspend User?"
							trigger={
								<Button
									className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
									variant="outline"
								>
									<UserX className="h-4 w-4" />
									Suspend User
								</Button>
							}
							variant="destructive"
						/>
					) : (
						<Button
							className="gap-2 bg-green-600 text-white hover:bg-green-700"
							onClick={() => activate.mutate({ userId })}
						>
							<UserCheck className="h-4 w-4" />
							Activate User
						</Button>
					)}
					<ConfirmDialog
						confirmLabel="Delete"
						description={`Permanently delete ${user.name}? This action cannot be undone.`}
						onConfirm={() => deleteUser.mutate({ userId })}
						title="Delete User?"
						trigger={
							<Button
								className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
								variant="outline"
							>
								<Trash2 className="h-4 w-4" />
								Delete User
							</Button>
						}
						variant="destructive"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
