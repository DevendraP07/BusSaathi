import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DriverRouteClient } from "./_client";
export const metadata = { title: "My Route" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="driver">
			<DriverRouteClient />
		</DashboardLayout>
	);
}
