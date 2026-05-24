"use client";

import { Bus, Calendar, Pencil, Route, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

export function BusDetailClient({ busId }: { busId: string }) {
	const router = useRouter();
	const [editing, setEditing] = useState(false);
	const [status, setStatus] = useState<"active" | "inactive" | "maintenance">(
		"active",
	);
	const [model, setModel] = useState("");
	const [capacity, setCapacity] = useState("");
	const [gpsDeviceId, setGpsDeviceId] = useState("");
	const [insuranceExpiry, setInsuranceExpiry] = useState("");
	const [fitnessCertExpiry, setFitnessCertExpiry] = useState("");

	const { data: bus, isLoading } = api.bus.getById.useQuery({ busId });
	const utils = api.useUtils();

	useEffect(() => {
		if (bus) {
			setStatus(bus.status);
			setModel(bus.model ?? "");
			setCapacity(bus.capacity.toString());
			setGpsDeviceId(bus.gpsDeviceId ?? "");
			setInsuranceExpiry(
				bus.insuranceExpiry
					? (new Date(bus.insuranceExpiry).toISOString().split("T")[0] ?? "")
					: "",
			);
			setFitnessCertExpiry(
				bus.fitnessCertExpiry
					? (new Date(bus.fitnessCertExpiry).toISOString().split("T")[0] ?? "")
					: "",
			);
		}
	}, [bus]);

	const update = api.bus.update.useMutation({
		onSuccess: () => {
			toast.success("Bus updated!");
			setEditing(false);
			void utils.bus.getById.invalidate({ busId });
		},
		onError: (e) => toast.error(e.message),
	});

	const remove = api.bus.remove.useMutation({
		onSuccess: () => {
			toast.success("Bus removed");
			router.push("/manager/buses");
		},
		onError: (e) => toast.error(e.message),
	});

	if (isLoading) return <Skeleton className="h-96 max-w-2xl" />;
	if (!bus) return <p className="text-muted-foreground">Bus not found.</p>;

	return (
		<div className="max-w-2xl space-y-5">
			<PageHeader
				actions={
					<div className="flex gap-2">
						{!editing ? (
							<>
								<Button
									className="gap-1"
									onClick={() => setEditing(true)}
									size="sm"
									variant="outline"
								>
									<Pencil className="h-4 w-4" />
									Edit
								</Button>
								<ConfirmDialog
									confirmLabel="Remove"
									description={`Remove bus ${bus.registrationNumber}? This action cannot be undone.`}
									onConfirm={() => remove.mutate({ busId })}
									title="Remove Bus?"
									trigger={
										<Button
											className="gap-1 border-destructive text-destructive hover:bg-destructive/10"
											size="sm"
											variant="outline"
										>
											Remove
										</Button>
									}
									variant="destructive"
								/>
							</>
						) : (
							<>
								<Button
									className="gap-1"
									onClick={() => setEditing(false)}
									size="sm"
									variant="outline"
								>
									<X className="h-4 w-4" />
									Cancel
								</Button>
								<Button
									className="gap-1 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
									disabled={update.isPending}
									onClick={() =>
										update.mutate({
											busId,
											status,
											model: model || undefined,
											capacity: capacity ? Number(capacity) : undefined,
											gpsDeviceId: gpsDeviceId || undefined,
											insuranceExpiry: insuranceExpiry || undefined,
											fitnessCertExpiry: fitnessCertExpiry || undefined,
										})
									}
									size="sm"
								>
									<Save className="h-4 w-4" />
									{update.isPending ? "Saving..." : "Save"}
								</Button>
							</>
						)}
					</div>
				}
				description={bus.model ?? "Bus Details"}
				icon={Bus}
				title={bus.registrationNumber}
			/>

			{/* Bus Info */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center justify-between text-sm">
						Bus Information
						<StatusBadge status={bus.status} />
					</CardTitle>
				</CardHeader>
				<CardContent>
					{editing ? (
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<Label className="text-xs">Status</Label>
								<Select
									onValueChange={(v) => setStatus(v as typeof status)}
									value={status}
								>
									<SelectTrigger className="h-8">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="maintenance">Maintenance</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Model / Make</Label>
								<Input
									className="h-8"
									onChange={(e) => setModel(e.target.value)}
									value={model}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Seating Capacity</Label>
								<Input
									className="h-8"
									min="1"
									onChange={(e) => setCapacity(e.target.value)}
									type="number"
									value={capacity}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">GPS Device ID</Label>
								<Input
									className="h-8"
									onChange={(e) => setGpsDeviceId(e.target.value)}
									value={gpsDeviceId}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Insurance Expiry</Label>
								<Input
									className="h-8"
									onChange={(e) => setInsuranceExpiry(e.target.value)}
									type="date"
									value={insuranceExpiry}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Fitness Cert Expiry</Label>
								<Input
									className="h-8"
									onChange={(e) => setFitnessCertExpiry(e.target.value)}
									type="date"
									value={fitnessCertExpiry}
								/>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground text-xs">Registration</p>
								<p className="font-bold font-mono">{bus.registrationNumber}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Model</p>
								<p className="font-semibold">{bus.model ?? "—"}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Capacity</p>
								<p className="font-semibold">{bus.capacity} seats</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">GPS Device</p>
								<p className="font-semibold">{bus.gpsDeviceId ?? "—"}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									Insurance Expiry
								</p>
								<p className="font-semibold">
									{formatDate(bus.insuranceExpiry)}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									Fitness Cert Expiry
								</p>
								<p className="font-semibold">
									{formatDate(bus.fitnessCertExpiry)}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Added On</p>
								<p className="font-semibold">{formatDate(bus.createdAt)}</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Assigned Routes */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Route className="h-4 w-4" />
						Assigned Routes ({bus.routes.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{bus.routes.length === 0 ? (
						<p className="py-4 text-center text-muted-foreground text-sm">
							Not assigned to any route
						</p>
					) : (
						bus.routes.map((r) => (
							<div
								className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
								key={r.id}
							>
								<div>
									<p className="font-medium text-sm">{r.name}</p>
									<p className="text-muted-foreground text-xs">
										{r.routeCode} · {r.departureTime}
									</p>
								</div>
								<StatusBadge status={r.status} />
							</div>
						))
					)}
				</CardContent>
			</Card>

			{/* Trip History */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Calendar className="h-4 w-4" />
						Recent Trips ({bus.trips.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{bus.trips.length === 0 ? (
						<p className="py-4 text-center text-muted-foreground text-sm">
							No trips recorded yet
						</p>
					) : (
						bus.trips.slice(0, 5).map((t) => (
							<div
								className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
								key={t.id}
							>
								<div>
									<p className="font-medium font-mono text-xs">{t.tripRef}</p>
									<p className="text-muted-foreground text-xs">
										{formatDate(t.scheduledDate)}
									</p>
								</div>
								<StatusBadge status={t.status} />
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
