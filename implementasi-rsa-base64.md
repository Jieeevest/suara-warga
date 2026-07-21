# Implementasi Enkripsi RSA dan Encoding Base64 pada Data Suara

Untuk memberikan gambaran nyata mengenai hasil implementasi algoritma RSA yang dikombinasikan dengan encoding Base64 pada sistem, berikut disajikan contoh transformasi data suara secara lengkap dalam dua arah: arah maju pada saat warga memberikan suara (enkripsi di sisi klien hingga tersimpan di basis data), serta arah balik pada saat server membaca suara tersebut kembali (dekripsi di sisi server).

> **Cara isi file ini:** jalankan alur vote kamu (klien enkripsi → kirim → server dekripsi), lalu `console.log`/print nilai di tiap tahap dan tempel hasilnya menggantikan placeholder `<<< ... >>>` di bawah. Jangan ubah struktur heading-nya biar gampang pas dikonversi ke .docx nanti.

---

## A. Arah Maju — Saat Warga Memberikan Suara

### Tahap 1 — Data Suara Sebelum Enkripsi (Plaintext)

Aplikasi menyusun data suara ke dalam format JSON sebelum diproses lebih lanjut:

| | |
|---|---|
| Data dipilih | Kandidat A |
| Payload (plaintext) | `{"candidateId":"A","issuedAt":1784531896095}` |

### Tahap 2 — Setelah Enkripsi RSA-OAEP (Ciphertext)

Payload di atas dienkripsi menggunakan kunci publik RSA 2048-bit dengan skema padding OAEP (SHA-256), menghasilkan ciphertext biner. Karena data biner tidak dapat ditampilkan langsung sebagai teks, tampilkan representasinya dalam format heksadesimal (`Buffer.from(ciphertext).toString('hex')` di sisi server, atau konversi ArrayBuffer→hex di sisi klien).

| | |
|---|---|
| Ciphertext (hex) | `772a208061d1d98d3852cffd10ef44f1598148d2d98aad0fe647135f0fbe1b1ba7abf598d00598b6fad47324923e6e6ddcd8d47a0ff2ad16c9583ad20851efba6e3bcc81a727cd8fec9ec463e81532f461e9c6428110007db01ed20b90c2556380ac5cbdbffe1b91dc6b92958e8db3435b6951287bc1fee19bd7e15e3de9edd1798dbb51c1ad7fbb866d292dae154b7a46f397e10f74d84327a0acc0a5725b7398d723ea333695536de1a823de9b7aae8fee9f1dc8b2c78071cedbe6ab40fbc5ee7bd884db64782d6f9447cea1afccae648050d56f785a1c2aa2d6979dc123c42490a3f2d4304692c552b0a4cad462cb328911700bb91ddc3cc808903f9c5f7c` |
| Panjang ciphertext | 256 byte |

### Tahap 3 — Setelah Encoding Base64 (Dikirim & Disimpan)

Karena ciphertext biner tidak dapat dikirim langsung sebagai bagian dari body JSON pada permintaan HTTP, data tersebut dienkode menjadi string Base64 (hasil dari `arrayBufferToBase64` di sisi klien). Inilah bentuk data yang sesungguhnya dikirim dari klien ke server dan disimpan ke dalam basis data:

| | |
|---|---|
| encryptedVote (Base64) | `dyoggGHR2Y04Us/9EO9E8VmBSNLZiq0P5kcTXw++Gxunq/WY0AWYtvrUcySSPm5t3NjUeg/yrRbJWDrSCFHvum47zIGnJ82P7J7EY+gVMvRh6cZCgRAAfbAe0guQwlVjgKxcvb/+G5Hca5KVjo2zQ1tpUSh7wf7hm9fhXj3p7dF5jbtRwa1/u4ZtKS2uFUt6RvOX4Q902EMnoKzApXJbc5jXI+ozNpVTbeGoI96beq6P7p8dyLLHgHHO2+arQPvF7nvYhNtkeC1vlEfOoa/MrmSAUNVveFocKqLWl53BI8QkkKPy1DBGksVSsKTK1GLLMokRcAu5Hdw8yAiQP5xffA==` |
| Panjang string | 344 karakter |

String di atas adalah yang tersimpan pada kolom `encryptedVote` di basis data. Apabila basis data berhasil diakses oleh pihak yang tidak berwenang, yang diperoleh hanyalah rangkaian karakter acak tersebut — tanpa mekanisme dekripsi menggunakan kunci privat yang hanya dimiliki server, kandidat pilihan warga tidak dapat diketahui.

---

## B. Arah Balik — Saat Server Membaca Suara (Rekapitulasi)

Proses ini terjadi saat server perlu membaca kembali data suara yang tersimpan, misalnya pada tahap penghitungan dan rekapitulasi suara. Server melakukan kebalikan dari proses enkripsi: decoding Base64 diikuti dekripsi RSA.

### Tahap 4 — Decoding Base64 Kembali ke Data Biner

String Base64 pada Tahap 3 didekode kembali menjadi data biner menggunakan `Buffer.from(encryptedVote, "base64")`. Tampilkan representasi hex-nya dan bandingkan dengan Tahap 2 — harus identik:

| | |
|---|---|
| Hasil decode (hex) | `772a208061d1d98d3852cffd10ef44f1598148d2d98aad0fe647135f0fbe1b1ba7abf598d00598b6fad47324923e6e6ddcd8d47a0ff2ad16c9583ad20851efba6e3bcc81a727cd8fec9ec463e81532f461e9c6428110007db01ed20b90c2556380ac5cbdbffe1b91dc6b92958e8db3435b6951287bc1fee19bd7e15e3de9edd1798dbb51c1ad7fbb866d292dae154b7a46f397e10f74d84327a0acc0a5725b7398d723ea333695536de1a823de9b7aae8fee9f1dc8b2c78071cedbe6ab40fbc5ee7bd884db64782d6f9447cea1afccae648050d56f785a1c2aa2d6979dc123c42490a3f2d4304692c552b0a4cad462cb328911700bb91ddc3cc808903f9c5f7c` |
| Identik dengan Tahap 2? | Ya |

### Tahap 5 — Dekripsi RSA Kembali ke Data Asli

Data biner hasil decoding kemudian didekripsi menggunakan fungsi `privateDecrypt` dengan kunci privat yang hanya dimiliki server, mengembalikan data ke bentuk plaintext semula:

| | |
|---|---|
| Hasil dekripsi | `{"candidateId":"A","issuedAt":1784531896095}` |
| Identik dengan Tahap 1? | Ya |

Setelah dekripsi berhasil, sistem memvalidasi struktur data (`candidateId` harus berupa string, `issuedAt` harus berupa angka) serta memastikan `issuedAt` berada dalam rentang waktu ±5 menit dari waktu saat ini, sebelum suara diteruskan ke proses pencatatan (`castVote`).

Dengan demikian, terbukti bahwa proses enkripsi RSA-OAEP dan encoding Base64 yang diterapkan bersifat reversible (dapat dikembalikan ke data asli) sepenuhnya oleh pihak yang memiliki kunci privat yang sah, sekaligus tidak dapat dibaca oleh pihak yang tidak berwenang.

---

<!--
TIPS logging cepat (hapus komentar ini setelah dipakai):

Sisi klien (sebelum crypto.subtle.encrypt dipanggil dan setelah hasil didapat):
  console.log("PLAINTEXT:", JSON.stringify(payloadObj));
  console.log("CIPHERTEXT_HEX:", Buffer.from(ciphertextArrayBuffer).toString('hex'));
  console.log("BASE64:", base64String);

Sisi server (di dalam fungsi decryptEncryptedVote / sebelum & sesudah privateDecrypt):
  const decodedBuf = Buffer.from(encryptedVote, "base64");
  console.log("DECODED_HEX:", decodedBuf.toString('hex'));
  const decrypted = crypto.privateDecrypt(..., decodedBuf);
  console.log("DECRYPTED:", decrypted.toString('utf8'));
-->
