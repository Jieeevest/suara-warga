import { randomUUID } from "node:crypto";
import { db } from "./db";
import type {
  Candidate,
  Resident,
  SessionUser,
  User,
  VotingStatus,
} from "./types";

function generateResidentPassword(length = 6) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length }, () =>
    characters[Math.floor(Math.random() * characters.length)],
  ).join("");
}

function mapResident(row: Record<string, unknown>): Resident {
  return {
    id: String(row.id),
    nik: String(row.nik),
    name: String(row.name),
    email: String(row.email || ""),
    birthPlace: String(row.birth_place || ""),
    gender: (String(row.gender || "") as Resident["gender"]),
    identityIssuedPlace: String(row.identity_issued_place || ""),
    occupation: String(row.occupation || ""),
    address: String(row.address),
    rt: String(row.rt),
    rw: String(row.rw),
    phoneNumber: String(row.phone_number),
    status: row.status as Resident["status"],
    block: String(row.block || ""),
    hasVoted: Boolean(row.has_voted),
    isPresent: Boolean(row.is_present),
  };
}

function mapCandidate(row: Record<string, unknown>): Candidate {
  return {
    id: String(row.id),
    number: Number(row.number),
    name: String(row.name),
    vision: String(row.vision),
    mission: String(row.mission),
    imageUrl: String(row.image_url),
    voteCount: Number(row.vote_count),
  };
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.name),
    role: row.role as User["role"],
    username: String(row.username),
    password: String(row.password),
  };
}

export function listResidents() {
  return db
    .prepare("SELECT * FROM residents ORDER BY name ASC")
    .all()
    .map((row) => mapResident(row as Record<string, unknown>));
}

export function listCandidates() {
  return db
    .prepare("SELECT * FROM candidates ORDER BY number ASC")
    .all()
    .map((row) => mapCandidate(row as Record<string, unknown>));
}

export function listUsers() {
  return db
    .prepare("SELECT * FROM users ORDER BY role DESC, name ASC")
    .all()
    .map((row) => mapUser(row as Record<string, unknown>));
}

export function getVotingStatus(): VotingStatus {
  const row = db
    .prepare("SELECT value FROM app_state WHERE key = 'votingStatus'")
    .get() as { value?: string };
  return (row?.value as VotingStatus) || "not_started";
}

export function getActiveVoterId() {
  const row = db
    .prepare("SELECT value FROM app_state WHERE key = 'activeVoterId'")
    .get() as { value?: string };
  return row?.value || null;
}

export function findResidentById(id: string) {
  const row = db.prepare("SELECT * FROM residents WHERE id = ?").get(id);
  return row ? mapResident(row as Record<string, unknown>) : null;
}

export function findResidentByNik(nik: string) {
  const row = db.prepare("SELECT * FROM residents WHERE nik = ?").get(nik);
  return row ? mapResident(row as Record<string, unknown>) : null;
}

export function findUserByCredentials(username: string, password: string) {
  const row = db
    .prepare("SELECT * FROM users WHERE username = ? AND password = ?")
    .get(username, password);
  return row ? mapUser(row as Record<string, unknown>) : null;
}

export function findResidentSessionByCredentials(
  username: string,
  password: string,
) {
  const row = db.prepare("SELECT * FROM residents WHERE nik = ?").get(username);
  const resident = row ? mapResident(row as Record<string, unknown>) : null;
  const residentPassword = row ? String((row as Record<string, unknown>).password || "") : "";

  if (!resident || password !== residentPassword || resident.status !== "Aktif") {
    return null;
  }

  return {
    id: resident.id,
    name: resident.name,
    role: "resident",
    username: resident.nik,
  } satisfies SessionUser;
}

export function findResidentAccessById(id: string) {
  const row = db
    .prepare("SELECT id, name, nik, email, password, status FROM residents WHERE id = ?")
    .get(id) as
    | {
        id?: string;
        name?: string;
        nik?: string;
        email?: string;
        password?: string;
        status?: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: String(row.name),
    nik: String(row.nik),
    email: String(row.email || ""),
    password: String(row.password || ""),
    status: row.status as Resident["status"],
  };
}

export function markResidentPresent(residentId: string) {
  const resident = findResidentById(residentId);
  if (!resident) {
    throw new Error("Resident not found");
  }
  if (resident.status !== "Aktif") {
    throw new Error("Hanya warga aktif yang dapat diverifikasi kehadirannya.");
  }
  if (!resident.isPresent) {
    updateResident(residentId, { isPresent: true });
  }
}

export function getSessionUserById(role: string, id: string) {
  if (role === "resident") {
    const resident = findResidentById(id);
    return resident
      && resident.status === "Aktif"
      ? ({
          id: resident.id,
          name: resident.name,
          role: "resident",
          username: resident.nik,
        } satisfies SessionUser)
      : null;
  }

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!row) {
    return null;
  }

  const user = mapUser(row as Record<string, unknown>);
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    username: user.username,
  } satisfies SessionUser;
}

export function createResident(
  input: Omit<Resident, "id" | "hasVoted" | "isPresent">,
) {
  const generatedPassword = generateResidentPassword();
  const resident: Resident = {
    ...input,
    id: randomUUID(),
    hasVoted: false,
    isPresent: false,
  };

  db.prepare(`
    INSERT INTO residents (
      id, nik, name, email, birth_place, gender, identity_issued_place, occupation, password, address, rt, rw, phone_number, status, block, has_voted, is_present
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    resident.id,
    resident.nik,
    resident.name,
    resident.email,
    resident.birthPlace,
    resident.gender,
    resident.identityIssuedPlace,
    resident.occupation,
    generatedPassword,
    resident.address,
    resident.rt,
    resident.rw,
    resident.phoneNumber,
    resident.status,
    resident.block ?? "",
    0,
    0,
  );

  return resident;
}

export function updateResident(id: string, updates: Partial<Resident>) {
  const current = findResidentById(id);
  if (!current) {
    throw new Error("Resident not found");
  }

  const next = { ...current, ...updates };
  if (next.status !== "Aktif") {
    next.isPresent = false;
  }
  db.prepare(`
    UPDATE residents
    SET nik = ?, name = ?, email = ?, birth_place = ?, gender = ?, identity_issued_place = ?, occupation = ?, address = ?, rt = ?, rw = ?, phone_number = ?, status = ?, block = ?, has_voted = ?, is_present = ?
    WHERE id = ?
  `).run(
    next.nik,
    next.name,
    next.email,
    next.birthPlace,
    next.gender,
    next.identityIssuedPlace,
    next.occupation,
    next.address,
    next.rt,
    next.rw,
    next.phoneNumber,
    next.status,
    next.block ?? "",
    next.hasVoted ? 1 : 0,
    next.isPresent ? 1 : 0,
    id,
  );

  if (next.status !== "Aktif" && getActiveVoterId() === id) {
    setActiveVoter(null);
  }
}

export function deleteResident(id: string) {
  db.prepare("DELETE FROM residents WHERE id = ?").run(id);
}

export function importResidents(
  inputs: Array<
    Pick<
      Resident,
      | "nik"
      | "name"
      | "birthPlace"
      | "gender"
      | "identityIssuedPlace"
      | "occupation"
      | "email"
      | "address"
      | "rt"
      | "rw"
      | "phoneNumber"
      | "status"
      | "block"
    >
  >,
) {
  const findByNikStatement = db.prepare("SELECT id FROM residents WHERE nik = ?");
  const insertStatement = db.prepare(`
    INSERT INTO residents (
      id, nik, name, email, birth_place, gender, identity_issued_place, occupation, password, address, rt, rw, phone_number, status, block, has_voted, is_present
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0
    )
  `);
  const updateStatement = db.prepare(`
    UPDATE residents
    SET name = ?, birth_place = ?, gender = ?, identity_issued_place = ?, occupation = ?
    WHERE nik = ?
  `);

  let created = 0;
  let updated = 0;

  const transaction = db.transaction(() => {
    for (const input of inputs) {
      const existing = findByNikStatement.get(input.nik) as { id?: string } | undefined;
      if (existing?.id) {
        updateStatement.run(
          input.name,
          input.birthPlace,
          input.gender,
          input.identityIssuedPlace,
          input.occupation,
          input.nik,
        );
        updated += 1;
        continue;
      }

      insertStatement.run(
        randomUUID(),
        input.nik,
        input.name,
        input.email,
        input.birthPlace,
        input.gender,
        input.identityIssuedPlace,
        input.occupation,
        generateResidentPassword(),
        input.address,
        input.rt,
        input.rw,
        input.phoneNumber,
        input.status,
        input.block,
      );
      created += 1;
    }
  });

  transaction();

  return {
    created,
    updated,
    total: inputs.length,
  };
}

export function createCandidate(input: Omit<Candidate, "id" | "voteCount">) {
  const candidate: Candidate = {
    ...input,
    id: randomUUID(),
    voteCount: 0,
  };

  db.prepare(`
    INSERT INTO candidates (
      id, number, name, vision, mission, image_url, vote_count
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    candidate.id,
    candidate.number,
    candidate.name,
    candidate.vision,
    candidate.mission,
    candidate.imageUrl,
    0,
  );

  return candidate;
}

export function updateCandidate(id: string, updates: Partial<Candidate>) {
  const currentRow = db.prepare("SELECT * FROM candidates WHERE id = ?").get(id);
  if (!currentRow) {
    throw new Error("Candidate not found");
  }

  const current = mapCandidate(currentRow as Record<string, unknown>);
  const next = { ...current, ...updates };
  db.prepare(`
    UPDATE candidates
    SET number = ?, name = ?, vision = ?, mission = ?, image_url = ?, vote_count = ?
    WHERE id = ?
  `).run(
    next.number,
    next.name,
    next.vision,
    next.mission,
    next.imageUrl,
    next.voteCount,
    id,
  );
}

export function deleteCandidate(id: string) {
  db.prepare("DELETE FROM candidates WHERE id = ?").run(id);
}

export function createUser(input: Omit<User, "id">) {
  const user: User = {
    ...input,
    id: randomUUID(),
  };

  db.prepare(`
    INSERT INTO users (
      id, name, role, username, password
    ) VALUES (
      ?, ?, ?, ?, ?
    )
  `).run(user.id, user.name, user.role, user.username, user.password || "");

  return user;
}

export function updateUser(id: string, updates: Partial<User>) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!row) {
    throw new Error("User not found");
  }

  const current = mapUser(row as Record<string, unknown>);
  const next = { ...current, ...updates };
  db.prepare(`
    UPDATE users
    SET name = ?, role = ?, username = ?, password = ?
    WHERE id = ?
  `).run(next.name, next.role, next.username, next.password || "", id);
}

export function deleteUser(id: string) {
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
}

export function setVotingStatus(status: VotingStatus) {
  db.prepare("UPDATE app_state SET value = ? WHERE key = 'votingStatus'").run(
    status,
  );
}

export function setActiveVoter(id: string | null) {
  if (id) {
    if (getVotingStatus() !== "active") {
      throw new Error("Akses bilik hanya dapat dibuka saat voting sedang aktif.");
    }
    const resident = findResidentById(id);
    if (!resident) {
      throw new Error("Resident not found");
    }
    if (resident.status !== "Aktif") {
      throw new Error("Hanya warga aktif yang dapat diberi akses bilik.");
    }
    if (!resident.isPresent) {
      throw new Error("Warga harus ditandai hadir sebelum membuka bilik.");
    }
    if (resident.hasVoted) {
      throw new Error("Warga ini sudah menggunakan hak pilih.");
    }
  }

  db.prepare("UPDATE app_state SET value = ? WHERE key = 'activeVoterId'").run(
    id || "",
  );
}

export function toggleAttendance(residentId: string) {
  if (getVotingStatus() !== "active") {
    throw new Error("Kehadiran hanya dapat dicatat saat voting sedang aktif.");
  }

  const resident = findResidentById(residentId);
  if (!resident) {
    throw new Error("Resident not found");
  }
  if (resident.status !== "Aktif") {
    throw new Error("Hanya warga aktif yang dapat dicatat kehadirannya.");
  }

  updateResident(residentId, { isPresent: !resident.isPresent });
  if (resident.isPresent && getActiveVoterId() === residentId) {
    setActiveVoter(null);
  }
}

export function castVote(candidateId: string, residentId: string) {
  const resident = findResidentById(residentId);
  if (!resident) {
    throw new Error("Resident not found");
  }
  if (resident.status !== "Aktif") {
    throw new Error("Hanya warga aktif yang dapat mengikuti e-voting.");
  }
  if (resident.hasVoted) {
    throw new Error("Resident already voted");
  }

  const candidate = db.prepare("SELECT * FROM candidates WHERE id = ?").get(candidateId);
  if (!candidate) {
    throw new Error("Candidate not found");
  }

  db.prepare("UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?").run(
    candidateId,
  );
  updateResident(residentId, { hasVoted: true });
  setActiveVoter(null);
}

export function resetVotingSession() {
  db.prepare("UPDATE residents SET has_voted = 0").run();
  db.prepare("UPDATE candidates SET vote_count = 0").run();
  setVotingStatus("not_started");
  setActiveVoter(null);
}
