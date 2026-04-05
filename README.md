# Sura Warga

Sistem e-voting RT/RW berbasis Next.js dengan dashboard admin, registrasi pemilih, kontrol bilik suara, dan pengamanan payload voting menggunakan RSA + Base64.

## Stack

- Next.js App Router
- React 19
- SQLite lokal
- Tailwind CSS

## Menjalankan aplikasi

Prasyarat:

- Node.js 20+
- npm

Langkah:

1. Install dependency

```bash
npm install
```

2. Siapkan environment

```bash
cp .env.example .env.local
```

3. Isi minimal variabel berikut di `.env.local`

```env
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=superadmin
AUTH_SECRET=ganti_dengan_secret_yang_aman
```

4. Jalankan aplikasi

```bash
npm run dev
```

## Update cepat di laptop lain

Kalau repo sudah pernah di-clone dan ingin menarik update terbaru lalu mengosongkan data demo:

```bash
git pull origin main
npm run refresh:demo
npm run dev
```

Kalau hanya ingin reset database lokal ke kondisi demo bersih tanpa install ulang dependency:

```bash
npm run reset:demo
npm run dev
```

Script `reset:demo` akan menghapus file SQLite lokal di folder `data/`, lalu database akan dibuat ulang otomatis dari seed kosong saat aplikasi dijalankan lagi.

## Email akses warga via Gmail SMTP

Fitur `Send Access via Email` pada manajemen data warga mengirim email dari server menggunakan SMTP.

Environment yang perlu diisi:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Sura Warga <your_gmail_address@gmail.com>"
```

Catatan:

- Untuk Gmail, gunakan App Password, bukan password akun utama.
- Tombol kirim akses di halaman warga akan memanggil endpoint backend dan mengirim kredensial login resident dari server.

## RSA + Base64 untuk data voting

Sistem ini sudah mengimplementasikan pengamanan payload voting dengan alur berikut:

1. Frontend menerima `public key` voting dari bootstrap aplikasi.
2. Saat resident memilih kandidat, payload vote dienkripsi menggunakan RSA-OAEP SHA-256 di browser.
3. Hasil enkripsi di-encode ke Base64 agar aman dikirim lewat JSON.
4. Backend menerima `encryptedVote`, melakukan decode Base64, lalu decrypt dengan `private key`.
5. Setelah `candidateId` asli diperoleh, server memproses vote.

Catatan:

- RSA dipakai untuk enkripsi payload vote.
- Base64 dipakai sebagai encoding ciphertext, bukan sebagai algoritma keamanan.
- Payload vote saat ini berisi `candidateId` dan `issuedAt`.
- Server memvalidasi umur payload untuk mencegah replay sederhana.

## Konfigurasi key voting

Secara default, aplikasi akan membuat key pair RSA sementara jika `VOTING_RSA_PUBLIC_KEY` dan `VOTING_RSA_PRIVATE_KEY` tidak diisi.

Itu cukup untuk development, tetapi tidak ideal untuk deployment atau pengujian yang membutuhkan key konsisten.

Untuk membuat key pair sendiri:

```bash
npm run generate:voting-keys
```

Perintah ini akan menghasilkan dua baris environment yang bisa langsung ditempel ke `.env.local`.

## File implementasi utama

- [lib/vote-crypto.ts](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/lib/vote-crypto.ts)
- [lib/vote-encryption-client.ts](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/lib/vote-encryption-client.ts)
- [lib/bootstrap.ts](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/lib/bootstrap.ts)
- [features/context/AppContext.tsx](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/features/context/AppContext.tsx)
- [app/api/votes/cast/route.ts](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/app/api/votes/cast/route.ts)

## Catatan keamanan

- Implementasi ini melindungi payload vote saat transit pada level aplikasi.
- Ini belum mencakup digital signature, audit cryptographic trail, atau end-to-end verifiable voting.
- Untuk lingkungan nyata, simpan private key di secret manager atau environment yang aman.
