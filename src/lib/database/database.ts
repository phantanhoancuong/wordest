import { drizzle } from "drizzle-orm/libsql";

export const database = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_TOKEN!,
  },
});
