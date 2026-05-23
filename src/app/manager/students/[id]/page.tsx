import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StudentDetailClient } from "./_client";

export const metadata = { title: "Student Detail" };

export default function StudentDetailPage({
	params,
}: {
	params: { id: string };
}) {
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<StudentDetailClient studentId={params.id} />
		</DashboardLayout>
	);
}
