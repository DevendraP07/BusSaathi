import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DriverTripClient } from "./_client";
export const metadata = { title: "Today's Trip" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="driver">
			<DriverTripClient />
		</DashboardLayout>
	);
}
