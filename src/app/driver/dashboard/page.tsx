import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DriverDashboardClient } from "./_client";
export const metadata = { title: "Driver Dashboard" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="driver">
			<DriverDashboardClient />
		</DashboardLayout>
	);
}
