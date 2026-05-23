"use client";

import { Plus, Route, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

interface StopInput {
	stopName: string;
	stopOrder: number;
	landmark: string;
	pickupTime: string;
	dropTime: string;
}

export function NewRouteClient() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [routeCode, setRouteCode] = useState("");
	const [routeType, setRouteType] = useState<
		"morning" | "evening" | "full_day"
	>("morning");
	const [startLocation, setStartLocation] = useState("");
	const [endLocation, setEndLocation] = useState("");
	const [departureTime, setDepartureTime] = useState("");
	const [estimatedArrival, setEstimatedArrival] = useState("");
	const [description, setDescription] = useState("");
	const [busId, setBusId] = useState("");
	const [driverId, setDriverId] = useState("");
	const [stops, setStops] = useState<StopInput[]>([
		{ stopName: "", stopOrder: 1, landmark: "", pickupTime: "", dropTime: "" },
	]);

	const { data: buses } = api.bus.list.useQuery({});
	const { data: drivers } = api.admin.listUsers.useQuery({ role: "driver" });

	const create = api.route.create.useMutation({
		onSuccess: () => {
			toast.success("Route created!");
			router.push("/manager/routes");
		},
		onError: (e) => toast.error(e.message),
	});

	function addStop() {
		setStops((prev) => [
			...prev,
			{
				stopName: "",
				stopOrder: prev.length + 1,
				landmark: "",
				pickupTime: "",
				dropTime: "",
			},
		]);
	}

	function removeStop(i: number) {
		setStops((prev) =>
			prev
				.filter((_, idx) => idx !== i)
				.map((s, idx) => ({ ...s, stopOrder: idx + 1 })),
		);
	}

	function updateStop(i: number, field: keyof StopInput, value: string) {
		setStops((prev) =>
			prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
		);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (
			!name ||
			!routeCode ||
			!startLocation ||
			!endLocation ||
			!departureTime
		) {
			toast.error("Please fill all required fields");
			return;
		}
		const validStops = stops.filter((s) => s.stopName.trim());
		create.mutate({
			name,
			routeCode,
			routeType,
			startLocation,
			endLocation,
			departureTime,
			estimatedArrival: estimatedArrival || undefined,
			description: description || undefined,
			busId: busId || undefined,
			driverId: driverId || undefined,
			stops: validStops.map((s) => ({
				stopName: s.stopName,
				stopOrder: s.stopOrder,
				landmark: s.landmark || undefined,
				pickupTime: s.pickupTime || undefined,
				dropTime: s.dropTime || undefined,
			})),
		});
	}

	return (
		<div className="max-w-2xl space-y-6">
			<PageHeader
				description="Set up a new bus route with stops and assignments"
				icon={Route}
				title="Create New Route"
			/>
			<form className="space-y-5" onSubmit={handleSubmit}>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">Route Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>
									Route Name <span className="text-destructive">*</span>
								</Label>
								<Input
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. Velachery Morning"
									value={name}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>
									Route Code <span className="text-destructive">*</span>
								</Label>
								<Input
									onChange={(e) => setRouteCode(e.target.value.toUpperCase())}
									placeholder="e.g. RT-01"
									value={routeCode}
								/>
							</div>
						</div>
						<div className="grid grid-cols-3 gap-3">
							<div className="space-y-1.5">
								<Label>
									Type <span className="text-destructive">*</span>
								</Label>
								<Select
									onValueChange={(v) => setRouteType(v as typeof routeType)}
									value={routeType}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="morning">Morning</SelectItem>
										<SelectItem value="evening">Evening</SelectItem>
										<SelectItem value="full_day">Full Day</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>
									Departure Time <span className="text-destructive">*</span>
								</Label>
								<Input
									onChange={(e) => setDepartureTime(e.target.value)}
									type="time"
									value={departureTime}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Est. Arrival</Label>
								<Input
									onChange={(e) => setEstimatedArrival(e.target.value)}
									type="time"
									value={estimatedArrival}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>
									Start Location <span className="text-destructive">*</span>
								</Label>
								<Input
									onChange={(e) => setStartLocation(e.target.value)}
									placeholder="Starting point"
									value={startLocation}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>
									End Location <span className="text-destructive">*</span>
								</Label>
								<Input
									onChange={(e) => setEndLocation(e.target.value)}
									placeholder="Destination"
									value={endLocation}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Assign Bus</Label>
								<Select onValueChange={setBusId} value={busId}>
									<SelectTrigger>
										<SelectValue placeholder="Select bus" />
									</SelectTrigger>
									<SelectContent>
										{buses?.map((b) => (
											<SelectItem key={b.id} value={b.id}>
												{b.registrationNumber} (Cap: {b.capacity})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>Assign Driver</Label>
								<Select onValueChange={setDriverId} value={driverId}>
									<SelectTrigger>
										<SelectValue placeholder="Select driver" />
									</SelectTrigger>
									<SelectContent>
										{drivers?.map((d) => (
											<SelectItem key={d.id} value={d.id}>
												{d.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label>Description</Label>
							<Textarea
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Route notes..."
								rows={2}
								value={description}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center justify-between text-sm">
							Stops
							<Button
								className="h-7 gap-1 text-xs"
								onClick={addStop}
								size="sm"
								type="button"
								variant="outline"
							>
								<Plus className="h-3.5 w-3.5" />
								Add Stop
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{stops.map((stop, i) => (
							<div
								className="space-y-3 rounded-lg border bg-muted/20 p-3"
								key={`stop-${stop.stopOrder}`}
							>
								<div className="flex items-center justify-between">
									<span className="font-semibold text-muted-foreground text-xs">
										STOP {stop.stopOrder}
									</span>
									{stops.length > 1 && (
										<Button
											className="h-6 w-6 text-destructive"
											onClick={() => removeStop(i)}
											size="icon"
											type="button"
											variant="ghost"
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									)}
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div className="space-y-1">
										<Label className="text-xs">Stop Name *</Label>
										<Input
											className="h-8 text-sm"
											onChange={(e) =>
												updateStop(i, "stopName", e.target.value)
											}
											placeholder="e.g. Gandhi Nagar"
											value={stop.stopName}
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Landmark</Label>
										<Input
											className="h-8 text-sm"
											onChange={(e) =>
												updateStop(i, "landmark", e.target.value)
											}
											placeholder="Near..."
											value={stop.landmark}
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Pickup Time</Label>
										<Input
											className="h-8 text-sm"
											onChange={(e) =>
												updateStop(i, "pickupTime", e.target.value)
											}
											type="time"
											value={stop.pickupTime}
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Drop Time</Label>
										<Input
											className="h-8 text-sm"
											onChange={(e) =>
												updateStop(i, "dropTime", e.target.value)
											}
											type="time"
											value={stop.dropTime}
										/>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<div className="flex gap-3">
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
						{create.isPending ? "Creating..." : "Create Route"}
					</Button>
				</div>
			</form>
		</div>
	);
}
