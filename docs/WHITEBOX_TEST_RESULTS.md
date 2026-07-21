# Hasil Pengujian Whitebox — Sura Warga

## 0. Status & Metodologi (PENTING — baca sebelum memakai dokumen ini)

Dokumen ini memuat **dua tingkat bukti** yang berbeda sifatnya. Keduanya ditandai eksplisit di setiap bagian agar tidak disalahartikan sebagai hasil eksekusi ketika sebenarnya hanya analisis manual:

| Level | Cakupan | Metode | Status |
|---|---|---|---|
| **Level 1 — Eksekusi otomatis (real)** | `lib/auth.ts`, `lib/vote-crypto.ts`, `lib/password-policy.ts`, `lib/repository.ts` (state machine voting & kredensial) | Test suite **Vitest** sungguhan (`lib/*.test.ts`), dijalankan dengan `npx vitest run`, hasil pass/fail berasal dari output asli terminal | **54/54 test PASS** (lihat §1–§5 dan log mentah di §9) |
| **Level 2 — Code tracing (analisis manual)** | API route `auth/login`, `votes/cast`, dan endpoint lain | Penelusuran kode manual tanpa eksekusi otomatis (belum ada test harness untuk Next.js route handler di proyek ini) | Belum dieksekusi — ditandai jelas di §6–§7 |

**Alat & lingkungan:**
- Test runner: `vitest` v3.2.7 (ditambahkan sebagai devDependency baru — sudah disetujui pengguna).
- Config: `vitest.config.ts` (project root).
- File test: `lib/vote-crypto.test.ts`, `lib/password-policy.test.ts`, `lib/auth.test.ts`, `lib/repository.test.ts`.
- Database test: SQLite **in-memory** (`better-sqlite3(':memory:')`) dengan skema identik ke `lib/db.ts`, di-mock lewat `vi.mock("./db")` — **tidak pernah menyentuh** `data/sura-warga.sqlite` (diverifikasi: mtime file tidak berubah setelah test run).
- Perintah reproduksi: `npx vitest run` dari root proyek.

**Koreksi penting terhadap draf awal:** dua kesimpulan di draf sebelumnya (yang murni berbasis code tracing manual) **terbukti salah** setelah dijalankan sebagai test sungguhan. Ini didokumentasikan apa adanya di §5 dan §4 — termasuk dalam whitebox testing yang baik untuk ditunjukkan di skripsi, karena justru menunjukkan *kenapa* eksekusi nyata lebih kuat daripada analisis manual saja.

## 1. Hasil Eksekusi — `lib/auth.ts` (12 test, real, PASS 12/12)

File: `lib/auth.test.ts`. Mocking: `next/headers` (cookie store in-memory via `Map`), `./repository` (`vi.mock`).

| ID Uji | Skenario | Hasil Eksekusi | Status |
|---|---|---|---|
| TC-AUTH-01 | Round-trip sign/parse | Objek `SessionUser` yang dikembalikan identik dengan input | ✅ PASS |
| TC-AUTH-02 | Cookie di-tamper (payload diubah) | `parseSessionValue` mengembalikan `null` | ✅ PASS |
| TC-AUTH-03 | Cookie tanpa separator `.` | `null` | ✅ PASS |
| TC-AUTH-04 | Signature panjang berbeda | `null`, tanpa exception terlempar | ✅ PASS |
| TC-AUTH-05 | Payload base64url valid tapi bukan JSON | `null`, tanpa exception terlempar | ✅ PASS |
| — | `parseSessionValue(undefined)` | `null` | ✅ PASS |
| TC-AUTH-06 | Resident session saat voting `not_started` | `getCurrentSessionUser()` → `null` | ✅ PASS |
| TC-AUTH-07 | Resident session saat voting `active` | Mengembalikan user | ✅ PASS |
| — | Admin session tidak terpengaruh status voting | Tetap mengembalikan user meski voting `not_started` | ✅ PASS |
| TC-AUTH-08 | Cookie flag saat `NODE_ENV=production` | `secure: true` | ✅ PASS |
| — | Cookie flag saat bukan production | `secure: false` | ✅ PASS |
| TC-AUTH-09 | `AUTH_SECRET` berbeda menghasilkan signature berbeda | Session lama menjadi invalid (`null`) setelah secret berganti | ✅ PASS (perilaku terkonfirmasi — lihat catatan risiko di §8) |

## 2. Hasil Eksekusi — `lib/vote-crypto.ts` (13 test, real, PASS 13/13)

File: `lib/vote-crypto.test.ts`. Enkripsi test dilakukan dengan `publicEncrypt` (Node `node:crypto`) memakai public key yang sama yang diekspor `getVotingPublicKey()`, menghasilkan ciphertext yang identik formatnya dengan payload dari client (`lib/vote-encryption-client.ts`, WebCrypto RSA-OAEP SHA-256).

| ID Uji | Skenario | Hasil Eksekusi | Status |
|---|---|---|---|
| TC-CRYPTO-01 | Round-trip encrypt-decrypt | Payload identik | ✅ PASS |
| TC-CRYPTO-02 | Ciphertext acak/korup | Exception terlempar | ✅ PASS |
| TC-CRYPTO-03 | `candidateId` hilang | `"Payload vote tidak valid."` | ✅ PASS |
| TC-CRYPTO-04 | `candidateId` bukan string | `"Payload vote tidak valid."` | ✅ PASS |
| TC-CRYPTO-05 | `issuedAt` hilang | `"Timestamp vote tidak valid."` | ✅ PASS |
| TC-CRYPTO-06 | `issuedAt = 0` | `"Timestamp vote tidak valid."` | ✅ PASS |
| TC-CRYPTO-07 | `issuedAt` kedaluwarsa (>5 menit lalu) | `"Payload vote sudah kedaluwarsa."` | ✅ PASS |
| TC-CRYPTO-08 | `issuedAt` di masa depan (>5 menit) | `"Payload vote sudah kedaluwarsa."` | ✅ PASS |
| TC-CRYPTO-09a | Boundary 299999ms | Diterima | ✅ PASS |
| TC-CRYPTO-09b | Boundary tepat 300000ms | Diterima (inklusif) | ✅ PASS |
| TC-CRYPTO-09c | Boundary 300001ms | Ditolak | ✅ PASS |
| TC-CRYPTO-10 | Replay payload sama 2x dalam window valid | Dekripsi sukses di kedua panggilan (proteksi replay ada di `castVote`, bukan di layer ini) | ✅ PASS |
| — | `getVotingPublicKey()` mengembalikan PEM valid | Mengandung header `-----BEGIN PUBLIC KEY-----` | ✅ PASS |

**Catatan teknis dari proses eksekusi nyata (temuan yang tidak muncul saat hanya code tracing):** percobaan awal test boundary (TC-CRYPTO-09a/09b) memakai `Date.now()` real-time saat encrypt lalu dipakai lagi saat decrypt beberapa milidetik kemudian — pada eksekusi sungguhan ini **gagal secara intermiten** karena proses RSA encrypt/decrypt makan waktu nyata beberapa ms, sehingga payload yang dibuat "299999ms lalu" kadang sudah melewati batas 300000ms saat benar-benar dicek. Ini bukan bug di `vote-crypto.ts`, melainkan bukti bahwa **kode memakai jam nyata (`Date.now()`) saat pengecekan, bukan waktu saat payload dibuat** — konsekuensinya, request vote yang lambat sampai ke server (jaringan lambat) bisa gagal lebih cepat dari yang diperkirakan pengguna. Test diperbaiki dengan `vi.setSystemTime()` (fake timer) agar deterministik; hasil akhir tetap PASS 13/13.

## 3. Hasil Eksekusi — `lib/password-policy.ts` (8 test, real, PASS 8/8)

File: `lib/password-policy.test.ts`.

| ID Uji | Input | Hasil Eksekusi | Status |
|---|---|---|---|
| TC-PWD-01 | `Passw0rd!` | `true` | ✅ PASS |
| TC-PWD-02 | `passw0rd!` (tanpa huruf besar) | `false` | ✅ PASS |
| TC-PWD-03 | `PASSW0RD!` (tanpa huruf kecil) | `false` | ✅ PASS |
| TC-PWD-04 | `Password!` (tanpa angka) | `false` | ✅ PASS |
| TC-PWD-05 | `Passw0rd` (tanpa simbol) | `false` | ✅ PASS |
| TC-PWD-06 | `Pw0!aaa` (7 karakter) | `false` | ✅ PASS |
| TC-PWD-07 | `""` | `false` | ✅ PASS |
| TC-PWD-08 | `Aa1!bbbb` (tepat 8 karakter valid) | `true` | ✅ PASS |

## 4. Hasil Eksekusi — `lib/repository.ts`: Kredensial (5 test, real, PASS 5/5)

File: `lib/repository.test.ts`, dengan SQLite in-memory.

| ID Uji | Skenario | Hasil Eksekusi | Status |
|---|---|---|---|
| TC-REPO-01 | Kredensial admin valid | User ter-mapping dengan benar | ✅ PASS |
| TC-REPO-02 | Input `' OR '1'='1` (SQL-injection-like) di username & password | Tetap `null` — prepared statement memperlakukan input sebagai data literal | ✅ PASS |
| TC-REPO-03 | NIK bukan 8 digit (`"1234567"`, `"abcdefgh"`, `"123456789"`) | `null` tanpa query ke DB | ✅ PASS |
| TC-REPO-04 | NIK 8 digit valid, tidak ada match | `null` | ✅ PASS |
| — | NIK 8 digit + password cocok, 1 match | Session resident ditemukan | ✅ PASS |
| TC-REPO-05 | **(revisi)** Dua resident beda NIK, 8 digit akhir sama, password sama | `null` — **bukan bug**, kode memang menolak match ambigu (`matches.length !== 1 → return null`), sehingga fail-safe, bukan salah pilih resident | ✅ PASS |

**Koreksi terhadap draf awal:** draf pertama menandai TC-REPO-05 sebagai "Perlu Perhatian" karena diduga bisa terjadi pemilihan baris yang salah saat ambigu. Setelah dieksekusi nyata, terbukti kode **menolak seluruhnya** (return `null`) saat match lebih dari satu — ini perilaku aman, bukan celah. Temuan awal dicabut.

## 5. Hasil Eksekusi — State Machine Voting (21 test, real, PASS 21/21)

| ID Uji | Skenario | Hasil Eksekusi | Status |
|---|---|---|---|
| TC-VOTE-01 | Vote saat status ≠ `active` | Throw `"Vote hanya dapat dilakukan saat voting sedang aktif."` | ✅ PASS |
| TC-VOTE-02 | Resident tidak ditemukan | Throw `"Resident not found"` | ✅ PASS |
| TC-VOTE-03 | Resident status bukan `Aktif` | Throw `"Hanya warga aktif yang dapat mengikuti e-voting."` | ✅ PASS |
| TC-VOTE-04 | Resident sudah `hasVoted` | Throw `"Resident already voted"` (anti double-voting) | ✅ PASS |
| TC-VOTE-05 | Resident belum `isPresent` | Throw sesuai pesan | ✅ PASS |
| TC-VOTE-06 | Semua syarat terpenuhi | Vote count kandidat +1, `hasVoted → true` | ✅ PASS |
| **(revisi)** | `candidateId` tidak eksis di tabel kandidat | **Throw `"Candidate not found"`** — validasi ADA di `castVote` (`repository.ts` baris ~552), berbeda dari kesimpulan draf awal | ✅ PASS |
| — | Vote dua kali berturut-turut (double-submit) untuk resident sama | Panggilan kedua ditolak `"Resident already voted"` | ✅ PASS |
| TC-VOTE-07 | `markResidentPresent` dipanggil saat voting `not_started` | **Berhasil tanpa error** — tidak ada guard status voting di fungsi ini | ✅ PASS (mengonfirmasi inkonsistensi — lihat §8) |
| — | `toggleAttendance` dipanggil saat voting `not_started` | Throw `"Kehadiran hanya dapat dicatat saat voting sedang aktif."` | ✅ PASS |
| TC-VOTE-08 | `startVotingSession` dari status `active` | Throw `"Sesi hanya dapat dimulai dari status belum dimulai."` | ✅ PASS |
| TC-VOTE-09 | `agenda` kosong/whitespace | Throw `"Agenda sesi wajib diisi."` | ✅ PASS |
| — | Transisi penuh `not_started → active → closed → not_started` | Semua transisi status sesuai ekspektasi | ✅ PASS |
| TC-VOTE-10 | Booth access untuk resident yang sudah `hasVoted` | Throw `"Warga ini sudah menggunakan hak pilih."` | ✅ PASS |
| — | Booth access untuk resident belum hadir | Throw `"Warga harus ditandai hadir sebelum membuka bilik."` | ✅ PASS |

**Koreksi penting terhadap draf awal (TC-API-VOTE-05):** draf pertama menyimpulkan "tidak ada validasi eksistensi `candidateId`" berdasarkan pembacaan kode yang **terpotong** (saya sebelumnya berhenti membaca `castVote` sebelum baris pengecekan kandidat). Setelah membaca fungsi lengkap dan mengujinya secara nyata, terbukti **validasi tersebut ADA**: `castVote` melakukan `SELECT * FROM candidates WHERE id = ?` dan throw `"Candidate not found"` bila tidak ada. Temuan ini **dicabut** dari daftar risiko.

## 6. API Route `POST /api/auth/login` — Level 2 (code tracing, BELUM dieksekusi otomatis)

| ID Uji | Skenario | Hasil yang Diharapkan | Hasil Aktual (Code Tracing) | Status |
|---|---|---|---|---|
| TC-API-LOGIN-01 | Body tanpa username/password | 400 | Sesuai (route.ts:18-20) | Belum dieksekusi |
| TC-API-LOGIN-02 | Kredensial admin valid | 200 + cookie | Sesuai | Belum dieksekusi |
| TC-API-LOGIN-03 | Resident valid, voting ≠ `active` | 403 | Sesuai (route.ts:37-39) | Belum dieksekusi |
| TC-API-LOGIN-04 | Resident valid, voting `active` | 200, `markResidentPresent` terpanggil | Sesuai (route.ts:41-45) | Belum dieksekusi |
| TC-API-LOGIN-05 | Kredensial salah | 401 pesan generik | Sesuai (route.ts:33-35) | Belum dieksekusi |

## 7. API Route `POST /api/votes/cast` — Level 2 (code tracing, BELUM dieksekusi otomatis)

| ID Uji | Skenario | Hasil yang Diharapkan | Hasil Aktual (Code Tracing) | Status |
|---|---|---|---|---|
| TC-API-VOTE-01 | Tanpa sesi valid | 401 | Sesuai (route.ts:8-11) | Belum dieksekusi |
| TC-API-VOTE-02 | Role bukan `resident` | 403 | Sesuai (route.ts:15-17) | Belum dieksekusi |
| TC-API-VOTE-03 | Body tanpa `encryptedVote` | 400 | Sesuai (route.ts:18-20) | Belum dieksekusi |
| TC-API-VOTE-04 | `encryptedVote` gagal didekripsi | 400 | Sesuai (route.ts:22-29) | Belum dieksekusi |
| TC-API-VOTE-06 | Resident sudah vote, submit lagi | 400 `"Resident already voted"` | Sesuai — konsisten dengan hasil real §5 | Belum dieksekusi di level API (tapi logika inti sudah teruji real di `castVote`) |

> Untuk membuat §6–§7 menjadi Level 1 (real), diperlukan test yang memanggil langsung fungsi `POST` dari masing-masing `route.ts` dengan mock `Request`, `next/headers`, dan `lib/repository` — bisa dikerjakan sebagai langkah lanjutan bila dibutuhkan untuk skripsi.

## 8. Ringkasan Hasil Real (Level 1) & Temuan

| Modul | Jumlah Test | Pass | Fail |
|---|---|---|---|
| `lib/auth.ts` | 12 | 12 | 0 |
| `lib/vote-crypto.ts` | 13 | 13 | 0 |
| `lib/password-policy.ts` | 8 | 8 | 0 |
| `lib/repository.ts` (kredensial + state machine) | 21 | 21 | 0 |
| **Total** | **54** | **54** | **0** |

**Temuan yang tetap berlaku setelah verifikasi nyata (untuk dibahas di BAB IV/V skripsi sebagai catatan, bukan bug fatal):**
1. **`AUTH_SECRET` fallback ke string default** bila env var tidak di-set (`lib/auth.ts`). Terkonfirmasi lewat eksekusi: mengganti `AUTH_SECRET` langsung membuat semua sesi lama invalid — perilaku yang benar secara keamanan, tapi berisiko bila server produksi berjalan tanpa `AUTH_SECRET` di-set (memakai nilai default yang predictable).
2. **`markResidentPresent` tidak memvalidasi status voting aktif**, berbeda dari `toggleAttendance` yang memvalidasi. Dikonfirmasi lewat eksekusi nyata (TC-VOTE-07): resident bisa ditandai hadir bahkan saat sesi voting belum dimulai.

**Temuan yang DICABUT setelah verifikasi nyata (bukti bahwa code tracing manual saja tidak cukup):**
1. ~~Tidak ada validasi eksistensi `candidateId`~~ — validasi TERNYATA ADA (`"Candidate not found"`).
2. ~~Ambiguous match pada NIK 8-digit + password sama berpotensi salah pilih resident~~ — TERNYATA kode menolak seluruhnya secara aman (fail-closed).

## 9. Log Eksekusi Mentah (lampiran bukti)

```
$ npx vitest run

 RUN  v3.2.7 /Users/bitmind/Documents/SUPER-PROJECT/sura-warga

 ✓ lib/password-policy.test.ts (8 tests) 5ms
 ✓ lib/auth.test.ts (12 tests) 16ms
 ✓ lib/repository.test.ts (21 tests) 13ms
 ✓ lib/vote-crypto.test.ts (13 tests) 34ms

 Test Files  4 passed (4)
      Tests  54 passed (54)
   Start at  13:02:21
   Duration  890ms (transform 222ms, setup 0ms, collect 785ms, tests 68ms, environment 1ms, prepare 325ms)
```

## 10. Kesimpulan

Dari 54 test case yang **benar-benar dieksekusi** (bukan hanya ditelusuri manual) terhadap modul inti autentikasi (`lib/auth.ts`), enkripsi suara (`lib/vote-crypto.ts`), validasi password (`lib/password-policy.ts`), dan state machine voting (`lib/repository.ts`), **seluruh 54 test (100%) PASS**. Dua temuan minor (fallback secret default, inkonsistensi validasi status voting di `markResidentPresent`) tetap berlaku sebagai catatan perbaikan, sementara dua dugaan celah dari analisis manual awal terbukti keliru setelah verifikasi eksekusi nyata — menegaskan pentingnya menjalankan test, bukan sekadar membaca kode, untuk klaim ilmiah yang valid.
