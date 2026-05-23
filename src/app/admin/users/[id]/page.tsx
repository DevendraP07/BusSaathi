import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UserDetailClient } from "./_client";
export const metadata = { title: "User Detail" };
export default function Page({ params }: { params: { id: string } }) {
	return (
		<DashboardLayout expectedRole="admin">
			<UserDetailClient userId={params.id} />
		</DashboardLayout>
	);
}
