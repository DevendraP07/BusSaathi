import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DriverProfileClient } from "./_client";
export const metadata = { title: "Driver Profile" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="driver">
			<DriverProfileClient />
		</DashboardLayout>
	);
}
