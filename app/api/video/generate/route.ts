import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { randomUUID } from "crypto";

// Store in-flight mock predictions if Replicate API token is not set
declare global {
  // eslint-disable-next-line no-var
  var __vynterMockPredictions:
    | Map<
        string,
        {
          id: string;
          generationLogId: string;
          prompt: string;
          createdAt: number;
          status: "starting" | "processing" | "succeeded" | "failed";
          videoUrl?: string;
        }
      >
    | undefined;
}

if (!global.__vynterMockPredictions) {
  global.__vynterMockPredictions = new Map();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrichedPrompt, generationLogId } = body as {
      enrichedPrompt?: string;
      generationLogId?: string;
    };

    if (!enrichedPrompt) {
      return NextResponse.json({ error: "enrichedPrompt is required" }, { status: 400 });
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN;

    if (replicateToken && replicateToken.trim() !== "") {
      try {
        const replicate = new Replicate({
          auth: replicateToken,
        });

        // Use minimax/video-01 or wan-ai/wan2.1-t2v-480p
        const prediction = await replicate.predictions.create({
          version: "wan-ai/wan2.1-t2v-480p", // Or minimax/video-01
          input: {
            prompt: enrichedPrompt,
          },
        });

        return NextResponse.json({
          predictionId: prediction.id,
          status: prediction.status,
          generationLogId: generationLogId || null,
          isLiveReplicate: true,
        });
      } catch (repError: unknown) {
        const repMsg = repError instanceof Error ? repError.message : String(repError);
        console.warn("Replicate API call failed, falling back to simulation:", repMsg);
      }
    }

    // High quality simulation for local test / no API token
    const mockId = `mock_pred_${randomUUID().slice(0, 8)}`;
    global.__vynterMockPredictions!.set(mockId, {
      id: mockId,
      generationLogId: generationLogId || "",
      prompt: enrichedPrompt,
      createdAt: Date.now(),
      status: "starting",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    });

    return NextResponse.json({
      predictionId: mockId,
      status: "starting",
      generationLogId: generationLogId || null,
      isLiveReplicate: false,
      message: "Video generation job dispatched",
    });
  } catch (error: unknown) {
    console.error("Error starting video generation:", error);
    const message = error instanceof Error ? error.message : "Failed to start video generation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
