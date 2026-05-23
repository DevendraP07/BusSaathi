import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AddStudentClient } from "./_client";
export const metadata = { title: "Add Child" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="parent">
			<AddStudentClient />
		</DashboardLayout>
	);
}
