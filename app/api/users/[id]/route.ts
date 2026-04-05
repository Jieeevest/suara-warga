import { badRequest, ok, requireSuperAdmin } from "@/lib/api";
import { PASSWORD_POLICY_MESSAGE, validatePasswordStrength } from "@/lib/password-policy";
import { deleteUser, updateUser } from "@/lib/repository";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireSuperAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as Partial<User>;
  if (body.role && body.role !== "admin" && body.role !== "resident") {
    return badRequest("Role yang diizinkan hanya admin atau resident.");
  }
  if (body.password && !validatePasswordStrength(body.password)) {
    return badRequest(PASSWORD_POLICY_MESSAGE);
  }
  updateUser(id, body);
  return ok({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await requireSuperAdmin();
  const { id } = await context.params;
  if (id === "super-admin") {
    return badRequest("Super admin utama tidak dapat dihapus.", 403);
  }
  deleteUser(id);
  return ok({ success: true });
}
