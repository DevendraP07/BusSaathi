import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/env";
import { db } from "@/server/db";
import { account, session, user, verification } from "@/server/db/schema";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user,
			session,
			account,
			verification,
		},
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "parent",
			},
			phone: {
				type: "string",
				required: false,
			},
			address: {
				type: "string",
				required: false,
			},
			isActive: {
				type: "boolean",
				required: false,
				defaultValue: true,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
	},
});

export type Session = typeof auth.$Infer.Session;
