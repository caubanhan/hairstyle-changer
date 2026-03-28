import { Router } from "express";
import { z } from "zod";
import { getHairstyleAdvice } from "../services/anthropic";

const adviceRouter = Router();

const adviceSchema = z.object({
  imageBase64: z.string().min(100, "Invalid image data"),
  imageMediaType: z.enum(["image/jpeg", "image/png"]),
  hairstyleName: z.string().min(1).max(100),
});

adviceRouter.post("/", async (req, res, next) => {
  try {
    const { imageBase64, imageMediaType, hairstyleName } = adviceSchema.parse(req.body);
    const advice = await getHairstyleAdvice(imageBase64, imageMediaType, hairstyleName);

    res.status(200).json({ advice });
  } catch (error) {
    next(error);
  }
});

export { adviceRouter };
