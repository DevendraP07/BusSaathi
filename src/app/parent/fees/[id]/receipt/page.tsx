import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReceiptPageClient } from "./_client";

export const metadata = { title: "Payment Receipt" };

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<DashboardLayout expectedRole="parent">
			<ReceiptPageClient paymentId={id} />
		</DashboardLayout>
	);
}