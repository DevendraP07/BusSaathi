import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminClient } from "./_client";
export const metadata = { title: "Notifications" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="admin">
			<AdminClient />
		</DashboardLayout>
	);
}
