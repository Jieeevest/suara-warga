import { generateKeyPairSync, publicEncrypt, privateDecrypt, constants } from "node:crypto";

// Kunci demo khusus untuk bukti BAB IV — dibuat sekali di memori proses ini saja,
// tidak ditulis ke .env, tidak dipakai oleh sistem live.
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
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

console.log("=== KUNCI PUBLIK RSA (PEM, 2048-bit) ===");
console.log(publicKey);

function encrypt(payload) {
  const buffer = Buffer.from(JSON.stringify(payload), "utf8");
  return publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer,
  );
}

function decrypt(ciphertextBuffer) {
  return privateDecrypt(
    {
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    ciphertextBuffer,
  );
}

const payload = { candidateId: "A", issuedAt: 1784531896095 };

console.log("=== BUKTI SEMANTIC SECURITY (OAEP): 2x enkripsi payload sama ===");
console.log("Payload:", JSON.stringify(payload));

const ciphertext1 = encrypt(payload);
const ciphertext2 = encrypt(payload);

console.log("Ciphertext #1 (hex):", ciphertext1.toString("hex"));
console.log("Ciphertext #2 (hex):", ciphertext2.toString("hex"));
console.log("Kedua ciphertext identik?", ciphertext1.equals(ciphertext2) ? "Ya" : "Tidak (sesuai ekspektasi OAEP)");

console.log("");
console.log("=== ALUR LENGKAP (memakai ciphertext #1) ===");

console.log("Tahap 1 - Plaintext:", JSON.stringify(payload));

const ciphertextHex = ciphertext1.toString("hex");
console.log("Tahap 2 - Ciphertext (hex):", ciphertextHex);
console.log("Tahap 2 - Panjang ciphertext:", ciphertext1.length, "byte");

const base64 = ciphertext1.toString("base64");
console.log("Tahap 3 - Base64:", base64);
console.log("Tahap 3 - Panjang string:", base64.length, "karakter");

const decodedBuffer = Buffer.from(base64, "base64");
const decodedHex = decodedBuffer.toString("hex");
console.log("Tahap 4 - Hasil decode Base64 (hex):", decodedHex);
console.log("Tahap 4 - Identik dengan Tahap 2?", decodedHex === ciphertextHex ? "Ya" : "Tidak");

const decryptedBuffer = decrypt(decodedBuffer);
const decryptedText = decryptedBuffer.toString("utf8");
console.log("Tahap 5 - Hasil dekripsi:", decryptedText);
console.log("Tahap 5 - Identik dengan Tahap 1?", decryptedText === JSON.stringify(payload) ? "Ya" : "Tidak");
