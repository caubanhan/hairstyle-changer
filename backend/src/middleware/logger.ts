import type { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const timestamp = new Date().toISOString();
    const duration = Date.now() - start;
    const message = `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    console.log(message);
  });

  next();
}
