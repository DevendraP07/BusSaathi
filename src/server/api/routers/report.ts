import { and, desc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, managerProcedure } from "@/server/api/trpc";
import { feePayment, route, studentAllocation, trip } from "@/server/db/schema";

export const reportRouter = createTRPCRouter({
	// Fee collection summary
	feeCollectionSummary: managerProcedure
		.input(
			z.object({
				fromDate: z.string().optional(),
				toDate: z.string().optional(),
				routeId: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const payments = await ctx.db.query.feePayment.findMany({
				where: and(
					input.fromDate
						? gte(feePayment.createdAt, new Date(input.fromDate))
						: undefined,
					input.toDate
						? lte(feePayment.createdAt, new Date(input.toDate))
						: undefined,
				),
				with: {
					student: true,
					parent: true,
					feeStructure: { with: { route: true } },
				},
				orderBy: [desc(feePayment.createdAt)],
			});

			const filtered = input.routeId
				? payments.filter((p) => p.feeStructure.routeId === input.routeId)
				: payments;

			const confirmed = filtered.filter((p) => p.paymentStatus === "confirmed");
			const pending = filtered.filter((p) => p.paymentStatus === "pending");
			const failed = filtered.filter((p) => p.paymentStatus === "failed");

			const totalCollected = confirmed.reduce(
				(sum, p) => sum + Number(p.amount),
				0,
			);
			const totalPending = pending.reduce(
				(sum, p) => sum + Number(p.amount),
				0,
			);

			return {
				totalPayments: filtered.length,
				confirmed: confirmed.length,
				pending: pending.length,
				failed: failed.length,
				totalCollected: totalCollected.toFixed(2),
				totalPending: totalPending.toFixed(2),
				payments: filtered,
			};
		}),

	// Route utilization
	routeUtilization: managerProcedure.query(async ({ ctx }) => {
		const routes = await ctx.db.query.route.findMany({
			where: eq(route.status, "active"),
			with: {
				allocations: { where: (a) => eq(a.status, "active") },
				bus: true,
				trips: { where: (t) => eq(t.status, "completed") },
			},
		});

		return routes.map((r) => ({
			routeId: r.id,
			routeName: r.name,
			routeCode: r.routeCode,
			busCapacity: r.bus?.capacity ?? 0,
			studentsAllocated: r.allocations.length,
			occupancyPercent: r.bus?.capacity
				? Math.round((r.allocations.length / r.bus.capacity) * 100)
				: 0,
			totalTripsCompleted: r.trips.length,
		}));
	}),

	// Trip performance
	tripPerformance: managerProcedure
		.input(
			z.object({
				fromDate: z.string().optional(),
				toDate: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const trips = await ctx.db.query.trip.findMany({
				where: and(
					input.fromDate
						? gte(trip.scheduledDate, new Date(input.fromDate))
						: undefined,
					input.toDate
						? lte(trip.scheduledDate, new Date(input.toDate))
						: undefined,
				),
				with: { route: true, driver: true, attendances: true },
				orderBy: [desc(trip.scheduledDate)],
			});

			const completed = trips.filter((t) => t.status === "completed");
			const cancelled = trips.filter((t) => t.status === "cancelled");
			const ongoing = trips.filter((t) =>
				["started", "ongoing"].includes(t.status),
			);

			return {
				totalTrips: trips.length,
				completed: completed.length,
				cancelled: cancelled.length,
				ongoing: ongoing.length,
				completionRate:
					trips.length > 0
						? Math.round((completed.length / trips.length) * 100)
						: 0,
				trips,
			};
		}),

	// Student allocation summary
	allocationSummary: managerProcedure.query(async ({ ctx }) => {
		const allocations = await ctx.db.query.studentAllocation.findMany({
			where: eq(studentAllocation.status, "active"),
			with: {
				student: { with: { parent: true } },
				route: true,
				pickupStop: true,
				dropStop: true,
			},
		});

		const byRoute: Record<string, number> = {};
		for (const alloc of allocations) {
			const routeName = alloc.route.name;
			byRoute[routeName] = (byRoute[routeName] ?? 0) + 1;
		}

		return {
			totalAllocated: allocations.length,
			byRoute: Object.entries(byRoute).map(([name, count]) => ({
				name,
				count,
			})),
			allocations,
		};
	}),
});
