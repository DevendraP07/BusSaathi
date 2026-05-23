"use client";

import { Users } from "lucide-react";
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
import { api } from "@/trpc/react";

export function AddStudentClient() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [rollNumber, setRollNumber] = useState("");
	const [className, setClassName] = useState("");
	const [section, setSection] = useState("");
	const [gender, setGender] = useState<"male" | "female" | "other" | undefined>(
		undefined,
	);
	const [emergencyContact, setEmergencyContact] = useState("");

	const create = api.student.create.useMutation({
		onSuccess: () => {
			toast.success("Child added successfully!");
			router.push("/parent/students");
		},
		onError: (e) => toast.error(e.message),
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name) {
			toast.error("Name is required");
			return;
		}
		create.mutate({
			name,
			rollNumber: rollNumber || undefined,
			className: className || undefined,
			section: section || undefined,
			gender: gender ?? undefined,
			emergencyContact: emergencyContact || undefined,
		});
	}

	return (
		<div className="max-w-xl space-y-6">
			<PageHeader
				description="Add your child's details to manage their transport"
				icon={Users}
				title="Add Child"
			/>
			<Card>
				<CardContent className="p-6">
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-1.5">
							<Label htmlFor="name">
								Full Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="name"
								onChange={(e) => setName(e.target.value)}
								placeholder="Child's full name"
								value={name}
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="class">Class</Label>
								<Input
									id="class"
									onChange={(e) => setClassName(e.target.value)}
									placeholder="e.g. 6th Grade"
									value={className}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="section">Section</Label>
								<Input
									id="section"
									onChange={(e) => setSection(e.target.value)}
									placeholder="e.g. A"
									value={section}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="roll">Roll Number</Label>
								<Input
									id="roll"
									onChange={(e) => setRollNumber(e.target.value)}
									placeholder="Roll number"
									value={rollNumber}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Gender</Label>
								<Select
									onValueChange={(v) =>
										setGender(v as "male" | "female" | "other")
									}
									value={gender ?? ""}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">Male</SelectItem>
										<SelectItem value="female">Female</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="emergency">Emergency Contact</Label>
							<Input
								id="emergency"
								onChange={(e) => setEmergencyContact(e.target.value)}
								placeholder="Emergency phone number"
								value={emergencyContact}
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
								{create.isPending ? "Adding..." : "Add Child"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
