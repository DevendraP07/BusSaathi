"use client";

import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { parseReceiptData } from "@/lib/receipt";

interface ReceiptCardProps {
	receiptData: string;
	receiptNumber: string;
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-start justify-between gap-4 py-2">
			<span className="shrink-0 text-muted-foreground text-sm">{label}</span>
			<span className="text-right font-medium text-sm">{value}</span>
		</div>
	);
}

export function ReceiptCard({ receiptData, receiptNumber }: ReceiptCardProps) {
	const data = parseReceiptData(receiptData);

	function handleDownload() {
		if (!data) return;
		const content = [
			"=====================================",
			"       BUSSAATHI - PAYMENT RECEIPT   ",
			"=====================================",
			`Receipt No   : ${data.receiptNumber}`,
			`Payment Ref  : ${data.paymentRef}`,
			`Date         : ${data.paidAt}`,
			"-------------------------------------",
			`Student      : ${data.studentName}`,
			`Parent       : ${data.parentName}`,
			`Route        : ${data.routeName}`,
			`Fee Type     : ${data.feeType}`,
			`Period       : ${data.forPeriod}`,
			"-------------------------------------",
			`Amount       : ₹${data.amount}`,
			`Method       : ${data.paymentMethod.toUpperCase()}`,
			`Txn Ref      : ${data.transactionRef ?? "—"}`,
			"-------------------------------------",
			"Thank you for your payment!",
			"=====================================",
		].join("\n");

		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `receipt-${receiptNumber}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	if (!data) {
		return (
			<Card>
				<CardContent className="py-6 text-center text-muted-foreground text-sm">
					Receipt data unavailable
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mx-auto max-w-md border-2 border-green-200 shadow-lg">
			{/* Header */}
			<div className="rounded-t-xl bg-[oklch(0.18_0.04_250)] px-6 py-5 text-white">
				<div className="mb-3 flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 font-black text-[oklch(0.18_0.04_250)] text-sm">
						B
					</div>
					<span className="font-bold">BusSaathi</span>
				</div>
				<div className="flex items-center gap-2">
					<CheckCircle2 className="h-5 w-5 text-green-400" />
					<span className="font-semibold text-green-400">
						Payment Successful
					</span>
				</div>
				<p className="mt-2 font-black text-2xl text-amber-400">
					₹{data.amount}
				</p>
			</div>

			<CardContent className="px-6 pt-5 pb-6">
				<div className="mb-1 flex items-center justify-between">
					<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
						Receipt Details
					</span>
					<span className="rounded bg-amber-50 px-2 py-0.5 font-mono text-amber-700 text-xs">
						{data.receiptNumber}
					</span>
				</div>
				<Separator className="mb-3" />

				<Row label="Student" value={data.studentName} />
				<Row label="Parent" value={data.parentName} />
				<Row label="Route" value={data.routeName} />
				<Row label="Fee Type" value={data.feeType} />
				<Row label="Period" value={data.forPeriod} />
				<Separator className="my-2" />
				<Row
					label="Payment Method"
					value={data.paymentMethod.replace(/_/g, " ").toUpperCase()}
				/>
				<Row label="Transaction Ref" value={data.transactionRef ?? "—"} />
				<Row label="Payment Ref" value={data.paymentRef} />
				<Row label="Paid At" value={data.paidAt} />

				<Button
					className="mt-5 w-full gap-2 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
					onClick={handleDownload}
				>
					<Download className="h-4 w-4" />
					Download Receipt
				</Button>

				<p className="mt-3 text-center text-[10px] text-muted-foreground">
					Generated: {data.generatedAt}
				</p>
			</CardContent>
		</Card>
	);
}
