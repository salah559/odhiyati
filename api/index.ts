
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

let routesRegistered = false;

const registerRoutesOnce = async () => {
  if (!routesRegistered) {
    try {
      await registerRoutes(app);
      routesRegistered = true;
    } catch (error) {
      console.error('Failed to register routes:', error);
      throw error;
    }
  }
};

app.use((req, res, next) => {
  if (!routesRegistered) {
    registerRoutesOnce().then(() => next()).catch(next);
  } else {
    next();
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;
