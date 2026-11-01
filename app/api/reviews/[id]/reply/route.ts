import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { replyReview, getReviews, getCharacterById } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to reply." } },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;
    const body = await req.json();
    const replyText = (body.reply || "").trim();

    if (!replyText) {
      return NextResponse.json(
        { ok: false, error: { code: "EMPTY_REPLY", message: "Reply text cannot be empty." } },
        { status: 400 }
      );
    }

    // Check review and verify current user is character owner
    // We can find the review
    const allReviews = await getReviews();
    const review = allReviews.find((r) => r.id === reviewId);
    if (!review) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Review not found." } },
        { status: 404 }
      );
    }

    const character = await getCharacterById(review.character_id);
    if (!character || character.owner_id !== session.id) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Only the character creator can reply to this review." } },
        { status: 403 }
      );
    }

    if (review.creator_reply) {
      return NextResponse.json(
        { ok: false, error: { code: "ALREADY_REPLIED", message: "Creators can only post one reply per review." } },
        { status: 400 }
      );
    }

    const updated = await replyReview(reviewId, replyText);
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    console.error("POST /api/reviews/[id]/reply error:", err);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err.message || "Failed to post reply" } },
      { status: 500 }
    );
  }
}
