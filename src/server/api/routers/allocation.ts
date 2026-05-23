import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "@/lib/id";
import {
	createTRPCRouter,
	managerProcedure,
	parentProcedure,
} from "@/server/api/trpc";
import { studentAllocation } from "@/server/db/schema";

export const allocationRouter = createTRPCRouter({
	// Manager: assign student to a route
	assign: managerProcedure
		.input(
			z.object({
				studentId: z.string(),
				routeId: z.string(),
				pickupStopId: z.string().optional(),
				dropStopId: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check for existing active allocation
			const existing = await ctx.db.query.studentAllocation.findFirst({
				where: and(
					eq(studentAllocation.studentId, input.studentId),
					eq(studentAllocation.status, "active"),
				),
			});
			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message:
						"Student is already allocated to an active route. Remove existing allocation first.",
				});
			}

			const [created] = await ctx.db
				.insert(studentAllocation)
				.values({
					id: generateId(),
					studentId: input.studentId,
					routeId: input.routeId,
					pickupStopId: input.pickupStopId ?? null,
					dropStopId: input.dropStopId ?? null,
					status: "active",
					allocatedBy: ctx.session.user.id,
					allocatedAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			return created;
		}),

	// Manager: update allocation stops
	updateStops: managerProcedure
		.input(
			z.object({
				allocationId: z.string(),
				pickupStopId: z.string().nullable().optional(),
				dropStopId: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { allocationId, ...data } = input;
			const [updated] = await ctx.db
				.update(studentAllocation)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(studentAllocation.id, allocationId))
				.returning();
			return updated;
		}),

	// Manager: deactivate allocation
	remove: managerProcedure
		.input(z.object({ allocationId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(studentAllocation)
				.set({ status: "inactive", updatedAt: new Date() })
				.where(eq(studentAllocation.id, input.allocationId));
			return { success: true };
		}),

	// Manager: list allocations by route
	listByRoute: managerProcedure
		.input(z.object({ routeId: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.studentAllocation.findMany({
				where: and(
					eq(studentAllocation.routeId, input.routeId),
					eq(studentAllocation.status, "active"),
				),
				with: {
					student: { with: { parent: true } },
					pickupStop: true,
					dropStop: true,
				},
			});
		}),

	// Parent: view own children's allocations
	myAllocations: parentProcedure.query(async ({ ctx }) => {
		const students = await ctx.db.query.student.findMany({
			where: (s) => eq(s.parentId, ctx.session.user.id),
			with: {
				allocations: {
					where: (a) => eq(a.status, "active"),
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
				},
			},
		});
		return students;
	}),
});
