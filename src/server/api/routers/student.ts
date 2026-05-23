import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "@/lib/id";
import {
	createTRPCRouter,
	managerProcedure,
	parentProcedure,
} from "@/server/api/trpc";
import { student } from "@/server/db/schema";

export const studentRouter = createTRPCRouter({
	// Parent: get own children
	myStudents: parentProcedure.query(async ({ ctx }) => {
		return ctx.db.query.student.findMany({
			where: and(
				eq(student.parentId, ctx.session.user.id),
				eq(student.isActive, true),
			),
			with: {
				allocations: {
					with: { route: true, pickupStop: true, dropStop: true },
				},
			},
		});
	}),

	// Parent: add a student
	create: parentProcedure
		.input(
			z.object({
				name: z.string().min(2, "Name required"),
				rollNumber: z.string().optional(),
				className: z.string().optional(),
				section: z.string().optional(),
				gender: z.enum(["male", "female", "other"]).optional(),
				emergencyContact: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [created] = await ctx.db
				.insert(student)
				.values({
					id: generateId(),
					parentId: ctx.session.user.id,
					...input,
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			return created;
		}),

	// Parent: update a student
	update: parentProcedure
		.input(
			z.object({
				studentId: z.string(),
				name: z.string().min(2).optional(),
				rollNumber: z.string().optional(),
				className: z.string().optional(),
				section: z.string().optional(),
				gender: z.enum(["male", "female", "other"]).optional(),
				emergencyContact: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { studentId, ...data } = input;
			const existing = await ctx.db.query.student.findFirst({
				where: and(
					eq(student.id, studentId),
					eq(student.parentId, ctx.session.user.id),
				),
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Student not found",
				});
			}
			const [updated] = await ctx.db
				.update(student)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(student.id, studentId))
				.returning();
			return updated;
		}),

	// Parent: soft delete
	remove: parentProcedure
		.input(z.object({ studentId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.student.findFirst({
				where: and(
					eq(student.id, input.studentId),
					eq(student.parentId, ctx.session.user.id),
				),
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Student not found",
				});
			}
			await ctx.db
				.update(student)
				.set({ isActive: false, updatedAt: new Date() })
				.where(eq(student.id, input.studentId));
			return { success: true };
		}),

	// Manager: list all students
	listAll: managerProcedure
		.input(
			z.object({
				routeId: z.string().optional(),
				search: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const students = await ctx.db.query.student.findMany({
				where: eq(student.isActive, true),
				with: {
					parent: true,
					allocations: {
						with: { route: true, pickupStop: true, dropStop: true },
					},
				},
			});
			let result = students;
			if (input.routeId) {
				result = result.filter((s) =>
					s.allocations.some((a) => a.routeId === input.routeId),
				);
			}
			if (input.search) {
				const q = input.search.toLowerCase();
				result = result.filter(
					(s) =>
						s.name.toLowerCase().includes(q) ||
						s.rollNumber?.toLowerCase().includes(q),
				);
			}
			return result;
		}),

	// Manager: get one student
	getById: managerProcedure
		.input(z.object({ studentId: z.string() }))
		.query(async ({ ctx, input }) => {
			const found = await ctx.db.query.student.findFirst({
				where: eq(student.id, input.studentId),
				with: {
					parent: true,
					allocations: {
						with: { route: true, pickupStop: true, dropStop: true },
					},
					feePayments: {
						with: { feeStructure: true, receipt: true },
						orderBy: (fp, { desc }) => [desc(fp.createdAt)],
					},
				},
			});
			if (!found) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Student not found",
				});
			}
			return found;
		}),
});
