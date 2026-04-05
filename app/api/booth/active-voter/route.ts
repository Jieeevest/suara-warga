import { badRequest, ok, requireAdmin } from "@/lib/api";
import { setActiveVoter } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as { residentId?: string | null };
  try {
    setActiveVoter(body.residentId || null);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memperbarui akses bilik.";
    return badRequest(message);
  }
  return ok({ success: true });
}
