import { NextRequest, NextResponse } from "next/server";
import { getSkillTemplateById, hasAcquiredSkill } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await getSkillTemplateById(id);
    if (!template) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Skill template not found." } },
        { status: 404 }
      );
    }

    const session = await getSession();
    let isUnlocked = false;

    if (session) {
      if (session.id === template.creator_id) {
        isUnlocked = true;
      } else {
        isUnlocked = await hasAcquiredSkill(template.id, session.id);
      }
    }

    // Section 7.5 rule: Never show full content until acquired!
    const sanitizedTemplate = {
      ...template,
      content: isUnlocked ? template.content : null,
      is_unlocked: isUnlocked,
    };

    return NextResponse.json({
      ok: true,
      data: { template: sanitizedTemplate },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_FAILED", message: err.message || "Failed to load skill template." } },
      { status: 500 }
    );
  }
}
