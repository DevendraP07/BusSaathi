import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NewBusClient } from "./_client";
export const metadata = { title: "Add Bus" };
export default function Page() {
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<NewBusClient />
		</DashboardLayout>
	);
}
