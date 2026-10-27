import { NextRequest, NextResponse } from "next/server";
import { getAllSkillTemplates, createSkillTemplate } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const templates = await getAllSkillTemplates(category);
    return NextResponse.json({ templates });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch skill templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.title || !body.description || !body.content) {
      return NextResponse.json(
        { error: "Title, description, and template content are required." },
        { status: 400 }
      );
    }

    const template = await createSkillTemplate(body);
    return NextResponse.json({ success: true, template });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create skill template" },
      { status: 500 }
    );
  }
}
