import axios from "axios";
import type { AxiosError } from "axios";
import FormData from "form-data";

const SUBMIT_URL = "https://www.ailabapi.com/api/portrait/effects/hairstyle-editor-pro";
const QUERY_URL = "https://www.ailabapi.com/api/common/query-async-task-result";

export type HairStyle =
  | "BuzzCut"
  | "UnderCut"
  | "Pompadour"
  | "SlickBack"
  | "CurlyShag"
  | "WavyShag"
  | "FauxHawk"
  | "Spiky"
  | "CombOver"
  | "HighTightFade"
  | "ManBun"
  | "Afro"
  | "LowFade"
  | "UndercutLongHair"
  | "TwoBlockHaircut"
  | "TexturedFringe"
  | "BluntBowlCut"
  | "LongWavyCurtainBangs"
  | "MessyTousled"
  | "PixieCut"
  | "ShortNeatBob"
  | "BobCut"
  | "LongStraight"
  | "LongWavy"
  | "LongCurly"
  | "Ponytail"
  | "Updo"
  | "Cornrows"
  | "FishtailBraid"
  | "TwinBraids"
  | "DoubleBun"
  | "Chignon"
  | "CurlyBob"
  | "SlickedBack"
  | "ShoulderLengthHair"
  | "WavyFrenchBobVibesfrom1920"
  | "bowlCut";

export type HairColor =
  | "blonde"
  | "platinumBlonde"
  | "brown"
  | "lightBrown"
  | "blue"
  | "lightBlue"
  | "purple"
  | "lightPurple"
  | "pink"
  | "black"
  | "white"
  | "grey"
  | "silver"
  | "red"
  | "orange"
  | "green"
  | "gradient"
  | "multicolored"
  | "darkBlue"
  | "burgundy"
  | "darkGreen";

export interface SubmitJobParams {
  imageBuffer: Buffer;
  imageMimeType: string;
  imageOriginalName: string;
  hairStyle: HairStyle;
  hairColor?: HairColor;
  imageSize?: 1 | 2 | 3 | 4;
}

export interface TaskResult {
  status: "PENDING" | "SUCCESS" | "FAILED";
  imageUrls?: string[];
  error?: string;
}

type SubmitResponse = {
  error_code: number;
  error_msg?: string;
  task_id?: string;
  data?: {
    task_id?: string;
  };
};

type QueryResponse = {
  error_code: number;
  error_msg?: string;
  error_detail?: {
    message?: string;
  };
  data?: {
    task_status?: number;
    images?: string[];
    image_urls?: string[];
  };
};

function getApiKey(): string {
  return process.env.AILAB_API_KEY ?? "";
}

export async function submitHairstyleJob(params: SubmitJobParams): Promise<string> {
  try {
    const form = new FormData();
    form.append("task_type", "async");
    form.append("auto", "1");
    form.append("image", params.imageBuffer, {
      filename: params.imageOriginalName,
      contentType: params.imageMimeType,
    });
    form.append("hair_style", params.hairStyle);
    if (params.hairColor) {
      form.append("color", params.hairColor);
    }
    form.append("image_size", String(params.imageSize ?? 1));

    const response = await axios.post<SubmitResponse>(SUBMIT_URL, form, {
      headers: {
        "ailabapi-api-key": getApiKey(),
        ...form.getHeaders(),
      }
    });

    const payload = response.data;
    if (payload.error_code !== 0) {
      throw new Error(
        `AILab API error: ${payload.error_msg ?? "Unknown error"} (code: ${payload.error_code})`
      );
    }

    const taskId = payload.task_id ?? payload.data?.task_id;
    if (!taskId) {
      throw new Error("AILab API error: Missing task_id in response (code: unknown)");
    }

    return taskId;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError<{ error_msg?: string }>;
      if (err.response) {
        throw new Error(`AILab request failed: ${err.response.data?.error_msg ?? err.message}`);
      }
    }

    throw error;
  }
}

export async function queryTaskResult(taskId: string): Promise<TaskResult> {
  try {
    const response = await axios.post<QueryResponse>(
      QUERY_URL,
      { task_id: taskId },
      {
        headers: {
          "Content-Type": "application/json",
          "ailabapi-api-key": getApiKey(),
        },
      }
    );

    const payload = response.data;

    if (payload.error_code !== 0) {
      return { status: "FAILED", error: payload.error_msg ?? "AILab query failed" };
    }

    const taskStatus = payload.data?.task_status;
    const images = payload.data?.images ?? payload.data?.image_urls;

    if (taskStatus === 2) {
      return {
        status: "SUCCESS",
        imageUrls: images,
      };
    }

    if (taskStatus === 3) {
      return {
        status: "FAILED",
        error: payload.error_detail?.message ?? "Task failed",
      };
    }

    return {
      status: "PENDING",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError<{ error_msg?: string }>;
      if (err.response) {
        return { status: "FAILED", error: err.response.data?.error_msg ?? err.message };
      }
    }

    return {
      status: "FAILED",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const getTaskResult = queryTaskResult;
