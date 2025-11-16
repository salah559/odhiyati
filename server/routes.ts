import type { Express } from "express";
import { createServer, type Server } from "http";
import { getUserByEmail } from "./admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { db } from "./db";
import { admins } from "@shared/schema";
import { eq } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/download-app", (req, res) => {
    try {
      const apkPath = path.join(__dirname, "..", "attached_assets", "app-release_1762910223541.apk");
      
      if (!fs.existsSync(apkPath)) {
        return res.status(404).json({ message: "APK file not found" });
      }

      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", "attachment; filename=adhiati-app.apk");
      
      const fileStream = fs.createReadStream(apkPath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error("Error downloading APK:", error);
      res.status(500).json({ message: "Error downloading app" });
    }
  });

  app.get("/api/admins/check", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.json(null);
      }

      const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
      
      if (!admin) {
        return res.json(null);
      }

      res.json({ email: admin.email, role: admin.role });
    } catch (error: any) {
      console.error("Error checking admin:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.get("/api/admin/user-by-email", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Error getting user by email:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
