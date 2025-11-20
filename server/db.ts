import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Format: postgresql://user:password@host/database");
}

const queryClient = postgres(process.env.DATABASE_URL.trim());

export const db = drizzle(queryClient, { schema });
