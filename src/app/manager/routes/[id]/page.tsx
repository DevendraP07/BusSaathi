import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RouteDetailClient } from "./_client";

export const metadata = { title: "Route Detail" };

export default function RouteDetailPage({
	params,
}: {
	params: { id: string };
}) {
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<RouteDetailClient routeId={params.id} />
		</DashboardLayout>
	);
}
