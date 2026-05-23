import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ParentDashboardClient } from "./_client";

export const metadata = { title: "Parent Dashboard" };

export default function ParentDashboardPage() {
	return (
		<DashboardLayout expectedRole="parent">
			<ParentDashboardClient />
		</DashboardLayout>
	);
}
