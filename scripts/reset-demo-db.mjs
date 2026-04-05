import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const targets = [
  "sura-warga.sqlite",
  "sura-warga.sqlite-shm",
  "sura-warga.sqlite-wal",
];

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

for (const file of targets) {
  const filePath = path.join(dataDir, file);
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
    console.log(`Removed ${file}`);
  }
}

console.log("Demo database reset complete. Run `npm run dev` to recreate fresh data.");
