import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { generateId, generateRef } from "@/lib/id";
import {
	createTRPCRouter,
	driverProcedure,
	managerProcedure,
	protectedProcedure,
} from "@/server/api/trpc";
import { issue, notification } from "@/server/db/schema";

export const issueRouter = createTRPCRouter({
	// Driver/Parent: report an issue
	report: protectedProcedure
		.input(
			z.object({
				type: z.enum([
					"delay",
					"breakdown",
					"route_deviation",
					"student_safety",
					"other",
				]),
				priority: z.enum(["low", "medium", "high", "critical"]),
				title: z.string().min(3, "Title required"),
				description: z.string().min(10, "Description required"),
				tripId: z.string().optional(),
				routeId: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [created] = await ctx.db
				.insert(issue)
				.values({
					id: generateId(),
					issueRef: generateRef("ISS"),
					reportedBy: ctx.session.user.id,
					...input,
					tripId: input.tripId ?? null,
					routeId: input.routeId ?? null,
					status: "open",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			if (!created) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create issue",
				});
			}

			// Notify all managers
			const managers = await ctx.db.query.user.findMany({
				where: (u) => and(eq(u.role, "manager"), eq(u.isActive, true)),
			});
			if (managers.length > 0) {
				await ctx.db.insert(notification).values(
					managers.map((m) => ({
						id: generateId(),
						userId: m.id,
						type: "issue_reported" as const,
						title: `New Issue Reported: ${input.title}`,
						message: `Priority: ${input.priority.toUpperCase()}. ${input.description.slice(0, 100)}`,
						entityId: created.id,
						entityType: "issue",
						isRead: false,
						createdAt: new Date(),
					})),
				);
			}

			return created;
		}),

	// Driver: my reported issues
	myIssues: driverProcedure.query(async ({ ctx }) => {
		return ctx.db.query.issue.findMany({
			where: eq(issue.reportedBy, ctx.session.user.id),
			with: { trip: true, route: true },
			orderBy: [desc(issue.createdAt)],
		});
	}),

	// Manager: list all issues
	listAll: managerProcedure
		.input(
			z.object({
				status: z
					.enum(["open", "in_progress", "resolved", "closed"])
					.optional(),
				priority: z.enum(["low", "medium", "high", "critical"]).optional(),
				type: z
					.enum([
						"delay",
						"breakdown",
						"route_deviation",
						"student_safety",
						"other",
					])
					.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.query.issue.findMany({
				where: and(
					input.status ? eq(issue.status, input.status) : undefined,
					input.priority ? eq(issue.priority, input.priority) : undefined,
					input.type ? eq(issue.type, input.type) : undefined,
				),
				with: {
					reporter: true,
					resolver: true,
					trip: true,
					route: true,
				},
				orderBy: [desc(issue.createdAt)],
			});
		}),

	getById: managerProcedure
		.input(z.object({ issueId: z.string() }))
		.query(async ({ ctx, input }) => {
			const found = await ctx.db.query.issue.findFirst({
				where: eq(issue.id, input.issueId),
				with: { reporter: true, resolver: true, trip: true, route: true },
			});
			if (!found) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Issue not found" });
			}
			return found;
		}),

	// Manager: update issue status
	updateStatus: managerProcedure
		.input(
			z.object({
				issueId: z.string(),
				status: z.enum(["open", "in_progress", "resolved", "closed"]),
				resolutionNote: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.issue.findFirst({
				where: eq(issue.id, input.issueId),
				with: { reporter: true },
			});
			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Issue not found" });
			}

			const isResolved = ["resolved", "closed"].includes(input.status);

			const [updated] = await ctx.db
				.update(issue)
				.set({
					status: input.status,
					resolvedBy: isResolved ? ctx.session.user.id : null,
					resolvedAt: isResolved ? new Date() : null,
					resolutionNote: input.resolutionNote ?? null,
					updatedAt: new Date(),
				})
				.where(eq(issue.id, input.issueId))
				.returning();

			// Notify reporter
			await ctx.db.insert(notification).values({
				id: generateId(),
				userId: existing.reportedBy,
				type: "system",
				title: `Issue ${input.status.replace("_", " ").toUpperCase()}`,
				message: `Your issue "${existing.title}" has been updated to: ${input.status}. ${input.resolutionNote ?? ""}`,
				entityId: existing.id,
				entityType: "issue",
				isRead: false,
				createdAt: new Date(),
			});

			return updated;
		}),
});
