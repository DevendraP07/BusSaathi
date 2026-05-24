import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StudentDetailClient } from "./_client";

export const metadata = { title: "Student Detail" };

export default async function StudentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<StudentDetailClient studentId={id} />
		</DashboardLayout>
	);
}
