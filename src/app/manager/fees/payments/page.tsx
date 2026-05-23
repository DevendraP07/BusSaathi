import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PaymentsClient } from "./_client";
export const metadata = { title: "Payments" };
export default function Page() {
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<PaymentsClient />
		</DashboardLayout>
	);
}
