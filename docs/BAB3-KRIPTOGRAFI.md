# 3.2–3.4 Penerapan Kriptografi, RSA, dan Encoding Base64

Materi ini disusun berdasarkan implementasi nyata pada aplikasi Sura Warga, mencakup proses enkripsi suara yang berjalan di sisi klien (browser warga) dan proses dekripsi yang berjalan di sisi server, pada fitur e-voting.

---

## 3.2 Penerapan Kriptografi

Dalam sistem e-voting Sura Warga, kriptografi diterapkan untuk menjaga kerahasiaan (*confidentiality*) dan integritas suara warga selama proses pengiriman dari perangkat warga menuju server, sekaligus mencegah kebocoran pilihan warga apabila data berhasil disadap di jalur komunikasi.

Beberapa pertimbangan penerapan kriptografi pada sistem ini:

- Proses pemungutan suara melibatkan dua pihak yang tidak dapat saling berbagi kunci rahasia yang sama secara aman (warga di sisi klien dan server di sisi backend). Oleh karena itu, sistem menggunakan skema **kriptografi asimetris** (*public-key cryptography*), bukan kriptografi simetris. Pada skema ini digunakan sepasang kunci: **kunci publik** (*public key*) yang disebarkan ke seluruh klien untuk mengenkripsi suara, dan **kunci privat** (*private key*) yang hanya disimpan di server untuk mendekripsi suara yang masuk.
- Dengan skema tersebut, meskipun kunci publik diketahui oleh siapa pun (termasuk pihak yang tidak berwenang), hanya server yang memegang kunci privat dan mampu membaca isi suara yang dikirim warga.
- Enkripsi dilakukan **di sisi klien** (browser warga), tepatnya pada fungsi `encryptVotePayload`, sebelum data dikirim melalui jaringan — sehingga pilihan kandidat warga (`candidateId`) tidak pernah dikirim dalam bentuk teks polos (*plaintext*) melalui HTTP.
- Dekripsi hanya dapat dilakukan **di sisi server**, tepatnya pada fungsi `decryptEncryptedVote`, menggunakan kunci privat yang tidak pernah didistribusikan ke klien mana pun.
- Selain melindungi isi suara, payload yang dienkripsi turut menyertakan stempel waktu (`issuedAt`) yang divalidasi berada dalam rentang **±5 menit** dari waktu server menerima permintaan, sebagai mekanisme tambahan untuk mencegah serangan *replay* (pengiriman ulang paket suara yang sama oleh pihak yang tidak berwenang).

Algoritma kriptografi asimetris yang dipilih dalam penelitian ini adalah **RSA (Rivest–Shamir–Adleman)** dengan skema padding **OAEP**, yang dijelaskan lebih rinci pada subbab 3.3.

---

## 3.3 Penerapan Algoritma RSA

Algoritma RSA digunakan sebagai skema enkripsi asimetris utama pada proses pemungutan suara elektronik. Implementasi RSA pada sistem ini memanfaatkan pustaka bawaan Node.js (`node:crypto`) di sisi server dan Web Crypto API bawaan browser (`SubtleCrypto`) di sisi klien, sehingga **tidak memerlukan pustaka kriptografi pihak ketiga tambahan**.

### 3.3.1 Pembangkitan Kunci

- Ukuran kunci (modulus) yang digunakan adalah **2048 bit**, sesuai rekomendasi minimum keamanan RSA saat ini.
- Kunci publik disimpan dalam format **SPKI** (*SubjectPublicKeyInfo*) dan kunci privat dalam format **PKCS8**, keduanya dienkode **PEM** (*Privacy-Enhanced Mail*) — format pertukaran kunci yang umum digunakan.
- Pada lingkungan produksi, pasangan kunci diambil dari variabel lingkungan (`VOTING_RSA_PUBLIC_KEY` dan `VOTING_RSA_PRIVATE_KEY`) agar kunci privat tidak tersimpan di dalam kode sumber. Apabila variabel tersebut tidak diset (misalnya pada lingkungan pengembangan), sistem otomatis membangkitkan pasangan kunci baru saat aplikasi dijalankan, melalui fungsi `generateKeyPairSync`.
- Kunci publik didistribusikan ke seluruh klien melalui data awal aplikasi (field `votingEncryptionPublicKey` pada endpoint bootstrap), sedangkan kunci privat tidak pernah meninggalkan server.

### 3.3.2 Skema Padding OAEP

- Alih-alih menggunakan skema padding klasik **PKCS#1 v1.5** yang rentan terhadap serangan *chosen-ciphertext* (Bleichenbacher attack), sistem ini menerapkan skema padding **OAEP** (*Optimal Asymmetric Encryption Padding*) dengan fungsi hash **SHA-256**.
- Penerapan OAEP memberikan sifat keamanan semantik (*semantic security*): ciphertext yang dihasilkan dari plainteks yang sama akan selalu berbeda pada setiap proses enkripsi (karena adanya nilai acak yang disisipkan OAEP), sehingga pihak luar tidak dapat menyimpulkan pola pilihan warga hanya dari kemiripan ciphertext.

### 3.3.3 Proses Enkripsi (Sisi Klien)

Dilakukan pada fungsi `encryptVotePayload`:

1. Kunci publik PEM yang diterima dari server diubah menjadi `ArrayBuffer`, lalu diimpor sebagai objek `CryptoKey` menggunakan `crypto.subtle.importKey` dengan algoritma `RSA-OAEP` dan hash `SHA-256`.
2. Payload suara berupa objek `{ candidateId, issuedAt }` diserialisasi menjadi JSON, lalu dienkode ke `Uint8Array`.
3. Data tersebut dienkripsi menggunakan `crypto.subtle.encrypt` dengan kunci publik yang telah diimpor, menghasilkan ciphertext biner (`ArrayBuffer`).
4. Ciphertext biner dikonversi ke format **Base64** (dibahas pada subbab 3.4) agar dapat dikirim sebagai teks melalui permintaan HTTP.

### 3.3.4 Proses Dekripsi (Sisi Server)

Dilakukan pada fungsi `decryptEncryptedVote`:

1. String Base64 yang diterima dari klien didekode kembali menjadi data biner (`Buffer`).
2. Data biner didekripsi menggunakan fungsi `privateDecrypt` dari modul `node:crypto`, dengan kunci privat RSA serta parameter padding `RSA_PKCS1_OAEP_PADDING` dan `oaepHash: "sha256"` — harus sama persis dengan parameter yang digunakan saat enkripsi di sisi klien, agar proses dekripsi berhasil.
3. Hasil dekripsi (plainteks JSON) di-*parse* kembali menjadi objek `{ candidateId, issuedAt }`.
4. Sistem memvalidasi struktur data (`candidateId` harus berupa *string*, `issuedAt` harus berupa angka) serta memastikan `issuedAt` berada dalam rentang waktu **±5 menit** dari waktu saat ini, sebelum suara diteruskan ke proses pencatatan (`castVote`).

### Tabel Ringkasan Parameter RSA

| Parameter | Nilai |
|---|---|
| Algoritma | RSA-OAEP |
| Ukuran kunci (modulus) | 2048 bit |
| Fungsi hash OAEP | SHA-256 |
| Format kunci publik | SPKI (PEM) |
| Format kunci privat | PKCS8 (PEM) |
| Pustaka sisi server | `node:crypto` (Node.js) |
| Pustaka sisi klien | Web Crypto API (`SubtleCrypto`) |
| Validasi tambahan | Rentang waktu payload ±5 menit (anti-*replay*) |

---

## 3.4 Penerapan Encoding Base64

Selain algoritma RSA, sistem ini juga menerapkan *encoding* Base64 pada beberapa titik dalam alur enkripsi suara. Perlu ditegaskan bahwa **Base64 bukan merupakan metode enkripsi atau mekanisme keamanan**, melainkan skema *encoding* yang mengubah data biner menjadi rangkaian karakter ASCII agar aman ditransmisikan melalui media berbasis teks seperti JSON dan HTTP, yang tidak dapat menyertakan data biner mentah secara langsung.

Penerapan Base64 pada sistem ini terjadi pada empat titik berikut:

1. **Format kunci PEM** — kunci publik dan kunci privat RSA yang dibangkitkan disimpan dalam format PEM, yang secara internal merupakan representasi Base64 dari struktur data kunci (*DER-encoded* SPKI/PKCS8) yang diapit oleh penanda `-----BEGIN PUBLIC KEY-----` dan `-----END PUBLIC KEY-----`.
2. **Impor kunci publik di sisi klien** (fungsi `pemToArrayBuffer`) — sebelum kunci publik PEM dapat digunakan oleh Web Crypto API, penanda PEM dihapus dan sisa teks Base64 didekode menjadi data biner mentah menggunakan fungsi bawaan browser `atob()`, menghasilkan `ArrayBuffer` yang kemudian diimpor sebagai `CryptoKey`.
3. **Pengiriman ciphertext hasil enkripsi** (fungsi `arrayBufferToBase64`) — hasil enkripsi RSA-OAEP berupa data biner (`ArrayBuffer`) tidak dapat dikirim langsung sebagai bagian dari *body* JSON. Data biner tersebut dienkode menjadi string Base64 menggunakan fungsi bawaan browser `btoa()`, sehingga dapat disertakan sebagai nilai string pada field `encryptedVote` dalam permintaan HTTP saat suara dikirim ke server.
4. **Dekode di sisi server** (fungsi `decryptEncryptedVote`) — string Base64 yang diterima server dari klien didekode kembali menjadi data biner menggunakan `Buffer.from(encryptedVote, "base64")`, sebelum diproses oleh fungsi dekripsi RSA (`privateDecrypt`).

Dengan demikian, Base64 berperan sebagai jembatan transportasi data biner (baik kunci maupun ciphertext) agar tetap kompatibel dengan format teks yang digunakan pada komunikasi HTTP/JSON. Keamanan kerahasiaan data sepenuhnya bergantung pada proses enkripsi RSA-OAEP yang dijelaskan pada subbab 3.3, **bukan** pada Base64 itu sendiri.
