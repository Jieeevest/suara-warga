import { generateKeyPairSync } from "node:crypto";

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

const escapeForEnv = (value) => value.replace(/\n/g, "\\n");

console.log("# Add these lines to your .env.local");
console.log(`VOTING_RSA_PUBLIC_KEY="${escapeForEnv(publicKey)}"`);
console.log(`VOTING_RSA_PRIVATE_KEY="${escapeForEnv(privateKey)}"`);
