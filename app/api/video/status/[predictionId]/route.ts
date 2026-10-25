import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { updateGenerationLogVideo } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ predictionId: string }> }
) {
  try {
    const { predictionId } = await params;
    const { searchParams } = new URL(request.url);
    const generationLogId = searchParams.get("logId");

    const replicateToken = process.env.REPLICATE_API_TOKEN;

    // Check if it's a real Replicate prediction
    if (!predictionId.startsWith("mock_") && replicateToken && replicateToken.trim() !== "") {
      try {
        const replicate = new Replicate({
          auth: replicateToken,
        });

        const prediction = await replicate.predictions.get(predictionId);

        let videoUrl: string | undefined;
        if (prediction.status === "succeeded" && prediction.output) {
          videoUrl = Array.isArray(prediction.output)
            ? prediction.output[0]
            : (prediction.output as string);

          if (generationLogId && videoUrl) {
            await updateGenerationLogVideo(generationLogId, videoUrl);
          }
        }

        return NextResponse.json({
          status: prediction.status,
          videoUrl,
          error: prediction.error,
        });
      } catch (repErr) {
        console.warn("Replicate status check failed:", repErr);
      }
    }

    // Mock prediction simulation
    const mockRecord = global.__vynterMockPredictions?.get(predictionId);
    if (mockRecord) {
      const elapsed = Date.now() - mockRecord.createdAt;
      let currentStatus: "starting" | "processing" | "succeeded" | "failed" = "starting";

      if (elapsed > 7000) {
        currentStatus = "succeeded";
        if (mockRecord.generationLogId && mockRecord.videoUrl) {
          await updateGenerationLogVideo(mockRecord.generationLogId, mockRecord.videoUrl);
        }
      } else if (elapsed > 2000) {
        currentStatus = "processing";
      }

      mockRecord.status = currentStatus;

      return NextResponse.json({
        status: currentStatus,
        videoUrl: currentStatus === "succeeded" ? mockRecord.videoUrl : undefined,
      });
    }

    return NextResponse.json({
      status: "succeeded",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    });
  } catch (error: unknown) {
    console.error("Error checking video status:", error);
    const message = error instanceof Error ? error.message : "Failed to retrieve status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
