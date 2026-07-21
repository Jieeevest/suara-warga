import { publicEncrypt, constants } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptEncryptedVote, getVotingPublicKey } from "./vote-crypto";

function encryptPayload(payload: unknown) {
  const buffer = Buffer.from(JSON.stringify(payload), "utf8");
  return publicEncrypt(
    {
      key: getVotingPublicKey(),
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer,
  ).toString("base64");
}

describe("vote-crypto", () => {
  it("TC-CRYPTO-01: round-trip encrypt-decrypt mengembalikan payload identik", () => {
    const now = Date.now();
    const encrypted = encryptPayload({ candidateId: "C1", issuedAt: now });
    const result = decryptEncryptedVote(encrypted);
    expect(result).toEqual({ candidateId: "C1", issuedAt: now });
  });

  it("TC-CRYPTO-02: ciphertext acak/korup melempar error", () => {
    expect(() => decryptEncryptedVote("bukan-ciphertext-valid")).toThrow();
  });

  it("TC-CRYPTO-03: candidateId hilang -> Payload vote tidak valid.", () => {
    const encrypted = encryptPayload({ issuedAt: Date.now() });
    expect(() => decryptEncryptedVote(encrypted)).toThrow("Payload vote tidak valid.");
  });

  it("TC-CRYPTO-04: candidateId bukan string -> Payload vote tidak valid.", () => {
    const encrypted = encryptPayload({ candidateId: 123, issuedAt: Date.now() });
    expect(() => decryptEncryptedVote(encrypted)).toThrow("Payload vote tidak valid.");
  });

  it("TC-CRYPTO-05: issuedAt hilang -> Timestamp vote tidak valid.", () => {
    const encrypted = encryptPayload({ candidateId: "C1" });
    expect(() => decryptEncryptedVote(encrypted)).toThrow("Timestamp vote tidak valid.");
  });

  it("TC-CRYPTO-06: issuedAt = 0 -> Timestamp vote tidak valid.", () => {
    const encrypted = encryptPayload({ candidateId: "C1", issuedAt: 0 });
    expect(() => decryptEncryptedVote(encrypted)).toThrow("Timestamp vote tidak valid.");
  });

  it("TC-CRYPTO-07: issuedAt kedaluwarsa (>5 menit lalu) -> Payload vote sudah kedaluwarsa.", () => {
    const encrypted = encryptPayload({
      candidateId: "C1",
      issuedAt: Date.now() - 6 * 60 * 1000,
    });
    expect(() => decryptEncryptedVote(encrypted)).toThrow("Payload vote sudah kedaluwarsa.");
  });

  it("TC-CRYPTO-08: issuedAt di masa depan (>5 menit) -> Payload vote sudah kedaluwarsa.", () => {
    const encrypted = encryptPayload({
      candidateId: "C1",
      issuedAt: Date.now() + 6 * 60 * 1000,
    });
    expect(() => decryptEncryptedVote(encrypted)).toThrow("Payload vote sudah kedaluwarsa.");
  });

  describe("boundary window 5 menit (waktu dibekukan dengan fake timer agar deterministik)", () => {
    const frozenNow = 1_752_600_000_000;

    afterEach(() => {
      vi.useRealTimers();
    });

    it("TC-CRYPTO-09a: boundary 299999ms (di dalam window) diterima", () => {
      const encrypted = encryptPayload({ candidateId: "C1", issuedAt: frozenNow - 299999 });
      vi.useFakeTimers();
      vi.setSystemTime(frozenNow);
      expect(() => decryptEncryptedVote(encrypted)).not.toThrow();
    });

    it("TC-CRYPTO-09b: boundary tepat 300000ms masih diterima (inklusif)", () => {
      const encrypted = encryptPayload({ candidateId: "C1", issuedAt: frozenNow - 300000 });
      vi.useFakeTimers();
      vi.setSystemTime(frozenNow);
      expect(() => decryptEncryptedVote(encrypted)).not.toThrow();
    });

    it("TC-CRYPTO-09c: boundary 300001ms ditolak", () => {
      const encrypted = encryptPayload({ candidateId: "C1", issuedAt: frozenNow - 300001 });
      vi.useFakeTimers();
      vi.setSystemTime(frozenNow);
      expect(() => decryptEncryptedVote(encrypted)).toThrow("Payload vote sudah kedaluwarsa.");
    });
  });

  it("TC-CRYPTO-10: payload sama didekripsi 2x dalam window valid, keduanya sukses (replay protection bukan tanggung jawab layer ini)", () => {
    const encrypted = encryptPayload({ candidateId: "C1", issuedAt: Date.now() });
    const first = decryptEncryptedVote(encrypted);
    const second = decryptEncryptedVote(encrypted);
    expect(first).toEqual(second);
  });

  it("getVotingPublicKey() mengembalikan string PEM valid", () => {
    const pem = getVotingPublicKey();
    expect(pem).toContain("-----BEGIN PUBLIC KEY-----");
  });
});
