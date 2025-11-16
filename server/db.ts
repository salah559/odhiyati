
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Format: mysql://user:password@host/database");
}

const connection = mysql.createPool(process.env.DATABASE_URL.trim());

export const db = drizzle(connection, { schema, mode: "default" });
