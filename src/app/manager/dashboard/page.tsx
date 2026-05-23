import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ManagerClient } from "./_client";
export const metadata = { title: "Manager Dashboard" };
export default function Page() {
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<ManagerClient />
		</DashboardLayout>
	);
}
