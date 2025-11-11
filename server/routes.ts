import type { Express } from "express";
import { createServer, type Server } from "http";
import { getUserByEmail } from "./admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin API endpoints
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
