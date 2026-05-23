import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { generateId, generateRef } from "@/lib/id";
import {
	createTRPCRouter,
	managerProcedure,
	parentProcedure,
} from "@/server/api/trpc";
import { notification, student, systemLog, user } from "@/server/db/schema";

interface TransportRequestData {
	requestRef: string;
	parentId: string;
	parentName: string;
	parentEmail: string;
	studentId: string;
	studentName: string;
	preferredRouteId: string | null;
	preferredPickupStop: string;
	preferredDropStop: string;
	notes: string;
	status: "pending" | "approved" | "rejected";
	reviewedBy: string | null;
	reviewNote: string | null;
	createdAt: string;
	updatedAt: string;
}

function _parseRequest(metadata: string | null): TransportRequestData | null {
	if (!metadata) return null;
	try {
		return JSON.parse(metadata) as TransportRequestData;
	} catch {
		return null;
	}
}

export const transportRequestRouter = createTRPCRouter({
	// Parent: submit a transport registration request
	submit: parentProcedure
		.input(
			z.object({
				studentId: z.string(),
				preferredRouteId: z.string().optional(),
				preferredPickupStop: z.string().min(1, "Pickup stop required"),
				preferredDropStop: z.string().min(1, "Drop stop required"),
				notes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const parentUser = await ctx.db.query.user.findFirst({
				where: eq(user.id, ctx.session.user.id),
			});
			const studentRecord = await ctx.db.query.student.findFirst({
				where: and(
					eq(student.id, input.studentId),
					eq(student.parentId, ctx.session.user.id),
				),
			});

			if (!studentRecord) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Student not found or not your child",
				});
			}

			const requestRef = generateRef("TR");
			const requestData: TransportRequestData = {
				requestRef,
				parentId: ctx.session.user.id,
				parentName: parentUser?.name ?? "",
				parentEmail: parentUser?.email ?? "",
				studentId: input.studentId,
				studentName: studentRecord.name,
				preferredRouteId: input.preferredRouteId ?? null,
				preferredPickupStop: input.preferredPickupStop,
				preferredDropStop: input.preferredDropStop,
				notes: input.notes ?? "",
				status: "pending",
				reviewedBy: null,
				reviewNote: null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			// Store as system log entry
			await ctx.db.insert(systemLog).values({
				id: generateId(),
				actorId: ctx.session.user.id,
				action: "TRANSPORT_REQUEST",
				entity: "transport_request",
				entityId: requestRef,
				metadata: JSON.stringify(requestData),
				createdAt: new Date(),
			});

			// Notify managers
			const managers = await ctx.db.query.user.findMany({
				where: and(eq(user.role, "manager"), eq(user.isActive, true)),
			});
			if (managers.length > 0) {
				await ctx.db.insert(notification).values(
					managers.map((m) => ({
						id: generateId(),
						userId: m.id,
						type: "system" as const,
						title: "New Transport Request",
						message: `${parentUser?.name ?? "A parent"} has requested transport for ${studentRecord.name}. Ref: ${requestRef}`,
						entityId: requestRef,
						entityType: "transport_request",
						isRead: false,
						createdAt: new Date(),
					})),
				);
			}

			return { success: true, requestRef, data: requestData };
		}),

	// Parent: my transport requests
	myRequests: parentProcedure.query(async ({ ctx }) => {
		const logs = await ctx.db.query.systemLog.findMany({
			where: and(
				eq(systemLog.actorId, ctx.session.user.id),
				eq(systemLog.entity, "transport_request"),
			),
			orderBy: [desc(systemLog.createdAt)],
		});

		return logs
			.map((log) => {
				if (!log.metadata) return null;
				try {
					return JSON.parse(log.metadata) as TransportRequestData;
				} catch {
					return null;
				}
			})
			.filter(Boolean);
	}),

	// Manager: list all transport requests
	listAll: managerProcedure
		.input(
			z.object({
				status: z.enum(["pending", "approved", "rejected"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const logs = await ctx.db.query.systemLog.findMany({
				where: eq(systemLog.entity, "transport_request"),
				orderBy: [desc(systemLog.createdAt)],
			});

			const requests = logs
				.map((log) => {
					if (!log.metadata) return null;
					try {
						return JSON.parse(log.metadata) as TransportRequestData;
					} catch {
						return null;
					}
				})
				.filter(Boolean) as TransportRequestData[];

			if (input.status) {
				return requests.filter((r) => r.status === input.status);
			}
			return requests;
		}),

	// Manager: approve or reject a request
	review: managerProcedure
		.input(
			z.object({
				requestRef: z.string(),
				status: z.enum(["approved", "rejected"]),
				reviewNote: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Find the log entry
			const log = await ctx.db.query.systemLog.findFirst({
				where: and(
					eq(systemLog.entity, "transport_request"),
					eq(systemLog.entityId, input.requestRef),
				),
			});

			if (!log?.metadata) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Transport request not found",
				});
			}

			const requestData = JSON.parse(log.metadata) as TransportRequestData;

			if (requestData.status !== "pending") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Request is already ${requestData.status}`,
				});
			}

			// Update the metadata
			const updatedData: TransportRequestData = {
				...requestData,
				status: input.status,
				reviewedBy: ctx.session.user.id,
				reviewNote: input.reviewNote ?? null,
				updatedAt: new Date().toISOString(),
			};

			await ctx.db
				.update(systemLog)
				.set({ metadata: JSON.stringify(updatedData) })
				.where(eq(systemLog.id, log.id));

			// Notify parent
			await ctx.db.insert(notification).values({
				id: generateId(),
				userId: requestData.parentId,
				type: "system" as const,
				title: `Transport Request ${input.status === "approved" ? "Approved ✅" : "Rejected ❌"}`,
				message:
					input.status === "approved"
						? `Your transport request (${input.requestRef}) for ${requestData.studentName} has been approved. You will be allocated a route shortly.`
						: `Your transport request (${input.requestRef}) for ${requestData.studentName} was rejected. ${input.reviewNote ?? ""}`,
				entityId: input.requestRef,
				entityType: "transport_request",
				isRead: false,
				createdAt: new Date(),
			});

			return { success: true, data: updatedData };
		}),
});
