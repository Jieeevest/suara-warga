import { ok, requireAdmin } from "@/lib/api";
import { deleteCandidate, updateCandidate } from "@/lib/repository";
import type { Candidate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as Partial<Candidate>;
  updateCandidate(id, body);
  return ok({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await context.params;
  deleteCandidate(id);
  return ok({ success: true });
}
