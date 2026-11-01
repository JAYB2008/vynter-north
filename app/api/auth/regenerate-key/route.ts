import { NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";
import { updateAccount } from "@/lib/db";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const account = await requireAccount();
    const newKey = randomBytes(24).toString("hex");

    await updateAccount(account.id, { account_key: newKey });

    return NextResponse.json({
      ok: true,
      data: { account_key: newKey, message: "Account key regenerated. Previous MCP endpoints have been retired." },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "KEY_REGENERATE_FAILED", message: error.message || "Failed to regenerate account key." },
      },
      { status: 500 }
    );
  }
}
