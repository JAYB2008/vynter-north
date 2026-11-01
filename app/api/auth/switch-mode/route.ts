import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";
import { updateAccount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const account = await requireAccount();
    const body = await req.json();
    const mode = body.mode || body.target_mode;

    if (mode !== "creator" && mode !== "studio") {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_MODE", message: "Mode must be creator or studio." } },
        { status: 400 }
      );
    }

    const updates: any = { active_mode: mode };
    if (mode === "creator") updates.has_creator = true;
    if (mode === "studio") updates.has_studio = true;

    const updated = await updateAccount(account.id, updates);
    if (!updated) {
      throw new Error("Failed to update active mode.");
    }

    const { password_hash: _p, recovery_hash: _r, ...safeAccount } = updated;
    return NextResponse.json({ ok: true, data: safeAccount });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SWITCH_MODE_FAILED", message: error.message || "Failed to switch mode." },
      },
      { status: 500 }
    );
  }
}
