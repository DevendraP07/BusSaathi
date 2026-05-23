import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TrackBusClient } from "./_client";
export const metadata = { title: "Track Bus" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="parent">
			<TrackBusClient />
		</DashboardLayout>
	);
}
