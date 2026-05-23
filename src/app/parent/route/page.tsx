import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ParentRouteClient } from "./_client";
export const metadata = { title: "Route & Schedule" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="parent">
			<ParentRouteClient />
		</DashboardLayout>
	);
}
