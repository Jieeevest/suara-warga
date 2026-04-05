# Implementasi Algoritma RSA Dengan Encoding Base64 Untuk Pengamanan Data Voting

## Gambaran umum

Pada sistem ini, data voting tidak lagi dikirim dalam bentuk plaintext dari browser ke server. Sebelum request dikirim, payload vote dienkripsi menggunakan algoritma RSA di sisi client. Hasil enkripsi tersebut kemudian diubah ke format Base64 agar dapat dikirim melalui JSON pada request HTTP.

Di sisi server, ciphertext Base64 didekode kembali menjadi data biner, lalu didekripsi menggunakan private key RSA. Setelah payload asli diperoleh, server memproses data suara sesuai logika aplikasi.

## Tujuan implementasi

- Menjaga kerahasiaan data pilihan kandidat saat transmisi.
- Mengurangi risiko pembacaan langsung terhadap payload vote di network log atau request body.
- Menyesuaikan implementasi sistem dengan topik pengamanan data voting menggunakan RSA dan Base64.

## Arsitektur

Komponen utama:

1. Client browser
2. Public key RSA
3. Endpoint vote di server
4. Private key RSA
5. Database aplikasi

Alur:

1. Server menyisipkan public key ke bootstrap aplikasi.
2. Client membuat payload vote:
   - `candidateId`
   - `issuedAt`
3. Client mengenkripsi payload dengan public key RSA menggunakan skema `RSA-OAEP` dan hash `SHA-256`.
4. Ciphertext hasil enkripsi di-encode ke Base64.
5. Client mengirim `encryptedVote` ke endpoint `/api/votes/cast`.
6. Server melakukan decode Base64.
7. Server melakukan decrypt dengan private key RSA.
8. Server memvalidasi payload dan memproses vote.

## Lokasi implementasi pada kode

### 1. Util RSA server

File: [lib/vote-crypto.ts](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/lib/vote-crypto.ts)

Tanggung jawab:

- memuat key dari environment
- membuat key pair sementara jika environment belum tersedia
- menyediakan public key ke frontend
- decrypt ciphertext vote
- memvalidasi struktur payload
- memvalidasi umur payload vote

### 2. Distribusi public key

File: [lib/bootstrap.ts](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/lib/bootstrap.ts)

Public key RSA dikirim ke frontend melalui `BootstrapData` dengan properti:

- `votingEncryptionPublicKey`

### 3. Enkripsi di client

File: [lib/vote-encryption-client.ts](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/lib/vote-encryption-client.ts)

Tanggung jawab:

- mengubah PEM public key menjadi `ArrayBuffer`
- import key ke Web Crypto API
- mengenkripsi payload vote
- mengubah ciphertext ke Base64

### 4. Pengiriman vote terenkripsi

File: [features/context/AppContext.tsx](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/features/context/AppContext.tsx)

Sebelum implementasi:

- frontend mengirim `candidateId` langsung

Sesudah implementasi:

- frontend mengenkripsi payload vote
- frontend mengirim `encryptedVote`

### 5. Dekripsi di endpoint voting

File: [app/api/votes/cast/route.ts](/Users/bitmind/Documents/SUPER-PROJECT/sura-warga/app/api/votes/cast/route.ts)

Tanggung jawab:

- menerima ciphertext Base64
- melakukan decrypt RSA
- menolak payload invalid atau kedaluwarsa
- meneruskan `candidateId` hasil decrypt ke repository

## Peran Base64

Base64 pada implementasi ini tidak berfungsi sebagai algoritma keamanan. Base64 hanya dipakai untuk mengubah ciphertext biner hasil enkripsi RSA menjadi string teks agar dapat dikirim lewat body JSON.

Jadi:

- RSA = pengamanan / enkripsi
- Base64 = encoding untuk transport data

## Validasi payload

Payload vote mengandung:

- `candidateId`
- `issuedAt`

Server memeriksa:

- `candidateId` harus ada
- `issuedAt` harus valid
- payload tidak boleh lebih lama dari batas yang ditentukan

Tujuannya adalah menekan replay request sederhana.

## Konfigurasi key

Environment yang didukung:

- `VOTING_RSA_PUBLIC_KEY`
- `VOTING_RSA_PRIVATE_KEY`

Jika dua variabel tersebut tidak diisi, aplikasi membuat pasangan key sementara saat runtime. Pendekatan ini praktis untuk development, namun untuk pengujian formal dan deployment sebaiknya key disimpan permanen di environment.

Untuk generate key:

```bash
npm run generate:voting-keys
```

## Kelebihan implementasi

- Payload vote tidak dikirim dalam bentuk plaintext.
- Frontend hanya memegang public key.
- Server menjaga private key.
- Implementasi cukup relevan untuk kebutuhan akademik dan demonstrasi pengamanan data voting.

## Keterbatasan implementasi

- Belum menggunakan digital signature.
- Belum menyediakan audit trail kriptografis.
- Belum merupakan sistem end-to-end verifiable voting.
- Keamanan total sistem masih tetap bergantung pada keamanan server, session, dan kontrol akses.

## Kesimpulan implementasi

Dengan implementasi ini, sistem e-voting telah menggunakan RSA untuk mengenkripsi payload data voting pada sisi client, dan menggunakan Base64 untuk mentransmisikan ciphertext tersebut ke server dalam format yang kompatibel dengan JSON. Pendekatan ini meningkatkan kerahasiaan data voting selama proses pengiriman dari browser ke server.
