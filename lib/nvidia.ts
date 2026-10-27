/**
 * NVIDIA NIM API Client
 * Base URL: https://integrate.api.nvidia.com/v1
 * Primary Model: meta/llama-3.1-8b-instruct
 * Fallback Model: meta/llama-3.2-11b-vision-instruct
 */

export interface NvidiaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface NvidiaCompletionOptions {
  model?: string;
  messages: NvidiaChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

const DEFAULT_MODELS = [
  "meta/llama-3.1-8b-instruct",
  "meta/llama-3.2-11b-vision-instruct",
  "meta/llama2-70b",
];

export async function callNvidiaNIM(options: NvidiaCompletionOptions): Promise<string> {
  const apiKey =
    process.env.NVIDIA_API_KEY ||
    "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";

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured.");
  }

  const modelsToTry = options.model
    ? [options.model, ...DEFAULT_MODELS.filter((m) => m !== options.model)]
    : DEFAULT_MODELS;

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          max_tokens: options.max_tokens ?? 1500,
          temperature: options.temperature ?? 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If 404 or 410 (model retired/not found on account), continue to next model
        if (response.status === 404 || response.status === 410) {
          lastError = new Error(
            `NVIDIA NIM model ${model} unavailable (${response.status}): ${
              errorData.detail || errorData.title || response.statusText
            }`
          );
          continue;
        }
        throw new Error(
          `NVIDIA NIM API error (${response.status}): ${
            errorData.detail || errorData.title || response.statusText
          }`
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from NVIDIA NIM API.");
      }
      return content;
    } catch (err: any) {
      lastError = err;
      // If network error or fatal error on first attempt, try fallback model if available
      continue;
    }
  }

  throw lastError || new Error("Failed to generate response from NVIDIA NIM.");
}
