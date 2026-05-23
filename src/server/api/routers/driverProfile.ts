import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "@/lib/id";
import {
	createTRPCRouter,
	driverProcedure,
	managerProcedure,
} from "@/server/api/trpc";
import { driverProfile } from "@/server/db/schema";

export const driverProfileRouter = createTRPCRouter({
	// Driver: get own profile
	getMyProfile: driverProcedure.query(async ({ ctx }) => {
		const profile = await ctx.db.query.driverProfile.findFirst({
			where: eq(driverProfile.userId, ctx.session.user.id),
			with: { user: true },
		});
		return profile ?? null;
	}),

	// Driver: create or update own profile
	upsert: driverProcedure
		.input(
			z.object({
				licenseNumber: z.string().min(2, "License number required"),
				licenseExpiry: z.string().optional(),
				experience: z.number().int().min(0).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.driverProfile.findFirst({
				where: eq(driverProfile.userId, ctx.session.user.id),
			});

			if (existing) {
				const [updated] = await ctx.db
					.update(driverProfile)
					.set({
						licenseNumber: input.licenseNumber,
						licenseExpiry: input.licenseExpiry
							? new Date(input.licenseExpiry)
							: null,
						experience: input.experience ?? null,
						updatedAt: new Date(),
					})
					.where(eq(driverProfile.userId, ctx.session.user.id))
					.returning();
				return updated;
			}

			const [created] = await ctx.db
				.insert(driverProfile)
				.values({
					id: generateId(),
					userId: ctx.session.user.id,
					licenseNumber: input.licenseNumber,
					licenseExpiry: input.licenseExpiry
						? new Date(input.licenseExpiry)
						: null,
					experience: input.experience ?? null,
					isVerified: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			return created;
		}),

	// Manager: list all driver profiles
	listAll: managerProcedure
		.input(
			z.object({
				isVerified: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const profiles = await ctx.db.query.driverProfile.findMany({
				where:
					input.isVerified !== undefined
						? eq(driverProfile.isVerified, input.isVerified)
						: undefined,
				with: { user: true },
				orderBy: (dp, { desc }) => [desc(dp.createdAt)],
			});
			return profiles;
		}),

	// Manager: get one driver profile
	getByUserId: managerProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const profile = await ctx.db.query.driverProfile.findFirst({
				where: eq(driverProfile.userId, input.userId),
				with: { user: true },
			});
			if (!profile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Driver profile not found",
				});
			}
			return profile;
		}),

	// Manager: verify or unverify driver
	setVerification: managerProcedure
		.input(
			z.object({
				userId: z.string(),
				isVerified: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.driverProfile.findFirst({
				where: eq(driverProfile.userId, input.userId),
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Driver profile not found",
				});
			}
			const [updated] = await ctx.db
				.update(driverProfile)
				.set({ isVerified: input.isVerified, updatedAt: new Date() })
				.where(eq(driverProfile.userId, input.userId))
				.returning();
			return updated;
		}),
});
