import { badRequest, ok } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth";
import {
  findResidentByNik,
  findResidentSessionByCredentials,
  findUserByCredentials,
  getVotingStatus,
} from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!body.username || !body.password) {
    return badRequest("Username dan password wajib diisi.");
  }

  const adminUser = findUserByCredentials(body.username, body.password);
  const resident = adminUser ? null : findResidentByNik(body.username);

  if (
    !adminUser &&
    resident &&
    body.password === "password" &&
    resident.status !== "Aktif"
  ) {
    return badRequest(
      "Akses e-voting hanya tersedia untuk warga dengan status aktif.",
      403,
    );
  }

  const sessionUser = adminUser
    ? {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role,
        username: adminUser.username,
      }
    : findResidentSessionByCredentials(body.username, body.password);

  if (!sessionUser) {
    return badRequest("Username atau password salah.", 401);
  }

  if (sessionUser.role === "resident" && getVotingStatus() !== "active") {
    return badRequest("Akses warga hanya dapat digunakan saat acara voting sedang aktif.", 403);
  }

  await setSessionCookie(sessionUser);
  return ok({ success: true, user: sessionUser });
}
