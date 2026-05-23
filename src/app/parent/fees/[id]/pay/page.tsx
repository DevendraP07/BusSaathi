import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PayFeeClient } from "./_client";

export const metadata = { title: "Pay Fee" };

export default function PayFeePage({ params }: { params: { id: string } }) {
	return (
		<DashboardLayout expectedRole="parent">
			<PayFeeClient paymentId={params.id} />
		</DashboardLayout>
	);
}
