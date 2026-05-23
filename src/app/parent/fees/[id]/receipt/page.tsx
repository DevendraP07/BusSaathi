import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReceiptPageClient } from "./_client";

export const metadata = { title: "Payment Receipt" };

export default function ReceiptPage({ params }: { params: { id: string } }) {
	return (
		<DashboardLayout expectedRole="parent">
			<ReceiptPageClient paymentId={params.id} />
		</DashboardLayout>
	);
}
