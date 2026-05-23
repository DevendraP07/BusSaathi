"use client";

import { AlertTriangle } from "lucide-react";
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

export function ReportIssueClient() {
	const router = useRouter();
	const [type, setType] = useState<
		"delay" | "breakdown" | "route_deviation" | "student_safety" | "other"
	>("delay");
	const [priority, setPriority] = useState<
		"low" | "medium" | "high" | "critical"
	>("medium");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const report = api.issue.report.useMutation({
		onSuccess: () => {
			toast.success("Issue reported to management!");
			router.push("/driver/issues");
		},
		onError: (e) => toast.error(e.message),
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!title || !description) {
			toast.error("Please fill all required fields");
			return;
		}
		report.mutate({ type, priority, title, description });
	}

	return (
		<div className="max-w-xl space-y-6">
			<PageHeader
				description="Report any problem to the transport manager"
				icon={AlertTriangle}
				title="Report Issue"
			/>
			<Card>
				<CardContent className="p-6">
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>
									Issue Type <span className="text-destructive">*</span>
								</Label>
								<Select
									onValueChange={(v) => setType(v as typeof type)}
									value={type}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="delay">Delay</SelectItem>
										<SelectItem value="breakdown">Breakdown</SelectItem>
										<SelectItem value="route_deviation">
											Route Deviation
										</SelectItem>
										<SelectItem value="student_safety">
											Student Safety
										</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>
									Priority <span className="text-destructive">*</span>
								</Label>
								<Select
									onValueChange={(v) => setPriority(v as typeof priority)}
									value={priority}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="critical">Critical</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="title">
								Title <span className="text-destructive">*</span>
							</Label>
							<Input
								id="title"
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Brief description of the issue"
								value={title}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="desc">
								Full Description <span className="text-destructive">*</span>
							</Label>
							<Textarea
								id="desc"
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Describe the issue in detail — location, time, what happened..."
								rows={5}
								value={description}
							/>
						</div>
						<div className="flex gap-2 pt-1">
							<Button
								className="flex-1"
								onClick={() => router.back()}
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
							<Button
								className="flex-1 bg-red-600 text-white hover:bg-red-700"
								disabled={report.isPending}
								type="submit"
							>
								{report.isPending ? "Reporting..." : "Submit Report"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
