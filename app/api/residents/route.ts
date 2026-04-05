import { badRequest, ok, requireAdmin } from "@/lib/api";
import { createResident } from "@/lib/repository";
import type { Resident } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as Partial<Resident>;

  if (!body.name || !body.nik) {
    return badRequest("Nama dan NIK wajib diisi.");
  }

  const resident = createResident({
    nik: body.nik,
    name: body.name,
    email: body.email || "",
    birthPlace: body.birthPlace || "",
    gender: (body.gender as Resident["gender"]) || "",
    identityIssuedPlace: body.identityIssuedPlace || "",
    occupation: body.occupation || "",
    address: body.address || "",
    rt: body.rt || "",
    rw: body.rw || "",
    phoneNumber: body.phoneNumber || "",
    status: (body.status as Resident["status"]) || "Aktif",
    block: body.block || "",
  });

  return ok({ resident });
}
