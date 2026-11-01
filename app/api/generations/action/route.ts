import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getGenerationById,
  updateGeneration,
  getRentalById,
  incrementRentalCreditsUsed,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const { generation_id, action } = body; // action: 'keep' | 'discard'

    if (!generation_id || !action) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "BAD_REQUEST", message: "generation_id and action ('keep' | 'discard') are required." },
        },
        { status: 400 }
      );
    }

    const generation = await getGenerationById(generation_id);
    if (!generation) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Generation record not found." } },
        { status: 404 }
      );
    }

    if (action === "keep") {
      let creditsCharged = false;
      // If not already charged (e.g. within the first 10 free previews) and associated with a rental, charge 1 credit
      if (!generation.charged && generation.rental_id) {
        await incrementRentalCreditsUsed(generation.rental_id, 1);
        creditsCharged = true;
      }

      await updateGeneration(generation_id, {
        status: "kept",
        charged: true,
      });

      return NextResponse.json({
        ok: true,
        data: { message: "Prompt kept successfully.", creditsCharged },
      });
    } else if (action === "discard") {
      await updateGeneration(generation_id, {
        status: "discarded",
      });

      return NextResponse.json({
        ok: true,
        data: { message: "Preview discarded." },
      });
    }

    return NextResponse.json(
      { ok: false, error: { code: "INVALID_ACTION", message: "Invalid action." } },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "ACTION_FAILED", message: err.message || "Failed to process generation action." },
      },
      { status: 500 }
    );
  }
}
