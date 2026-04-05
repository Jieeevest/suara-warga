import { badRequest, ok, requireUser } from "@/lib/api";
import { castVote } from "@/lib/repository";
import { decryptEncryptedVote } from "@/lib/vote-crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = (await request.json()) as { encryptedVote?: string };

  if (user.role !== "resident") {
    return badRequest("Hanya warga yang dapat memilih.", 403);
  }
  if (!body.encryptedVote) {
    return badRequest("encryptedVote wajib diisi.");
  }

  try {
    const payload = decryptEncryptedVote(body.encryptedVote);
    castVote(payload.candidateId, user.id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Payload vote gagal didekripsi.";
    return badRequest(message);
  }

  return ok({ success: true });
}
