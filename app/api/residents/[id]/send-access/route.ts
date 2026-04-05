import { badRequest, ok, requireAdmin } from "@/lib/api";
import { sendResidentAccessEmail } from "@/lib/mailer";
import { findResidentById } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await context.params;
  const resident = findResidentById(id);

  if (!resident) {
    return badRequest("Data warga tidak ditemukan.", 404);
  }

  if (!resident.email) {
    return badRequest("Email warga belum tersedia.");
  }
  if (resident.status !== "Aktif") {
    return badRequest("Hak akses hanya dapat diberikan kepada warga dengan status aktif.");
  }

  try {
    await sendResidentAccessEmail({
      to: resident.email,
      residentName: resident.name,
      residentNik: resident.nik,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengirim email akses.";
    return badRequest(message, 500);
  }

  return ok({ success: true });
}
