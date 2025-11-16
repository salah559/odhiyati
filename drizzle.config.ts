import { defineConfig } from "drizzle-kit";

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_NAME) {
  throw new Error("MySQL credentials missing. Ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are set");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST.trim(),
    user: process.env.DB_USER.trim(),
    password: process.env.DB_PASS.trim(),
    database: process.env.DB_NAME.trim(),
  },
});
