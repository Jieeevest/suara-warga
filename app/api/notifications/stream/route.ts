import { badRequest, requireAdmin } from "@/lib/api";
import { VOTE_CAST_EVENT, voteEvents, type VoteCastNotification } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return badRequest("Unauthorized", 401);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: VoteCastNotification) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 25000);

      voteEvents.on(VOTE_CAST_EVENT, send);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        voteEvents.off(VOTE_CAST_EVENT, send);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
