"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export function FeeStructureClient() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [feeType, setFeeType] = useState<"monthly" | "term" | "annual">(
		"monthly",
	);
	const [amount, setAmount] = useState("");
	const [routeId, setRouteId] = useState("all");
	const [description, setDescription] = useState("");
	const [effectiveFrom, setEffectiveFrom] = useState("");
	const [effectiveTo, setEffectiveTo] = useState("");

	const { data: routes } = api.route.listActive.useQuery({});

	const create = api.fee.createStructure.useMutation({
		onSuccess: () => {
			toast.success("Fee structure created!");
			router.push("/manager/fees");
		},
		onError: (e) => toast.error(e.message),
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name || !amount || !effectiveFrom) {
			toast.error("Please fill all required fields");
			return;
		}
		create.mutate({
			name,
			feeType,
			amount,
			routeId: routeId === "all" || !routeId ? undefined : routeId,
			description: description || undefined,
			effectiveFrom,
			effectiveTo: effectiveTo || undefined,
		});
	}

	return (
		<div className="max-w-lg space-y-6">
			<PageHeader
				description="Configure a transport fee for students"
				icon={CreditCard}
				title="New Fee Structure"
			/>
			<Card>
				<CardContent className="p-6">
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-1.5">
							<Label>
								Fee Name <span className="text-destructive">*</span>
							</Label>
							<Input
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Monthly Transport Fee"
								value={name}
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>
									Fee Type <span className="text-destructive">*</span>
								</Label>
								<Select
									onValueChange={(v) => setFeeType(v as typeof feeType)}
									value={feeType}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="monthly">Monthly</SelectItem>
										<SelectItem value="term">Term-wise</SelectItem>
										<SelectItem value="annual">Annual</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>
									Amount (₹) <span className="text-destructive">*</span>
								</Label>
								<Input
									min="0"
									onChange={(e) => setAmount(e.target.value)}
									placeholder="e.g. 3000"
									type="number"
									value={amount}
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label>Apply to Route (optional)</Label>
							<Select onValueChange={setRouteId} value={routeId}>
								<SelectTrigger>
									<SelectValue placeholder="All routes" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Routes</SelectItem>
									{routes?.map((r) => (
										<SelectItem key={r.id} value={r.id}>
											{r.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>
									Effective From <span className="text-destructive">*</span>
								</Label>
								<Input
									onChange={(e) => setEffectiveFrom(e.target.value)}
									type="date"
									value={effectiveFrom}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Effective To</Label>
								<Input
									onChange={(e) => setEffectiveTo(e.target.value)}
									type="date"
									value={effectiveTo}
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label>Description</Label>
							<Textarea
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Notes about this fee..."
								rows={2}
								value={description}
							/>
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
								{create.isPending ? "Creating..." : "Create Structure"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
