import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = new Map<string, { value: string; options?: unknown }>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string, options?: unknown) => {
      cookieStore.set(name, { value, options });
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  }),
}));

const repositoryMock = {
  getVotingStatus: vi.fn(),
  getSessionUserById: vi.fn(),
};

vi.mock("./repository", () => repositoryMock);

const { createSessionValue, parseSessionValue, getCurrentSessionUser, setSessionCookie } =
  await import("./auth");

const SESSION_COOKIE = "sura_warga_session";

const adminUser = { id: "u1", name: "Admin", role: "admin" as const, username: "admin1" };
const residentUser = { id: "r1", name: "Warga", role: "resident" as const, username: "3271000001" };

beforeEach(() => {
  cookieStore.clear();
  vi.clearAllMocks();
});

describe("createSessionValue / parseSessionValue (TC-AUTH-01..05)", () => {
  it("TC-AUTH-01: round-trip sign/parse mengembalikan objek identik", () => {
    const value = createSessionValue(adminUser);
    expect(parseSessionValue(value)).toEqual(adminUser);
  });

  it("TC-AUTH-02: cookie di-tamper (payload diubah) -> null", () => {
    const value = createSessionValue(adminUser);
    const [payload, signature] = value.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...adminUser, role: "super_admin" }),
    ).toString("base64url");
    expect(parseSessionValue(`${tamperedPayload}.${signature}`)).toBeNull();
  });

  it("TC-AUTH-03: cookie tanpa separator '.' -> null", () => {
    expect(parseSessionValue("tidak-ada-titik")).toBeNull();
  });

  it("TC-AUTH-04: signature panjang berbeda -> null tanpa exception", () => {
    const value = createSessionValue(adminUser);
    const [payload] = value.split(".");
    expect(() => parseSessionValue(`${payload}.abcd`)).not.toThrow();
    expect(parseSessionValue(`${payload}.abcd`)).toBeNull();
  });

  it("TC-AUTH-05: payload base64url valid tapi bukan JSON -> null tanpa exception", () => {
    const bogusPayload = Buffer.from("bukan json").toString("base64url");
    const crypto = require("node:crypto");
    const signature = crypto
      .createHmac("sha256", process.env.AUTH_SECRET || "development-only-secret")
      .update(bogusPayload)
      .digest("hex");
    expect(() => parseSessionValue(`${bogusPayload}.${signature}`)).not.toThrow();
    expect(parseSessionValue(`${bogusPayload}.${signature}`)).toBeNull();
  });

  it("value undefined -> null", () => {
    expect(parseSessionValue(undefined)).toBeNull();
  });
});

describe("getCurrentSessionUser (TC-AUTH-06, TC-AUTH-07)", () => {
  it("TC-AUTH-06: resident session saat voting status bukan active -> null", async () => {
    const value = createSessionValue(residentUser);
    cookieStore.set(SESSION_COOKIE, { value });
    repositoryMock.getVotingStatus.mockReturnValue("not_started");

    const result = await getCurrentSessionUser();
    expect(result).toBeNull();
  });

  it("TC-AUTH-07: resident session saat voting active -> mengembalikan user", async () => {
    const value = createSessionValue(residentUser);
    cookieStore.set(SESSION_COOKIE, { value });
    repositoryMock.getVotingStatus.mockReturnValue("active");
    repositoryMock.getSessionUserById.mockReturnValue(residentUser);

    const result = await getCurrentSessionUser();
    expect(result).toEqual(residentUser);
  });

  it("admin session tidak terpengaruh status voting", async () => {
    const value = createSessionValue(adminUser);
    cookieStore.set(SESSION_COOKIE, { value });
    repositoryMock.getVotingStatus.mockReturnValue("not_started");
    repositoryMock.getSessionUserById.mockReturnValue(adminUser);

    const result = await getCurrentSessionUser();
    expect(result).toEqual(adminUser);
  });
});

describe("setSessionCookie (TC-AUTH-08)", () => {
  it("TC-AUTH-08: secure flag true hanya saat NODE_ENV=production", async () => {
    const original = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "production";
    await setSessionCookie(adminUser);
    const stored = cookieStore.get(SESSION_COOKIE);
    expect((stored?.options as { secure?: boolean })?.secure).toBe(true);
    (process.env as Record<string, string>).NODE_ENV = original ?? "test";
  });

  it("secure flag false saat bukan production", async () => {
    const original = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "development";
    await setSessionCookie(adminUser);
    const stored = cookieStore.get(SESSION_COOKIE);
    expect((stored?.options as { secure?: boolean })?.secure).toBe(false);
    (process.env as Record<string, string>).NODE_ENV = original ?? "test";
  });
});

describe("AUTH_SECRET fallback (TC-AUTH-09)", () => {
  it("signature berubah mengikuti AUTH_SECRET yang dipakai saat sign", () => {
    const original = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;
    const valueWithDefaultSecret = createSessionValue(adminUser);

    process.env.AUTH_SECRET = "secret-lain";
    const valueWithCustomSecret = createSessionValue(adminUser);

    expect(valueWithDefaultSecret).not.toBe(valueWithCustomSecret);

    delete process.env.AUTH_SECRET;
    expect(parseSessionValue(valueWithCustomSecret)).toBeNull();

    if (original !== undefined) {
      process.env.AUTH_SECRET = original;
    } else {
      delete process.env.AUTH_SECRET;
    }
  });
});
