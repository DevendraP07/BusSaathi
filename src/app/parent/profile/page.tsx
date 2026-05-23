import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProfileClient } from "./_client";
export const metadata = { title: "Profile" };
export default function Page() {
	return (
		<DashboardLayout expectedRole="parent">
			<ProfileClient />
		</DashboardLayout>
	);
}
