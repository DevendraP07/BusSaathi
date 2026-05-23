import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/permissions";
import { getSession } from "@/server/better-auth/server";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

const NOTIF_HREF: Record<UserRole, string> = {
	parent: "/parent/notifications",
	driver: "/driver/dashboard",
	manager: "/manager/notifications",
	admin: "/admin/notifications",
};

interface DashboardLayoutProps {
	children: React.ReactNode;
	expectedRole?: UserRole | UserRole[];
}

export async function DashboardLayout({
	children,
	expectedRole,
}: DashboardLayoutProps) {
	const session = await getSession();
	if (!session?.user) redirect("/login");

	const role = ((session.user as Record<string, unknown>).role ??
		"parent") as UserRole;
	const allowedRoles = expectedRole
		? Array.isArray(expectedRole)
			? expectedRole
			: [expectedRole]
		: (["parent", "driver", "manager", "admin"] as UserRole[]);

	if (!allowedRoles.includes(role)) {
		const map: Record<UserRole, string> = {
			parent: "/parent/dashboard",
			driver: "/driver/dashboard",
			manager: "/manager/dashboard",
			admin: "/admin/dashboard",
		};
		redirect(map[role] ?? "/");
	}

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			<div className="hidden md:flex md:shrink-0">
				<Sidebar
					role={role}
					userEmail={session.user.email}
					userName={session.user.name}
				/>
			</div>
			<div className="flex flex-1 flex-col overflow-hidden">
				<Navbar notifHref={NOTIF_HREF[role]} />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
