import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReportIssueClient } from "./_client";
export const metadata = { title: "Report Issue" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="driver">
			<ReportIssueClient />
		</DashboardLayout>
	);
}
