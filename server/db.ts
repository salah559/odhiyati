import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Format: postgresql://user:password@host/database");
}

const sql = neon(process.env.DATABASE_URL.trim());

export const db = drizzle(sql, { schema });
