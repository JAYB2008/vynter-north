import { NextRequest, NextResponse } from "next/server";
import { getRentalById, updateRentalStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rental = await getRentalById(id);
    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }
    return NextResponse.json({ rental });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch rental" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await updateRentalStatus(id, "cancelled");
    return NextResponse.json({ success: true, message: "Rental cancelled" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to cancel rental" },
      { status: 500 }
    );
  }
}
