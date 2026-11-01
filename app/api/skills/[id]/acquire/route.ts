import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSkillTemplateById, acquireSkill } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const template = await getSkillTemplateById(id);
    if (!template) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Template not found." } },
        { status: 404 }
      );
    }

    await acquireSkill(template.id, session.id, template.price_cents);

    return NextResponse.json({
      ok: true,
      data: {
        message: "Template unlocked successfully.",
        content: template.content,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "ACQUISITION_FAILED", message: err.message || "Failed to acquire template." } },
      { status: 500 }
    );
  }
}
