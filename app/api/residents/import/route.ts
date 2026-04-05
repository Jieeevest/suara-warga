import { badRequest, ok, requireAdmin } from "@/lib/api";
import { getVotingStatus, importResidents } from "@/lib/repository";
import type { Resident } from "@/lib/types";

export const dynamic = "force-dynamic";

type ImportResidentRow = Pick<
  Resident,
  | "nik"
  | "name"
  | "birthPlace"
  | "gender"
  | "identityIssuedPlace"
  | "occupation"
>;

function normalizeGender(input: unknown): Resident["gender"] {
  const value = String(input || "")
    .trim()
    .toLowerCase();

  if (["l", "laki-laki", "laki laki", "male", "pria"].includes(value)) {
    return "Laki-laki";
  }

  if (["p", "perempuan", "female", "wanita"].includes(value)) {
    return "Perempuan";
  }

  return "";
}

export async function POST(request: Request) {
  await requireAdmin();

  if (getVotingStatus() === "active") {
    return badRequest("Import data warga dikunci selama sesi voting sedang aktif.", 403);
  }

  const body = (await request.json()) as { residents?: ImportResidentRow[] };
  const rows = Array.isArray(body.residents) ? body.residents : [];

  if (rows.length === 0) {
    return badRequest("File Excel tidak berisi data warga yang dapat diimpor.");
  }

  const sanitizedRows = rows
    .map((row) => ({
      nik: String(row.nik || "").trim(),
      name: String(row.name || "").trim(),
      birthPlace: String(row.birthPlace || "").trim(),
      gender: normalizeGender(row.gender),
      identityIssuedPlace: String(row.identityIssuedPlace || "").trim(),
      occupation: String(row.occupation || "").trim(),
    }))
    .filter((row) => row.nik && row.name);

  if (sanitizedRows.length === 0) {
    return badRequest("Data Excel wajib memiliki kolom Nama dan NIK yang valid.");
  }

  const duplicateNiks = new Set<string>();
  const seenNiks = new Set<string>();
  for (const row of sanitizedRows) {
    if (seenNiks.has(row.nik)) {
      duplicateNiks.add(row.nik);
    }
    seenNiks.add(row.nik);
  }

  if (duplicateNiks.size > 0) {
    return badRequest(
      `Terdapat NIK duplikat di file Excel: ${Array.from(duplicateNiks).join(", ")}`,
    );
  }

  const result = importResidents(
    sanitizedRows.map((row) => ({
      ...row,
      email: "",
      address: "",
      rt: "",
      rw: "",
      phoneNumber: "",
      status: "Aktif" as const,
      block: "",
    })),
  );

  return ok(result);
}
