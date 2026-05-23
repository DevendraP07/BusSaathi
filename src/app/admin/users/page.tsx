import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminClient } from "./_client";
export const metadata = { title: "Users" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="admin">
			<AdminClient />
		</DashboardLayout>
	);
}
