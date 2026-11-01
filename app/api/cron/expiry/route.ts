import { NextRequest, NextResponse } from "next/server";
import { getRentalsList, createNotification, getCharacterById } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET || process.env.SESSION_SECRET;

    // Optional bearer secret check if CRON_SECRET is configured
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Invalid cron secret" } },
        { status: 401 }
      );
    }

    const rentals = await getRentalsList();
    const now = new Date();
    let remindersCreated = 0;

    for (const rental of rentals) {
      if (!rental.expires_at || rental.ended_early) continue;

      const expiresAt = new Date(rental.expires_at);
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // 5-day warning
      if (diffDays === 5) {
        const char = await getCharacterById(rental.character_id);
        await createNotification({
          account_id: rental.studio_id,
          type: "rental_expiry_warning",
          title: "Rental expiring in 5 days",
          body: `Your rental for ${char?.name || "a character"} expires in 5 days. Renew now to avoid interruption.`,
          link: `/studio/library/${rental.id}`,
        });
        remindersCreated++;
      } else if (diffDays === 1) {
        // 1-day warning
        const char = await getCharacterById(rental.character_id);
        await createNotification({
          account_id: rental.studio_id,
          type: "rental_expiry_warning",
          title: "Rental expires tomorrow",
          body: `Your rental for ${char?.name || "a character"} expires tomorrow. Top up or renew in your library.`,
          link: `/studio/library/${rental.id}`,
        });
        remindersCreated++;
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        processed_rentals: rentals.length,
        reminders_created: remindersCreated,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("GET /api/cron/expiry error:", err);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err.message || "Cron run failed" } },
      { status: 500 }
    );
  }
}
