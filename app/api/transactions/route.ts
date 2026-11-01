import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTransactionsByAccount, getCharacters } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    const transactions = await getTransactionsByAccount(session.id);
    const myCharacters = await getCharacters({ owner_id: session.id });

    return NextResponse.json({
      ok: true,
      data: { transactions, characters: myCharacters },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_FAILED", message: err.message || "Failed to fetch transactions." } },
      { status: 500 }
    );
  }
}
