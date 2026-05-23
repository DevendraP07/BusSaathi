"use client";

import { Save, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";

export function DriverProfileClient() {
	const { data: profile } = api.profile.get.useQuery();
	const { data: driverProfile } = api.driverProfile.getMyProfile.useQuery();
	const utils = api.useUtils();

	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [licenseNumber, setLicenseNumber] = useState("");
	const [licenseExpiry, setLicenseExpiry] = useState("");
	const [experience, setExperience] = useState("");

	useEffect(() => {
		if (profile) {
			setName(profile.name);
			setPhone(profile.phone ?? "");
		}
	}, [profile]);

	useEffect(() => {
		if (driverProfile) {
			setLicenseNumber(driverProfile.licenseNumber);
			setLicenseExpiry(
				driverProfile.licenseExpiry
					? (new Date(driverProfile.licenseExpiry)
							.toISOString()
							.split("T")[0] ?? "")
					: "",
			);
			setExperience(driverProfile.experience?.toString() ?? "");
		}
	}, [driverProfile]);

	const updateProfile = api.profile.update.useMutation({
		onSuccess: () => {
			toast.success("Profile updated!");
			void utils.profile.get.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	const upsertDriver = api.driverProfile.upsert.useMutation({
		onSuccess: () => {
			toast.success("Driver details saved!");
			void utils.driverProfile.getMyProfile.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	return (
		<div className="max-w-xl space-y-6">
			<PageHeader
				description="Manage your account and license details"
				icon={User}
				title="Driver Profile"
			/>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center justify-between text-sm">
						Personal Info
						{driverProfile?.isVerified ? (
							<span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 font-semibold text-green-700 text-xs">
								<Shield className="h-3 w-3" />
								Verified
							</span>
						) : (
							<span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 font-semibold text-amber-700 text-xs">
								Pending Verification
							</span>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="mb-2 flex items-center gap-4">
						<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 font-black text-2xl text-amber-700">
							{profile?.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="font-bold text-lg">{profile?.name}</p>
							<p className="text-muted-foreground text-sm">{profile?.email}</p>
							<StatusBadge status="driver" />
						</div>
					</div>
					<div className="space-y-1.5">
						<Label>Full Name</Label>
						<Input onChange={(e) => setName(e.target.value)} value={name} />
					</div>
					<div className="space-y-1.5">
						<Label>Phone</Label>
						<Input onChange={(e) => setPhone(e.target.value)} value={phone} />
					</div>
					<Button
						className="w-full gap-2 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
						disabled={updateProfile.isPending}
						onClick={() =>
							updateProfile.mutate({
								name: name || undefined,
								phone: phone || undefined,
							})
						}
					>
						<Save className="h-4 w-4" />
						{updateProfile.isPending ? "Saving..." : "Save Personal Info"}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">License & Experience</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-1.5">
						<Label>
							License Number <span className="text-destructive">*</span>
						</Label>
						<Input
							onChange={(e) => setLicenseNumber(e.target.value)}
							placeholder="e.g. TN0120220012345"
							value={licenseNumber}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label>License Expiry</Label>
							<Input
								onChange={(e) => setLicenseExpiry(e.target.value)}
								type="date"
								value={licenseExpiry}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Years of Experience</Label>
							<Input
								max="50"
								min="0"
								onChange={(e) => setExperience(e.target.value)}
								placeholder="e.g. 5"
								type="number"
								value={experience}
							/>
						</div>
					</div>
					<Button
						className="w-full gap-2 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
						disabled={upsertDriver.isPending || !licenseNumber}
						onClick={() =>
							upsertDriver.mutate({
								licenseNumber,
								licenseExpiry: licenseExpiry || undefined,
								experience: experience ? Number(experience) : undefined,
							})
						}
					>
						<Save className="h-4 w-4" />
						{upsertDriver.isPending ? "Saving..." : "Save License Details"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
