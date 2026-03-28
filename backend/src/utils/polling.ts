import { getTaskResult } from "../services/ailab";

type PollOptions = {
  intervalMs?: number;
  timeoutMs?: number;
};

export async function pollUntilDone(
  taskId: string,
  options: PollOptions = {}
): Promise<{ imageUrl: string }> {
  const intervalMs = options.intervalMs ?? 3000;
  const timeoutMs = options.timeoutMs ?? 120000;
  const startedAt = Date.now();
  let attempts = 0;

  try {
    return await new Promise<{ imageUrl: string }>((resolve, reject) => {
      const execute = async (): Promise<void> => {
        attempts += 1;
        console.log(`Polling taskId ${taskId}... attempt ${attempts}`);

        try {
          const result = await getTaskResult(taskId);

          if (result.status === "SUCCESS") {
            const imageUrl = result.imageUrls?.[0];
            if (!imageUrl) {
              reject(new Error("Task completed without image URL"));
              return;
            }
            resolve({ imageUrl });
            return;
          }

          if (result.status === "FAILED") {
            reject(new Error(`Task failed: ${result.error ?? "Unknown error"}`));
            return;
          }

          if (Date.now() - startedAt >= timeoutMs) {
            reject(new Error("Polling timeout after 2 minutes"));
            return;
          }

          setTimeout(() => {
            void execute();
          }, intervalMs);
        } catch (error) {
          reject(error);
        }
      };

      void execute();
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`pollUntilDone failed: ${message}`);
  }
}
