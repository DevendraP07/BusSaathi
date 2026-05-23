import { and, desc, eq, gte, lte } from "drizzle-orm";
import {
	adminProcedure,
	createTRPCRouter,
	driverProcedure,
	managerProcedure,
	parentProcedure,
} from "@/server/api/trpc";
import {
	bus,
	feePayment,
	issue,
	notification,
	route,
	student,
	studentAllocation,
	trip,
	user,
} from "@/server/db/schema";

export const dashboardRouter = createTRPCRouter({
	// ── Parent Dashboard ────────────────────────────

	parentStats: parentProcedure.query(async ({ ctx }) => {
		const parentId = ctx.session.user.id;

		// All children
		const children = await ctx.db.query.student.findMany({
			where: and(eq(student.parentId, parentId), eq(student.isActive, true)),
			with: {
				allocations: {
					where: (a) => eq(a.status, "active"),
					with: {
						route: { with: { bus: true, driver: true } },
						pickupStop: true,
						dropStop: true,
					},
				},
			},
		});

		// Pending dues
		const pendingPayments = await ctx.db.query.feePayment.findMany({
			where: and(
				eq(feePayment.parentId, parentId),
				eq(feePayment.paymentStatus, "pending"),
			),
			with: { student: true, feeStructure: true },
		});

		// Recent payments
		const recentPayments = await ctx.db.query.feePayment.findMany({
			where: eq(feePayment.parentId, parentId),
			with: { student: true, feeStructure: true, receipt: true },
			orderBy: [desc(feePayment.createdAt)],
			limit: 5,
		});

		// Unread notifications count
		const unreadNotifs = await ctx.db.query.notification.findMany({
			where: and(
				eq(notification.userId, parentId),
				eq(notification.isRead, false),
			),
		});

		const totalPaid = await ctx.db.query.feePayment.findMany({
			where: and(
				eq(feePayment.parentId, parentId),
				eq(feePayment.paymentStatus, "confirmed"),
			),
		});

		return {
			totalChildren: children.length,
			childrenAllocated: children.filter((c) => c.allocations.length > 0)
				.length,
			children,
			pendingDuesCount: pendingPayments.length,
			pendingDuesAmount: pendingPayments
				.reduce((sum, p) => sum + Number(p.amount), 0)
				.toFixed(2),
			totalPaidAmount: totalPaid
				.reduce((sum, p) => sum + Number(p.amount), 0)
				.toFixed(2),
			recentPayments,
			unreadNotifications: unreadNotifs.length,
		};
	}),

	// ── Driver Dashboard ────────────────────────────

	driverStats: driverProcedure.query(async ({ ctx }) => {
		const driverId = ctx.session.user.id;

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

		// Today's trip
		const todayTrip = await ctx.db.query.trip.findFirst({
			where: and(
				eq(trip.driverId, driverId),
				gte(trip.scheduledDate, today),
				lte(trip.scheduledDate, tomorrow),
			),
			with: {
				route: {
					with: {
						stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
						allocations: {
							where: (a) => eq(a.status, "active"),
							with: { student: true, pickupStop: true, dropStop: true },
						},
					},
				},
				bus: true,
				attendances: { with: { student: true } },
			},
		});

		// Assigned route
		const assignedRoute = await ctx.db.query.route.findFirst({
			where: and(eq(route.driverId, driverId), eq(route.status, "active")),
			with: {
				bus: true,
				stops: { orderBy: (s, { asc }) => [asc(s.stopOrder)] },
			},
		});

		// Monthly trip stats
		const monthlyTrips = await ctx.db.query.trip.findMany({
			where: and(
				eq(trip.driverId, driverId),
				gte(trip.scheduledDate, startOfMonth),
			),
		});

		const completedTrips = monthlyTrips.filter(
			(t) => t.status === "completed",
		).length;
		const cancelledTrips = monthlyTrips.filter(
			(t) => t.status === "cancelled",
		).length;

		// Open issues reported by driver
		const openIssues = await ctx.db.query.issue.findMany({
			where: and(eq(issue.reportedBy, driverId), eq(issue.status, "open")),
		});

		// Unread notifications
		const unreadNotifs = await ctx.db.query.notification.findMany({
			where: and(
				eq(notification.userId, driverId),
				eq(notification.isRead, false),
			),
		});

		// Recent trips
		const recentTrips = await ctx.db.query.trip.findMany({
			where: eq(trip.driverId, driverId),
			with: { route: true, bus: true },
			orderBy: [desc(trip.scheduledDate)],
			limit: 5,
		});

		return {
			todayTrip,
			assignedRoute,
			monthlyTripsTotal: monthlyTrips.length,
			completedTrips,
			cancelledTrips,
			completionRate:
				monthlyTrips.length > 0
					? Math.round((completedTrips / monthlyTrips.length) * 100)
					: 0,
			openIssuesCount: openIssues.length,
			unreadNotifications: unreadNotifs.length,
			recentTrips,
		};
	}),

	// ── Manager Dashboard ────────────────────────────

	managerStats: managerProcedure.query(async ({ ctx }) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

		const [
			allRoutes,
			allBuses,
			allStudents,
			allAllocations,
			todayTrips,
			monthlyPayments,
			openIssues,
			pendingPayments,
		] = await Promise.all([
			ctx.db.query.route.findMany({
				where: eq(route.status, "active"),
				with: {
					allocations: { where: (a) => eq(a.status, "active") },
					bus: true,
					driver: true,
				},
			}),
			ctx.db.query.bus.findMany({
				where: eq(bus.status, "active"),
			}),
			ctx.db.query.student.findMany({
				where: eq(student.isActive, true),
			}),
			ctx.db.query.studentAllocation.findMany({
				where: eq(studentAllocation.status, "active"),
			}),
			ctx.db.query.trip.findMany({
				where: and(
					gte(trip.scheduledDate, today),
					lte(trip.scheduledDate, tomorrow),
				),
				with: { route: true, driver: true, bus: true },
			}),
			ctx.db.query.feePayment.findMany({
				where: and(
					eq(feePayment.paymentStatus, "confirmed"),
					gte(feePayment.createdAt, startOfMonth),
				),
			}),
			ctx.db.query.issue.findMany({
				where: eq(issue.status, "open"),
				with: { reporter: true },
				orderBy: [desc(issue.createdAt)],
				limit: 5,
			}),
			ctx.db.query.feePayment.findMany({
				where: eq(feePayment.paymentStatus, "pending"),
				with: { student: true, parent: true },
				orderBy: (fp, { asc }) => [asc(fp.dueDate)],
				limit: 5,
			}),
		]);

		const monthlyRevenue = monthlyPayments
			.reduce((sum, p) => sum + Number(p.amount), 0)
			.toFixed(2);

		// Overdue payments
		const now = new Date();
		const overduePayments = await ctx.db.query.feePayment.findMany({
			where: and(
				eq(feePayment.paymentStatus, "pending"),
				lte(feePayment.dueDate, now),
			),
		});

		// Recent trips for activity feed
		const recentTrips = await ctx.db.query.trip.findMany({
			with: { route: true, driver: true },
			orderBy: [desc(trip.scheduledDate)],
			limit: 5,
		});

		return {
			activeRoutesCount: allRoutes.length,
			activeBusesCount: allBuses.length,
			totalStudentsCount: allStudents.length,
			allocatedStudentsCount: allAllocations.length,
			todayTripsCount: todayTrips.length,
			todayTripsCompleted: todayTrips.filter((t) => t.status === "completed")
				.length,
			todayTrips,
			monthlyRevenue,
			openIssuesCount: openIssues.length,
			recentOpenIssues: openIssues,
			overduePaymentsCount: overduePayments.length,
			recentPendingPayments: pendingPayments,
			recentTrips,
			routes: allRoutes,
		};
	}),

	// ── Admin Dashboard ────────────────────────────

	adminStats: adminProcedure.query(async ({ ctx }) => {
		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);

		const [
			allUsers,
			allRoutes,
			allBuses,
			allStudents,
			allTrips,
			monthlyPayments,
			allIssues,
			allNotifications,
		] = await Promise.all([
			ctx.db.query.user.findMany({ where: eq(user.isActive, true) }),
			ctx.db.query.route.findMany(),
			ctx.db.query.bus.findMany(),
			ctx.db.query.student.findMany({ where: eq(student.isActive, true) }),
			ctx.db.query.trip.findMany({
				where: gte(trip.scheduledDate, startOfMonth),
			}),
			ctx.db.query.feePayment.findMany({
				where: and(
					eq(feePayment.paymentStatus, "confirmed"),
					gte(feePayment.createdAt, startOfMonth),
				),
			}),
			ctx.db.query.issue.findMany({
				where: eq(issue.status, "open"),
				with: { reporter: true },
				orderBy: [desc(issue.createdAt)],
				limit: 10,
			}),
			ctx.db.query.notification.findMany({
				where: eq(notification.isRead, false),
			}),
		]);

		const byRole = {
			parent: allUsers.filter((u) => u.role === "parent").length,
			driver: allUsers.filter((u) => u.role === "driver").length,
			manager: allUsers.filter((u) => u.role === "manager").length,
			admin: allUsers.filter((u) => u.role === "admin").length,
		};

		const monthlyRevenue = monthlyPayments
			.reduce((sum, p) => sum + Number(p.amount), 0)
			.toFixed(2);

		// Recent users
		const recentUsers = await ctx.db.query.user.findMany({
			orderBy: [desc(user.createdAt)],
			limit: 5,
		});

		return {
			totalUsers: allUsers.length,
			usersByRole: byRole,
			totalRoutes: allRoutes.length,
			activeRoutes: allRoutes.filter((r) => r.status === "active").length,
			totalBuses: allBuses.length,
			activeBuses: allBuses.filter((b) => b.status === "active").length,
			totalStudents: allStudents.length,
			monthlyTrips: allTrips.length,
			completedTrips: allTrips.filter((t) => t.status === "completed").length,
			monthlyRevenue,
			openIssues: allIssues.length,
			recentIssues: allIssues,
			unreadNotificationsSystem: allNotifications.length,
			recentUsers,
		};
	}),
});
