import { NextRequest, NextResponse } from "next/server";
import { getSkillTemplates, createSkillTemplate } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const rawTemplates = await getSkillTemplates(category);

    // Filter by search if provided
    let templates = rawTemplates;
    if (search) {
      const s = search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.summary.toLowerCase().includes(s) ||
          t.tags.some((tag) => tag.toLowerCase().includes(s))
      );
    }

    // Never return full content on public catalog listing
    const sanitized = templates.map((t) => ({
      ...t,
      content: "", // Private
    }));

    return NextResponse.json({
      ok: true,
      data: { templates: sanitized },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_FAILED", message: err.message || "Failed to fetch skills." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required to create templates." } },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      category = "personality",
      summary,
      what_it_adds = [],
      sample_scene,
      sample_output,
      preview_excerpt,
      content,
      tags = [],
      price_cents = 0,
    } = body;

    if (!title || !summary || !content) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "Title, summary, and content are required." } },
        { status: 400 }
      );
    }

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const excerpt = preview_excerpt || content.slice(0, 400) + "…";

    const newTemplate = await createSkillTemplate({
      creator_id: session.id,
      title: title.trim(),
      category: category as any,
      summary: summary.trim(),
      what_it_adds,
      sample_scene: sample_scene || null,
      sample_output: sample_output || null,
      preview_excerpt: excerpt,
      content,
      tags,
      price_cents: Math.min(1500, Math.max(0, parseInt(price_cents) || 0)),
      word_count: wordCount,
      installs: 0,
    });

    return NextResponse.json({
      ok: true,
      data: { template: newTemplate },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "CREATION_FAILED", message: err.message || "Failed to create skill template." } },
      { status: 500 }
    );
  }
}
