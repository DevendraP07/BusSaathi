import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PayFeeClient } from "./_client";

export const metadata = { title: "Pay Fee" };

export default async function PayFeePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<DashboardLayout expectedRole="parent">
			<PayFeeClient paymentId={id} />
		</DashboardLayout>
	);
}