import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { generateId, generateRef } from "@/lib/id";
import {
	createTRPCRouter,
	driverProcedure,
	managerProcedure,
	parentProcedure,
} from "@/server/api/trpc";
import { notification, trip, tripAttendance } from "@/server/db/schema";

export const tripRouter = createTRPCRouter({
	// Manager: create a scheduled trip
	schedule: managerProcedure
		.input(
			z.object({
				routeId: z.string(),
				busId: z.string(),
				driverId: z.string(),
				scheduledDate: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [created] = await ctx.db
				.insert(trip)
				.values({
					id: generateId(),
					tripRef: generateRef("TRIP"),
					routeId: input.routeId,
					busId: input.busId,
					driverId: input.driverId,
					status: "scheduled",
					scheduledDate: new Date(input.scheduledDate),
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			return created;
		}),

	// Driver: list my trips
	myTrips: driverProcedure
		.input(
			z.object({
				status: z
					.enum(["scheduled", "started", "ongoing", "completed", "cancelled"])
					.optional(),
				fromDate: z.string().optional(),
				toDate: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const trips = await ctx.db.query.trip.findMany({
				where: and(
					eq(trip.driverId, ctx.session.user.id),
					input.status ? eq(trip.status, input.status) : undefined,
					input.fromDate
						? gte(trip.scheduledDate, new Date(input.fromDate))
						: undefined,
					input.toDate
						? lte(trip.scheduledDate, new Date(input.toDate))
						: undefined,
				),
				with: {
					route: {
						with: { stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] } },
					},
					bus: true,
					attendances: { with: { student: true } },
				},
				orderBy: [desc(trip.scheduledDate)],
			});
			return trips;
		}),

	// Driver: get today's trip
	todayTrip: driverProcedure.query(async ({ ctx }) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const found = await ctx.db.query.trip.findFirst({
			where: and(
				eq(trip.driverId, ctx.session.user.id),
				gte(trip.scheduledDate, today),
				lte(trip.scheduledDate, tomorrow),
			),
			with: {
				route: {
					with: {
						stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
						allocations: {
							where: (a) => eq(a.status, "active"),
							with: { student: true, pickupStop: true, dropStop: true },
						},
					},
				},
				bus: true,
				attendances: { with: { student: true } },
			},
		});
		return found ?? null;
	}),

	getById: managerProcedure
		.input(z.object({ tripId: z.string() }))
		.query(async ({ ctx, input }) => {
			const found = await ctx.db.query.trip.findFirst({
				where: eq(trip.id, input.tripId),
				with: {
					route: {
						with: { stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] } },
					},
					bus: true,
					driver: true,
					attendances: { with: { student: true } },
					issues: true,
				},
			});
			if (!found) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" });
			}
			return found;
		}),

	// Driver: start trip
	start: driverProcedure
		.input(z.object({ tripId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.trip.findFirst({
				where: and(
					eq(trip.id, input.tripId),
					eq(trip.driverId, ctx.session.user.id),
				),
				with: {
					route: {
						with: {
							allocations: {
								where: (a) => eq(a.status, "active"),
								with: { student: { with: { parent: true } } },
							},
						},
					},
				},
			});
			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" });
			}
			if (existing.status !== "scheduled") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Cannot start a trip with status: ${existing.status}`,
				});
			}

			const [updated] = await ctx.db
				.update(trip)
				.set({
					status: "started",
					startedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(trip.id, input.tripId))
				.returning();

			// Initialize attendance records for all allocated students
			const allocations = existing.route?.allocations ?? [];
			if (allocations.length > 0) {
				await ctx.db.insert(tripAttendance).values(
					allocations.map((alloc) => ({
						id: generateId(),
						tripId: input.tripId,
						studentId: alloc.studentId,
						boardingStatus: "absent" as const,
						droppingStatus: "absent" as const,
						createdAt: new Date(),
						updatedAt: new Date(),
					})),
				);

				// Notify parents
				const notifValues = allocations.map((alloc) => ({
					id: generateId(),
					userId: alloc.student.parentId,
					type: "trip_started" as const,
					title: "Bus Trip Started",
					message: `The bus has started its trip. Your child ${alloc.student.name} is expected soon.`,
					entityId: input.tripId,
					entityType: "trip",
					isRead: false,
					createdAt: new Date(),
				}));
				await ctx.db.insert(notification).values(notifValues);
			}

			return updated;
		}),

	// Driver: complete trip
	complete: driverProcedure
		.input(z.object({ tripId: z.string(), notes: z.string().optional() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.trip.findFirst({
				where: and(
					eq(trip.id, input.tripId),
					eq(trip.driverId, ctx.session.user.id),
				),
			});
			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" });
			}
			if (!["started", "ongoing"].includes(existing.status)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Trip must be started before completing",
				});
			}
			const [updated] = await ctx.db
				.update(trip)
				.set({
					status: "completed",
					completedAt: new Date(),
					notes: input.notes,
					updatedAt: new Date(),
				})
				.where(eq(trip.id, input.tripId))
				.returning();
			return updated;
		}),

	// Manager: list all trips
	listAll: managerProcedure
		.input(
			z.object({
				status: z
					.enum(["scheduled", "started", "ongoing", "completed", "cancelled"])
					.optional(),
				routeId: z.string().optional(),
				driverId: z.string().optional(),
				fromDate: z.string().optional(),
				toDate: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const trips = await ctx.db.query.trip.findMany({
				where: and(
					input.status ? eq(trip.status, input.status) : undefined,
					input.routeId ? eq(trip.routeId, input.routeId) : undefined,
					input.driverId ? eq(trip.driverId, input.driverId) : undefined,
					input.fromDate
						? gte(trip.scheduledDate, new Date(input.fromDate))
						: undefined,
					input.toDate
						? lte(trip.scheduledDate, new Date(input.toDate))
						: undefined,
				),
				with: { route: true, bus: true, driver: true },
				orderBy: [desc(trip.scheduledDate)],
			});
			return trips;
		}),

	// Driver: mark attendance
	markAttendance: driverProcedure
		.input(
			z.object({
				attendanceId: z.string(),
				boardingStatus: z
					.enum(["present", "absent", "boarded", "dropped"])
					.optional(),
				droppingStatus: z
					.enum(["present", "absent", "boarded", "dropped"])
					.optional(),
				remarks: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { attendanceId, ...data } = input;
			const [updated] = await ctx.db
				.update(tripAttendance)
				.set({
					...data,
					boardedAt: data.boardingStatus === "boarded" ? new Date() : undefined,
					droppedAt: data.droppingStatus === "dropped" ? new Date() : undefined,
					updatedAt: new Date(),
				})
				.where(eq(tripAttendance.id, attendanceId))
				.returning();
			return updated;
		}),

	// Parent: view child's trip history
	childTripHistory: parentProcedure
		.input(z.object({ studentId: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.tripAttendance.findMany({
				where: eq(tripAttendance.studentId, input.studentId),
				with: {
					trip: {
						with: { route: true, bus: true, driver: true },
					},
				},
				orderBy: (a, { desc: d }) => [d(a.createdAt)],
			});
		}),
});
