import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ParentFeesClient } from "./_client";
export const metadata = { title: "Fee Payments" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="parent">
			<ParentFeesClient />
		</DashboardLayout>
	);
}
