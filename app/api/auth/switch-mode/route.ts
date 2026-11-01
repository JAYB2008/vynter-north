import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";
import { updateAccount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const account = await requireAccount();
    const body = await req.json();
    const { mode } = body;

    if (mode !== "creator" && mode !== "studio") {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_MODE", message: "Mode must be creator or studio." } },
        { status: 400 }
      );
    }

    if (mode === "creator" && !account.has_creator) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "ROLE_NOT_INITIALIZED",
            message: "Creator profile is not initialized. Please add the Creator role first.",
          },
        },
        { status: 403 }
      );
    }

    if (mode === "studio" && !account.has_studio) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "ROLE_NOT_INITIALIZED",
            message: "Studio profile is not initialized. Please add the Studio role first.",
          },
        },
        { status: 403 }
      );
    }

    const updated = await updateAccount(account.id, { active_mode: mode });
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
