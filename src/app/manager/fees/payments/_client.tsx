"use client";

import { AlertCircle, CreditCard } from "lucide-react";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

type PaymentRow = {
	id: string;
	paymentRef: string;
	amount: string;
	paymentStatus: string;
	dueDate: Date;
	paidAt: Date | null;
	student: { name: string };
	parent: { name: string };
	feeStructure: { name: string; route: { name: string } | null };
};

export function PaymentsClient() {
	const { data: payments, isLoading } = api.fee.listPayments.useQuery({});
	const { data: defaulters } = api.fee.defaulters.useQuery();

	const confirmed =
		payments?.filter((p) => p.paymentStatus === "confirmed") ?? [];
	const totalCollected = confirmed.reduce((s, p) => s + Number(p.amount), 0);

	const columns: Column<PaymentRow>[] = [
		{
			key: "ref",
			header: "Ref",
			cell: (r) => <span className="font-mono text-xs">{r.paymentRef}</span>,
		},
		{
			key: "student",
			header: "Student",
			cell: (r) => (
				<div>
					<p className="font-medium text-sm">{r.student.name}</p>
					<p className="text-muted-foreground text-xs">{r.parent.name}</p>
				</div>
			),
		},
		{
			key: "fee",
			header: "Fee",
			cell: (r) => <span className="text-sm">{r.feeStructure.name}</span>,
		},
		{
			key: "amount",
			header: "Amount",
			cell: (r) => <span className="font-bold text-sm">₹{r.amount}</span>,
		},
		{
			key: "due",
			header: "Due Date",
			cell: (r) => <span className="text-sm">{formatDate(r.dueDate)}</span>,
		},
		{
			key: "paid",
			header: "Paid At",
			cell: (r) => (
				<span className="text-sm">{r.paidAt ? formatDate(r.paidAt) : "—"}</span>
			),
		},
		{
			key: "status",
			header: "Status",
			cell: (r) => <StatusBadge status={r.paymentStatus} />,
		},
	];

	return (
		<div className="space-y-6">
			<PageHeader
				description="All student payment records and defaulters"
				icon={CreditCard}
				title="Fee Payments"
			/>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<StatsCard
					accent="green"
					icon={CreditCard}
					title="Total Collected"
					value={`₹${totalCollected.toFixed(0)}`}
				/>
				<StatsCard
					accent="blue"
					icon={CreditCard}
					title="Confirmed Payments"
					value={confirmed.length}
				/>
				<StatsCard
					accent={defaulters?.length ? "red" : "green"}
					icon={AlertCircle}
					title="Defaulters"
					value={defaulters?.length ?? 0}
				/>
			</div>

			{defaulters && defaulters.length > 0 && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4">
					<p className="mb-2 font-semibold text-red-700 text-sm">
						⚠️ Overdue Payments ({defaulters.length})
					</p>
					<div className="space-y-1.5">
						{defaulters.slice(0, 5).map((d) => (
							<div
								className="flex items-center justify-between rounded-lg border border-red-200 bg-white px-3 py-2"
								key={d.id}
							>
								<div>
									<p className="font-medium text-sm">{d.student.name}</p>
									<p className="text-muted-foreground text-xs">
										{d.parent.name} · Due: {formatDate(d.dueDate)}
									</p>
								</div>
								<span className="font-bold text-red-600 text-sm">
									₹{d.amount}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			<DataTable
				columns={columns}
				data={(payments ?? []) as PaymentRow[]}
				emptyTitle="No payments found"
				isLoading={isLoading}
				searchKeys={["paymentRef"]}
				searchPlaceholder="Search payments..."
			/>
		</div>
	);
}
