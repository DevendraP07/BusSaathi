import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { user } from "@/server/db/schema";

export const profileRouter = createTRPCRouter({
	get: protectedProcedure.query(async ({ ctx }) => {
		const found = await ctx.db.query.user.findFirst({
			where: eq(user.id, ctx.session.user.id),
		});
		if (!found) {
			throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
		}
		return found;
	}),

	update: protectedProcedure
		.input(
			z.object({
				name: z.string().min(2).optional(),
				phone: z.string().optional(),
				address: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [updated] = await ctx.db
				.update(user)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(user.id, ctx.session.user.id))
				.returning();

			if (!updated) {
				throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
			}
			return updated;
		}),
});
