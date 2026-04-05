import { badRequest, ok, requireSuperAdmin } from "@/lib/api";
import { PASSWORD_POLICY_MESSAGE, validatePasswordStrength } from "@/lib/password-policy";
import { createUser } from "@/lib/repository";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireSuperAdmin();
  const body = (await request.json()) as Partial<User>;

  if (!body.name || !body.username || !body.password) {
    return badRequest("Nama, username, dan password wajib diisi.");
  }
  if (body.role !== "admin" && body.role !== "resident") {
    return badRequest("Role yang diizinkan hanya admin atau resident.");
  }
  if (!validatePasswordStrength(body.password)) {
    return badRequest(PASSWORD_POLICY_MESSAGE);
  }

  const user = createUser({
    name: body.name,
    username: body.username,
    password: body.password,
    role: body.role,
  });

  return ok({ user });
}
