
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// تهيئة المسارات
let routesInitialized = false;

async function initializeApp() {
  if (!routesInitialized) {
    await registerRoutes(app);
    
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    
    routesInitialized = true;
  }
  return app;
}

// تصدير كدالة سحابية لـ Vercel
export default async function handler(req: any, res: any) {
  const app = await initializeApp();
  return app(req, res);
}
