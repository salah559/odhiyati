import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Note: This application uses Firebase directly from the client side
  // All data operations are handled by Firestore with security rules
  // The server only serves the static frontend and handles routing

  const httpServer = createServer(app);
  return httpServer;
}
