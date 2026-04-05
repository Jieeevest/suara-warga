import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";
import { getSessionUserById, getVotingStatus } from "./repository";

const SESSION_COOKIE = "sura_warga_session";

function getSecret() {
  return process.env.AUTH_SECRET || "development-only-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionValue(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseSessionValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentSessionUser() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  const session = parseSessionValue(raw);
  if (!session) {
    return null;
  }

  if (session.role === "resident" && getVotingStatus() !== "active") {
    return null;
  }

  return getSessionUserById(session.role, session.id);
}

export async function setSessionCookie(user: SessionUser) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionValue(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
