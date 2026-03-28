import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError("Route not found", 404));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}]`, err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.errors,
    });
    return;
  }

  if (typeof err === "object" && err !== null && "statusCode" in err) {
    const typedError = err as { statusCode: number; message?: string };
    res.status(typedError.statusCode).json({ error: typedError.message ?? "Request failed" });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
  });
}
