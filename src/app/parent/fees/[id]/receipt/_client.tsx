"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ReceiptCard } from "@/components/shared/receipt-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export function ReceiptPageClient({ paymentId }: { paymentId: string }) {
	const { data: payment, isLoading } = api.fee.getReceipt.useQuery({
		paymentId,
	});

	if (isLoading) return <Skeleton className="mx-auto h-[500px] max-w-md" />;
	if (!payment?.receipt) {
		return (
			<div className="mx-auto max-w-md py-16 text-center">
				<p className="mb-4 text-muted-foreground">Receipt not available yet.</p>
				<Button asChild variant="outline">
					<Link href="/parent/fees">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Fees
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-md space-y-6">
			<PageHeader icon={FileText} title="Payment Receipt" />
			<ReceiptCard
				receiptData={payment.receipt.receiptData}
				receiptNumber={payment.receipt.receiptNumber}
			/>
			<div className="text-center">
				<Button asChild variant="outline">
					<Link href="/parent/fees">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Payments
					</Link>
				</Button>
			</div>
		</div>
	);
}
