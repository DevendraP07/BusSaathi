import {
	BarChart3,
	Bell,
	Bus,
	CreditCard,
	MapPin,
	Route,
	Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
	{ label: "Features", href: "#features" },
	{ label: "How It Works", href: "#how" },
	{ label: "For Schools", href: "#schools" },
];

const STATS = [
	{ value: "500+", label: "Schools Onboarded" },
	{ value: "50,000+", label: "Students Managed" },
	{ value: "₹2Cr+", label: "Fees Collected" },
	{ value: "99.9%", label: "Uptime" },
];

const FEATURES = [
	{
		icon: Route,
		title: "Smart Route Management",
		desc: "Create and manage routes, stops, and schedules. Assign drivers and buses in seconds.",
		tag: "Manager",
	},
	{
		icon: CreditCard,
		title: "Automated Fee Collection",
		desc: "Generate fee records, track payments, identify defaulters, and send reminders automatically.",
		tag: "Finance",
	},
	{
		icon: MapPin,
		title: "Real-Time Bus Tracking",
		desc: "Parents track bus location live with estimated arrival time at their child's stop.",
		tag: "Safety",
	},
	{
		icon: Bell,
		title: "Smart Notifications",
		desc: "Instant alerts for bus arrival, delays, fee dues, and payment confirmations.",
		tag: "Alerts",
	},
	{
		icon: Users,
		title: "Multi-Role Access",
		desc: "Separate secure portals for parents, drivers, transport managers, and admins.",
		tag: "Roles",
	},
	{
		icon: BarChart3,
		title: "Reports & Analytics",
		desc: "Detailed reports on fee collection, route utilization, and trip performance.",
		tag: "Admin",
	},
];

const HOW_STEPS = [
	{
		num: "01",
		icon: "🏫",
		title: "School Registers",
		desc: "Admin sets up routes, buses, and fee structures on the platform.",
	},
	{
		num: "02",
		icon: "👨‍👩‍👧",
		title: "Parents Enroll",
		desc: "Parents add children, apply for transport, and get allocated to routes.",
	},
	{
		num: "03",
		icon: "🚌",
		title: "Driver Executes Trip",
		desc: "Driver starts trip, marks attendance, and updates real-time location.",
	},
	{
		num: "04",
		icon: "💳",
		title: "Fees Paid Online",
		desc: "Parents pay fees securely via UPI, card, or wallet and download receipts.",
	},
];

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-[oklch(0.97_0.003_240)] font-sans">
			{/* NAV */}
			<nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-xl">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<Link className="flex items-center gap-2.5" href="/">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.18_0.04_250)] shadow-md">
							<Bus className="h-5 w-5 text-amber-400" />
						</div>
						<span className="font-black text-[oklch(0.18_0.04_250)] text-xl tracking-tight">
							Bus<span className="text-amber-500">Saathi</span>
						</span>
					</Link>
					<ul className="hidden items-center gap-8 md:flex">
						{NAV_LINKS.map((l) => (
							<li key={l.label}>
								<a
									className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
									href={l.href}
								>
									{l.label}
								</a>
							</li>
						))}
					</ul>
					<div className="flex items-center gap-2">
						<Button asChild size="sm" variant="outline">
							<Link href="/login">Log in</Link>
						</Button>
						<Button
							asChild
							className="bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
							size="sm"
						>
							<Link href="/register">Get Started</Link>
						</Button>
					</div>
				</div>
			</nav>

			{/* HERO */}
			<section className="relative overflow-hidden py-20 md:py-32">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.75_0.17_72/0.08),transparent_60%)]" />
				<div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-[oklch(0.18_0.04_250/0.04)] blur-[80px]" />
				<div className="relative mx-auto max-w-7xl px-6">
					<div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
						<div className="max-w-xl">
							<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 font-semibold text-amber-700 text-xs">
								<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
								Trusted by 500+ schools across India
							</div>
							<h1 className="mb-6 font-black text-5xl text-[oklch(0.18_0.04_250)] leading-[1.05] tracking-tight md:text-6xl">
								School Bus Management,
								<br />
								<span className="text-amber-500">Made Simple.</span>
							</h1>
							<p className="mb-8 text-lg text-muted-foreground leading-relaxed">
								BusSaathi handles routes, fees, tracking, and notifications for
								your entire school transport system — in one secure platform.
							</p>
							<div className="flex flex-wrap gap-3">
								<Button
									asChild
									className="bg-[oklch(0.18_0.04_250)] px-8 font-semibold text-white hover:bg-[oklch(0.22_0.04_250)]"
									size="lg"
								>
									<Link href="/register">Start Free Today</Link>
								</Button>
								<Button asChild className="px-8" size="lg" variant="outline">
									<a href="#how">See How It Works →</a>
								</Button>
							</div>
							<div className="mt-8 flex flex-wrap gap-5 text-muted-foreground text-sm">
								{["No setup fees", "Role-based access", "Instant receipts"].map(
									(t) => (
										<span className="flex items-center gap-1.5" key={t}>
											<span className="font-bold text-amber-500">✓</span>
											{t}
										</span>
									),
								)}
							</div>
						</div>

						{/* App preview */}
						<div className="relative">
							<div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
								<div className="flex items-center gap-2 border-b bg-[oklch(0.18_0.04_250)] px-4 py-3">
									<span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
									<span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
									<span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
									<span className="ml-3 text-[11px] text-white/40">
										bussaathi.app/manager/dashboard
									</span>
								</div>
								<div className="p-5">
									<p className="mb-4 font-bold text-sm">
										Good morning, Transport Manager 👋
									</p>
									<div className="mb-4 grid grid-cols-3 gap-2.5">
										{[
											{
												label: "Active Routes",
												value: "12",
												color: "text-amber-600",
												bg: "bg-amber-50 border-amber-200",
											},
											{
												label: "Today's Trips",
												value: "8",
												color: "text-blue-600",
												bg: "bg-blue-50 border-blue-200",
											},
											{
												label: "Fees Collected",
												value: "₹42K",
												color: "text-green-600",
												bg: "bg-green-50 border-green-200",
											},
										].map((s) => (
											<div
												className={`rounded-xl border p-3 ${s.bg}`}
												key={s.label}
											>
												<p className="text-[10px] text-muted-foreground">
													{s.label}
												</p>
												<p className={`mt-0.5 font-black text-xl ${s.color}`}>
													{s.value}
												</p>
											</div>
										))}
									</div>
									<p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										Live Trips
									</p>
									{[
										{
											route: "Route A — Velachery",
											driver: "Ravi Kumar",
											status: "On Route",
											students: 32,
										},
										{
											route: "Route B — Tambaram",
											driver: "Suresh M",
											status: "Completed",
											students: 28,
										},
										{
											route: "Route C — Anna Nagar",
											driver: "Muthu R",
											status: "Scheduled",
											students: 24,
										},
									].map((t) => (
										<div
											className="mb-1.5 flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
											key={t.route}
										>
											<div>
												<p className="font-semibold text-xs">{t.route}</p>
												<p className="text-[10px] text-muted-foreground">
													{t.driver} · {t.students} students
												</p>
											</div>
											<span
												className={`rounded-full px-2 py-0.5 font-semibold text-[10px] ${
													t.status === "On Route"
														? "bg-green-100 text-green-700"
														: t.status === "Completed"
															? "bg-gray-100 text-gray-600"
															: "bg-blue-100 text-blue-700"
												}`}
											>
												{t.status}
											</span>
										</div>
									))}
								</div>
							</div>
							{/* Floating badge */}
							<div className="absolute top-10 -right-3 w-48 rounded-xl border bg-white p-3 shadow-lg">
								<div className="flex items-center gap-2">
									<div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 font-bold text-green-600 text-xs">
										✓
									</div>
									<div>
										<p className="font-semibold text-xs">Fee Received!</p>
										<p className="text-[10px] text-muted-foreground">
											₹3,600 · Arjun P.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* STATS */}
			<div className="border-y bg-[oklch(0.18_0.04_250)]">
				<div className="mx-auto max-w-7xl px-6 py-10">
					<div className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
						{STATS.map((s) => (
							<div key={s.label}>
								<p className="font-black text-3xl text-amber-400">{s.value}</p>
								<p className="mt-1 text-sm text-white/50">{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* FEATURES */}
			<section className="py-24" id="features">
				<div className="mx-auto max-w-7xl px-6">
					<div className="mb-14 text-center">
						<p className="mb-3 font-semibold text-amber-600 text-xs uppercase tracking-[0.2em]">
							Features
						</p>
						<h2 className="font-black text-4xl text-[oklch(0.18_0.04_250)] md:text-5xl">
							Everything your school needs
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{FEATURES.map((f) => (
							<div
								className="group rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
								key={f.title}
							>
								<div className="mb-4 flex items-start justify-between">
									<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
										<f.icon className="h-5 w-5" />
									</div>
									<span className="rounded-full bg-[oklch(0.18_0.04_250/0.07)] px-2 py-0.5 font-semibold text-[11px] text-[oklch(0.18_0.04_250)]">
										{f.tag}
									</span>
								</div>
								<h3 className="mb-2 font-bold text-[oklch(0.18_0.04_250)] text-base">
									{f.title}
								</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{f.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* HOW IT WORKS */}
			<section className="bg-white py-24" id="how">
				<div className="mx-auto max-w-7xl px-6">
					<div className="mb-14 text-center">
						<p className="mb-3 font-semibold text-amber-600 text-xs uppercase tracking-[0.2em]">
							How It Works
						</p>
						<h2 className="font-black text-4xl text-[oklch(0.18_0.04_250)] md:text-5xl">
							Up and running in minutes
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-4">
						{HOW_STEPS.map((s, i) => (
							<div
								className="flex flex-col items-center text-center"
								key={s.num}
							>
								<div className="relative mb-5">
									<div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-100 bg-amber-50 text-4xl">
										{s.icon}
									</div>
									<span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.18_0.04_250)] font-black text-[10px] text-white">
										{i + 1}
									</span>
								</div>
								<p className="mb-1 font-bold text-[oklch(0.18_0.04_250)] text-sm">
									{s.title}
								</p>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{s.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="bg-[oklch(0.18_0.04_250)] py-28">
				<div className="mx-auto max-w-2xl px-6 text-center">
					<h2 className="mb-6 font-black text-4xl text-white md:text-5xl">
						Ready to transform school transport?
					</h2>
					<p className="mb-10 text-lg text-white/50">
						Join hundreds of schools already using BusSaathi to manage routes,
						fees, and safety.
					</p>
					<div className="flex flex-wrap justify-center gap-3">
						<Button
							asChild
							className="bg-amber-400 px-10 font-bold text-[oklch(0.18_0.04_250)] hover:bg-amber-500"
							size="lg"
						>
							<Link href="/register">Get Started Free</Link>
						</Button>
						<Button
							asChild
							className="border-white/20 bg-transparent px-10 text-white hover:bg-white/10"
							size="lg"
							variant="outline"
						>
							<Link href="/login">Sign In</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="border-t bg-white px-6 py-8">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.18_0.04_250)]">
							<Bus className="h-4 w-4 text-amber-400" />
						</div>
						<span className="font-black text-[oklch(0.18_0.04_250)]">
							Bus<span className="text-amber-500">Saathi</span>
						</span>
					</div>
					<p className="text-muted-foreground text-sm">
						© 2026 BusSaathi. All rights reserved.
					</p>
					<div className="flex gap-5">
						{["Privacy", "Terms", "Support"].map((l) => (
							<a
								className="text-muted-foreground text-sm transition-colors hover:text-foreground"
								href="/"
								key={l}
							>
								{l}
							</a>
						))}
					</div>
				</div>
			</footer>
		</div>
	);
}
