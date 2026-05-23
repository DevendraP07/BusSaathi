import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ParentNotificationsClient } from "./_client";
export const metadata = { title: "Notifications" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="parent">
			<ParentNotificationsClient />
		</DashboardLayout>
	);
}
