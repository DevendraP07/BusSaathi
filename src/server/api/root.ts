import { adminRouter } from "@/server/api/routers/admin";
import { allocationRouter } from "@/server/api/routers/allocation";
import { authRouter } from "@/server/api/routers/auth";
import { busRouter } from "@/server/api/routers/bus";
import { dashboardRouter } from "@/server/api/routers/dashboard";
import { driverProfileRouter } from "@/server/api/routers/driverProfile";
import { feeRouter } from "@/server/api/routers/fee";
import { issueRouter } from "@/server/api/routers/issue";
import { notificationRouter } from "@/server/api/routers/notification";
import { profileRouter } from "@/server/api/routers/profile";
import { reportRouter } from "@/server/api/routers/report";
import { routeRouter } from "@/server/api/routers/route";
import { studentRouter } from "@/server/api/routers/student";
import { trackingRouter } from "@/server/api/routers/tracking";
import { transportRequestRouter } from "@/server/api/routers/transportRequest";
import { tripRouter } from "@/server/api/routers/trip";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
	auth: authRouter,
	profile: profileRouter,
	student: studentRouter,
	bus: busRouter,
	route: routeRouter,
	allocation: allocationRouter,
	trip: tripRouter,
	fee: feeRouter,
	notification: notificationRouter,
	issue: issueRouter,
	admin: adminRouter,
	report: reportRouter,
	driverProfile: driverProfileRouter,
	dashboard: dashboardRouter,
	tracking: trackingRouter,
	transportRequest: transportRequestRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
