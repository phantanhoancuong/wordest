import { eq } from "drizzle-orm";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";

import { database } from "@/lib/database/client";
import * as schema from "@/lib/database/schema";

export const auth = betterAuth({
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  baseUrl: process.env.BETTER_AUTH_URL,

  database: drizzleAdapter(database, { provider: "sqlite", schema }),

  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser }) => {
        await database
          .delete(schema.user)
          .where(eq(schema.user.id, anonymousUser.user.id));
      },
    }),
  ],

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
