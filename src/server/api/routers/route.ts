import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "@/lib/id";
import {
	createTRPCRouter,
	driverProcedure,
	managerProcedure,
	parentProcedure,
	protectedProcedure,
} from "@/server/api/trpc";
import { route, routeStop } from "@/server/db/schema";

export const routeRouter = createTRPCRouter({
	// All authenticated users can list active routes
	listActive: protectedProcedure
		.input(
			z.object({
				search: z.string().optional(),
				routeType: z.enum(["morning", "evening", "full_day"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const routes = await ctx.db.query.route.findMany({
				where: and(eq(route.status, "active"), isNull(route.deletedAt)),
				with: {
					stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
					bus: true,
					driver: true,
				},
				orderBy: (r, { asc }) => [asc(r.name)],
			});
			let result = routes;
			if (input.routeType) {
				result = result.filter((r) => r.routeType === input.routeType);
			}
			if (input.search) {
				const q = input.search.toLowerCase();
				result = result.filter(
					(r) =>
						r.name.toLowerCase().includes(q) ||
						r.routeCode.toLowerCase().includes(q) ||
						r.startLocation.toLowerCase().includes(q),
				);
			}
			return result;
		}),

	// Manager: list all routes
	listAll: managerProcedure
		.input(
			z.object({
				status: z.enum(["active", "inactive", "suspended"]).optional(),
				routeType: z.enum(["morning", "evening", "full_day"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const routes = await ctx.db.query.route.findMany({
				where: and(
					isNull(route.deletedAt),
					input.status ? eq(route.status, input.status) : undefined,
					input.routeType ? eq(route.routeType, input.routeType) : undefined,
				),
				with: {
					stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
					bus: true,
					driver: true,
					allocations: { with: { student: true } },
				},
				orderBy: (r, { asc }) => [asc(r.name)],
			});
			return routes;
		}),

	getById: protectedProcedure
		.input(z.object({ routeId: z.string() }))
		.query(async ({ ctx, input }) => {
			const found = await ctx.db.query.route.findFirst({
				where: and(eq(route.id, input.routeId), isNull(route.deletedAt)),
				with: {
					stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
					bus: true,
					driver: true,
					allocations: { with: { student: { with: { parent: true } } } },
					feeStructures: true,
				},
			});
			if (!found) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Route not found" });
			}
			return found;
		}),

	create: managerProcedure
		.input(
			z.object({
				name: z.string().min(2, "Route name required"),
				routeCode: z.string().min(2, "Route code required"),
				routeType: z.enum(["morning", "evening", "full_day"]),
				busId: z.string().optional(),
				driverId: z.string().optional(),
				startLocation: z.string().min(2, "Start location required"),
				endLocation: z.string().min(2, "End location required"),
				departureTime: z.string().min(1, "Departure time required"),
				estimatedArrival: z.string().optional(),
				totalDistance: z.string().optional(),
				description: z.string().optional(),
				stops: z
					.array(
						z.object({
							stopName: z.string().min(1, "Stop name required"),
							stopOrder: z.number().int().min(1),
							landmark: z.string().optional(),
							pickupTime: z.string().optional(),
							dropTime: z.string().optional(),
							latitude: z.string().optional(),
							longitude: z.string().optional(),
						}),
					)
					.optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.route.findFirst({
				where: eq(route.routeCode, input.routeCode),
			});
			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Route code already exists",
				});
			}

			const routeId = generateId();
			const { stops, ...routeData } = input;

			await ctx.db.insert(route).values({
				id: routeId,
				...routeData,
				status: "active",
				createdBy: ctx.session.user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			if (stops && stops.length > 0) {
				await ctx.db.insert(routeStop).values(
					stops.map((stop) => ({
						id: generateId(),
						routeId,
						...stop,
						createdAt: new Date(),
						updatedAt: new Date(),
					})),
				);
			}

			const created = await ctx.db.query.route.findFirst({
				where: eq(route.id, routeId),
				with: {
					stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
					bus: true,
					driver: true,
				},
			});
			return created;
		}),

	update: managerProcedure
		.input(
			z.object({
				routeId: z.string(),
				name: z.string().min(2).optional(),
				routeType: z.enum(["morning", "evening", "full_day"]).optional(),
				status: z.enum(["active", "inactive", "suspended"]).optional(),
				busId: z.string().nullable().optional(),
				driverId: z.string().nullable().optional(),
				startLocation: z.string().optional(),
				endLocation: z.string().optional(),
				departureTime: z.string().optional(),
				estimatedArrival: z.string().optional(),
				totalDistance: z.string().optional(),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { routeId, ...data } = input;
			const existing = await ctx.db.query.route.findFirst({
				where: and(eq(route.id, routeId), isNull(route.deletedAt)),
			});
			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Route not found" });
			}
			const [updated] = await ctx.db
				.update(route)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(route.id, routeId))
				.returning();
			return updated;
		}),

	remove: managerProcedure
		.input(z.object({ routeId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(route)
				.set({
					deletedAt: new Date(),
					status: "inactive",
					updatedAt: new Date(),
				})
				.where(eq(route.id, input.routeId));
			return { success: true };
		}),

	// Stop management
	addStop: managerProcedure
		.input(
			z.object({
				routeId: z.string(),
				stopName: z.string().min(1),
				stopOrder: z.number().int().min(1),
				landmark: z.string().optional(),
				pickupTime: z.string().optional(),
				dropTime: z.string().optional(),
				latitude: z.string().optional(),
				longitude: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { routeId, ...stopData } = input;
			const [created] = await ctx.db
				.insert(routeStop)
				.values({
					id: generateId(),
					routeId,
					...stopData,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			return created;
		}),

	updateStop: managerProcedure
		.input(
			z.object({
				stopId: z.string(),
				stopName: z.string().optional(),
				stopOrder: z.number().int().optional(),
				landmark: z.string().optional(),
				pickupTime: z.string().optional(),
				dropTime: z.string().optional(),
				latitude: z.string().optional(),
				longitude: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { stopId, ...data } = input;
			const [updated] = await ctx.db
				.update(routeStop)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(routeStop.id, stopId))
				.returning();
			return updated;
		}),

	removeStop: managerProcedure
		.input(z.object({ stopId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(routeStop).where(eq(routeStop.id, input.stopId));
			return { success: true };
		}),

	// Driver: my assigned route
	myRoute: driverProcedure.query(async ({ ctx }) => {
		const found = await ctx.db.query.route.findFirst({
			where: and(
				eq(route.driverId, ctx.session.user.id),
				eq(route.status, "active"),
				isNull(route.deletedAt),
			),
			with: {
				stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
				bus: true,
				allocations: {
					with: { student: true, pickupStop: true, dropStop: true },
				},
			},
		});
		return found ?? null;
	}),

	// Parent: my child's route
	myChildRoute: parentProcedure
		.input(z.object({ studentId: z.string() }))
		.query(async ({ ctx, input }) => {
			const allocation = await ctx.db.query.studentAllocation.findFirst({
				where: (a) =>
					and(eq(a.studentId, input.studentId), eq(a.status, "active")),
				with: {
					route: {
						with: {
							stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
							bus: true,
							driver: true,
						},
					},
					pickupStop: true,
					dropStop: true,
				},
			});
			return allocation ?? null;
		}),
});
