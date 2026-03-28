import multer from "multer";
import type { NextFunction, Request, Response } from "express";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req: Request, file: Express.Multer.File, cb): void => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    (cb as unknown as (error: Error | null, acceptFile: boolean) => void)(
      new Error("Only JPG and PNG images are allowed"),
      false
    );
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export function handleMulterError(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File too large. Max 5MB." });
      return;
    }

    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof Error && err.message === "Only JPG and PNG images are allowed") {
    res.status(400).json({ error: err.message });
    return;
  }

  next(err);
}