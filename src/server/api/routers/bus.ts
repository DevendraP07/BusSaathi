import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "@/lib/id";
import { createTRPCRouter, managerProcedure } from "@/server/api/trpc";
import { bus } from "@/server/db/schema";

export const busRouter = createTRPCRouter({
	list: managerProcedure
		.input(
			z.object({
				status: z.enum(["active", "inactive", "maintenance"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const buses = await ctx.db.query.bus.findMany({
				where: and(
					isNull(bus.deletedAt),
					input.status ? eq(bus.status, input.status) : undefined,
				),
				with: { routes: true },
				orderBy: (b, { asc }) => [asc(b.registrationNumber)],
			});
			return buses;
		}),

	getById: managerProcedure
		.input(z.object({ busId: z.string() }))
		.query(async ({ ctx, input }) => {
			const found = await ctx.db.query.bus.findFirst({
				where: and(eq(bus.id, input.busId), isNull(bus.deletedAt)),
				with: { routes: { with: { stops: true } }, trips: true },
			});
			if (!found) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Bus not found" });
			}
			return found;
		}),

	create: managerProcedure
		.input(
			z.object({
				registrationNumber: z.string().min(2, "Registration number required"),
				model: z.string().optional(),
				capacity: z.number().int().min(1, "Capacity must be at least 1"),
				gpsDeviceId: z.string().optional(),
				insuranceExpiry: z.string().optional(),
				fitnessCertExpiry: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.bus.findFirst({
				where: eq(bus.registrationNumber, input.registrationNumber),
			});
			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Bus with this registration number already exists",
				});
			}
			const [created] = await ctx.db
				.insert(bus)
				.values({
					id: generateId(),
					...input,
					status: "active",
					insuranceExpiry: input.insuranceExpiry
						? new Date(input.insuranceExpiry)
						: null,
					fitnessCertExpiry: input.fitnessCertExpiry
						? new Date(input.fitnessCertExpiry)
						: null,
					createdBy: ctx.session.user.id,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			return created;
		}),

	update: managerProcedure
		.input(
			z.object({
				busId: z.string(),
				model: z.string().optional(),
				capacity: z.number().int().min(1).optional(),
				status: z.enum(["active", "inactive", "maintenance"]).optional(),
				gpsDeviceId: z.string().optional(),
				insuranceExpiry: z.string().optional(),
				fitnessCertExpiry: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { busId, ...data } = input;
			const existing = await ctx.db.query.bus.findFirst({
				where: and(eq(bus.id, busId), isNull(bus.deletedAt)),
			});
			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Bus not found" });
			}
			const [updated] = await ctx.db
				.update(bus)
				.set({
					...data,
					insuranceExpiry: data.insuranceExpiry
						? new Date(data.insuranceExpiry)
						: undefined,
					fitnessCertExpiry: data.fitnessCertExpiry
						? new Date(data.fitnessCertExpiry)
						: undefined,
					updatedAt: new Date(),
				})
				.where(eq(bus.id, busId))
				.returning();
			return updated;
		}),

	remove: managerProcedure
		.input(z.object({ busId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(bus)
				.set({ deletedAt: new Date(), updatedAt: new Date() })
				.where(eq(bus.id, input.busId));
			return { success: true };
		}),
});
