export type UserRole = "parent" | "driver" | "manager" | "admin";

export const ROLE_ROUTES: Record<UserRole, string> = {
	parent: "/parent/dashboard",
	driver: "/driver/dashboard",
	manager: "/manager/dashboard",
	admin: "/admin/dashboard",
};

export function getDashboardRoute(role: UserRole): string {
	return ROLE_ROUTES[role] ?? "/";
}

export function canManageRoutes(role: UserRole): boolean {
	return role === "manager" || role === "admin";
}

export function canManageFees(role: UserRole): boolean {
	return role === "manager" || role === "admin";
}

export function canManageUsers(role: UserRole): boolean {
	return role === "admin";
}

export function canViewReports(role: UserRole): boolean {
	return role === "manager" || role === "admin";
}

export function canExecuteTrip(role: UserRole): boolean {
	return role === "driver";
}

export function canPayFees(role: UserRole): boolean {
	return role === "parent";
}

export function isAdminOrManager(role: UserRole): boolean {
	return role === "admin" || role === "manager";
}
