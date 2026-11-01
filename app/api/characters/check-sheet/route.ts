import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAccount();
    const body = await req.json();
    const { sheet } = body;

    if (!sheet || typeof sheet !== "string" || sheet.trim().length < 100) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "SHEET_TOO_SHORT",
            message: "Please write at least 100 characters before running the sheet quality check.",
          },
        },
        { status: 400 }
      );
    }

    const words = sheet.trim().split(/\s+/).filter(Boolean).length;
    const apiKey = process.env.NVIDIA_API_KEY;

    let score = Math.min(95, Math.max(40, Math.round(50 + (words / 1000) * 35)));
    let suggestions = [
      "Add a contradiction between what they show socially and what they do in total privacy.",
      "Specify their exact reaction when caught in an embarrassing or vulnerable mistake.",
      "Detail their physical relationship with danger—do they freeze, get louder, or slow down?",
    ];

    if (apiKey) {
      try {
        const prompt = `Analyze this character personality sheet for depth, specificity, and originality.
Return ONLY valid JSON with:
{
  "specificity_score": (integer 0-100),
  "suggestions": [
    "concrete improvement 1",
    "concrete improvement 2",
    "concrete improvement 3"
  ]
}

SHEET:
${sheet.slice(0, 3000)}`;

        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.NIM_MODEL || "meta/llama-3.1-8b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 400,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || "";
          const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (parsed && typeof parsed.specificity_score === "number" && Array.isArray(parsed.suggestions)) {
            score = parsed.specificity_score;
            suggestions = parsed.suggestions.slice(0, 3);
          }
        }
      } catch (e) {
        console.warn("NIM check-sheet fallback:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        specificity_score: score,
        word_count: words,
        suggestions,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "CHECK_FAILED", message: error.message || "Failed to check sheet." },
      },
      { status: 500 }
    );
  }
}
