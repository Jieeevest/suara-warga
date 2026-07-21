# Rencana Whitebox Testing — Sura Warga

## 1. Ringkasan

Dokumen ini adalah rencana pengujian whitebox untuk aplikasi **Sura Warga** (sistem presensi & e-voting berbasis Next.js + SQLite). Fokus pengujian pada logika inti: autentikasi/sesi, enkripsi suara (RSA-OAEP), state machine voting, dan validasi input di seluruh API route.

## 2. Ruang Lingkup

### 2.1 Modul inti (`lib/`)
| File | Fungsi utama | Prioritas |
|---|---|---|
| `lib/auth.ts` | sign/parse session cookie (HMAC), gating akses resident berdasarkan status voting | Tinggi |
| `lib/vote-crypto.ts` | enkripsi/dekripsi suara RSA-OAEP, validasi payload & expiry | Tinggi |
| `lib/password-policy.ts` | validasi kekuatan password (regex) | Sedang |
| `lib/repository.ts` | query SQLite: kredensial, castVote, attendance, voting session lifecycle | Tinggi |
| `lib/api.ts` | helper response (`ok`, `badRequest`, `requireUser`) | Sedang |
| `lib/vote-encryption-client.ts` | enkripsi di sisi client sebelum submit | Sedang |
| `lib/db.ts` | schema & koneksi SQLite | Rendah (struktural) |

### 2.2 API Routes (`app/api/`)
`auth/login`, `auth/logout`, `votes/cast`, `attendance/toggle`, `booth/active-voter`, `voting/sessions`, `voting/status`, `residents` (CRUD, `access`, `send-access`, `import`), `users`, `candidates`, `bootstrap`, `analysis`, `notifications/stream`.

### 2.3 Di luar cakupan
Styling/UI (`components/`, halaman React) — direkomendasikan diuji lewat E2E/manual, bukan whitebox unit test.

## 3. Metodologi & Tools

- **Framework:** Vitest atau Jest (belum ada test runner di `package.json` saat ini — perlu konfirmasi & instalasi sebelum eksekusi).
- **Teknik whitebox:** statement/branch coverage, boundary value analysis, path testing untuk state machine voting.
- **Mocking:** mock `lib/db.ts` (better-sqlite3) dengan in-memory SQLite atau file test terpisah agar tidak menyentuh `data/sura-warga.sqlite` produksi/dev.
- **Target coverage:** ≥ 85% statement/branch untuk `lib/auth.ts`, `lib/vote-crypto.ts`, `lib/repository.ts`.

## 4. Skenario Uji per Modul

### 4.1 `lib/auth.ts` — Session & Signing
- Sign/parse round-trip: `createSessionValue` → `parseSessionValue` mengembalikan objek `SessionUser` yang sama.
- Cookie yang di-tamper (ubah 1 byte payload/signature) → `parseSessionValue` mengembalikan `null`.
- Payload tanpa `.` separator, atau bagian payload/signature kosong → `null`.
- Payload base64url valid tapi bukan JSON → `null` (tidak throw).
- Signature dengan panjang berbeda dari signature valid → ditolak (cek `signature.length !== expected.length` sebelum `timingSafeEqual`, hindari exception panjang buffer beda).
- `getCurrentSessionUser`: resident dengan status voting != `active` → `null` walau cookie valid (gating).
- `getCurrentSessionUser`: role admin tidak terpengaruh status voting.
- `setSessionCookie`: flag `httpOnly`, `sameSite=lax`, `secure` true hanya saat `NODE_ENV=production`.
- Fallback `AUTH_SECRET` default (`development-only-secret`) — pastikan ada test yang menandai risiko bila env var tidak di-set di produksi (lihat §6).

### 4.2 `lib/vote-crypto.ts` — Enkripsi Suara
- Encrypt (public key) → decrypt (private key) round-trip menghasilkan `candidateId` & `issuedAt` yang sama.
- Ciphertext invalid/corrupt → `privateDecrypt` throw, dipastikan tertangkap dan pesan error sesuai.
- Payload JSON valid tapi `candidateId` hilang/bukan string → `"Payload vote tidak valid."`.
- Payload JSON valid tapi `issuedAt` hilang/bukan number/nol → `"Timestamp vote tidak valid."`.
- `issuedAt` di luar window ±5 menit (baik terlalu lama maupun **timestamp masa depan**) → `"Payload vote sudah kedaluwarsa."`.
- Boundary test: `issuedAt` tepat di batas 5 menit (299999ms vs 300001ms).
- Replay attack: kirim ulang `encryptedVote` yang sama dua kali dalam window valid → dekripsi sukses dua-duanya (proteksi replay harus datang dari `castVote`'s `hasVoted` check, bukan dari layer crypto — pastikan ini diuji terintegrasi di §4.6).
- `getVotingPublicKey()` mengembalikan PEM string valid saat `keyPair.publicKey` berupa `KeyObject` maupun string (cabang env var vs generated).

### 4.3 `lib/password-policy.ts`
Uji regex `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$` dengan tabel boundary:
| Input | Ekspektasi | Alasan |
|---|---|---|
| `Passw0rd!` | valid | semua kriteria terpenuhi |
| `passw0rd!` | invalid | tanpa huruf besar |
| `PASSW0RD!` | invalid | tanpa huruf kecil |
| `Password!` | invalid | tanpa angka |
| `Passw0rd` | invalid | tanpa simbol |
| `Pw0!aaa` (7 char) | invalid | kurang dari 8 karakter |
| `Passw0rd!` + emoji/unicode simbol | valid/invalid? | cek definisi "simbol" konsisten dgn `PASSWORD_POLICY_MESSAGE` |
| string kosong `""` | invalid | |

### 4.4 `lib/repository.ts` — Kredensial & Query
- `findUserByCredentials`: username/password cocok → return user; tidak cocok → `null`. Pastikan **prepared statement** dipakai (cek tidak ada string concatenation — sudah OK, tapi tambahkan test negatif dengan payload SQL-injection-like string, mis. `' OR '1'='1`, memastikan tetap `null`).
- `findResidentSessionByCredentials`: input NIK yang bukan 8 digit (huruf, kurang/lebih dari 8 digit, ada spasi) → `null` tanpa query ke DB.
- NIK 8 digit valid tapi tidak match resident manapun → `null`.
- Beberapa resident dengan 8 digit akhir NIK sama (duplikat) tapi password berbeda → hanya yang password cocok yang match; jika lebih dari satu match, tentukan perilaku yang diharapkan (ambiguous match) dan tuliskan sebagai test eksplisit.
- **Catatan keamanan:** password resident/user tampak dibandingkan sebagai plaintext di query (`WHERE username = ? AND password = ?`). Tambahkan test yang men-dokumentasikan perilaku ini secara eksplisit sebagai temuan, lihat §6.

### 4.5 `lib/repository.ts` — State Machine Voting
Diagram status: `not_started` → `active` → `closed`.

- `castVote`:
  - Status bukan `active` → throw `"Vote hanya dapat dilakukan saat voting sedang aktif."`.
  - Resident tidak ditemukan → throw `"Resident not found"`.
  - Resident status bukan `Aktif` (meninggal/pindah) → throw.
  - Resident `hasVoted = true` → throw `"Resident already voted"` (**test kritis: cegah double voting**).
  - Resident belum `isPresent` → throw `"Warga harus ditandai hadir sebelum dapat memilih."`.
  - Path sukses: semua syarat terpenuhi → vote count kandidat bertambah, `hasVoted` menjadi true.
  - Race condition: dua request `castVote` konkuren untuk resident yang sama → hanya satu yang berhasil (perlu verifikasi apakah SQLite transaction/lock mencegah double-count; better-sqlite3 bersifat synchronous sehingga secara alami serial — tuliskan test yang memverifikasi asumsi ini).

- `markResidentPresent` / `toggleAttendance`:
  - Status voting bukan `active` → throw pada `toggleAttendance` (perhatikan `markResidentPresent` **tidak** mengecek status voting — beda perilaku dari `toggleAttendance`; tuliskan test yang mengonfirmasi/menyoroti inkonsistensi ini).
  - Resident status bukan `Aktif` → throw.
  - Toggle dua kali → kembali ke `isPresent` semula; jika sedang jadi `activeVoterId` lalu di-set `isPresent=true→false`? cek efek pada `activeVoterId`.

- `startVotingSession` / `closeVotingSession` / `resetVotingSession`:
  - `startVotingSession` hanya valid dari status `not_started`; dari `active`/`closed` → throw.
  - `agenda`/`scheduledAt` kosong atau hanya whitespace → throw.
  - Transisi penuh: `not_started` → `startVotingSession` → `active` → `closeVotingSession` → `closed` → `resetVotingSession` → `not_started`.
  - Coba `closeVotingSession` dari status `not_started` (belum pernah start) → perilaku harus didefinisikan & diuji.

- `setActiveVoter` (akses bilik):
  - Voting tidak aktif → throw.
  - Resident belum hadir → throw.
  - Resident sudah `hasVoted` → throw `"Warga ini sudah menggunakan hak pilih."`.
  - Dua resident berbeda merebut bilik (`activeVoterId`) secara berurutan → yang kedua menggantikan yang pertama; pastikan ini sesuai desain (single booth).

### 4.6 API Routes — Integration Test (whitebox, mock DB)

**`POST /api/auth/login`**
- Body tanpa `username`/`password` → 400.
- Kredensial admin valid → 200, cookie ter-set, `sessionUser.role` benar.
- Kredensial resident valid tapi voting status ≠ `active` → 403 meski password benar.
- Kredensial resident valid + voting `active` → 200 dan `markResidentPresent` terpanggil (cek side-effect `isPresent`).
- Kredensial salah → 401 dengan pesan generik (tidak membocorkan apakah username ada).

**`POST /api/votes/cast`**
- Tanpa sesi (cookie kosong/invalid) → 401.
- Sesi valid tapi role `admin`/`operator` → 403 `"Hanya warga yang dapat memilih."`.
- Body tanpa `encryptedVote` → 400.
- `encryptedVote` tidak bisa didekripsi (ciphertext acak) → 400 dengan pesan error dekripsi.
- `encryptedVote` valid tapi `candidateId` tidak ada di tabel kandidat → perilaku `castVote` saat `findResidentById` beda dari validasi kandidat — **cek apakah ada validasi candidateId exists**; jika tidak ada, ini gap yang perlu dicatat (lihat §6).
- Resident sudah pernah vote → 400 `"Resident already voted"` (test anti double-submit lewat endpoint, bukan hanya fungsi repository).
- Endpoint hanya menerima method POST (GET/PUT ke route ini harus 405 dari Next.js routing — cukup smoke test).

**`POST /api/attendance/toggle`, `GET/POST /api/booth/active-voter`, `GET/POST /api/voting/sessions`, `GET/POST /api/voting/status`**
- RBAC: pastikan endpoint operator-only menolak resident dan sebaliknya.
- State-dependent errors dari §4.5 harus terpropagasi sebagai 400 dengan pesan yang sesuai (bukan 500).

**`residents` (CRUD, `access`, `send-access`, `import`)**
- Validasi field wajib saat create/update (NIK format, status enum).
- `import`: file/array kosong, duplikat NIK dalam satu batch import, baris dengan kolom hilang.
- `access`/`send-access`: hanya bisa dipicu untuk resident dengan status `Aktif`; pastikan tidak bisa mengirim akses ke resident yang sudah `hasVoted` atau tidak `isPresent` (selaras dengan §4.5).
- Mask NIK pada response (sesuai riwayat commit "Mask NIK display") — pastikan endpoint list residents tidak balik NIK penuh ke client non-admin.

**`users`, `candidates`**
- CRUD dasar: create dengan field wajib kosong → 400; update/delete id yang tidak ada → 404/400 sesuai kontrak; duplikat nomor urut kandidat → ditolak (selaras riwayat commit "flag duplicate candidate numbers").

**`bootstrap`, `analysis`, `notifications/stream`**
- `bootstrap`: idempotensi — dipanggil berkali-kali tidak membuat data duplikat/tidak merusak state existing.
- `analysis`: menghitung agregat suara dengan benar untuk 0 kandidat, 0 vote, dan vote merata/timpang.
- `notifications/stream` (SSE): koneksi ditutup dengan bersih, tidak leak listener saat client disconnect (uji lewat `lib/events.ts`).

## 5. Pengujian Berorientasi Keamanan (bagian dari whitebox)

| Area | Yang diuji |
|---|---|
| Session tampering | Modifikasi payload/signature cookie → ditolak (lihat §4.1) |
| Timing attack | Konfirmasi `timingSafeEqual` dipakai untuk signature comparison (sudah ada — regresi test agar tidak dihapus tanpa sengaja) |
| Replay vote payload | Payload terenkripsi lama (>5 menit) ditolak; payload valid yang dikirim ulang ditolak oleh `hasVoted` check di level `castVote` |
| RBAC | Setiap endpoint operator-only ditolak untuk role resident dan sebaliknya |
| SQL Injection | Semua query di `repository.ts` memakai prepared statement — tambahkan test dengan input mengandung `'`, `--`, `;` untuk memastikan tidak ada string concatenation yang terlewat |
| Password storage | **Temuan untuk dikonfirmasi ke tim:** query kredensial membandingkan password secara langsung di SQL (`WHERE ... password = ?`), mengindikasikan kemungkinan password disimpan plaintext, bukan hash. Rekomendasikan audit terpisah — di luar scope "menambah test", tapi perlu ditandai sebagai risiko. |
| Default secret | `AUTH_SECRET` fallback ke `"development-only-secret"` — tambahkan test yang memverifikasi env var wajib di-set saat `NODE_ENV=production` (saat ini tidak ada guard eksplisit di kode). |
| Expired/future timestamp | Payload dengan `issuedAt` di masa depan (jam device tidak sinkron / manipulasi client) tetap harus ditolak jika di luar window. |

## 6. Prioritas & Urutan Eksekusi

1. **P0 — Kritis:** `lib/vote-crypto.ts`, `castVote` state machine, `lib/auth.ts` session tampering, RBAC di `votes/cast`.
2. **P1 — Tinggi:** `findResidentSessionByCredentials`, voting session lifecycle, `attendance/toggle`, `booth/active-voter`.
3. **P2 — Sedang:** CRUD residents/users/candidates, password policy, import residents.
4. **P3 — Rendah:** `analysis`, `notifications/stream`, `bootstrap` idempotency.

## 7. Setup Lingkungan Uji

- Tambahkan test runner (Vitest direkomendasikan untuk kompatibilitas Next.js/TypeScript — perlu persetujuan sebelum instalasi dependency baru).
- Gunakan file SQLite terpisah untuk test (mis. `data/sura-warga.test.sqlite`) atau in-memory (`:memory:`), jangan pernah menjalankan test terhadap `data/sura-warga.sqlite` yang dipakai dev/produksi.
- Set `VOTING_RSA_PRIVATE_KEY` / `VOTING_RSA_PUBLIC_KEY` dummy khusus test (jangan reuse key produksi) via `.env.test`.
- Reset state DB per test case (gunakan `scripts/reset-demo-db.mjs` sebagai referensi, jalankan sebelum setiap suite).

## 8. Deliverable

- Suite test otomatis per modul (`*.test.ts`) mengikuti struktur folder `lib/` dan `app/api/`.
- Laporan coverage (statement/branch) per file.
- Daftar temuan non-fungsional dari §5 & §6 untuk ditindaklanjuti terpisah dari implementasi test.
