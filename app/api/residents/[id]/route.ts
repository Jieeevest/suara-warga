import { ok, requireAdmin } from "@/lib/api";
import { deleteResident, updateResident } from "@/lib/repository";
import type { Resident } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as Partial<Resident>;
  updateResident(id, body);
  return ok({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await context.params;
  deleteResident(id);
  return ok({ success: true });
}
