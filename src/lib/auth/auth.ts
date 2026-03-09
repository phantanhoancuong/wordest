import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { database } from "@/lib/database/database";

export const auth = betterAuth({
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  baseUrl: process.env.BETTER_AUTH_URL,

  database: drizzleAdapter(database, { provider: "pg" }),

  secret: process.env.BETTER_AUTH_SECRET,

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
