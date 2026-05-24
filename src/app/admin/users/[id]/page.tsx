import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UserDetailClient } from "./_client";

export const metadata = { title: "User Detail" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <DashboardLayout expectedRole="admin"><UserDetailClient userId={id} /></DashboardLayout>;
}