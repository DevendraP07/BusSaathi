import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BusDetailClient } from "./_client";

export const metadata = { title: "Bus Detail" };

export default async function BusDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return (
		<DashboardLayout expectedRole={["manager", "admin"]}>
			<BusDetailClient busId={id} />
		</DashboardLayout>
	);
}
