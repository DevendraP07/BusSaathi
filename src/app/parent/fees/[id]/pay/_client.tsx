"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentGateway } from "@/components/shared/payment-gateway";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export function PayFeeClient({ paymentId }: { paymentId: string }) {
	const router = useRouter();
	const { data: payment, isLoading } = api.fee.getReceipt.useQuery({
		paymentId,
	});
	const utils = api.useUtils();

	const initiate = api.fee.initiatePayment.useMutation();
	const confirm = api.fee.confirmPayment.useMutation({
		onSuccess: (_data) => {
			toast.success("Payment successful!");
			void utils.fee.myPayments.invalidate();
			router.push(`/parent/fees/${paymentId}/receipt`);
		},
		onError: (e) => toast.error(e.message),
	});

	async function handleSuccess(method: string, txRef: string) {
		await initiate.mutateAsync({
			paymentId,
			paymentMethod: method as
				| "upi"
				| "credit_card"
				| "debit_card"
				| "wallet"
				| "cash",
		});
		confirm.mutate({ paymentId, transactionRef: txRef });
	}

	if (isLoading) return <Skeleton className="mx-auto h-96 max-w-md" />;
	if (!payment)
		return <p className="text-muted-foreground">Payment not found.</p>;
	if (payment.paymentStatus !== "pending") {
		router.push(`/parent/fees/${paymentId}/receipt`);
		return null;
	}

	return (
		<div className="mx-auto max-w-md space-y-6">
			<PageHeader
				description="Complete your transport fee payment securely"
				icon={CreditCard}
				title="Pay Fee"
			/>
			<PaymentGateway
				amount={payment.amount}
				description={`${payment.feeStructure.name} — ${payment.student.name}`}
				isLoading={confirm.isPending || initiate.isPending}
				onCancel={() => router.back()}
				onSuccess={handleSuccess}
			/>
		</div>
	);
}
