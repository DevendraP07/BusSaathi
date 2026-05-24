import { TRPCError } from "@trpc/server";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, adminProcedure, managerProcedure } from "@/server/api/trpc";
import { user, systemLog, notification, route, bus, issue } from "@/server/db/schema";
import { generateId } from "@/lib/id";
import type { UserRole } from "@/lib/permissions";

export const adminRouter = createTRPCRouter({
	// ── User Management ────────────────────────────

	// Manager + Admin: list users by role (for dropdowns in route/bus forms)
	listUsersByRole: managerProcedure
		.input(
			z.object({
				role: z.enum(["parent", "driver", "manager", "admin"]).optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.query.user.findMany({
				where: and(
					input.role ? eq(user.role, input.role) : undefined,
					input.isActive !== undefined
						? eq(user.isActive, input.isActive)
						: eq(user.isActive, true),
				),
				orderBy: (u, { asc }) => [asc(u.name)],
			});
		}),

	listUsers: adminProcedure
		.input(
			z.object({
				role: z.enum(["parent", "driver", "manager", "admin"]).optional(),
				isActive: z.boolean().optional(),
				search: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const users = await ctx.db.query.user.findMany({
				where: and(
					input.role ? eq(user.role, input.role) : undefined,
					input.isActive !== undefined
						? eq(user.isActive, input.isActive)
						: undefined,
				),
				orderBy: [desc(user.createdAt)],
			});
			if (input.search) {
				const q = input.search.toLowerCase();
				return users.filter(
					(u) =>
						u.name.toLowerCase().includes(q) ||
						u.email.toLowerCase().includes(q),
				);
			}
			return users;
		}),

	getUserById: adminProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const found = await ctx.db.query.user.findFirst({
				where: eq(user.id, input.userId),
				with: { students: true, driverProfile: true },
			});
			if (!found) {
				throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
			}
			return found;
		}),

	updateUserRole: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				role: z.enum(["parent", "driver", "manager", "admin"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.userId === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You cannot change your own role",
				});
			}
			const [updated] = await ctx.db
				.update(user)
				.set({ role: input.role, updatedAt: new Date() })
				.where(eq(user.id, input.userId))
				.returning();

			await ctx.db.insert(systemLog).values({
				id: generateId(),
				actorId: ctx.session.user.id,
				action: "UPDATE_ROLE",
				entity: "user",
				entityId: input.userId,
				metadata: JSON.stringify({ newRole: input.role }),
				createdAt: new Date(),
			});

			return updated;
		}),

	suspendUser: adminProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (input.userId === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You cannot suspend yourself",
				});
			}
			const [updated] = await ctx.db
				.update(user)
				.set({ isActive: false, updatedAt: new Date() })
				.where(eq(user.id, input.userId))
				.returning();

			await ctx.db.insert(systemLog).values({
				id: generateId(),
				actorId: ctx.session.user.id,
				action: "SUSPEND_USER",
				entity: "user",
				entityId: input.userId,
				createdAt: new Date(),
			});

			return updated;
		}),

	activateUser: adminProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [updated] = await ctx.db
				.update(user)
				.set({ isActive: true, updatedAt: new Date() })
				.where(eq(user.id, input.userId))
				.returning();
			return updated;
		}),

	deleteUser: adminProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (input.userId === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You cannot delete yourself",
				});
			}
			await ctx.db
				.update(user)
				.set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
				.where(eq(user.id, input.userId));

			await ctx.db.insert(systemLog).values({
				id: generateId(),
				actorId: ctx.session.user.id,
				action: "DELETE_USER",
				entity: "user",
				entityId: input.userId,
				createdAt: new Date(),
			});

			return { success: true };
		}),

	// ── System Logs ────────────────────────────────

	getLogs: adminProcedure
		.input(
			z.object({
				entity: z.string().optional(),
				actorId: z.string().optional(),
				limit: z.number().int().min(1).max(500).default(50),
			}),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.query.systemLog.findMany({
				where: and(
					input.entity ? eq(systemLog.entity, input.entity) : undefined,
					input.actorId ? eq(systemLog.actorId, input.actorId) : undefined,
				),
				with: { actor: true },
				orderBy: [desc(systemLog.createdAt)],
				limit: input.limit,
			});
		}),

	// ── Dashboard Stats ────────────────────────────

	dashboardStats: adminProcedure.query(async ({ ctx }) => {
		const [
			totalUsers,
			totalParents,
			totalDrivers,
			totalManagers,
		] = await Promise.all([
			ctx.db.query.user.findMany({ where: eq(user.isActive, true) }),
			ctx.db.query.user.findMany({ where: and(eq(user.role, "parent"), eq(user.isActive, true)) }),
			ctx.db.query.user.findMany({ where: and(eq(user.role, "driver"), eq(user.isActive, true)) }),
			ctx.db.query.user.findMany({ where: and(eq(user.role, "manager"), eq(user.isActive, true)) }),
		]);

		const routes = await ctx.db.query.route.findMany({
			where: eq(route.status, "active"),
		});
		const buses = await ctx.db.query.bus.findMany({
			where: eq(bus.status, "active"),
		});
		const openIssues = await ctx.db.query.issue.findMany({
			where: eq(issue.status, "open"),
		});

		return {
			totalUsers: totalUsers.length,
			totalParents: totalParents.length,
			totalDrivers: totalDrivers.length,
			totalManagers: totalManagers.length,
			activeRoutes: routes.length,
			activeBuses: buses.length,
			openIssues: openIssues.length,
		};
	}),

	// ── Broadcast notification ─────────────────────

	broadcastToRole: adminProcedure
		.input(
			z.object({
				role: z.enum(["parent", "driver", "manager", "admin"]),
				title: z.string().min(1),
				message: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const targetUsers = await ctx.db.query.user.findMany({
				where: and(
					eq(user.role, input.role as UserRole),
					eq(user.isActive, true),
				),
			});
			if (targetUsers.length === 0) {
				return { success: true, sentTo: 0 };
			}
			await ctx.db.insert(notification).values(
				targetUsers.map((u) => ({
					id: generateId(),
					userId: u.id,
					type: "system" as const,
					title: input.title,
					message: input.message,
					entityId: null,
					entityType: null,
					isRead: false,
					createdAt: new Date(),
				})),
			);
			return { success: true, sentTo: targetUsers.length };
		}),
});