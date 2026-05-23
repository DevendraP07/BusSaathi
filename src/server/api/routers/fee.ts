import { TRPCError } from "@trpc/server";
import { and, desc, eq, lte } from "drizzle-orm";
import { z } from "zod";
import { formatDate, formatDateTime } from "@/lib/date";
import { generateId, generateRef } from "@/lib/id";
import { buildReceiptData } from "@/lib/receipt";
import {
	createTRPCRouter,
	managerProcedure,
	parentProcedure,
} from "@/server/api/trpc";
import {
	feePayment,
	feeStructure,
	notification,
	paymentReceipt,
} from "@/server/db/schema";

export const feeRouter = createTRPCRouter({
	// ─── Fee Structure ───────────────────────────────

	listStructures: managerProcedure
		.input(
			z.object({
				routeId: z.string().optional(),
				feeType: z.enum(["monthly", "term", "annual"]).optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const structures = await ctx.db.query.feeStructure.findMany({
				where: and(
					input.routeId ? eq(feeStructure.routeId, input.routeId) : undefined,
					input.feeType ? eq(feeStructure.feeType, input.feeType) : undefined,
					input.isActive !== undefined
						? eq(feeStructure.isActive, input.isActive)
						: undefined,
				),
				with: { route: true },
				orderBy: (fs, { desc: d }) => [d(fs.createdAt)],
			});
			return structures;
		}),

	// Parent can view active fee structures
	listActiveStructures: parentProcedure
		.input(z.object({ routeId: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.feeStructure.findMany({
				where: and(
					eq(feeStructure.isActive, true),
					input.routeId ? eq(feeStructure.routeId, input.routeId) : undefined,
				),
				with: { route: true },
			});
		}),

	createStructure: managerProcedure
		.input(
			z.object({
				name: z.string().min(2, "Name required"),
				feeType: z.enum(["monthly", "term", "annual"]),
				amount: z.string().min(1, "Amount required"),
				routeId: z.string().optional(),
				description: z.string().optional(),
				effectiveFrom: z.string(),
				effectiveTo: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [created] = await ctx.db
				.insert(feeStructure)
				.values({
					id: generateId(),
					...input,
					routeId: input.routeId ?? null,
					effectiveFrom: new Date(input.effectiveFrom),
					effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
					isActive: true,
					createdBy: ctx.session.user.id,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			return created;
		}),

	updateStructure: managerProcedure
		.input(
			z.object({
				structureId: z.string(),
				name: z.string().optional(),
				amount: z.string().optional(),
				description: z.string().optional(),
				isActive: z.boolean().optional(),
				effectiveTo: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { structureId, ...data } = input;
			const [updated] = await ctx.db
				.update(feeStructure)
				.set({
					...data,
					effectiveTo: data.effectiveTo
						? new Date(data.effectiveTo)
						: undefined,
					updatedAt: new Date(),
				})
				.where(eq(feeStructure.id, structureId))
				.returning();
			return updated;
		}),

	// ─── Fee Payments ─────────────────────────────

	// Manager: list all payments
	listPayments: managerProcedure
		.input(
			z.object({
				status: z
					.enum(["pending", "confirmed", "failed", "refunded"])
					.optional(),
				studentId: z.string().optional(),
				fromDate: z.string().optional(),
				toDate: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const payments = await ctx.db.query.feePayment.findMany({
				where: and(
					input.status ? eq(feePayment.paymentStatus, input.status) : undefined,
					input.studentId
						? eq(feePayment.studentId, input.studentId)
						: undefined,
				),
				with: {
					student: true,
					parent: true,
					feeStructure: { with: { route: true } },
					receipt: true,
				},
				orderBy: [desc(feePayment.createdAt)],
			});
			return payments;
		}),

	// Parent: view my fee details
	myPayments: parentProcedure
		.input(
			z.object({
				studentId: z.string().optional(),
				status: z
					.enum(["pending", "confirmed", "failed", "refunded"])
					.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const students = await ctx.db.query.student.findMany({
				where: (s) => eq(s.parentId, ctx.session.user.id),
			});
			const studentIds = students.map((s) => s.id);
			if (studentIds.length === 0) return [];

			const payments = await ctx.db.query.feePayment.findMany({
				where: and(
					eq(feePayment.parentId, ctx.session.user.id),
					input.studentId
						? eq(feePayment.studentId, input.studentId)
						: undefined,
					input.status ? eq(feePayment.paymentStatus, input.status) : undefined,
				),
				with: {
					student: true,
					feeStructure: { with: { route: true } },
					receipt: true,
				},
				orderBy: [desc(feePayment.createdAt)],
			});
			return payments;
		}),

	// Parent: get pending dues
	pendingDues: parentProcedure.query(async ({ ctx }) => {
		const now = new Date();
		return ctx.db.query.feePayment.findMany({
			where: and(
				eq(feePayment.parentId, ctx.session.user.id),
				eq(feePayment.paymentStatus, "pending"),
				lte(feePayment.dueDate, now),
			),
			with: {
				student: true,
				feeStructure: { with: { route: true } },
			},
			orderBy: (fp, { asc }) => [asc(fp.dueDate)],
		});
	}),

	// Manager: create a fee payment record for a student
	createPaymentRecord: managerProcedure
		.input(
			z.object({
				studentId: z.string(),
				feeStructureId: z.string(),
				dueDate: z.string(),
				forMonth: z.string().optional(),
				forTerm: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const student = await ctx.db.query.student.findFirst({
				where: (s) => eq(s.id, input.studentId),
				with: { parent: true },
			});
			if (!student) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Student not found",
				});
			}
			const structure = await ctx.db.query.feeStructure.findFirst({
				where: (fs) => eq(fs.id, input.feeStructureId),
			});
			if (!structure) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Fee structure not found",
				});
			}

			const [created] = await ctx.db
				.insert(feePayment)
				.values({
					id: generateId(),
					paymentRef: generateRef("PAY"),
					studentId: input.studentId,
					parentId: student.parentId,
					feeStructureId: input.feeStructureId,
					amount: structure.amount,
					paymentMethod: "upi",
					paymentStatus: "pending",
					dueDate: new Date(input.dueDate),
					forMonth: input.forMonth ?? null,
					forTerm: input.forTerm ?? null,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			if (!created) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create payment record",
				});
			}

			// Notify parent
			await ctx.db.insert(notification).values({
				id: generateId(),
				userId: student.parentId,
				type: "fee_reminder",
				title: "Fee Payment Due",
				message: `Transport fee of ₹${structure.amount} for ${student.name} is due on ${formatDate(input.dueDate)}.`,
				entityId: created.id,
				entityType: "fee_payment",
				isRead: false,
				createdAt: new Date(),
			});

			return created;
		}),

	// Parent: initiate payment (dummy gateway)
	initiatePayment: parentProcedure
		.input(
			z.object({
				paymentId: z.string(),
				paymentMethod: z.enum([
					"upi",
					"credit_card",
					"debit_card",
					"wallet",
					"cash",
				]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.feePayment.findFirst({
				where: and(
					eq(feePayment.id, input.paymentId),
					eq(feePayment.parentId, ctx.session.user.id),
				),
				with: { feeStructure: true, student: true },
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Payment not found",
				});
			}
			if (existing.paymentStatus !== "pending") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Payment is already ${existing.paymentStatus}`,
				});
			}

			// Update method
			const [updated] = await ctx.db
				.update(feePayment)
				.set({
					paymentMethod: input.paymentMethod,
					updatedAt: new Date(),
				})
				.where(eq(feePayment.id, input.paymentId))
				.returning();

			return { payment: updated, proceedToGateway: true };
		}),

	// Parent: confirm payment (after dummy gateway)
	confirmPayment: parentProcedure
		.input(
			z.object({
				paymentId: z.string(),
				transactionRef: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.feePayment.findFirst({
				where: and(
					eq(feePayment.id, input.paymentId),
					eq(feePayment.parentId, ctx.session.user.id),
				),
				with: {
					feeStructure: { with: { route: true } },
					student: true,
					parent: true,
				},
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Payment not found",
				});
			}

			const txRef = input.transactionRef ?? generateRef("TXN");
			const paidAt = new Date();

			const [updated] = await ctx.db
				.update(feePayment)
				.set({
					paymentStatus: "confirmed",
					transactionRef: txRef,
					paidAt,
					updatedAt: new Date(),
				})
				.where(eq(feePayment.id, input.paymentId))
				.returning();

			// Generate receipt
			const receiptNumber = generateRef("RCP");
			const receiptData = buildReceiptData({
				receiptNumber,
				paymentRef: existing.paymentRef,
				studentName: existing.student.name,
				parentName: existing.parent.name,
				routeName: existing.feeStructure.route?.name ?? "General",
				feeType: existing.feeStructure.feeType,
				forPeriod:
					existing.forMonth ?? existing.forTerm ?? formatDate(existing.dueDate),
				amount: existing.amount,
				paymentMethod: existing.paymentMethod,
				transactionRef: txRef,
				paidAt: formatDateTime(paidAt),
				generatedAt: formatDateTime(new Date()),
			});

			const [receipt] = await ctx.db
				.insert(paymentReceipt)
				.values({
					id: generateId(),
					receiptNumber,
					paymentId: input.paymentId,
					receiptData,
					generatedAt: new Date(),
				})
				.returning();

			// Notify parent
			await ctx.db.insert(notification).values({
				id: generateId(),
				userId: ctx.session.user.id,
				type: "payment_confirmed",
				title: "Payment Confirmed",
				message: `Payment of ₹${existing.amount} for ${existing.student.name} confirmed. Receipt: ${receiptNumber}`,
				entityId: existing.id,
				entityType: "fee_payment",
				isRead: false,
				createdAt: new Date(),
			});

			return { payment: updated, receipt };
		}),

	// Parent: get receipt
	getReceipt: parentProcedure
		.input(z.object({ paymentId: z.string() }))
		.query(async ({ ctx, input }) => {
			const payment = await ctx.db.query.feePayment.findFirst({
				where: and(
					eq(feePayment.id, input.paymentId),
					eq(feePayment.parentId, ctx.session.user.id),
				),
				with: {
					receipt: true,
					feeStructure: { with: { route: true } },
					student: true,
				},
			});
			if (!payment) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Payment not found",
				});
			}
			return payment;
		}),

	// Manager: get defaulters (overdue pending)
	defaulters: managerProcedure.query(async ({ ctx }) => {
		const now = new Date();
		return ctx.db.query.feePayment.findMany({
			where: and(
				eq(feePayment.paymentStatus, "pending"),
				lte(feePayment.dueDate, now),
			),
			with: {
				student: true,
				parent: true,
				feeStructure: { with: { route: true } },
			},
			orderBy: (fp, { asc }) => [asc(fp.dueDate)],
		});
	}),
});
