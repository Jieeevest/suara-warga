# Hasil Pengujian Enkripsi RSA + Base64 (30 Data Suara Nyata)

> Dihasilkan dari eksekusi nyata alur sistem (castVote, decryptEncryptedVote, encryptVotePayload, closeVotingSession) pada 2026-07-21T04:27:28.189Z, bukan simulasi terpisah.

---

## A. Contoh Lengkap (Data Suara ke-1)

| Tahap | Nilai |
|---|---|
| Plaintext (payload) | `{"candidateId":"c1","issuedAt":1784608048029}` |
| Ciphertext (hex, 256 byte) | `07960556cbd347e081b41b35439da455ff6874c0af37bcb1ef513ca1386456f1b881a030c12e95d79b815c6e16b464fda9f35ed2d14d18eaa2921b634f7eb38e24e1efc93d67b5e0472e394a2192f8c7f0e181fddb07f8724cefc9853b2186318a3b30b70a445513a394252d24408ba6b2cd7edb72a1e60601b26cead13489673a308893cbbc7ea1511e1367e1d4202afe38aa7a63bd548c5a85b166a5772db4244711b3566a0835bae7c0c9ce1ee8fee332fc1c1a50ac4f210a19dee0b0b7ddd8d9c5a9b8139cbc0ea64f97d6707f110d772fcc38b37c4a4bd281ae4a538cab669dc69be95642e827df22bc8653f7db63b5a04093326c48b861b10bc5f3c530` |
| Base64 (yang disimpan di DB) | `B5YFVsvTR+CBtBs1Q52kVf9odMCvN7yx71E8oThkVvG4gaAwwS6V15uBXG4WtGT9qfNe0tFNGOqikhtjT36zjiTh78k9Z7XgRy45SiGS+Mfw4YH92wf4ckzvyYU7IYYxijswtwpEVROjlCUtJECLprLNfttyoeYGAbJs6tE0iWc6MIiTy7x+oVEeE2fh1CAq/jiqemO9VIxahbFmpXcttCRHEbNWagg1uufAyc4e6P7jMvwcGlCsTyEKGd7gsLfd2NnFqbgTnLwOpk+X1nB/EQ13L8w4s3xKS9KBrkpTjKtmncab6VZC6CffIryGU/fbY7WgQJMybEi4YbELxfPFMA==` |
| Hasil decode Base64 -> hex | `07960556cbd347e081b41b35439da455ff6874c0af37bcb1ef513ca1386456f1b881a030c12e95d79b815c6e16b464fda9f35ed2d14d18eaa2921b634f7eb38e24e1efc93d67b5e0472e394a2192f8c7f0e181fddb07f8724cefc9853b2186318a3b30b70a445513a394252d24408ba6b2cd7edb72a1e60601b26cead13489673a308893cbbc7ea1511e1367e1d4202afe38aa7a63bd548c5a85b166a5772db4244711b3566a0835bae7c0c9ce1ee8fee332fc1c1a50ac4f210a19dee0b0b7ddd8d9c5a9b8139cbc0ea64f97d6707f110d772fcc38b37c4a4bd281ae4a538cab669dc69be95642e827df22bc8653f7db63b5a04093326c48b861b10bc5f3c530` |
| Hasil dekripsi -> plaintext | `{"candidateId":"c1","issuedAt":1784608048029}` |

Warga: AAN NURHAYANI (1f72c7e3-3cab-45f6-808a-647a8d565389) — memilih kandidat #1 H. Ahmad Sobari.

---

## B. Ringkasan 30 Data Suara

Isi tabel berikut untuk SEMUA 30 data. Kolom ciphertext/base64 boleh dipersingkat (8 karakter awal...8 karakter akhir), tapi kolom "Cocok?" harus dicek dari nilai LENGKAP di kode, bukan dari versi yang dipersingkat.

| No | Warga | Plaintext (candidateId) | Ciphertext (hex, dipersingkat) | Base64 (dipersingkat) | Decode=Ciphertext? | Dekripsi=Plaintext? |
|---|---|---|---|---|---|---|
| 1 | AAN NURHAYANI | `{"candidateId":"c1","issuedAt":1784608048029}` | `07960556...c5f3c530` | `B5YFVsvT...xfPFMA==` | Ya | Ya |
| 2 | ACHMAD ICHSAN ALKAMIL | `{"candidateId":"c2","issuedAt":1784608048038}` | `680d0ede...ae763cb0` | `aA0O3nfF...rnY8sA==` | Ya | Ya |
| 3 | AGUSTULASTARI | `{"candidateId":"c3","issuedAt":1784608048044}` | `c96e4bd1...00fe8c62` | `yW5L0RFW...AP6MYg==` | Ya | Ya |
| 4 | ARIA BASUKI | `{"candidateId":"c1","issuedAt":1784608048049}` | `24236c73...a117f98b` | `JCNsc6+x...oRf5iw==` | Ya | Ya |
| 5 | ARINDA HUTABARAT | `{"candidateId":"c2","issuedAt":1784608048054}` | `18a538e7...9944e217` | `GKU455ww...mUTiFw==` | Ya | Ya |
| 6 | ASTRI KUSHANDAYANI | `{"candidateId":"c3","issuedAt":1784608048060}` | `1b29e55f...9412964c` | `GynlXxLK...lBKWTA==` | Ya | Ya |
| 7 | ATIK HARTATI | `{"candidateId":"c1","issuedAt":1784608048065}` | `47270731...38d6abd4` | `RycHMaxe...ONar1A==` | Ya | Ya |
| 8 | BUDI DJATMIKO | `{"candidateId":"c2","issuedAt":1784608048070}` | `d1c0a81b...2a4097c0` | `0cCoGwbj...KkCXwA==` | Ya | Ya |
| 9 | DJAJA UTAMA | `{"candidateId":"c3","issuedAt":1784608048075}` | `16b7144b...58c65099` | `FrcUS4py...WMZQmQ==` | Ya | Ya |
| 10 | HENDRA AGUSNI | `{"candidateId":"c1","issuedAt":1784608048081}` | `96388c6a...0f70dff7` | `ljiMavZO...D3Df9w==` | Ya | Ya |
| 11 | HJ ENTJAH SADIYAH | `{"candidateId":"c2","issuedAt":1784608048086}` | `eac92859...8d6e4804` | `6skoWZng...jW5IBA==` | Ya | Ya |
| 12 | IDA RACHMAWATI | `{"candidateId":"c3","issuedAt":1784608048090}` | `75b863b3...3a448603` | `dbhjs5iz...OkSGAw==` | Ya | Ya |
| 13 | JACOBUS AMIN DELAROSA | `{"candidateId":"c1","issuedAt":1784608048095}` | `232ae64e...7e6145b4` | `IyrmTlTg...fmFFtA==` | Ya | Ya |
| 14 | JULIASIH WIDJAJA | `{"candidateId":"c2","issuedAt":1784608048100}` | `c5e513f4...98bf96f1` | `xeUT9L0H...mL+W8Q==` | Ya | Ya |
| 15 | LAURENTIA ARIANTI S | `{"candidateId":"c3","issuedAt":1784608048105}` | `d362e7b9...9cb0ed16` | `02Lnue57...nLDtFg==` | Ya | Ya |
| 16 | LUKAS KUSMANA | `{"candidateId":"c1","issuedAt":1784608048109}` | `c15737a9...fe3c56cc` | `wVc3qc19.../jxWzA==` | Ya | Ya |
| 17 | MEYZA GERSIA KUSUMA | `{"candidateId":"c2","issuedAt":1784608048115}` | `7822b1da...f8338c2f` | `eCKx2mgv...+DOMLw==` | Ya | Ya |
| 18 | MOHAMAD REZKY ALFAZRI | `{"candidateId":"c3","issuedAt":1784608048120}` | `c59341ab...56d753d5` | `xZNBq7DC...VtdT1Q==` | Ya | Ya |
| 19 | MUHAMAD FAIZAL | `{"candidateId":"c1","issuedAt":1784608048125}` | `1469a6a8...789492fc` | `FGmmqA7e...eJSS/A==` | Ya | Ya |
| 20 | PANJI HERVIYANA | `{"candidateId":"c2","issuedAt":1784608048130}` | `a551553d...622ecf53` | `pVFVPbF6...Yi7PUw==` | Ya | Ya |
| 21 | PUTRI NANDA RUSTIANTI | `{"candidateId":"c3","issuedAt":1784608048136}` | `2217b001...69a5099a` | `IhewATbb...aaUJmg==` | Ya | Ya |
| 22 | RONI IRAWAN | `{"candidateId":"c1","issuedAt":1784608048141}` | `559919db...079e3141` | `VZkZ2ypE...B54xQQ==` | Ya | Ya |
| 23 | S.HARTATI KUSUMASARI | `{"candidateId":"c2","issuedAt":1784608048147}` | `ce749314...e04a19c8` | `znSTFGl8...4EoZyA==` | Ya | Ya |
| 24 | SITI RUKYATUL HILALI | `{"candidateId":"c3","issuedAt":1784608048152}` | `de73463b...de284ca4` | `3nNGO4FL...3ihMpA==` | Ya | Ya |
| 25 | SUGI TRISNA | `{"candidateId":"c1","issuedAt":1784608048157}` | `866f7e13...b4e87f23` | `hm9+E/cO...tOh/Iw==` | Ya | Ya |
| 26 | SUYATMI | `{"candidateId":"c2","issuedAt":1784608048163}` | `a0957ebd...b3907ae2` | `oJV+vYzq...s5B64g==` | Ya | Ya |
| 27 | SYEH NOVITA | `{"candidateId":"c3","issuedAt":1784608048168}` | `3822c1d3...b06e73d6` | `OCLB0xwW...sG5z1g==` | Ya | Ya |
| 28 | TRI SUHARMAN | `{"candidateId":"c1","issuedAt":1784608048173}` | `9393551b...f6426dad` | `k5NVG52i...9kJtrQ==` | Ya | Ya |
| 29 | UPIK SISTIANINGTYAS | `{"candidateId":"c2","issuedAt":1784608048178}` | `c9680214...b130b2ad` | `yWgCFGEl...sTCyrQ==` | Ya | Ya |
| 30 | ZIZITA TIANA | `{"candidateId":"c3","issuedAt":1784608048184}` | `cb57abbd...537a77e5` | `y1ervQXp...U3p35Q==` | Ya | Ya |

**Ringkasan hasil:** 30/30 data cocok semua (decode == ciphertext dan dekripsi == plaintext).

---

## C. Rekapitulasi Hasil Suara (Setelah Dekripsi)

Hitung total suara per kandidat dari 30 data yang sudah didekripsi.

Diambil dari `closeVotingSession()` (fungsi rekapitulasi produksi yang sama dipakai admin untuk menutup sesi voting). Catatan arsitektur: sistem ini mendekripsi `encryptedVote` secara real-time di endpoint `/api/votes/cast` (fungsi `decryptEncryptedVote`) lalu langsung menambah `vote_count` kandidat — ciphertext tidak disimpan permanen di database, sehingga rekap tidak mendekripsi ulang dari tabel, melainkan menjumlahkan `vote_count` yang sudah hasil dekripsi per-suara.

| Kandidat | Jumlah Suara |
|---|---|
| #1 H. Ahmad Sobari | 10 |
| #2 Ir. Joko Susilo | 10 |
| #3 Ibu Linda Kusuma, S.Pd | 10 |
| **Total** | **30** |

---

## D. Analisis Entropi (30 Sampel)

Hitung entropi Shannon untuk setiap plaintext dan ciphertext dari 30 data, lalu rata-ratakan.

| | Nilai |
|---|---|
| Rata-rata entropi plaintext (bit/byte) | 4.3198 |
| Rata-rata entropi plaintext (% dari maksimum 8 bit) | 54.00% |
| Rata-rata entropi ciphertext (bit/byte) | 7.1861 |
| Rata-rata entropi ciphertext (% dari maksimum 8 bit) | 89.83% |
| Peningkatan (poin persen) | 35.83 |
| Peningkatan relatif (%) | 66.35% |
