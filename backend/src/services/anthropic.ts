import { AppError } from "../middleware/errorHandler";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicResponse = {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AppError("ANTHROPIC_API_KEY is not configured", 500);
  }
  return apiKey;
}

export async function getHairstyleAdvice(
  imageBase64: string,
  imageMediaType: "image/jpeg" | "image/png",
  hairstyleName: string
): Promise<string> {
  try {
    const apiKey = getApiKey();
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: imageMediaType,
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: `You are a professional hairstyle consultant. The person wants a ${hairstyleName} hairstyle. Analyze their facial features and provide: 1) Whether it suits their face shape, 2) How it would look on them specifically, 3) Exact instructions to tell their hairdresser, 4) Maintenance tips. Be encouraging and specific. Max 200 words.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new AppError(`getHairstyleAdvice: Anthropic HTTP ${response.status}`, response.status);
    }

    let payload: AnthropicResponse;
    try {
      payload = (await response.json()) as AnthropicResponse;
    } catch {
      throw new AppError("getHairstyleAdvice: invalid JSON response from Anthropic", 502);
    }

    const adviceText = payload.content?.[0]?.text;
    if (!adviceText) {
      throw new AppError("getHairstyleAdvice: missing advice text in Anthropic response", 502);
    }

    return adviceText;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    throw new AppError(`getHairstyleAdvice failed: ${message}`, 500);
  }
}
