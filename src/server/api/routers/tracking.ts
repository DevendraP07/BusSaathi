import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
	createTRPCRouter,
	driverProcedure,
	managerProcedure,
	parentProcedure,
} from "@/server/api/trpc";
import { trip } from "@/server/db/schema";

// ── Simulated GPS Store (in-memory for dummy tracking) ──
// In production this would be Redis or a real GPS API
const busLocationStore = new Map<
	string,
	{
		tripId: string;
		latitude: string;
		longitude: string;
		currentStopIndex: number;
		speed: string;
		updatedAt: Date;
		status: "moving" | "stopped" | "at_stop";
	}
>();

function simulateLocation(stopIndex: number): {
	latitude: string;
	longitude: string;
} {
	// Simulated Chennai-area coordinates shifting by stop index
	const baseLat = 13.0827 + stopIndex * 0.005;
	const baseLng = 80.2707 + stopIndex * 0.003;
	return {
		latitude: baseLat.toFixed(6),
		longitude: baseLng.toFixed(6),
	};
}

export const trackingRouter = createTRPCRouter({
	// Driver: update bus location (called every ~30s from driver app)
	updateLocation: driverProcedure
		.input(
			z.object({
				tripId: z.string(),
				latitude: z.string(),
				longitude: z.string(),
				currentStopIndex: z.number().int().min(0),
				speed: z.string().optional(),
				status: z.enum(["moving", "stopped", "at_stop"]).default("moving"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify this driver owns this trip
			const tripRecord = await ctx.db.query.trip.findFirst({
				where: and(
					eq(trip.id, input.tripId),
					eq(trip.driverId, ctx.session.user.id),
				),
			});
			if (!tripRecord) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Trip not found or not assigned to you",
				});
			}
			if (!["started", "ongoing"].includes(tripRecord.status)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Trip must be active to update location",
				});
			}

			busLocationStore.set(input.tripId, {
				tripId: input.tripId,
				latitude: input.latitude,
				longitude: input.longitude,
				currentStopIndex: input.currentStopIndex,
				speed: input.speed ?? "0",
				updatedAt: new Date(),
				status: input.status,
			});

			return { success: true, updatedAt: new Date() };
		}),

	// Parent: get current bus location for their child's route
	getBusLocation: parentProcedure
		.input(z.object({ studentId: z.string() }))
		.query(async ({ ctx, input }) => {
			// Find student's active allocation → route → today's trip
			const allocation = await ctx.db.query.studentAllocation.findFirst({
				where: (a) =>
					and(eq(a.studentId, input.studentId), eq(a.status, "active")),
				with: {
					route: {
						with: {
							stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
						},
					},
					pickupStop: true,
					dropStop: true,
				},
			});

			if (!allocation) {
				return {
					hasActiveTrip: false,
					message: "No active route allocation found for this student",
					location: null,
					stops: [],
					pickupStop: null,
					estimatedArrival: null,
				};
			}

			// Find today's trip on this route
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			const activeTrip = await ctx.db.query.trip.findFirst({
				where: and(
					eq(trip.routeId, allocation.routeId),
					eq(trip.status, "started"),
				),
				with: { bus: true, driver: true },
			});

			if (!activeTrip) {
				// Return simulated static location if no active trip
				return {
					hasActiveTrip: false,
					message: "No active trip right now. Bus is at depot.",
					location: simulateLocation(0),
					stops: allocation.route.stops,
					pickupStop: allocation.pickupStop,
					estimatedArrival: allocation.route.stops[0]?.pickupTime ?? null,
					bus: null,
					driver: null,
				};
			}

			// Get stored location or simulate
			const stored = busLocationStore.get(activeTrip.id);
			const location = stored
				? {
						latitude: stored.latitude,
						longitude: stored.longitude,
						speed: stored.speed,
						status: stored.status,
						updatedAt: stored.updatedAt,
						currentStopIndex: stored.currentStopIndex,
					}
				: {
						...simulateLocation(0),
						speed: "25",
						status: "moving" as const,
						updatedAt: new Date(),
						currentStopIndex: 0,
					};

			// Estimate arrival at pickup stop
			const pickupStopOrder = allocation.pickupStop?.stopOrder ?? 1;
			const stopsRemaining = Math.max(
				0,
				pickupStopOrder - (location.currentStopIndex + 1),
			);
			const estimatedMinutes = stopsRemaining * 5; // ~5 min per stop

			return {
				hasActiveTrip: true,
				tripId: activeTrip.id,
				tripRef: activeTrip.tripRef,
				location,
				stops: allocation.route.stops,
				pickupStop: allocation.pickupStop,
				dropStop: allocation.dropStop,
				estimatedArrival:
					estimatedMinutes > 0
						? `~${estimatedMinutes} min away`
						: "Arriving now",
				bus: activeTrip.bus,
				driver: activeTrip.driver,
			};
		}),

	// Manager: get live overview of all active trips
	liveOverview: managerProcedure.query(async ({ ctx }) => {
		const activeTrips = await ctx.db.query.trip.findMany({
			where: eq(trip.status, "started"),
			with: {
				route: true,
				bus: true,
				driver: true,
				attendances: true,
			},
		});

		return activeTrips.map((t) => {
			const location = busLocationStore.get(t.id);
			return {
				tripId: t.id,
				tripRef: t.tripRef,
				route: t.route,
				bus: t.bus,
				driver: t.driver,
				studentsOnboard: t.attendances.filter(
					(a) => a.boardingStatus === "boarded",
				).length,
				totalStudents: t.attendances.length,
				location: location ?? {
					...simulateLocation(0),
					speed: "0",
					status: "stopped" as const,
					updatedAt: new Date(),
					currentStopIndex: 0,
				},
				lastUpdated: location?.updatedAt ?? new Date(),
			};
		});
	}),

	// Manager: get location of a specific trip
	getTripLocation: managerProcedure
		.input(z.object({ tripId: z.string() }))
		.query(async ({ ctx, input }) => {
			const tripRecord = await ctx.db.query.trip.findFirst({
				where: eq(trip.id, input.tripId),
				with: {
					route: {
						with: { stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] } },
					},
					bus: true,
					driver: true,
					attendances: { with: { student: true } },
				},
			});
			if (!tripRecord) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" });
			}

			const location = busLocationStore.get(input.tripId) ?? {
				...simulateLocation(0),
				speed: "0",
				status: "stopped" as const,
				updatedAt: new Date(),
				currentStopIndex: 0,
				tripId: input.tripId,
			};

			return { trip: tripRecord, location };
		}),
});
