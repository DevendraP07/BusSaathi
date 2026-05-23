import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NewRouteClient } from "./_client";
export const metadata = { title: "New Route" };
export default function Page() {
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<NewRouteClient />
		</DashboardLayout>
	);
}
