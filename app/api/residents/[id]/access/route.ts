import { badRequest, ok, requireAdmin } from "@/lib/api";
import { findResidentAccessById } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await context.params;
  const resident = findResidentAccessById(id);

  if (!resident) {
    return badRequest("Data warga tidak ditemukan.", 404);
  }

  if (resident.status !== "Aktif") {
    return badRequest("Hak akses hanya dapat diberikan kepada warga dengan status aktif.");
  }

  return ok({
    resident: {
      name: resident.name,
      nik: resident.nik,
      email: resident.email,
      password: resident.password,
    },
  });
}
