export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Immediately send endpoint URI message
      const endpointMsg = `data: ${JSON.stringify({
        type: "endpoint",
        uri: "/api/mcp/messages",
      })}\n\n`;
      controller.enqueue(encoder.encode(endpointMsg));

      // 2. Heartbeat ping
      const timer = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "ping" })}\n\n`)
          );
        } catch {
          clearInterval(timer);
        }
      }, 30000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
