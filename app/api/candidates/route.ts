import { badRequest, ok, requireAdmin } from "@/lib/api";
import { createCandidate, getVotingStatus } from "@/lib/repository";
import type { Candidate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();
  if (getVotingStatus() === "active") {
    return badRequest("Tidak dapat menambah kandidat saat e-voting sedang berjalan.", 403);
  }

  const body = (await request.json()) as Partial<Candidate>;

  if (!body.name || !body.number) {
    return badRequest("Nomor urut dan nama kandidat wajib diisi.");
  }

  const candidate = createCandidate({
    number: Number(body.number),
    name: body.name,
    vision: body.vision || "",
    mission: body.mission || "",
    imageUrl:
      body.imageUrl || `https://i.pravatar.cc/300?u=${encodeURIComponent(body.name)}`,
  });

  return ok({ candidate });
}
