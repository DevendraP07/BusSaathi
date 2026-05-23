"use client";

import {
	Bus,
	ClipboardList,
	Eye,
	EyeOff,
	Loader2,
	Shield,
	Truck,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const ROLES: {
	value: UserRole;
	label: string;
	desc: string;
	icon: React.ElementType;
}[] = [
	{
		value: "parent",
		label: "Parent / Student",
		desc: "Manage children, pay fees, track bus",
		icon: Users,
	},
	{
		value: "driver",
		label: "Bus Driver",
		desc: "Manage trips and attendance",
		icon: Truck,
	},
	{
		value: "manager",
		label: "Transport Manager",
		desc: "Manage routes, buses, and fees",
		icon: ClipboardList,
	},
	{
		value: "admin",
		label: "System Admin",
		desc: "Full platform access and control",
		icon: Shield,
	},
];

export default function RegisterPage() {
	const router = useRouter();
	const [role, setRole] = useState<UserRole>("parent");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const register = api.auth.register.useMutation({
		onSuccess: (data) => {
			toast.success("Account created successfully!");
			router.push(data.redirectTo);
		},
		onError: (err) => {
			// Parse Zod validation errors into clean messages
			try {
				const parsed = JSON.parse(err.message) as {
					message: string;
					path: string[];
				}[];
				if (Array.isArray(parsed) && parsed.length > 0) {
					const first = parsed[0];
					if (first) {
						const field = first.path?.[0] ?? "";
						const fieldLabel =
							field === "password"
								? "Password"
								: field === "email"
									? "Email"
									: field === "name"
										? "Name"
										: field;
						const msg = fieldLabel
							? `${fieldLabel}: ${first.message}`
							: first.message;
						toast.error(msg);
						return;
					}
				}
			} catch {
				// not JSON — show as-is
			}
			toast.error(err.message);
		},
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name || !email || !password) {
			toast.error("Please fill all required fields");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		if (password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}
		if (!/[A-Z]/.test(password)) {
			toast.error("Password must contain at least one uppercase letter");
			return;
		}
		if (!/[0-9]/.test(password)) {
			toast.error("Password must contain at least one number");
			return;
		}
		register.mutate({ name, email, password, role, phone: phone || undefined });
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-[oklch(0.97_0.003_240)] px-4 py-10">
			<div className="w-full max-w-lg">
				{/* Brand */}
				<div className="mb-8 flex flex-col items-center">
					<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.18_0.04_250)] shadow-lg">
						<Bus className="h-6 w-6 text-amber-400" />
					</div>
					<h1 className="font-black text-2xl text-[oklch(0.18_0.04_250)]">
						Bus<span className="text-amber-500">Saathi</span>
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Create your account
					</p>
				</div>

				<Card className="shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="text-xl">Register</CardTitle>
						<CardDescription>
							Choose your role and fill in your details
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-5" onSubmit={handleSubmit}>
							{/* Role Selector */}
							<div className="space-y-2">
								<Label>I am a...</Label>
								<div className="grid grid-cols-2 gap-2">
									{ROLES.map((r) => (
										<button
											className={cn(
												"flex items-start gap-2.5 rounded-xl border-2 p-3 text-left transition-all",
												role === r.value
													? "border-[oklch(0.18_0.04_250)] bg-[oklch(0.18_0.04_250/0.05)]"
													: "border-border hover:border-muted-foreground/40",
											)}
											key={r.value}
											onClick={() => setRole(r.value)}
											type="button"
										>
											<div
												className={cn(
													"mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
													role === r.value
														? "bg-amber-100 text-amber-600"
														: "bg-muted text-muted-foreground",
												)}
											>
												<r.icon className="h-3.5 w-3.5" />
											</div>
											<div className="min-w-0">
												<p
													className={cn(
														"font-semibold text-xs leading-tight",
														role === r.value
															? "text-[oklch(0.18_0.04_250)]"
															: "text-foreground",
													)}
												>
													{r.label}
												</p>
												<p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
													{r.desc}
												</p>
											</div>
										</button>
									))}
								</div>
							</div>

							{/* Fields */}
							<div className="grid grid-cols-2 gap-3">
								<div className="col-span-2 space-y-1.5">
									<Label htmlFor="name">
										Full Name <span className="text-destructive">*</span>
									</Label>
									<Input
										disabled={register.isPending}
										id="name"
										onChange={(e) => setName(e.target.value)}
										placeholder="Your full name"
										value={name}
									/>
								</div>
								<div className="col-span-2 space-y-1.5">
									<Label htmlFor="email">
										Email Address <span className="text-destructive">*</span>
									</Label>
									<Input
										disabled={register.isPending}
										id="email"
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										type="email"
										value={email}
									/>
								</div>
								<div className="col-span-2 space-y-1.5">
									<Label htmlFor="phone">Phone Number</Label>
									<Input
										disabled={register.isPending}
										id="phone"
										onChange={(e) => setPhone(e.target.value)}
										placeholder="10-digit mobile number"
										value={phone}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="password">
										Password <span className="text-destructive">*</span>
									</Label>
									<div className="relative">
										<Input
											className="pr-9"
											disabled={register.isPending}
											id="password"
											onChange={(e) => setPassword(e.target.value)}
											placeholder="Min. 8 characters"
											type={showPassword ? "text" : "password"}
											value={password}
										/>
										<button
											className="absolute top-2.5 right-3 text-muted-foreground"
											onClick={() => setShowPassword((v) => !v)}
											type="button"
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="confirmPassword">
										Confirm Password <span className="text-destructive">*</span>
									</Label>
									<Input
										disabled={register.isPending}
										id="confirmPassword"
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="Repeat password"
										type={showPassword ? "text" : "password"}
										value={confirmPassword}
									/>
								</div>
							</div>

							<Button
								className="w-full bg-[oklch(0.18_0.04_250)] font-semibold text-white hover:bg-[oklch(0.22_0.04_250)]"
								disabled={register.isPending}
								type="submit"
							>
								{register.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating account...
									</>
								) : (
									"Create Account"
								)}
							</Button>
						</form>
						<p className="mt-5 text-center text-muted-foreground text-sm">
							Already have an account?{" "}
							<Link
								className="font-semibold text-amber-600 hover:text-amber-700"
								href="/login"
							>
								Sign in
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
