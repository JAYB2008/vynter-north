import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, isSupabaseConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to upload files.",
          },
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string) || "image"; // 'image' | 'audio' | 'doc'

    if (!file) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NO_FILE", message: "Please select a file to upload." },
        },
        { status: 400 }
      );
    }

    const mime = file.type.toLowerCase();
    const size = file.size;
    const name = file.name.toLowerCase();

    // Section 2 Validations:
    // Images: <= 8 MB, jpg/png/webp
    // Audio: <= 15 MB, mp3/wav/m4a
    // Docs: <= 10 MB, pdf/jpg/png
    if (kind === "image") {
      const isAllowedMime = ["image/jpeg", "image/png", "image/webp"].includes(mime);
      const isAllowedExt = /\.(jpe?g|png|webp)$/i.test(name);
      if (!isAllowedMime && !isAllowedExt) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_FILE_TYPE",
              message: "Images must be in JPG, PNG, or WebP format.",
            },
          },
          { status: 400 }
        );
      }
      if (size > 8 * 1024 * 1024) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "FILE_TOO_LARGE",
              message: "Image files cannot exceed 8 MB.",
            },
          },
          { status: 400 }
        );
      }
    } else if (kind === "audio") {
      const isAllowedMime = [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/m4a",
        "audio/x-m4a",
        "audio/aac",
      ].includes(mime);
      const isAllowedExt = /\.(mp3|wav|m4a)$/i.test(name);
      if (!isAllowedMime && !isAllowedExt) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_FILE_TYPE",
              message: "Audio samples must be MP3, WAV, or M4A format.",
            },
          },
          { status: 400 }
        );
      }
      if (size > 15 * 1024 * 1024) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "FILE_TOO_LARGE",
              message: "Audio sample files cannot exceed 15 MB.",
            },
          },
          { status: 400 }
        );
      }
    } else if (kind === "doc") {
      const isAllowedMime = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ].includes(mime);
      const isAllowedExt = /\.(pdf|jpe?g|png)$/i.test(name);
      if (!isAllowedMime && !isAllowedExt) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_FILE_TYPE",
              message: "Documents must be in PDF, JPG, or PNG format.",
            },
          },
          { status: 400 }
        );
      }
      if (size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "FILE_TOO_LARGE",
              message: "Document files cannot exceed 10 MB.",
            },
          },
          { status: 400 }
        );
      }
    }

    const isPublic = kind === "image";
    const bucket = isPublic ? "vn-public" : "vn-private";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = name.split(".").pop() || (kind === "audio" ? "mp3" : "jpg");
    const filePath = `${session.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    if (isSupabaseConfigured && supabaseServer) {
      try {
        const { error: uploadErr } = await supabaseServer.storage
          .from(bucket)
          .upload(filePath, buffer, {
            contentType: mime,
            upsert: true,
          });

        if (!uploadErr) {
          if (isPublic) {
            const {
              data: { publicUrl },
            } = supabaseServer.storage.from(bucket).getPublicUrl(filePath);
            return NextResponse.json({
              ok: true,
              data: { url: publicUrl, path: filePath, filename: file.name },
            });
          } else {
            // Private storage path
            return NextResponse.json({
              ok: true,
              data: { path: filePath, bucket, filename: file.name },
            });
          }
        }
      } catch (storageErr) {
        console.warn("Storage upload error:", storageErr);
      }
    }

    // Fallback in-memory / data URL
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({
      ok: true,
      data: {
        url: dataUrl,
        path: filePath,
        filename: file.name,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UPLOAD_FAILED",
          message: err.message || "Failed to upload file.",
        },
      },
      { status: 500 }
    );
  }
}
