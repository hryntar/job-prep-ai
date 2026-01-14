import type { Config } from "drizzle-kit"
import { env } from "./src/data/env/server"

export default {
   out: "./src/drizzle/migrations",
   schema: "./src/drizzle/schema.ts",
   connectionString: env.DATABASE_URL,
} satisfies Config