function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s+/g, "");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

export async function encryptVotePayload(
  publicKeyPem: string,
  payload: { candidateId: string; issuedAt: number },
) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Browser tidak mendukung Web Crypto API.");
  }

  const publicKey = await subtle.importKey(
    "spki",
    pemToArrayBuffer(publicKeyPem),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  );

  const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
  const encryptedBuffer = await subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encodedPayload,
  );

  return arrayBufferToBase64(encryptedBuffer);
}
