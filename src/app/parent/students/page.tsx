import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ParentStudentsClient } from "./_client";
export const metadata = { title: "My Children" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="parent">
			<ParentStudentsClient />
		</DashboardLayout>
	);
}
