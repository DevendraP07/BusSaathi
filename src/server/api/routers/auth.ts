import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { UserRole } from "@/lib/permissions";
import { getDashboardRoute } from "@/lib/permissions";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { auth } from "@/server/better-auth";

export const authRouter = createTRPCRouter({
	register: publicProcedure
		.input(
			z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.string().email("Invalid email address"),
				password: z
					.string()
					.min(8, "Password must be at least 8 characters")
					.regex(/[A-Z]/, "Must contain at least one uppercase letter")
					.regex(/[0-9]/, "Must contain at least one number"),
				role: z.enum(["parent", "driver", "manager", "admin"]),
				phone: z.string().optional(),
				address: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const result = await auth.api.signUpEmail({
				body: {
					name: input.name,
					email: input.email,
					password: input.password,
					role: input.role,
					phone: input.phone ?? "",
					address: input.address ?? "",
				},
			});

			if (!result?.user) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Registration failed. Email may already be in use.",
				});
			}

			return {
				success: true,
				redirectTo: getDashboardRoute(input.role),
			};
		}),

	getSession: publicProcedure.query(async ({ ctx }) => {
		return ctx.session ?? null;
	}),

	getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
		const user = ctx.session.user;
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: (user as { role?: string }).role as UserRole,
			image: user.image ?? null,
		};
	}),

	getDashboard: protectedProcedure.query(async ({ ctx }) => {
		const role = (ctx.session.user as { role?: string }).role as UserRole;
		return { redirectTo: getDashboardRoute(role) };
	}),
});
