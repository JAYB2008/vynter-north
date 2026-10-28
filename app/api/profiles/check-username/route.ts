import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ available: false, error: "Username required" }, { status: 400 });
  }

  // Basic regex check: lowercase alphanumeric and underscores, length 3-30
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return NextResponse.json({
      available: false,
      error: "Username must be 3-30 characters with lowercase letters, numbers, or underscores.",
    });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      // In case column or table not available yet, allow
      return NextResponse.json({ available: true });
    }

    return NextResponse.json({ available: !data });
  } catch {
    return NextResponse.json({ available: true });
  }
}
