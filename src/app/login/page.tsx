"use client";

import { Bus, Eye, EyeOff, Loader2 } from "lucide-react";
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
import { getDashboardRoute } from "@/lib/permissions";
import { authClient } from "@/server/better-auth/client";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!email || !password) {
			toast.error("Please fill all fields");
			return;
		}
		setIsLoading(true);
		try {
			const result = await authClient.signIn.email({ email, password });
			if (result.error) {
				toast.error(result.error.message ?? "Invalid credentials");
				return;
			}
			const role = ((result.data?.user as Record<string, unknown>)?.role ??
				"parent") as UserRole;
			toast.success("Welcome back!");
			router.push(getDashboardRoute(role));
		} catch {
			toast.error("Login failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-[oklch(0.97_0.003_240)] px-4">
			<div className="w-full max-w-sm">
				{/* Brand */}
				<div className="mb-8 flex flex-col items-center">
					<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.18_0.04_250)] shadow-lg">
						<Bus className="h-6 w-6 text-amber-400" />
					</div>
					<h1 className="font-black text-2xl text-[oklch(0.18_0.04_250)]">
						Bus<span className="text-amber-500">Saathi</span>
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						School Bus Management System
					</p>
				</div>

				<Card className="border shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="text-xl">Welcome back</CardTitle>
						<CardDescription>
							Sign in to your account to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="space-y-1.5">
								<Label htmlFor="email">Email Address</Label>
								<Input
									autoComplete="email"
									disabled={isLoading}
									id="email"
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									type="email"
									value={email}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Input
										autoComplete="current-password"
										className="pr-10"
										disabled={isLoading}
										id="password"
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Enter your password"
										type={showPassword ? "text" : "password"}
										value={password}
									/>
									<button
										className="absolute top-2.5 right-3 text-muted-foreground hover:text-foreground"
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
							<Button
								className="w-full bg-[oklch(0.18_0.04_250)] font-semibold text-white hover:bg-[oklch(0.22_0.04_250)]"
								disabled={isLoading}
								type="submit"
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Signing in...
									</>
								) : (
									"Sign In"
								)}
							</Button>
						</form>
						<p className="mt-5 text-center text-muted-foreground text-sm">
							Don&apos;t have an account?{" "}
							<Link
								className="font-semibold text-amber-600 hover:text-amber-700"
								href="/register"
							>
								Register here
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
