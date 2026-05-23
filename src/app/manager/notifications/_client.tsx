"use client";

import { Bell, Send } from "lucide-react";
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

export function ManagerClient() {
	const [role, setRole] = useState<"parent" | "driver" | "manager" | "admin">(
		"parent",
	);
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");

	const broadcast = api.admin.broadcastToRole.useMutation({
		onSuccess: (data) => {
			toast.success(`Notification sent to ${data.sentTo} users!`);
			setTitle("");
			setMessage("");
		},
		onError: (e) => toast.error(e.message),
	});

	function handleSend(e: React.FormEvent) {
		e.preventDefault();
		if (!title || !message) {
			toast.error("Title and message are required");
			return;
		}
		broadcast.mutate({ role, title, message });
	}

	const QUICK_TEMPLATES = [
		{
			label: "Bus Delay",
			title: "Bus Delay Notice",
			message:
				"Your school bus is running late by approximately 15-20 minutes today. We apologize for the inconvenience.",
		},
		{
			label: "Route Change",
			title: "Route Change Notification",
			message:
				"Please note that there is a temporary route change today due to road work. The bus will take an alternate path.",
		},
		{
			label: "Fee Reminder",
			title: "Transport Fee Reminder",
			message:
				"This is a reminder that your transport fee is due. Please make the payment at the earliest to avoid any service disruption.",
		},
		{
			label: "Holiday Notice",
			title: "No Transport on Holiday",
			message:
				"Please note that there will be no school bus service on the upcoming holiday. Normal service will resume on the next working day.",
		},
	];

	return (
		<div className="max-w-2xl space-y-6">
			<PageHeader
				description="Broadcast messages to parents, drivers, or managers"
				icon={Bell}
				title="Send Notifications"
			/>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Quick Templates</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-2">
					{QUICK_TEMPLATES.map((t) => (
						<Button
							className="h-auto justify-start py-2 text-left text-xs"
							key={t.label}
							onClick={() => {
								setTitle(t.title);
								setMessage(t.message);
							}}
							size="sm"
							variant="outline"
						>
							{t.label}
						</Button>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Compose Notification</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSend}>
						<div className="space-y-1.5">
							<Label>
								Send To <span className="text-destructive">*</span>
							</Label>
							<Select
								onValueChange={(v) => setRole(v as typeof role)}
								value={role}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="parent">All Parents</SelectItem>
									<SelectItem value="driver">All Drivers</SelectItem>
									<SelectItem value="manager">All Managers</SelectItem>
									<SelectItem value="admin">All Admins</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>
								Title <span className="text-destructive">*</span>
							</Label>
							<Input
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Notification title"
								value={title}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>
								Message <span className="text-destructive">*</span>
							</Label>
							<Textarea
								onChange={(e) => setMessage(e.target.value)}
								placeholder="Write your message here..."
								rows={5}
								value={message}
							/>
							<p className="text-muted-foreground text-xs">
								{message.length} characters
							</p>
						</div>
						<Button
							className="w-full gap-2 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
							disabled={broadcast.isPending}
							type="submit"
						>
							<Send className="h-4 w-4" />
							{broadcast.isPending
								? "Sending..."
								: `Send to All ${role.charAt(0).toUpperCase() + role.slice(1)}s`}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
