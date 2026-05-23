import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
	"parent",
	"driver",
	"manager",
	"admin",
]);

export const busStatusEnum = pgEnum("bus_status", [
	"active",
	"inactive",
	"maintenance",
]);

export const routeStatusEnum = pgEnum("route_status", [
	"active",
	"inactive",
	"suspended",
]);

export const routeTypeEnum = pgEnum("route_type", [
	"morning",
	"evening",
	"full_day",
]);

export const allocationStatusEnum = pgEnum("allocation_status", [
	"active",
	"inactive",
	"pending",
]);

export const tripStatusEnum = pgEnum("trip_status", [
	"scheduled",
	"started",
	"ongoing",
	"completed",
	"cancelled",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
	"present",
	"absent",
	"boarded",
	"dropped",
]);

export const feeTypeEnum = pgEnum("fee_type", ["monthly", "term", "annual"]);

export const paymentMethodEnum = pgEnum("payment_method", [
	"upi",
	"credit_card",
	"debit_card",
	"wallet",
	"cash",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"confirmed",
	"failed",
	"refunded",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
	"bus_arrival",
	"bus_delay",
	"fee_reminder",
	"payment_confirmed",
	"route_change",
	"trip_started",
	"trip_completed",
	"issue_reported",
	"system",
]);

export const issuePriorityEnum = pgEnum("issue_priority", [
	"low",
	"medium",
	"high",
	"critical",
]);

export const issueStatusEnum = pgEnum("issue_status", [
	"open",
	"in_progress",
	"resolved",
	"closed",
]);

export const issueTypeEnum = pgEnum("issue_type", [
	"delay",
	"breakdown",
	"route_deviation",
	"student_safety",
	"other",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

// ─────────────────────────────────────────────
// BETTER AUTH TABLES (DO NOT RENAME COLUMNS)
// ─────────────────────────────────────────────

export const user = pgTable("bussaathi_user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
	// Additional fields
	role: userRoleEnum("role").default("parent").notNull(),
	phone: text("phone"),
	address: text("address"),
	isActive: boolean("is_active")
		.$defaultFn(() => true)
		.notNull(),
	deletedAt: timestamp("deleted_at"),
});

export const session = pgTable("bussaathi_session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("bussaathi_account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("bussaathi_verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => new Date()),
	updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ─────────────────────────────────────────────
// STUDENT PROFILES (linked to parent user)
// ─────────────────────────────────────────────

export const student = pgTable(
	"bussaathi_student",
	{
		id: text("id").primaryKey(),
		parentId: text("parent_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		rollNumber: text("roll_number"),
		className: text("class_name"),
		section: text("section"),
		gender: genderEnum("gender"),
		dateOfBirth: timestamp("date_of_birth"),
		photoUrl: text("photo_url"),
		emergencyContact: text("emergency_contact"),
		isActive: boolean("is_active")
			.$defaultFn(() => true)
			.notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [index("student_parent_idx").on(t.parentId)],
);

// ─────────────────────────────────────────────
// DRIVER PROFILE (linked to driver user)
// ─────────────────────────────────────────────

export const driverProfile = pgTable(
	"bussaathi_driver_profile",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		licenseNumber: text("license_number").notNull(),
		licenseExpiry: timestamp("license_expiry"),
		experience: integer("experience"),
		isVerified: boolean("is_verified")
			.$defaultFn(() => false)
			.notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [index("driver_profile_user_idx").on(t.userId)],
);

// ─────────────────────────────────────────────
// BUS
// ─────────────────────────────────────────────

export const bus = pgTable(
	"bussaathi_bus",
	{
		id: text("id").primaryKey(),
		registrationNumber: text("registration_number").notNull().unique(),
		model: text("model"),
		capacity: integer("capacity").notNull(),
		status: busStatusEnum("status").notNull().default("active"),
		gpsDeviceId: text("gps_device_id"),
		insuranceExpiry: timestamp("insurance_expiry"),
		fitnessCertExpiry: timestamp("fitness_cert_expiry"),
		imageUrl: text("image_url"),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
		deletedAt: timestamp("deleted_at"),
	},
	(t) => [
		index("bus_status_idx").on(t.status),
		index("bus_reg_idx").on(t.registrationNumber),
	],
);

// ─────────────────────────────────────────────
// ROUTE
// ─────────────────────────────────────────────

export const route = pgTable(
	"bussaathi_route",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		routeCode: text("route_code").notNull().unique(),
		routeType: routeTypeEnum("route_type").notNull().default("morning"),
		status: routeStatusEnum("status").notNull().default("active"),
		busId: text("bus_id").references(() => bus.id, { onDelete: "set null" }),
		driverId: text("driver_id").references(() => user.id, {
			onDelete: "set null",
		}),
		startLocation: text("start_location").notNull(),
		endLocation: text("end_location").notNull(),
		departureTime: text("departure_time").notNull(),
		estimatedArrival: text("estimated_arrival"),
		totalDistance: numeric("total_distance", { precision: 8, scale: 2 }),
		description: text("description"),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
		deletedAt: timestamp("deleted_at"),
	},
	(t) => [
		index("route_status_idx").on(t.status),
		index("route_bus_idx").on(t.busId),
		index("route_driver_idx").on(t.driverId),
		index("route_code_idx").on(t.routeCode),
	],
);

// ─────────────────────────────────────────────
// ROUTE STOP
// ─────────────────────────────────────────────

export const routeStop = pgTable(
	"bussaathi_route_stop",
	{
		id: text("id").primaryKey(),
		routeId: text("route_id")
			.notNull()
			.references(() => route.id, { onDelete: "cascade" }),
		stopName: text("stop_name").notNull(),
		stopOrder: integer("stop_order").notNull(),
		landmark: text("landmark"),
		pickupTime: text("pickup_time"),
		dropTime: text("drop_time"),
		latitude: text("latitude"),
		longitude: text("longitude"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("stop_route_idx").on(t.routeId),
		index("stop_order_idx").on(t.routeId, t.stopOrder),
	],
);

// ─────────────────────────────────────────────
// STUDENT ALLOCATION (assign student to route+stop)
// ─────────────────────────────────────────────

export const studentAllocation = pgTable(
	"bussaathi_student_allocation",
	{
		id: text("id").primaryKey(),
		studentId: text("student_id")
			.notNull()
			.references(() => student.id, { onDelete: "cascade" }),
		routeId: text("route_id")
			.notNull()
			.references(() => route.id, { onDelete: "restrict" }),
		pickupStopId: text("pickup_stop_id").references(() => routeStop.id, {
			onDelete: "set null",
		}),
		dropStopId: text("drop_stop_id").references(() => routeStop.id, {
			onDelete: "set null",
		}),
		status: allocationStatusEnum("status").notNull().default("active"),
		allocatedBy: text("allocated_by")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		allocatedAt: timestamp("allocated_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("allocation_student_idx").on(t.studentId),
		index("allocation_route_idx").on(t.routeId),
		index("allocation_status_idx").on(t.status),
	],
);

// ─────────────────────────────────────────────
// TRIP (daily trip execution record)
// ─────────────────────────────────────────────

export const trip = pgTable(
	"bussaathi_trip",
	{
		id: text("id").primaryKey(),
		tripRef: text("trip_ref").notNull().unique(),
		routeId: text("route_id")
			.notNull()
			.references(() => route.id, { onDelete: "restrict" }),
		busId: text("bus_id")
			.notNull()
			.references(() => bus.id, { onDelete: "restrict" }),
		driverId: text("driver_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		status: tripStatusEnum("status").notNull().default("scheduled"),
		scheduledDate: timestamp("scheduled_date").notNull(),
		startedAt: timestamp("started_at"),
		completedAt: timestamp("completed_at"),
		notes: text("notes"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("trip_route_idx").on(t.routeId),
		index("trip_driver_idx").on(t.driverId),
		index("trip_status_idx").on(t.status),
		index("trip_date_idx").on(t.scheduledDate),
		index("trip_ref_idx").on(t.tripRef),
	],
);

// ─────────────────────────────────────────────
// TRIP ATTENDANCE
// ─────────────────────────────────────────────

export const tripAttendance = pgTable(
	"bussaathi_trip_attendance",
	{
		id: text("id").primaryKey(),
		tripId: text("trip_id")
			.notNull()
			.references(() => trip.id, { onDelete: "cascade" }),
		studentId: text("student_id")
			.notNull()
			.references(() => student.id, { onDelete: "restrict" }),
		boardingStatus: attendanceStatusEnum("boarding_status").default("absent"),
		droppingStatus: attendanceStatusEnum("dropping_status").default("absent"),
		boardedAt: timestamp("boarded_at"),
		droppedAt: timestamp("dropped_at"),
		remarks: text("remarks"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("attendance_trip_idx").on(t.tripId),
		index("attendance_student_idx").on(t.studentId),
	],
);

// ─────────────────────────────────────────────
// FEE STRUCTURE
// ─────────────────────────────────────────────

export const feeStructure = pgTable(
	"bussaathi_fee_structure",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		feeType: feeTypeEnum("fee_type").notNull().default("monthly"),
		amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
		routeId: text("route_id").references(() => route.id, {
			onDelete: "set null",
		}),
		description: text("description"),
		isActive: boolean("is_active")
			.$defaultFn(() => true)
			.notNull(),
		effectiveFrom: timestamp("effective_from").notNull(),
		effectiveTo: timestamp("effective_to"),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("fee_structure_route_idx").on(t.routeId),
		index("fee_structure_type_idx").on(t.feeType),
		index("fee_structure_active_idx").on(t.isActive),
	],
);

// ─────────────────────────────────────────────
// FEE PAYMENT
// ─────────────────────────────────────────────

export const feePayment = pgTable(
	"bussaathi_fee_payment",
	{
		id: text("id").primaryKey(),
		paymentRef: text("payment_ref").notNull().unique(),
		studentId: text("student_id")
			.notNull()
			.references(() => student.id, { onDelete: "restrict" }),
		parentId: text("parent_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		feeStructureId: text("fee_structure_id")
			.notNull()
			.references(() => feeStructure.id, { onDelete: "restrict" }),
		amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
		paymentMethod: paymentMethodEnum("payment_method").notNull().default("upi"),
		paymentStatus: paymentStatusEnum("payment_status")
			.notNull()
			.default("pending"),
		transactionRef: text("transaction_ref"),
		paidAt: timestamp("paid_at"),
		dueDate: timestamp("due_date").notNull(),
		forMonth: text("for_month"),
		forTerm: text("for_term"),
		remarks: text("remarks"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("payment_student_idx").on(t.studentId),
		index("payment_parent_idx").on(t.parentId),
		index("payment_status_idx").on(t.paymentStatus),
		index("payment_ref_idx").on(t.paymentRef),
		index("payment_due_idx").on(t.dueDate),
		index("payment_fee_struct_idx").on(t.feeStructureId),
	],
);

// ─────────────────────────────────────────────
// PAYMENT RECEIPT
// ─────────────────────────────────────────────

export const paymentReceipt = pgTable(
	"bussaathi_payment_receipt",
	{
		id: text("id").primaryKey(),
		receiptNumber: text("receipt_number").notNull().unique(),
		paymentId: text("payment_id")
			.notNull()
			.unique()
			.references(() => feePayment.id, { onDelete: "restrict" }),
		receiptData: text("receipt_data").notNull(),
		generatedAt: timestamp("generated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [index("receipt_payment_idx").on(t.paymentId)],
);

// ─────────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────────

export const notification = pgTable(
	"bussaathi_notification",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: notificationTypeEnum("type").notNull().default("system"),
		title: text("title").notNull(),
		message: text("message").notNull(),
		entityId: text("entity_id"),
		entityType: text("entity_type"),
		isRead: boolean("is_read")
			.$defaultFn(() => false)
			.notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		readAt: timestamp("read_at"),
	},
	(t) => [
		index("notif_user_idx").on(t.userId),
		index("notif_read_idx").on(t.userId, t.isRead),
		index("notif_type_idx").on(t.type),
	],
);

// ─────────────────────────────────────────────
// ISSUE / COMPLAINT
// ─────────────────────────────────────────────

export const issue = pgTable(
	"bussaathi_issue",
	{
		id: text("id").primaryKey(),
		issueRef: text("issue_ref").notNull().unique(),
		reportedBy: text("reported_by")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		tripId: text("trip_id").references(() => trip.id, {
			onDelete: "set null",
		}),
		routeId: text("route_id").references(() => route.id, {
			onDelete: "set null",
		}),
		type: issueTypeEnum("type").notNull().default("other"),
		priority: issuePriorityEnum("priority").notNull().default("medium"),
		status: issueStatusEnum("status").notNull().default("open"),
		title: text("title").notNull(),
		description: text("description").notNull(),
		resolvedBy: text("resolved_by").references(() => user.id, {
			onDelete: "set null",
		}),
		resolvedAt: timestamp("resolved_at"),
		resolutionNote: text("resolution_note"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("issue_reporter_idx").on(t.reportedBy),
		index("issue_status_idx").on(t.status),
		index("issue_priority_idx").on(t.priority),
		index("issue_trip_idx").on(t.tripId),
		index("issue_ref_idx").on(t.issueRef),
	],
);

// ─────────────────────────────────────────────
// SYSTEM LOG
// ─────────────────────────────────────────────

export const systemLog = pgTable(
	"bussaathi_system_log",
	{
		id: text("id").primaryKey(),
		actorId: text("actor_id").references(() => user.id, {
			onDelete: "set null",
		}),
		action: text("action").notNull(),
		entity: text("entity").notNull(),
		entityId: text("entity_id"),
		metadata: text("metadata"),
		ipAddress: text("ip_address"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("log_actor_idx").on(t.actorId),
		index("log_entity_idx").on(t.entity),
		index("log_created_idx").on(t.createdAt),
	],
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const userRelations = relations(user, ({ many, one }) => ({
	sessions: many(session),
	accounts: many(account),
	students: many(student),
	driverProfile: one(driverProfile, {
		fields: [user.id],
		references: [driverProfile.userId],
	}),
	createdBuses: many(bus),
	createdRoutes: many(route),
	drivenRoutes: many(route, { relationName: "driverRoutes" }),
	drivenTrips: many(trip),
	notifications: many(notification),
	reportedIssues: many(issue, { relationName: "reporterIssues" }),
	resolvedIssues: many(issue, { relationName: "resolverIssues" }),
	feePayments: many(feePayment),
	systemLogs: many(systemLog),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const studentRelations = relations(student, ({ one, many }) => ({
	parent: one(user, { fields: [student.parentId], references: [user.id] }),
	allocations: many(studentAllocation),
	tripAttendances: many(tripAttendance),
	feePayments: many(feePayment),
}));

export const driverProfileRelations = relations(driverProfile, ({ one }) => ({
	user: one(user, { fields: [driverProfile.userId], references: [user.id] }),
}));

export const busRelations = relations(bus, ({ one, many }) => ({
	creator: one(user, { fields: [bus.createdBy], references: [user.id] }),
	routes: many(route),
	trips: many(trip),
}));

export const routeRelations = relations(route, ({ one, many }) => ({
	bus: one(bus, { fields: [route.busId], references: [bus.id] }),
	driver: one(user, {
		fields: [route.driverId],
		references: [user.id],
		relationName: "driverRoutes",
	}),
	creator: one(user, { fields: [route.createdBy], references: [user.id] }),
	stops: many(routeStop),
	allocations: many(studentAllocation),
	trips: many(trip),
	feeStructures: many(feeStructure),
	issues: many(issue),
}));

export const routeStopRelations = relations(routeStop, ({ one, many }) => ({
	route: one(route, { fields: [routeStop.routeId], references: [route.id] }),
	pickupAllocations: many(studentAllocation, {
		relationName: "pickupAllocations",
	}),
	dropAllocations: many(studentAllocation, { relationName: "dropAllocations" }),
}));

export const studentAllocationRelations = relations(
	studentAllocation,
	({ one }) => ({
		student: one(student, {
			fields: [studentAllocation.studentId],
			references: [student.id],
		}),
		route: one(route, {
			fields: [studentAllocation.routeId],
			references: [route.id],
		}),
		pickupStop: one(routeStop, {
			fields: [studentAllocation.pickupStopId],
			references: [routeStop.id],
			relationName: "pickupAllocations",
		}),
		dropStop: one(routeStop, {
			fields: [studentAllocation.dropStopId],
			references: [routeStop.id],
			relationName: "dropAllocations",
		}),
		allocatedByUser: one(user, {
			fields: [studentAllocation.allocatedBy],
			references: [user.id],
		}),
	}),
);

export const tripRelations = relations(trip, ({ one, many }) => ({
	route: one(route, { fields: [trip.routeId], references: [route.id] }),
	bus: one(bus, { fields: [trip.busId], references: [bus.id] }),
	driver: one(user, { fields: [trip.driverId], references: [user.id] }),
	attendances: many(tripAttendance),
	issues: many(issue),
}));

export const tripAttendanceRelations = relations(tripAttendance, ({ one }) => ({
	trip: one(trip, { fields: [tripAttendance.tripId], references: [trip.id] }),
	student: one(student, {
		fields: [tripAttendance.studentId],
		references: [student.id],
	}),
}));

export const feeStructureRelations = relations(
	feeStructure,
	({ one, many }) => ({
		route: one(route, {
			fields: [feeStructure.routeId],
			references: [route.id],
		}),
		creator: one(user, {
			fields: [feeStructure.createdBy],
			references: [user.id],
		}),
		payments: many(feePayment),
	}),
);

export const feePaymentRelations = relations(feePayment, ({ one }) => ({
	student: one(student, {
		fields: [feePayment.studentId],
		references: [student.id],
	}),
	parent: one(user, {
		fields: [feePayment.parentId],
		references: [user.id],
	}),
	feeStructure: one(feeStructure, {
		fields: [feePayment.feeStructureId],
		references: [feeStructure.id],
	}),
	receipt: one(paymentReceipt, {
		fields: [feePayment.id],
		references: [paymentReceipt.paymentId],
	}),
}));

export const paymentReceiptRelations = relations(paymentReceipt, ({ one }) => ({
	payment: one(feePayment, {
		fields: [paymentReceipt.paymentId],
		references: [feePayment.id],
	}),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
	user: one(user, { fields: [notification.userId], references: [user.id] }),
}));

export const issueRelations = relations(issue, ({ one }) => ({
	reporter: one(user, {
		fields: [issue.reportedBy],
		references: [user.id],
		relationName: "reporterIssues",
	}),
	resolver: one(user, {
		fields: [issue.resolvedBy],
		references: [user.id],
		relationName: "resolverIssues",
	}),
	trip: one(trip, { fields: [issue.tripId], references: [trip.id] }),
	route: one(route, { fields: [issue.routeId], references: [route.id] }),
}));

export const systemLogRelations = relations(systemLog, ({ one }) => ({
	actor: one(user, { fields: [systemLog.actorId], references: [user.id] }),
}));
