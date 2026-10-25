import { NextResponse } from "next/server";
import { getAllCharacters } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const characters = await getAllCharacters();
    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Error fetching characters:", error);
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}
