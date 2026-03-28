import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { HairColor, HairStyle } from "../services/ailab";
import { queryTaskResult, submitHairstyleJob } from "../services/ailab";
import { handleMulterError, upload } from "../middleware/upload";

const hairstyleRouter = Router();

// The frontend may send display names from UI cards instead of AILab enum values.
// Use this map to normalize those names into valid HairStyle values.
export const HAIRSTYLE_MAP: Record<string, HairStyle> = {
  // Female
  "Pixie Cut": "PixieCut",
  "Sleek Bob": "ShortNeatBob",
  "Blunt Bangs": "bowlCut",
  "Curtain Bangs": "WavyFrenchBobVibesfrom1920",
  "Long Bob (Lob)": "ShoulderLengthHair",
  "Shag Cut": "CurlyBob",
  "Wolf Cut": "LongWavy",
  "Butterfly Cut": "LongCurly",
  "Layered Cut": "LongStraight",
  "Beach Waves": "LongWavy",
  "Straight Sleek": "LongStraight",
  "Modern Mullet": "bowlCut",
  // Male
  "Buzz Cut": "BuzzCut",
  "Fade Cut": "LowFade",
  Undercut: "UnderCut",
  Pompadour: "Pompadour",
  "Slick Back": "SlickBack",
  "French Crop": "TexturedFringe",
  "Crew Cut": "BuzzCut",
  "Modern Bowl Cut": "BluntBowlCut",
  "Flat Top": "HighTightFade",
};

const submitSchema = z.object({
  hairStyle: z.string().min(1, "hairStyle is required"),
  hairColor: z.string().optional(),
  imageSize: z.coerce.number().int().min(1).max(4).optional(),
});

hairstyleRouter.post("/", upload.single("image"), handleMulterError, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Image file is required" });
      return;
    }

    const { hairStyle, hairColor, imageSize } = submitSchema.parse(req.body);
    const resolvedStyle = HAIRSTYLE_MAP[hairStyle] ?? (hairStyle as HairStyle);

    const taskId = await submitHairstyleJob({
      imageBuffer: req.file.buffer,
      imageOriginalName: req.file.originalname,
      imageMimeType: req.file.mimetype,
      hairStyle: resolvedStyle,
      hairColor: hairColor as HairColor | undefined,
      imageSize: imageSize as 1 | 2 | 3 | 4 | undefined,
    });

    res.status(202).json({
      taskId,
      message: "Job submitted. Poll /api/hairstyle/status/:taskId for result.",
    });
  } catch (error) {
    next(error);
  }
});

hairstyleRouter.get("/status/:taskId", async (req, res, next) => {
  try {
    if (!req.params.taskId) {
      res.status(400).json({ error: "taskId is required" });
      return;
    }

    const result = await queryTaskResult(req.params.taskId);

    if (result.status === "SUCCESS") {
      res.status(200).json({
        status: "SUCCESS",
        imageUrls: result.imageUrls,
      });
      return;
    }

    if (result.status === "FAILED") {
      res.status(422).json({
        status: "FAILED",
        error: result.error ?? "Task failed",
      });
      return;
    }

    res.status(200).json({
      status: "PENDING",
      message: "Still processing, try again in 3 seconds",
    });
  } catch (error) {
    next(error);
  }
});

export { hairstyleRouter };
