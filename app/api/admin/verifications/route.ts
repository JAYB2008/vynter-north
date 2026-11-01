import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { getAllAccounts, updateAccount, createNotification } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Admin privileges required." } },
        { status: 403 }
      );
    }

    const accounts = await getAllAccounts();
    const verifications = accounts.filter(
      (a) => a.verification_status !== "none" || a.verification_link || a.verification_doc_path
    );

    return NextResponse.json({
      ok: true,
      data: { verifications },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_FAILED", message: err.message || "Failed to fetch verifications." } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Admin privileges required." } },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { account_id, status } = body; // 'verified' | 'rejected'

    if (!account_id || !status) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "account_id and status required." } },
        { status: 400 }
      );
    }

    await updateAccount(account_id, {
      verification_status: status,
    });

    await createNotification({
      account_id,
      type: "verification_decision",
      title: status === "verified" ? "Studio Verified!" : "Verification Update",
      body: status === "verified"
        ? "Your studio profile has been verified. The verified badge is now visible on your roster."
        : "Your studio verification application was not approved. You may update your portfolio documentation in Settings.",
      link: "/dashboard/settings",
    });

    return NextResponse.json({
      ok: true,
      data: { message: `Account verification set to ${status}.` },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_FAILED", message: err.message || "Failed to update verification." } },
      { status: 500 }
    );
  }
}
