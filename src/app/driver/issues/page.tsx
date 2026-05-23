import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DriverIssuesClient } from "./_client";
export const metadata = { title: "Issues" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="driver">
			<DriverIssuesClient />
		</DashboardLayout>
	);
}
