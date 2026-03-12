import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/lib/database/schema";

export const database = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_TOKEN!,
  },
  schema,
});
