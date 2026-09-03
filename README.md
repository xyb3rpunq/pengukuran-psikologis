<div align="center">

# TERA

**Laboratorium Pengukuran Psikologis**
<br>
*A Psychological Measurement Laboratory*

Setiap rumus di modul **PSI307** ditulis ulang sebagai kode **R**, dijalankan di peramban lewat **WebAssembly**, dan diuji terhadap angka yang tercetak di modulnya sendiri.

[**→ Buka laboratoriumnya**](https://xyb3rpunq.github.io/pengukuran-psikologis/)

[![CI](https://github.com/xyb3rpunq/pengukuran-psikologis/actions/workflows/ci.yml/badge.svg)](https://github.com/xyb3rpunq/pengukuran-psikologis/actions/workflows/ci.yml)
[![Deploy](https://github.com/xyb3rpunq/pengukuran-psikologis/actions/workflows/deploy.yml/badge.svg)](https://github.com/xyb3rpunq/pengukuran-psikologis/actions/workflows/deploy.yml)
[![R](https://img.shields.io/badge/R-4.6.0%20di%20peramban-276DC3?logo=r&logoColor=white)](https://docs.r-wasm.org/webr/latest/)
[![Uji](https://img.shields.io/badge/uji-208%20lulus-3fb950)](uji/)
[![Konformansi](https://img.shields.io/badge/konformansi-numpy%20%2B%20scipy-4dd4c8)](conformance/)
[![Bahasa](https://img.shields.io/badge/bahasa-ID%20%2B%20EN-7c6cf0)](src/i18n/kamus.ts)
[![Lisensi](https://img.shields.io/badge/lisensi-MIT-blue)](LICENSE)

[🇮🇩 Bahasa Indonesia](#-bahasa-indonesia) · [🇬🇧 English](#-english)

</div>

---

## 🇮🇩 Bahasa Indonesia

### Apa ini

Mata kuliah **PSI307 Pengukuran Psikologis** mengajarkan empat belas sesi berisi rumus: korelasi produk momen, Spearman-Brown, KR-20, KR-21, alpha Cronbach, indeks kesukaran, daya pembeda, skor z dan T, nilai skala Thurstone, koefisien reprodusibilitas Guttman. Semuanya dikerjakan dengan tangan di Excel atau SPSS.

Proyek ini menulis ulang seluruhnya sebagai kode R yang berjalan di dalam peramban — lalu membuktikan hasilnya benar dengan tiga cara berbeda.

### Sebelas alat hitung

| Alat | Sesi | Yang dihitung |
|---|---|---|
| **Analisis aitem** | 4, 7 | Indeks kesukaran P, daya pembeda D, korelasi aitem-total, kategori Arikunto |
| **Validitas** | 5 | Korelasi aitem-total terkoreksi melawan r tabel, kategori Guilford |
| **Reliabilitas** | 6 | Belah dua ganjil-genap dan awal-akhir, Spearman-Brown, KR-20, KR-21, alpha Cronbach, alpha-jika-dibuang, SEM |
| **Skor standar** | 7 | z, T, stanine, jenjang persentil, pita keyakinan |
| **Thurstone** | 9, 10 | Nilai skala S, kuartil K25 dan K75, rentang Q, pemilihan butir |
| **Guttman** | 11, 12 | Scalogram, error Goodenough, koefisien reprodusibilitas dan skalabilitas |
| **Likert** | 13 | Pembalikan butir unfavorable, indeks persentase, alpha, rho Spearman |
| **Tabel r** | 5, 14 | Nilai kritis product moment untuk N berapa pun, dihitung dari distribusi t |
| **Analisis faktor** | 5, 2 | Bartlett, KMO dan MSA per butir, nilai eigen, muatan terotasi varimax atau promax, komunalitas, deteksi butir bermuatan ganda |
| **SUS** | 13 | System Usability Scale: skor, peringkat huruf Sauro-Lewis, kata sifat Bangor, keberterimaan, jenjang persentil, selang kepercayaan |
| **Peta modul** | 1–14 | Ringkasan tiap sesi, masing-masing dengan satu gambar |

### Kenapa R

Psikometri adalah kandang R. `qt()`, `cor()`, dan `quantile()` di R adalah rutin yang sama yang dipakai pustaka psikometri sungguhan, jadi menulis mesinnya di R berarti angkanya bisa dipertanggungjawabkan ke tempat asalnya.

Yang membuatnya bisa dijalankan tanpa memasang apa pun adalah **WebR** — R 4.6.0 yang dikompilasi ke WebAssembly. Dan karena WebR juga berjalan di Node.js, **berkas R yang sama diuji di terminal dan dijalankan di situs**. Tidak ada dua salinan rumus yang bisa menyimpang satu sama lain.

### Tiga lapis pembuktian

**1. Melawan modulnya sendiri.** Mesin harus menjawab soal di modul dengan angka modul. r tabel untuk N = 10 harus 0,632 — dan `qt(0.975, 8) / sqrt(qt(0.975, 8)^2 + 8)` memberi 0,63190. Enam butir contoh sesi 7 harus menghasilkan P = 0,50 · 0,70 · 0,20 · 0,45 · 0,75 · 0,30.

**2. Melawan identitas matematika.** Alpha Cronbach wajib sama persis dengan KR-20 pada data dikotomi. KR-21 tidak boleh melampaui KR-20. Reliabilitas belah dua wajib mengikuti Spearman-Brown. Kesamaan seperti ini tidak bisa lulus secara kebetulan.

**3. Melawan numpy dan scipy.** Rumus yang sama ditulis ulang di Python, jawabannya diterbitkan sebagai vektor emas, lalu diadu dengan jawaban R sampai `1e-10`. Nilai kritis r di sisi Python datang dari `scipy.stats.t.ppf`, di sisi R dari `qt()` — dua rutin distribusi t yang tidak berbagi satu baris kode pun. 118 nilai N, enam matriks respons, dan seluruh nilai eigen sebuah matriks korelasi — semuanya bertemu.

### Yang ditemukan uji ini

**KR-20 dengan pembagi yang tidak sepadan.** Versi pertama memakai `p*q` di pembilang tetapi varians sampel di penyebut. Angkanya tampak wajar. Uji identitas `alpha == KR-20` yang menangkapnya: `p*q` adalah varians aitem dengan pembagi N, jadi varians totalnya juga harus memakai pembagi N.

**Modul memakai dua metode berbeda untuk S dan Q.** Sesi 9 memberi rumus interpolasi data terkelompok. Sesi 10 menyuruh memakai kuartil SPSS. Keduanya berbeda hasil, dan modul memberi petunjuk siapa yang benar untuk Q: ia menyebut Q sama dengan nol bila semua penilai sepakat. Interpolasi terkelompok memberi 0,5 pada keadaan itu; kuartil SPSS memberi 0. Mesin ini memakai keduanya sesuai tempatnya dan menampilkan selisihnya di kolom terpisah.

**Kalimat yang tidak pernah ikut berganti bahasa.** Uji kebocoran dwibahasa merender setiap halaman di DOM sungguhan dalam kedua bahasa, lalu mengurangkan seluruh isi kamus dari teks yang muncul; apa pun yang tersisa adalah kalimat yang ditulis di tempat salah. Cara itu menangkap tiga hal yang lolos dari pemeriksaan biasa: label `Min-Maks` dan `Penilai` yang tetap Indonesia di mode Inggris, seluruh `<title>` dan `aria-label` di dalam SVG — satu-satunya bentuk gambar bagi pembaca layar — dan anotasi di dalam rumus seperti `n = butir × responden`. Memeriksa kelengkapan kunci kamus tidak akan menemukan satu pun dari ketiganya.

**Perhitungan pertama yang tidak pernah terjadi di tab latar.** Hasil pertama tiap kalkulator dijadwalkan lewat `requestAnimationFrame`. Peramban tidak pernah menjalankan callback rAF pada tab yang tidak terlihat, jadi halaman yang dibuka di tab latar berhenti selamanya di "belum ada hasil" — dan pengguna baru menemukannya kosong saat berpindah ke tab itu. Tidak satu pun uji menangkapnya; yang menemukannya adalah membuka situs yang sudah terbit. Sekarang memakai `setTimeout`, yang tetap berjalan di tab latar, dan [`uji/kerangka.uji.ts`](uji/kerangka.uji.ts) menirukan keadaan itu dengan memasang rAF yang tidak pernah memanggil balik.

**Bug WebR di Node untuk Windows.** WebR memuat runtime R dengan `import(path.resolve(berkas))`. Di Windows hasilnya berawalan huruf kandar dan pemuat ESM Node menolaknya. [`scripts/tambal-webr.mjs`](scripts/tambal-webr.mjs) menambal satu ekspresi itu, hanya di Windows, secara idempoten.

### Kinerja

Runtime R berukuran 46 MB, dan situs yang menunggunya sebelum menggambar apa pun akan kosong selama beberapa detik. Karena itu **mesin tidak disentuh saat situs dibuka**. Beranda, peta modul, dan halaman metode dirakit dari data yang sudah ada di berkas dan tampil seketika; runtime R baru diunduh saat peramban menganggur, lewat `requestIdleCallback`. Pada pemakaian biasa mesin sudah siap sebelum pengguna sampai ke kalkulator pertama.

| | |
|---|---|
| Bundel JavaScript | 241 kB, 73 kB setelah gzip |
| CSS | 15 kB, 3,8 kB setelah gzip |
| Pustaka grafik | tidak ada — seluruh visualisasi SVG ditulis tangan |
| Kerangka kerja UI | tidak ada |
| Permintaan jaringan saat menghitung | 0 |
| Permintaan ke pihak ketiga | 0 — runtime R dilayani dari asal yang sama |

### Menjalankan sendiri

```bash
npm install
npm test          # 208 uji, menjalankan berkas R yang sama dengan situsnya
npm run periksa   # tsc --noEmit
npm run dev       # pengembangan
npm run build     # tipe, bundel, salin runtime R ke dist/webr
```

Untuk membangkitkan ulang vektor emas konformansi (butuh numpy dan scipy):

```bash
python conformance/referensi.py
```

### Susunan berkas

| Jalur | Isi |
|---|---|
| `R/` | Mesinnya. Sebelas berkas R, hanya paket bawaan |
| `src/mesin/` | Jembatan ke WebR: penulis literal, permukaan bertipe, pemetaan galat |
| `src/ui/` | Cangkang tanpa kerangka kerja, komponen, dan pustaka visualisasi SVG |
| `src/i18n/` | Kamus dwibahasa — satu-satunya tempat kalimat berbahasa manusia |
| `uji/` | 208 uji, dijalankan Vitest lewat WebR di Node |
| `conformance/` | Implementasi pembanding numpy dan scipy, beserta vektor emasnya |

### Catatan hak cipta

Berkas modul PSI307 disusun oleh **Arbania Fitriani, S.Psi, M.Si** untuk Universitas Esa Unggul. Berkas aslinya **tidak** disertakan di repositori ini dan tidak dikutip panjang. Yang direproduksi hanyalah rumus matematikanya — dan rumus bukan objek hak cipta — beserta ringkasan tiap sesi yang ditulis ulang dengan kalimat sendiri.

Alat ini alat bantu hitung dan belajar, bukan pengganti pertimbangan metodologis. Angka yang keluar tetap harus dibaca oleh orang yang paham apa yang sedang diukurnya.

---

## 🇬🇧 English

### What this is

**PSI307 Psychological Measurement** teaches fourteen sessions of formulas: product-moment correlation, Spearman-Brown, KR-20, KR-21, Cronbach alpha, item difficulty, item discrimination, z and T scores, Thurstone scale values, Guttman reproducibility. All of it is normally done by hand in Excel or SPSS.

This project rewrites the lot as R code running inside the browser — then proves the answers right three different ways.

### Why R

Psychometrics is R's home ground. `qt()`, `cor()`, and `quantile()` are the same routines real psychometric packages are built on, so writing the engine in R means the numbers can be traced back to where they came from.

What makes it run without installing anything is **WebR** — R 4.6.0 compiled to WebAssembly. And because WebR also runs under Node.js, **the same R files are tested in the terminal and executed on the site**. There is no second copy of a formula that could drift.

### Three layers of proof

**1. Against the course modules.** The engine must answer the module's questions with the module's answers. The critical r at N = 10 must be 0.632, and `qt(0.975, 8) / sqrt(qt(0.975, 8)^2 + 8)` gives 0.63190. The six example items in session 7 must give P = 0.50 · 0.70 · 0.20 · 0.45 · 0.75 · 0.30.

**2. Against mathematical identities.** Cronbach alpha must equal KR-20 exactly on dichotomous data. KR-21 must never exceed KR-20. Split-half reliability must follow Spearman-Brown. Identities like these cannot pass by accident.

**3. Against numpy and scipy.** The same formulas rewritten in Python, published as golden vectors, matched against the R answers to `1e-10`. The critical r comes from `scipy.stats.t.ppf` on one side and `qt()` on the other — two t-distribution routines sharing no code. 118 values of N, six response matrices, and every eigenvalue of a correlation matrix — all agreeing.

### What the tests caught

**KR-20 with mismatched divisors.** The first version used `p*q` in the numerator but the sample variance in the denominator. The number looked plausible. The `alpha == KR-20` identity test caught it: `p*q` is an item variance with divisor N, so the total variance must use divisor N too.

**The module uses two different methods for S and Q.** Session 9 gives a grouped-data interpolation formula. Session 10 says to use SPSS quartiles. They disagree, and the module hints which is right for Q: it states Q equals zero when all judges agree. Grouped interpolation gives 0.5 there; SPSS quartiles give 0. The engine uses each where it belongs and shows the gap in a separate column.

**Sentences that never changed language.** The bilingual leak test renders every page in a real DOM in both languages, then subtracts the entire dictionary from the text that appears; whatever remains was written in the wrong place. That caught three things an ordinary check misses: the labels `Min-Maks` and `Penilai` still in Indonesian under English, every `<title>` and `aria-label` inside the SVGs — the only form those charts take for a screen reader — and the annotations inside formulas such as `n = items × respondents`. Verifying that dictionary keys match would have found none of them.

**A first computation that never happened in a background tab.** Each calculator scheduled its first result through `requestAnimationFrame`. Browsers never run rAF callbacks in a tab that is not visible, so a page opened in a background tab sat forever on "no results yet" — and the user only found it empty on switching to that tab. No test caught it; opening the published site did. It now uses `setTimeout`, which still runs in background tabs, and [`uji/kerangka.uji.ts`](uji/kerangka.uji.ts) reproduces the condition with an rAF that never calls back.

**A WebR bug on Node for Windows.** WebR loads the R runtime via `import(path.resolve(file))`. On Windows the result starts with a drive letter and the Node ESM loader refuses it. [`scripts/tambal-webr.mjs`](scripts/tambal-webr.mjs) patches that one expression, on Windows only, idempotently.

### Performance

The R runtime is 46 MB, and a site that waits for it before drawing anything sits blank for seconds. So **the engine is never touched on load**. The home page, module map, and method page are assembled from data already in the bundle and appear instantly; the R runtime downloads while the browser is idle, through `requestIdleCallback`. In normal use the engine is ready before the first calculator is opened.

### Running it

```bash
npm install
npm test          # 208 tests, running the same R files as the site
npm run periksa   # tsc --noEmit
npm run dev
npm run build
```

### Copyright note

The PSI307 module files were written by **Arbania Fitriani, S.Psi, M.Si** for Universitas Esa Unggul. The original files are **not** included in this repository and are not quoted at length. Only the mathematical formulas are reproduced — formulas are not copyrightable — along with session summaries written in our own words.

This is a computation and study aid, not a substitute for methodological judgement. The numbers it produces still need to be read by someone who understands what is being measured.

---

<div align="center">

Dibuat oleh **`.Deckyx`** · MIT

</div>
