import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteDetailClient } from "./_client";

export const metadata = { title: "Route Detail" };

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<RouteDetailClient routeId={id} />
		</DashboardLayout>
	);
}