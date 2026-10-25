import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY || "dummy-api-key";

export const anthropic = new Anthropic({
  apiKey,
});

export function isAnthropicConfigured(): boolean {
  return Boolean(
    process.env.ANTHROPIC_API_KEY &&
    process.env.ANTHROPIC_API_KEY.trim() !== "" &&
    !process.env.ANTHROPIC_API_KEY.includes("dummy")
  );
}
