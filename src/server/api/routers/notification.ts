import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "@/lib/id";
import {
	createTRPCRouter,
	managerProcedure,
	protectedProcedure,
} from "@/server/api/trpc";
import { notification } from "@/server/db/schema";

export const notificationRouter = createTRPCRouter({
	// All users: get own notifications
	myNotifications: protectedProcedure
		.input(
			z.object({
				isRead: z.boolean().optional(),
				limit: z.number().int().min(1).max(100).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.query.notification.findMany({
				where: and(
					eq(notification.userId, ctx.session.user.id),
					input.isRead !== undefined
						? eq(notification.isRead, input.isRead)
						: undefined,
				),
				orderBy: [desc(notification.createdAt)],
				limit: input.limit,
			});
		}),

	// Mark one as read
	markRead: protectedProcedure
		.input(z.object({ notificationId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(notification)
				.set({ isRead: true, readAt: new Date() })
				.where(
					and(
						eq(notification.id, input.notificationId),
						eq(notification.userId, ctx.session.user.id),
					),
				);
			return { success: true };
		}),

	// Mark all as read
	markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db
			.update(notification)
			.set({ isRead: true, readAt: new Date() })
			.where(
				and(
					eq(notification.userId, ctx.session.user.id),
					eq(notification.isRead, false),
				),
			);
		return { success: true };
	}),

	// Unread count
	unreadCount: protectedProcedure.query(async ({ ctx }) => {
		const result = await ctx.db.query.notification.findMany({
			where: and(
				eq(notification.userId, ctx.session.user.id),
				eq(notification.isRead, false),
			),
		});
		return { count: result.length };
	}),

	// Manager: broadcast notification to multiple users
	broadcast: managerProcedure
		.input(
			z.object({
				userIds: z.array(z.string()).min(1),
				type: z.enum([
					"bus_arrival",
					"bus_delay",
					"fee_reminder",
					"payment_confirmed",
					"route_change",
					"trip_started",
					"trip_completed",
					"issue_reported",
					"system",
				]),
				title: z.string().min(1),
				message: z.string().min(1),
				entityId: z.string().optional(),
				entityType: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { userIds, ...notifData } = input;
			await ctx.db.insert(notification).values(
				userIds.map((userId) => ({
					id: generateId(),
					userId,
					...notifData,
					entityId: notifData.entityId ?? null,
					entityType: notifData.entityType ?? null,
					isRead: false,
					createdAt: new Date(),
				})),
			);
			return { success: true, sentTo: userIds.length };
		}),
});
