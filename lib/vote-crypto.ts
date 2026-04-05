import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  privateDecrypt,
  constants,
} from "node:crypto";

interface VotePayload {
  candidateId: string;
  issuedAt: number;
}

const privateKeyPem = process.env.VOTING_RSA_PRIVATE_KEY;
const publicKeyPem = process.env.VOTING_RSA_PUBLIC_KEY;

const keyPair = (() => {
  if (privateKeyPem && publicKeyPem) {
    return {
      privateKey: createPrivateKey(privateKeyPem),
      publicKey: createPublicKey(publicKeyPem),
    };
  }

  return generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
})();

export function getVotingPublicKey() {
  if (typeof keyPair.publicKey === "string") {
    return keyPair.publicKey;
  }

  return keyPair.publicKey.export({
    type: "spki",
    format: "pem",
  }) as string;
}

export function decryptEncryptedVote(encryptedVote: string): VotePayload {
  const privateKey =
    typeof keyPair.privateKey === "string"
      ? createPrivateKey(keyPair.privateKey)
      : keyPair.privateKey;

  const decryptedBuffer = privateDecrypt(
    {
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encryptedVote, "base64"),
  );

  const payload = JSON.parse(decryptedBuffer.toString("utf8")) as Partial<VotePayload>;

  if (!payload.candidateId || typeof payload.candidateId !== "string") {
    throw new Error("Payload vote tidak valid.");
  }

  if (!payload.issuedAt || typeof payload.issuedAt !== "number") {
    throw new Error("Timestamp vote tidak valid.");
  }

  const maxAgeMs = 5 * 60 * 1000;
  if (Math.abs(Date.now() - payload.issuedAt) > maxAgeMs) {
    throw new Error("Payload vote sudah kedaluwarsa.");
  }

  return {
    candidateId: payload.candidateId,
    issuedAt: payload.issuedAt,
  };
}
