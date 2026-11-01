import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { voteReviewHelpful } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to vote." } },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;
    const voted = await voteReviewHelpful(reviewId, session.id);

    if (!voted) {
      return NextResponse.json(
        { ok: false, error: { code: "ALREADY_VOTED", message: "You have already voted on this review." } },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data: { voted: true } });
  } catch (err: any) {
    console.error("POST /api/reviews/[id]/vote error:", err);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err.message || "Failed to record vote" } },
      { status: 500 }
    );
  }
}
