"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Route, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
	const [routeType, setRouteType] = useState<"morning" | "evening" | "full_day">("morning");
	const [startLocation, setStartLocation] = useState("");
	const [endLocation, setEndLocation] = useState("");
	const [departureTime, setDepartureTime] = useState("");
	const [estimatedArrival, setEstimatedArrival] = useState("");
	const [description, setDescription] = useState("");
	const [busId, setBusId] = useState("");
	const [driverId, setDriverId] = useState("");
	const [stops, setStops] = useState<StopInput[]>([{ stopName: "", stopOrder: 1, landmark: "", pickupTime: "", dropTime: "" }]);

	const { data: buses } = api.bus.list.useQuery({});
	const { data: drivers } = api.admin.listUsersByRole.useQuery({ role: "driver" });

	const create = api.route.create.useMutation({
		onSuccess: () => { toast.success("Route created!"); router.push("/manager/routes"); },
		onError: (e) => toast.error(e.message),
	});

	function addStop() {
		setStops((prev) => [...prev, { stopName: "", stopOrder: prev.length + 1, landmark: "", pickupTime: "", dropTime: "" }]);
	}

	function removeStop(i: number) {
		setStops((prev) => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stopOrder: idx + 1 })));
	}

	function updateStop(i: number, field: keyof StopInput, value: string) {
		setStops((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name || !routeCode || !startLocation || !endLocation || !departureTime) {
			toast.error("Please fill all required fields"); return;
		}
		const validStops = stops.filter((s) => s.stopName.trim());
		create.mutate({
			name, routeCode, routeType, startLocation, endLocation,
			departureTime, estimatedArrival: estimatedArrival || undefined,
			description: description || undefined,
			busId: busId || undefined, driverId: driverId || undefined,
			stops: validStops.map((s) => ({
				stopName: s.stopName, stopOrder: s.stopOrder,
				landmark: s.landmark || undefined,
				pickupTime: s.pickupTime || undefined,
				dropTime: s.dropTime || undefined,
			})),
		});
	}

	return (
		<div className="max-w-2xl space-y-6">
			<PageHeader title="Create New Route" description="Set up a new bus route with stops and assignments" icon={Route} />
			<form onSubmit={handleSubmit} className="space-y-5">
				<Card>
					<CardHeader className="pb-3"><CardTitle className="text-sm">Route Details</CardTitle></CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Route Name <span className="text-destructive">*</span></Label>
								<Input placeholder="e.g. Velachery Morning" value={name} onChange={(e) => setName(e.target.value)} />
							</div>
							<div className="space-y-1.5">
								<Label>Route Code <span className="text-destructive">*</span></Label>
								<Input placeholder="e.g. RT-01" value={routeCode} onChange={(e) => setRouteCode(e.target.value.toUpperCase())} />
							</div>
						</div>
						<div className="grid grid-cols-3 gap-3">
							<div className="space-y-1.5">
								<Label>Type <span className="text-destructive">*</span></Label>
								<Select value={routeType} onValueChange={(v) => setRouteType(v as typeof routeType)}>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="morning">Morning</SelectItem>
										<SelectItem value="evening">Evening</SelectItem>
										<SelectItem value="full_day">Full Day</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>Departure Time <span className="text-destructive">*</span></Label>
								<Input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
							</div>
							<div className="space-y-1.5">
								<Label>Est. Arrival</Label>
								<Input type="time" value={estimatedArrival} onChange={(e) => setEstimatedArrival(e.target.value)} />
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Start Location <span className="text-destructive">*</span></Label>
								<Input placeholder="Starting point" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} />
							</div>
							<div className="space-y-1.5">
								<Label>End Location <span className="text-destructive">*</span></Label>
								<Input placeholder="Destination" value={endLocation} onChange={(e) => setEndLocation(e.target.value)} />
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Assign Bus</Label>
								<Select value={busId} onValueChange={setBusId}>
									<SelectTrigger><SelectValue placeholder="Select bus" /></SelectTrigger>
									<SelectContent>
										{buses?.map((b) => <SelectItem key={b.id} value={b.id}>{b.registrationNumber} (Cap: {b.capacity})</SelectItem>)}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>Assign Driver</Label>
								<Select value={driverId} onValueChange={setDriverId}>
									<SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
									<SelectContent>
										{drivers?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label>Description</Label>
							<Textarea placeholder="Route notes..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm flex items-center justify-between">
							Stops
							<Button type="button" size="sm" variant="outline" onClick={addStop} className="gap-1 h-7 text-xs">
								<Plus className="h-3.5 w-3.5" />Add Stop
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{stops.map((stop, i) => (
							<div key={`stop-${stop.stopOrder}`} className="rounded-lg border bg-muted/20 p-3 space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold text-muted-foreground">STOP {stop.stopOrder}</span>
									{stops.length > 1 && (
										<Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeStop(i)}>
											<Trash2 className="h-3 w-3" />
										</Button>
									)}
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div className="space-y-1">
										<Label className="text-xs">Stop Name *</Label>
										<Input className="h-8 text-sm" placeholder="e.g. Gandhi Nagar" value={stop.stopName} onChange={(e) => updateStop(i, "stopName", e.target.value)} />
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Landmark</Label>
										<Input className="h-8 text-sm" placeholder="Near..." value={stop.landmark} onChange={(e) => updateStop(i, "landmark", e.target.value)} />
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Pickup Time</Label>
										<Input className="h-8 text-sm" type="time" value={stop.pickupTime} onChange={(e) => updateStop(i, "pickupTime", e.target.value)} />
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Drop Time</Label>
										<Input className="h-8 text-sm" type="time" value={stop.dropTime} onChange={(e) => updateStop(i, "dropTime", e.target.value)} />
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<div className="flex gap-3">
					<Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
					<Button type="submit" className="flex-1 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]" disabled={create.isPending}>
						{create.isPending ? "Creating..." : "Create Route"}
					</Button>
				</div>
			</form>
		</div>
	);
}