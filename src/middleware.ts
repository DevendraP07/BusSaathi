import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";

// Routes that don't need authentication
const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth"];

// Role → allowed path prefixes
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
	parent: ["/parent"],
	driver: ["/driver"],
	manager: ["/manager"],
	admin: ["/admin", "/manager"], // admin can also see manager pages
};

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Allow public paths and static assets
	if (
		PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/favicon")
	) {
		return NextResponse.next();
	}

	// Allow tRPC API
	if (pathname.startsWith("/api/trpc")) {
		return NextResponse.next();
	}

	// Get session
	const session = await auth.api.getSession({ headers: req.headers });

	// Not authenticated → redirect to login
	if (!session?.user) {
		const loginUrl = new URL("/login", req.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	const role = (session.user as { role?: string }).role ?? "parent";
	const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role] ?? [];

	// Check if user is accessing a role-specific path they're not allowed to
	const isDashboardPath =
		pathname.startsWith("/parent") ||
		pathname.startsWith("/driver") ||
		pathname.startsWith("/manager") ||
		pathname.startsWith("/admin");

	if (isDashboardPath) {
		const isAllowed = allowedPrefixes.some((prefix) =>
			pathname.startsWith(prefix),
		);
		if (!isAllowed) {
			// Redirect to their own dashboard
			const dashboardMap: Record<string, string> = {
				parent: "/parent/dashboard",
				driver: "/driver/dashboard",
				manager: "/manager/dashboard",
				admin: "/admin/dashboard",
			};
			return NextResponse.redirect(new URL(dashboardMap[role] ?? "/", req.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
