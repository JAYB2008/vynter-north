import { NextResponse } from "next/server";
import { requireAccount, generateRecoveryCode, hashRecoveryCode } from "@/lib/auth";
import { updateAccount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const account = await requireAccount();
    const newCode = generateRecoveryCode();
    const newHash = await hashRecoveryCode(newCode);

    await updateAccount(account.id, { recovery_hash: newHash });

    return NextResponse.json({
      ok: true,
      data: { recovery_code: newCode, message: "New recovery code generated successfully." },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "REGENERATE_FAILED", message: error.message || "Failed to regenerate recovery code." },
      },
      { status: 500 }
    );
  }
}
