import fs from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import Database from "better-sqlite3";
import { INITIAL_CANDIDATES, INITIAL_RESIDENTS, getInitialUsers } from "./seed";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "sura-warga.sqlite");

declare global {
  // eslint-disable-next-line no-var
  var __suraWargaDb: Database.Database | undefined;
}

function generateResidentPassword(length = 6) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length }, () =>
    characters[randomInt(0, characters.length)],
  ).join("");
}

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = global.__suraWargaDb ?? new Database(dbPath);
  global.__suraWargaDb = db;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return db;
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS residents (
      id TEXT PRIMARY KEY,
      nik TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      birth_place TEXT NOT NULL DEFAULT '',
      gender TEXT NOT NULL DEFAULT '',
      identity_issued_place TEXT NOT NULL DEFAULT '',
      occupation TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL,
      rt TEXT NOT NULL,
      rw TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      status TEXT NOT NULL,
      block TEXT,
      has_voted INTEGER NOT NULL DEFAULT 0,
      is_present INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      number INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      vision TEXT NOT NULL,
      mission TEXT NOT NULL,
      image_url TEXT NOT NULL,
      vote_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const residentColumns = db.prepare("PRAGMA table_info(residents)").all() as Array<{
    name?: string;
  }>;
  const hasEmailColumn = residentColumns.some((column) => column.name === "email");
  if (!hasEmailColumn) {
    db.exec("ALTER TABLE residents ADD COLUMN email TEXT NOT NULL DEFAULT ''");
  }
  const residentColumnStatements = [
    {
      key: "birth_place",
      statement: "ALTER TABLE residents ADD COLUMN birth_place TEXT NOT NULL DEFAULT ''",
    },
    {
      key: "gender",
      statement: "ALTER TABLE residents ADD COLUMN gender TEXT NOT NULL DEFAULT ''",
    },
    {
      key: "identity_issued_place",
      statement:
        "ALTER TABLE residents ADD COLUMN identity_issued_place TEXT NOT NULL DEFAULT ''",
    },
    {
      key: "occupation",
      statement: "ALTER TABLE residents ADD COLUMN occupation TEXT NOT NULL DEFAULT ''",
    },
    {
      key: "password",
      statement: "ALTER TABLE residents ADD COLUMN password TEXT NOT NULL DEFAULT ''",
    },
  ];
  for (const column of residentColumnStatements) {
    if (!residentColumns.some((residentColumn) => residentColumn.name === column.key)) {
      db.exec(column.statement);
    }
  }

  const residentCountRow = db.prepare("SELECT COUNT(*) as count FROM residents").get() as {
    count?: number;
  };
  const residentCount = Number(residentCountRow.count || 0);
  if (residentCount === 0) {
    const insert = db.prepare(`
      INSERT INTO residents (
        id, nik, name, email, birth_place, gender, identity_issued_place, occupation, password, address, rt, rw, phone_number, status, block, has_voted, is_present
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    for (const resident of INITIAL_RESIDENTS) {
      insert.run(
        resident.id,
        resident.nik,
        resident.name,
        resident.email,
        resident.birthPlace,
        resident.gender,
        resident.identityIssuedPlace,
        resident.occupation,
        "",
        resident.address,
        resident.rt,
        resident.rw,
        resident.phoneNumber,
        resident.status,
        resident.block ?? "",
        resident.hasVoted ? 1 : 0,
        resident.isPresent ? 1 : 0,
      );
    }
  }

  const backfillResidentEmail = db.prepare(
    "UPDATE residents SET email = ? WHERE id = ? AND COALESCE(email, '') = ''",
  );
  const backfillResidentBirthPlace = db.prepare(
    "UPDATE residents SET birth_place = ? WHERE id = ? AND COALESCE(birth_place, '') = ''",
  );
  const backfillResidentGender = db.prepare(
    "UPDATE residents SET gender = ? WHERE id = ? AND COALESCE(gender, '') = ''",
  );
  const backfillResidentIdentityIssuedPlace = db.prepare(
    "UPDATE residents SET identity_issued_place = ? WHERE id = ? AND COALESCE(identity_issued_place, '') = ''",
  );
  const backfillResidentOccupation = db.prepare(
    "UPDATE residents SET occupation = ? WHERE id = ? AND COALESCE(occupation, '') = ''",
  );
  const backfillResidentPassword = db.prepare(
    "UPDATE residents SET password = ? WHERE id = ? AND COALESCE(password, '') = ''",
  );
  for (const resident of INITIAL_RESIDENTS) {
    backfillResidentEmail.run(resident.email, resident.id);
    backfillResidentBirthPlace.run(resident.birthPlace, resident.id);
    backfillResidentGender.run(resident.gender, resident.id);
    backfillResidentIdentityIssuedPlace.run(resident.identityIssuedPlace, resident.id);
    backfillResidentOccupation.run(resident.occupation, resident.id);
    backfillResidentPassword.run(generateResidentPassword(), resident.id);
  }

  const residentsWithoutPassword = db.prepare(
    "SELECT id FROM residents WHERE COALESCE(password, '') = ''",
  ).all() as Array<{ id?: string }>;
  for (const resident of residentsWithoutPassword) {
    if (resident.id) {
      backfillResidentPassword.run(generateResidentPassword(), resident.id);
    }
  }

  const candidateCountRow = db.prepare("SELECT COUNT(*) as count FROM candidates").get() as {
    count?: number;
  };
  const candidateCount = Number(candidateCountRow.count || 0);
  if (candidateCount === 0) {
    const insert = db.prepare(`
      INSERT INTO candidates (
        id, number, name, vision, mission, image_url, vote_count
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    for (const candidate of INITIAL_CANDIDATES) {
      insert.run(
        candidate.id,
        candidate.number,
        candidate.name,
        candidate.vision,
        candidate.mission,
        candidate.imageUrl,
        candidate.voteCount,
      );
    }
  }

  const upsertInitialCandidate = db.prepare(`
    INSERT OR IGNORE INTO candidates (
      id, number, name, vision, mission, image_url, vote_count
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?
    )
  `);
  for (const candidate of INITIAL_CANDIDATES) {
    upsertInitialCandidate.run(
      candidate.id,
      candidate.number,
      candidate.name,
      candidate.vision,
      candidate.mission,
      candidate.imageUrl,
      candidate.voteCount,
    );
  }

  const userCountRow = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count?: number;
  };
  const userCount = Number(userCountRow.count || 0);
  const upsertInitialUser = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, name, role, username, password
    ) VALUES (
      ?, ?, ?, ?, ?
    )
  `);

  if (userCount === 0) {
    for (const user of getInitialUsers()) {
      upsertInitialUser.run(
        user.id,
        user.name,
        user.role,
        user.username,
        user.password || "",
      );
    }
  } else {
    for (const user of getInitialUsers()) {
      upsertInitialUser.run(
        user.id,
        user.name,
        user.role,
        user.username,
        user.password || "",
      );
    }
  }

  const appStateCountRow = db.prepare("SELECT COUNT(*) as count FROM app_state").get() as {
    count?: number;
  };
  const appStateCount = Number(appStateCountRow.count || 0);
  if (appStateCount === 0) {
    const insert = db.prepare("INSERT INTO app_state (key, value) VALUES (?, ?)");
    insert.run("votingStatus", "not_started");
    insert.run("activeVoterId", "");
  }

  return db;
}

export const db = ensureDatabase();
