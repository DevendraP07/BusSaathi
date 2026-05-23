"use client";

import { Bus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";

export function NewBusClient() {
	const router = useRouter();
	const [registrationNumber, setRegistrationNumber] = useState("");
	const [model, setModel] = useState("");
	const [capacity, setCapacity] = useState("");
	const [gpsDeviceId, setGpsDeviceId] = useState("");
	const [insuranceExpiry, setInsuranceExpiry] = useState("");
	const [fitnessCertExpiry, setFitnessCertExpiry] = useState("");

	const create = api.bus.create.useMutation({
		onSuccess: () => {
			toast.success("Bus added!");
			router.push("/manager/buses");
		},
		onError: (e) => toast.error(e.message),
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!registrationNumber || !capacity) {
			toast.error("Registration number and capacity required");
			return;
		}
		create.mutate({
			registrationNumber: registrationNumber.toUpperCase(),
			model: model || undefined,
			capacity: Number(capacity),
			gpsDeviceId: gpsDeviceId || undefined,
			insuranceExpiry: insuranceExpiry || undefined,
			fitnessCertExpiry: fitnessCertExpiry || undefined,
		});
	}

	return (
		<div className="max-w-lg space-y-6">
			<PageHeader
				description="Register a bus in the school fleet"
				icon={Bus}
				title="Add New Bus"
			/>
			<Card>
				<CardContent className="p-6">
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-1.5">
							<Label>
								Registration Number <span className="text-destructive">*</span>
							</Label>
							<Input
								onChange={(e) => setRegistrationNumber(e.target.value)}
								placeholder="e.g. TN01AB1234"
								value={registrationNumber}
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Model / Make</Label>
								<Input
									onChange={(e) => setModel(e.target.value)}
									placeholder="e.g. TATA Starbus"
									value={model}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>
									Seating Capacity <span className="text-destructive">*</span>
								</Label>
								<Input
									max="80"
									min="1"
									onChange={(e) => setCapacity(e.target.value)}
									placeholder="e.g. 40"
									type="number"
									value={capacity}
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label>GPS Device ID</Label>
							<Input
								onChange={(e) => setGpsDeviceId(e.target.value)}
								placeholder="GPS tracker ID (optional)"
								value={gpsDeviceId}
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Insurance Expiry</Label>
								<Input
									onChange={(e) => setInsuranceExpiry(e.target.value)}
									type="date"
									value={insuranceExpiry}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Fitness Certificate Expiry</Label>
								<Input
									onChange={(e) => setFitnessCertExpiry(e.target.value)}
									type="date"
									value={fitnessCertExpiry}
								/>
							</div>
						</div>
						<div className="flex gap-3 pt-2">
							<Button
								className="flex-1"
								onClick={() => router.back()}
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								className="flex-1 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
								disabled={create.isPending}
								type="submit"
							>
								{create.isPending ? "Adding..." : "Add Bus"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
