import { badRequest, ok, requireAdmin } from "@/lib/api";
import {
  closeVotingSession,
  resetVotingSession,
  setVotingStatus,
  startVotingSession,
} from "@/lib/repository";
import type { VotingStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as {
    status?: VotingStatus;
    reset?: boolean;
    agenda?: string;
    scheduledAt?: string;
  };

  try {
    if (body.reset) {
      resetVotingSession();
      return ok({ success: true });
    }

    if (body.status === "active") {
      startVotingSession({ agenda: body.agenda || "", scheduledAt: body.scheduledAt || "" });
      return ok({ success: true });
    }

    if (body.status === "closed") {
      closeVotingSession();
      return ok({ success: true });
    }

    if (!body.status) {
      return badRequest("Status voting wajib diisi.");
    }

    setVotingStatus(body.status);
    return ok({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui status voting.";
    return badRequest(message);
  }
}
