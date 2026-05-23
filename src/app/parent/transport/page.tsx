import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TransportRequestClient } from "./_client";
export const metadata = { title: "Transport Registration" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="parent">
			<TransportRequestClient />
		</DashboardLayout>
	);
}
