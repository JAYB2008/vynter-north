import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "You must be signed in." } },
        { status: 401 }
      );
    }

    const list = await getNotifications(session.id);
    const unreadCount = list.filter((n) => !n.read).length;

    return NextResponse.json({
      ok: true,
      data: {
        notifications: list,
        unread_count: unreadCount,
      },
    });
  } catch (err: any) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err.message || "Failed to load notifications" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "You must be signed in." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, id } = body;

    if (action === "mark_all_read") {
      await markAllNotificationsRead(session.id);
      return NextResponse.json({ ok: true, data: { success: true } });
    }

    if (id) {
      await markNotificationRead(id);
      return NextResponse.json({ ok: true, data: { success: true } });
    }

    return NextResponse.json(
      { ok: false, error: { code: "BAD_REQUEST", message: "Invalid action or id." } },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("POST /api/notifications error:", err);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: err.message || "Failed to update notification" } },
      { status: 500 }
    );
  }
}
