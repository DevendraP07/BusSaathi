import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { UserRole } from "@/lib/permissions";
import { auth } from "@/server/better-auth";
import { db } from "@/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
	const session = await auth.api.getSession({ headers: opts.headers });
	return { db, session, ...opts };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now();
	if (t._config.isDev) {
		const waitMs = Math.floor(Math.random() * 400) + 100;
		await new Promise((resolve) => setTimeout(resolve, waitMs));
	}
	const result = await next();
	const end = Date.now();
	console.log(`[TRPC] ${path} took ${end - start}ms`);
	return result;
});

// ── Public ──────────────────────────────────
export const publicProcedure = t.procedure.use(timingMiddleware);

// ── Auth required ────────────────────────────
export const protectedProcedure = t.procedure
	.use(timingMiddleware)
	.use(({ ctx, next }) => {
		if (!ctx.session?.user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
		return next({
			ctx: { session: { ...ctx.session, user: ctx.session.user } },
		});
	});

// ── Role factory ─────────────────────────────
function roleGuard(...allowedRoles: UserRole[]) {
	return t.middleware(({ ctx, next }) => {
		if (!ctx.session?.user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
		const userRole = (ctx.session.user as { role?: string }).role as UserRole;
		if (!allowedRoles.includes(userRole)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
			});
		}
		return next({
			ctx: { session: { ...ctx.session, user: ctx.session.user } },
		});
	});
}

export const parentProcedure = t.procedure
	.use(timingMiddleware)
	.use(roleGuard("parent"));

export const driverProcedure = t.procedure
	.use(timingMiddleware)
	.use(roleGuard("driver"));

export const managerProcedure = t.procedure
	.use(timingMiddleware)
	.use(roleGuard("manager", "admin"));

export const adminProcedure = t.procedure
	.use(timingMiddleware)
	.use(roleGuard("admin"));
