import { NextRequest, NextResponse } from "next/server";
import { checkCharacterNameAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name || name.trim() === "") {
      return NextResponse.json({ available: true, message: "Please provide a name" });
    }

    const available = await checkCharacterNameAvailable(name);
    return NextResponse.json({ available });
  } catch (error) {
    console.error("Error checking character name:", error);
    return NextResponse.json({ error: "Failed to check name availability" }, { status: 500 });
  }
}
