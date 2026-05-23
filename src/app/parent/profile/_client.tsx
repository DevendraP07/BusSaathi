"use client";

import { Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/lib/permissions";
import { api } from "@/trpc/react";

export function ProfileClient({ role }: { role: UserRole }) {
	const { data: profile, isLoading } = api.profile.get.useQuery();
	const utils = api.useUtils();
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");

	useEffect(() => {
		if (profile) {
			setName(profile.name);
			setPhone(profile.phone ?? "");
			setAddress(profile.address ?? "");
		}
	}, [profile]);

	const update = api.profile.update.useMutation({
		onSuccess: () => {
			toast.success("Profile updated!");
			void utils.profile.get.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	if (isLoading) return <Skeleton className="h-64" />;

	return (
		<div className="max-w-xl space-y-6">
			<PageHeader
				description="Manage your account details"
				icon={User}
				title="My Profile"
			/>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center justify-between text-sm">
						Account Info
						<StatusBadge status={role ?? "parent"} />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="mb-4 flex items-center gap-4">
						<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 font-black text-2xl text-amber-700">
							{profile?.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="font-bold text-lg">{profile?.name}</p>
							<p className="text-muted-foreground text-sm">{profile?.email}</p>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="pname">Full Name</Label>
						<Input
							id="pname"
							onChange={(e) => setName(e.target.value)}
							value={name}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="pemail">Email Address</Label>
						<Input
							className="bg-muted"
							disabled
							id="pemail"
							value={profile?.email ?? ""}
						/>
						<p className="text-muted-foreground text-xs">
							Email cannot be changed
						</p>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="pphone">Phone Number</Label>
						<Input
							id="pphone"
							onChange={(e) => setPhone(e.target.value)}
							placeholder="10-digit mobile number"
							value={phone}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="paddress">Address</Label>
						<Input
							id="paddress"
							onChange={(e) => setAddress(e.target.value)}
							placeholder="Your address"
							value={address}
						/>
					</div>
					<Button
						className="w-full gap-2 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
						disabled={update.isPending}
						onClick={() =>
							update.mutate({
								name: name || undefined,
								phone: phone || undefined,
								address: address || undefined,
							})
						}
					>
						<Save className="h-4 w-4" />
						{update.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
