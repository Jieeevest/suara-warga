import { NextResponse } from "next/server";
import type { SessionUser } from "./types";
import { getCurrentSessionUser } from "./auth";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUser() {
  const user = await getCurrentSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
