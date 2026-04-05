import { badRequest, ok, requireAdmin } from "@/lib/api";
import { resetVotingSession, setVotingStatus } from "@/lib/repository";
import type { VotingStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as { status?: VotingStatus; reset?: boolean };

  if (body.reset) {
    resetVotingSession();
    return ok({ success: true });
  }

  if (!body.status) {
    return badRequest("Status voting wajib diisi.");
  }

  setVotingStatus(body.status);
  return ok({ success: true });
}
