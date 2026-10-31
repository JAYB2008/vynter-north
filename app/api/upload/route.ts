import { NextRequest, NextResponse } from "next/server";

import { supabaseServer, isSupabaseServerConfigured } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedBucket = formData.get("bucket") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const isAudio =
      mimeType.startsWith("audio/") ||
      /\.(mp3|wav|m4a|ogg|aac)$/i.test(file.name);
    const bucket = requestedBucket || (isAudio ? "voice-samples" : "character-images");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try Supabase Storage upload if configured
    if (isSupabaseServerConfigured() && supabaseServer) {
      try {
        const fileExt = file.name.split(".").pop() || (isAudio ? "mp3" : "jpg");
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabaseServer.storage
          .from(bucket)
          .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabaseServer.storage.from(bucket).getPublicUrl(filePath);

          return NextResponse.json({
            success: true,
            url: publicUrl,
            bucket,
            filename: file.name,
            size: file.size,
          });
        }
      } catch (storageErr) {
        console.warn("Supabase storage upload failed, falling back to dataUrl:", storageErr);
      }
    }

    // Fallback data URL
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      bucket,
      filename: file.name,
      size: file.size,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
