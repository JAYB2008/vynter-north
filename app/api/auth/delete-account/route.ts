import { NextRequest, NextResponse } from "next/server";
import { requireAccount, clearSessionCookie } from "@/lib/auth";
import { deleteAccount, checkAccountDeletionEligibility } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const account = await requireAccount();
    const body = await req.json();
    const { usernameConfirmation } = body;

    if (
      !usernameConfirmation ||
      usernameConfirmation.trim().toLowerCase() !== account.username.toLowerCase()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CONFIRMATION_MISMATCH",
            message: "Please type your exact username to confirm deletion.",
          },
        },
        { status: 400 }
      );
    }

    const check = await checkAccountDeletionEligibility(account.id);
    if (!check.eligible) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "DELETION_BLOCKED",
            message: `${check.reason || "Account cannot be deleted while rentals are active."} Deletion will be eligible on ${check.availableDate || "a later date"}.`,
          },
        },
        { status: 409 }
      );
    }

    await deleteAccount(account.id);
    await clearSessionCookie();

    return NextResponse.json({
      ok: true,
      data: { message: "Account and associated data deleted permanently." },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "DELETE_FAILED", message: error.message || "Failed to delete account." },
      },
      { status: 500 }
    );
  }
}
