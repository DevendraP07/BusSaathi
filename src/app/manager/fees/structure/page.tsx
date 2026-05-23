import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FeeStructureClient } from "./_client";
export const metadata = { title: "Fee Structure" };
export default function Page() {
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<FeeStructureClient />
		</DashboardLayout>
	);
}
