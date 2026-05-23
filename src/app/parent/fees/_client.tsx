"use client";

import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";
import Link from "next/link";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { daysUntilDue, formatDate, isOverdue } from "@/lib/date";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

type Payment = {
	id: string;
	paymentRef: string;
	amount: string;
	paymentStatus: string;
	dueDate: Date;
	paidAt: Date | null;
	forMonth: string | null;
	forTerm: string | null;
	student: { name: string };
	feeStructure: {
		name: string;
		feeType: string;
		route: { name: string } | null;
	};
	receipt: { receiptNumber: string } | null;
};

export function ParentFeesClient() {
	const { data: payments, isLoading } = api.fee.myPayments.useQuery({});

	const confirmed =
		payments?.filter((p) => p.paymentStatus === "confirmed") ?? [];
	const pending = payments?.filter((p) => p.paymentStatus === "pending") ?? [];
	const totalPaid = confirmed.reduce((s, p) => s + Number(p.amount), 0);
	const totalDue = pending.reduce((s, p) => s + Number(p.amount), 0);

	const columns: Column<Payment>[] = [
		{
			key: "student",
			header: "Student",
			cell: (r) => <span className="font-medium">{r.student.name}</span>,
		},
		{
			key: "fee",
			header: "Fee",
			cell: (r) => (
				<div>
					<p className="font-medium text-sm">{r.feeStructure.name}</p>
					<p className="text-muted-foreground text-xs">
						{r.feeStructure.route?.name ?? "General"}
					</p>
				</div>
			),
		},
		{
			key: "period",
			header: "Period",
			cell: (r) => (
				<span className="text-sm">{r.forMonth ?? r.forTerm ?? "—"}</span>
			),
		},
		{
			key: "due",
			header: "Due Date",
			cell: (r) => {
				const overdue = r.paymentStatus === "pending" && isOverdue(r.dueDate);
				return (
					<span
						className={cn("text-sm", overdue && "font-semibold text-red-600")}
					>
						{formatDate(r.dueDate)}
					</span>
				);
			},
		},
		{
			key: "amount",
			header: "Amount",
			cell: (r) => <span className="font-semibold">₹{r.amount}</span>,
		},
		{
			key: "status",
			header: "Status",
			cell: (r) => <StatusBadge status={r.paymentStatus} />,
		},
		{
			key: "actions",
			header: "",
			cell: (r) =>
				r.paymentStatus === "pending" ? (
					<Button
						asChild
						className="h-7 bg-amber-500 text-white text-xs hover:bg-amber-600"
						size="sm"
					>
						<Link href={`/parent/fees/${r.id}/pay`}>Pay Now</Link>
					</Button>
				) : r.receipt ? (
					<Button asChild className="h-7 text-xs" size="sm" variant="outline">
						<Link href={`/parent/fees/${r.id}/receipt`}>Receipt</Link>
					</Button>
				) : null,
		},
	];

	return (
		<div className="space-y-6">
			<PageHeader
				description="View and pay transport fees for your children"
				icon={CreditCard}
				title="Fee Payments"
			/>

			{isLoading ? (
				<div className="grid grid-cols-3 gap-4">
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<StatsCard
						accent="green"
						icon={CheckCircle2}
						title="Total Paid"
						value={`₹${totalPaid.toFixed(2)}`}
					/>
					<StatsCard
						accent={totalDue > 0 ? "red" : "green"}
						icon={AlertCircle}
						title="Pending Dues"
						value={`₹${totalDue.toFixed(2)}`}
					/>
					<StatsCard
						accent="blue"
						icon={CreditCard}
						title="Payments Made"
						value={confirmed.length}
					/>
				</div>
			)}

			{pending.length > 0 && (
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
					<p className="mb-2 font-semibold text-amber-800 text-sm">
						⚠️ Pending Payments
					</p>
					<div className="space-y-2">
						{pending.map((p) => {
							const days = daysUntilDue(p.dueDate);
							return (
								<div
									className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2.5"
									key={p.id}
								>
									<div>
										<p className="font-medium text-sm">
											{p.student.name} — {p.feeStructure.name}
										</p>
										<p
											className={cn(
												"text-xs",
												days < 0
													? "font-semibold text-red-600"
													: "text-muted-foreground",
											)}
										>
											{days < 0
												? `Overdue by ${Math.abs(days)} days`
												: days === 0
													? "Due today"
													: `Due in ${days} days`}{" "}
											· {formatDate(p.dueDate)}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<span className="font-bold text-sm">₹{p.amount}</span>
										<Button
											asChild
											className="h-7 bg-amber-500 text-white text-xs hover:bg-amber-600"
											size="sm"
										>
											<Link href={`/parent/fees/${p.id}/pay`}>Pay</Link>
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{isLoading ? (
				<Skeleton className="h-64" />
			) : (
				<DataTable
					columns={columns}
					data={(payments ?? []) as Payment[]}
					emptyDescription="Your fee payment history will appear here"
					emptyTitle="No payment records found"
					searchKeys={["paymentRef"]}
					searchPlaceholder="Search payments..."
				/>
			)}
		</div>
	);
}
