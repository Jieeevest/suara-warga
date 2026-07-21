import Database from "better-sqlite3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const testDb = new Database(":memory:");

testDb.exec(`
  CREATE TABLE residents (
    id TEXT PRIMARY KEY,
    nik TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    birth_place TEXT NOT NULL DEFAULT '',
    birth_date TEXT NOT NULL DEFAULT '',
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

  CREATE TABLE candidates (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    vision TEXT NOT NULL,
    mission TEXT NOT NULL,
    image_url TEXT NOT NULL,
    vote_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE app_state (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE voting_sessions (
    id TEXT PRIMARY KEY,
    agenda TEXT NOT NULL,
    scheduled_at TEXT NOT NULL,
    started_at TEXT NOT NULL,
    closed_at TEXT,
    total_voters INTEGER NOT NULL DEFAULT 0,
    total_votes INTEGER NOT NULL DEFAULT 0,
    turnout_percentage REAL NOT NULL DEFAULT 0,
    results_json TEXT NOT NULL DEFAULT '[]'
  );
`);

vi.mock("./db", () => ({ db: testDb }));

const {
  castVote,
  findResidentSessionByCredentials,
  findUserByCredentials,
  markResidentPresent,
  setActiveVoter,
  startVotingSession,
  closeVotingSession,
  resetVotingSession,
  toggleAttendance,
  getVotingStatus,
} = await import("./repository");

function insertResident(overrides: {
  id?: string;
  nik?: string;
  password?: string;
  status?: string;
  hasVoted?: number;
  isPresent?: number;
} = {}) {
  const resident = {
    id: overrides.id ?? "r1",
    nik: overrides.nik ?? "3271000000000001",
    name: "Warga Test",
    address: "Jl. Test",
    rt: "001",
    rw: "002",
    phone_number: "08123456789",
    status: overrides.status ?? "Aktif",
    password: overrides.password ?? "rahasia123",
    has_voted: overrides.hasVoted ?? 0,
    is_present: overrides.isPresent ?? 0,
  };
  testDb
    .prepare(
      `INSERT INTO residents (id, nik, name, address, rt, rw, phone_number, status, password, has_voted, is_present)
       VALUES (@id, @nik, @name, @address, @rt, @rw, @phone_number, @status, @password, @has_voted, @is_present)`,
    )
    .run(resident);
  return resident;
}

function insertCandidate(id = "c1", number = 1) {
  testDb
    .prepare(
      `INSERT INTO candidates (id, number, name, vision, mission, image_url, vote_count)
       VALUES (?, ?, 'Kandidat', 'Visi', 'Misi', '', 0)`,
    )
    .run(id, number);
}

function insertUser(overrides: { username?: string; password?: string } = {}) {
  testDb
    .prepare(
      `INSERT INTO users (id, name, role, username, password) VALUES ('u1', 'Admin', 'admin', @username, @password)`,
    )
    .run({ username: overrides.username ?? "admin1", password: overrides.password ?? "AdminPass1!" });
}

beforeEach(() => {
  testDb.exec(
    "DELETE FROM residents; DELETE FROM candidates; DELETE FROM users; DELETE FROM voting_sessions; DELETE FROM app_state;",
  );
  testDb.prepare("INSERT INTO app_state (key, value) VALUES ('votingStatus', 'not_started')").run();
  testDb.prepare("INSERT INTO app_state (key, value) VALUES ('activeVoterId', '')").run();
});

describe("findUserByCredentials (TC-REPO-01, TC-REPO-02)", () => {
  it("TC-REPO-01: kredensial admin valid mengembalikan user ter-mapping", () => {
    insertUser();
    const result = findUserByCredentials("admin1", "AdminPass1!");
    expect(result?.username).toBe("admin1");
    expect(result?.role).toBe("admin");
  });

  it("TC-REPO-02: input SQL-injection-like tidak bypass, tetap null", () => {
    insertUser();
    const result = findUserByCredentials("' OR '1'='1", "' OR '1'='1");
    expect(result).toBeNull();
  });
});

describe("findResidentSessionByCredentials (TC-REPO-03, TC-REPO-04, TC-REPO-05)", () => {
  it("TC-REPO-03: NIK bukan 8 digit -> null tanpa query", () => {
    expect(findResidentSessionByCredentials("1234567", "x")).toBeNull();
    expect(findResidentSessionByCredentials("abcdefgh", "x")).toBeNull();
    expect(findResidentSessionByCredentials("123456789", "x")).toBeNull();
  });

  it("TC-REPO-04: NIK 8 digit valid tapi tidak ada match -> null", () => {
    insertResident({ nik: "3271000000000001" });
    expect(findResidentSessionByCredentials("99999999", "rahasia123")).toBeNull();
  });

  it("resident dengan 8 digit akhir NIK + password cocok -> session ditemukan", () => {
    insertResident({ nik: "3271000000000001", password: "rahasia123" });
    const session = findResidentSessionByCredentials("00000001", "rahasia123");
    expect(session).not.toBeNull();
    expect(session?.role).toBe("resident");
  });

  it("TC-REPO-05: dua resident dengan 8 digit akhir NIK sama & password sama -> ambigu, null (matches.length !== 1)", () => {
    insertResident({ id: "r1", nik: "1111000000000001", password: "samapass1" });
    insertResident({ id: "r2", nik: "2222000000000001", password: "samapass1" });
    const session = findResidentSessionByCredentials("00000001", "samapass1");
    expect(session).toBeNull();
  });
});

describe("castVote - state machine (TC-VOTE-01..06)", () => {
  it("TC-VOTE-01: voting belum aktif -> throw", () => {
    insertResident();
    insertCandidate();
    expect(() => castVote("c1", "r1")).toThrow(
      "Vote hanya dapat dilakukan saat voting sedang aktif.",
    );
  });

  it("TC-VOTE-02: resident tidak ditemukan -> throw Resident not found", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    insertCandidate();
    expect(() => castVote("c1", "tidak-ada")).toThrow("Resident not found");
  });

  it("TC-VOTE-03: resident status bukan Aktif -> throw", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    insertResident({ status: "Pindah", isPresent: 1 });
    insertCandidate();
    expect(() => castVote("c1", "r1")).toThrow(
      "Hanya warga aktif yang dapat mengikuti e-voting.",
    );
  });

  it("TC-VOTE-04: resident sudah hasVoted -> throw Resident already voted (anti double-voting)", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    insertResident({ hasVoted: 1, isPresent: 1 });
    insertCandidate();
    expect(() => castVote("c1", "r1")).toThrow("Resident already voted");
  });

  it("TC-VOTE-05: resident belum isPresent -> throw", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    insertResident({ isPresent: 0 });
    insertCandidate();
    expect(() => castVote("c1", "r1")).toThrow(
      "Warga harus ditandai hadir sebelum dapat memilih.",
    );
  });

  it("TC-VOTE-06: semua syarat terpenuhi -> vote count bertambah dan hasVoted true", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    insertResident({ isPresent: 1 });
    insertCandidate("c1", 1);
    castVote("c1", "r1");

    const candidate = testDb.prepare("SELECT vote_count FROM candidates WHERE id = 'c1'").get() as {
      vote_count: number;
    };
    const resident = testDb.prepare("SELECT has_voted FROM residents WHERE id = 'r1'").get() as {
      has_voted: number;
    };
    expect(candidate.vote_count).toBe(1);
    expect(resident.has_voted).toBe(1);
  });

  it("KOREKSI TC-API-VOTE-05: candidateId yang tidak eksis DITOLAK dengan 'Candidate not found' (temuan awal di WHITEBOX_TEST_RESULTS.md keliru — validasi ini TERNYATA ADA di castVote)", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    insertResident({ isPresent: 1 });
    expect(() => castVote("candidate-tidak-eksis", "r1")).toThrow("Candidate not found");
  });

  it("double-submit lewat pemanggilan castVote dua kali berturut-turut -> panggilan kedua ditolak", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    insertResident({ isPresent: 1 });
    insertCandidate("c1", 1);
    castVote("c1", "r1");
    expect(() => castVote("c1", "r1")).toThrow("Resident already voted");
  });
});

describe("markResidentPresent vs toggleAttendance (TC-VOTE-07)", () => {
  it("TC-VOTE-07: markResidentPresent TIDAK mengecek status voting (beda dari toggleAttendance)", () => {
    insertResident({ isPresent: 0 });
    expect(getVotingStatus()).toBe("not_started");
    expect(() => markResidentPresent("r1")).not.toThrow();
    const resident = testDb.prepare("SELECT is_present FROM residents WHERE id = 'r1'").get() as {
      is_present: number;
    };
    expect(resident.is_present).toBe(1);
  });

  it("toggleAttendance MENGECEK status voting, throw saat not_started", () => {
    insertResident({ isPresent: 0 });
    expect(() => toggleAttendance("r1")).toThrow(
      "Kehadiran hanya dapat dicatat saat voting sedang aktif.",
    );
  });
});

describe("startVotingSession / closeVotingSession / resetVotingSession (TC-VOTE-08, TC-VOTE-09)", () => {
  it("TC-VOTE-08: startVotingSession dari status active -> throw", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    expect(() =>
      startVotingSession({ agenda: "Pemilihan Ketua RT", scheduledAt: "2026-07-16" }),
    ).toThrow("Sesi hanya dapat dimulai dari status belum dimulai.");
  });

  it("TC-VOTE-09: agenda kosong/whitespace -> throw", () => {
    expect(() => startVotingSession({ agenda: "   ", scheduledAt: "2026-07-16" })).toThrow(
      "Agenda sesi wajib diisi.",
    );
  });

  it("transisi penuh not_started -> active -> closed -> not_started", () => {
    startVotingSession({ agenda: "Pemilihan Ketua RT", scheduledAt: "2026-07-16" });
    expect(getVotingStatus()).toBe("active");
    closeVotingSession();
    expect(getVotingStatus()).toBe("closed");
    resetVotingSession();
    expect(getVotingStatus()).toBe("not_started");
  });
});

describe("setActiveVoter / booth access (TC-VOTE-10)", () => {
  it("TC-VOTE-10: resident yang sudah hasVoted ditolak dari akses bilik", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    insertResident({ isPresent: 1, hasVoted: 1 });
    expect(() => setActiveVoter("r1")).toThrow("Warga ini sudah menggunakan hak pilih.");
  });

  it("resident belum hadir ditolak dari akses bilik", () => {
    testDb.prepare("UPDATE app_state SET value = 'active' WHERE key = 'votingStatus'").run();
    insertResident({ isPresent: 0 });
    expect(() => setActiveVoter("r1")).toThrow("Warga harus ditandai hadir sebelum membuka bilik.");
  });
});
