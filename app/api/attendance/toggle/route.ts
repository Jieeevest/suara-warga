import { badRequest, ok, requireAdmin } from "@/lib/api";
import { toggleAttendance } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as { residentId?: string };
  if (!body.residentId) {
    return badRequest("residentId wajib diisi.");
  }

  try {
    toggleAttendance(body.residentId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui kehadiran.";
    return badRequest(message);
  }

  return ok({ success: true });
}
