import { NextResponse } from "next/server";
import { getAllGenerationLogs } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await getAllGenerationLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
