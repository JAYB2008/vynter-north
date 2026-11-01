import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getCastingApplications,
  updateCastingApplicationStatus,
  getCharacterById,
  createNotification,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applications = await getCastingApplications(id);

    return NextResponse.json({
      ok: true,
      data: { applications },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "FETCH_FAILED", message: err.message || "Failed to fetch applications." } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { application_id, action, character_id } = body; // action: 'shortlist' | 'decline' | 'invite'

    if (action === "invite" && character_id) {
      const character = await getCharacterById(character_id);
      if (character) {
        // Send notification inviting creator to rent character
        await createNotification({
          account_id: character.owner_id,
          type: "casting_invitation",
          title: "Casting Call Invitation!",
          body: `@${session.username} shortlisted ${character.name} and invited you to discuss rental terms.`,
          link: `/characters/${character.id}`,
        });
      }
      return NextResponse.json({
        ok: true,
        data: { message: "Invitation sent to creator." },
      });
    }

    if (action === "shortlist" || action === "decline") {
      const status = action === "shortlist" ? "shortlisted" : "declined";
      await updateCastingApplicationStatus(application_id, status);
      return NextResponse.json({
        ok: true,
        data: { message: `Application ${status}.` },
      });
    }

    return NextResponse.json(
      { ok: false, error: { code: "BAD_REQUEST", message: "Invalid action." } },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_FAILED", message: err.message || "Failed to update application." } },
      { status: 500 }
    );
  }
}
