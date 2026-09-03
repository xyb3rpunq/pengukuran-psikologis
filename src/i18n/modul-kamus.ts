/**
 * Kamus isi modul: judul sesi, ringkasannya, dan teks di dalam gambarnya.
 *
 * Dipisah dari kamus.ts hanya karena panjangnya, bukan karena aturannya
 * berbeda. Aturannya sama dan mutlak: kalau sebuah kalimat muncul di layar,
 * kalimat itu ada di sini dalam dua bahasa. Uji di uji/dwibahasa.uji.ts
 * menegakkan aturan itu dengan merender setiap halaman dalam kedua bahasa dan
 * menuntut setiap potongan teks yang muncul dapat ditemukan di kamus.
 *
 * Kunci gambar memakai nomor datar (kiri1, kiri2, …) alih-alih larik, supaya
 * kompilator bisa menuntut versi Inggrisnya punya jumlah butir yang sama.
 */

export const modulId = {
  sesi: {
    s1: {
      judul: 'Pengertian pengukuran psikologis dan penggolongan alat ukur',
      ringkas:
        'Pengukuran adalah cabang statistika terapan yang membangun dasar penyusunan tes ' +
        'agar tes itu berfungsi optimal, valid, dan reliabel. Sesi ini memisahkan tes dari ' +
        'ujian, dan menggolongkan alat ukur menurut apa yang diungkapnya.',
    },
    s2: {
      judul: 'Langkah-langkah penyusunan alat ukur psikologis',
      ringkas:
        'Tiga daftar langkah dibandingkan — Gable, Suryabrata, dan Djaali — dan ketiganya ' +
        'sepakat pada urutan intinya: rumuskan konstruk, turunkan dimensi dan indikator, ' +
        'susun kisi-kisi, tulis butir, uji coba, analisis, revisi, baru bakukan.',
    },
    s3: {
      judul: 'Prinsip dan jenis pengukuran tes prestatif',
      ringkas:
        'Tes prestasi mengukur apa yang sudah dipelajari. Kawasan belajar dibagi menurut ' +
        'Bloom menjadi kognitif, afektif, dan psikomotor, dan konstruksi tesnya harus ' +
        'mengacu pada tujuan instruksional yang tertulis di silabus.',
    },
    s4: {
      judul: 'Pedoman penulisan aitem tes prestatif',
      ringkas:
        'Sebelum satu butir pun ditulis, kawasan ukurnya ditegaskan dan komponen isinya ' +
        'diuraikan. Fungsi tes menentukan taraf kesukaran yang dituju: tes diagnostik ' +
        'butuh butir mudah, tes sumatif butuh cakupan menyeluruh.',
    },
    s5: {
      judul: 'Validitas alat ukur',
      ringkas:
        'Validitas isi, konstruk, dan kriteria dibedakan, lalu prosedur uji validitas ' +
        'banding dijabarkan langkah demi langkah: hitung korelasi produk momen, kalikan ' +
        'dengan koefisien validitas alat pembanding, bandingkan dengan r tabel, lalu ' +
        'kategorikan menurut Guilford.',
    },
    s6: {
      judul: 'Reliabilitas alat ukur',
      ringkas:
        'Tiga cara menguji reliabilitas dibahas — tes ulang, tes ekuivalen, dan konsistensi ' +
        'internal — lalu teknik belah dua dikerjakan dua kali dengan pembelahan berbeda ' +
        'untuk menunjukkan hasilnya memang tidak sama. Dari situ KR-20 dan alpha Cronbach ' +
        'diperkenalkan sebagai jalan keluarnya.',
    },
    s7: {
      judul: 'Skor dan interpretasi alat ukur tes prestasi',
      ringkas:
        'Skor mentah tidak berarti apa-apa sampai diletakkan pada sebarannya. Sesi ini ' +
        'memberi skor z, skor T, dan jenjang persentil, lalu masuk ke analisis aitem: ' +
        'indeks kesukaran P dan indeks daya pembeda D, dengan aturan 50 persen untuk ' +
        'kelompok kecil dan 27 persen untuk kelompok besar.',
    },
    s8: {
      judul: 'Tes kognitif dan non kognitif',
      ringkas:
        'Atribut psikologis adalah konstrak hipotetik yang harus diterjemahkan menjadi ' +
        'perilaku operasional sebelum bisa diukur. Perbedaan pokoknya: tes kognitif ' +
        'mengungkap performansi maksimal, tes non-kognitif mengungkap performansi tipikal.',
    },
    s9: {
      judul: 'Skala Thurstone — dasar',
      ringkas:
        'Skala Thurstone menghasilkan data interval, bukan ordinal seperti Likert. Sekitar ' +
        '30 penilai meletakkan tiap pernyataan pada rentang 1 sampai 11; nilai skala S ' +
        'diambil dari mediannya dan sebaran penilaian diukur dengan rentang antar-kuartil Q.',
    },
    s10: {
      judul: 'Skala Thurstone — penerapan',
      ringkas:
        'Contoh lengkap penyusunan skala dengan 25 penilai. Butir dipilih dengan dua ' +
        'syarat sekaligus: Q sekecil mungkin supaya penilaiannya sepakat, dan S menyebar ' +
        'merata supaya skala bisa membedakan sikap di semua tingkat.',
    },
    s11: {
      judul: 'Skala Guttman — dasar',
      ringkas:
        'Skala Guttman bersifat kumulatif dan unidimensional: siapa yang menjawab ya pada ' +
        'butir berat semestinya juga menjawab ya pada butir yang lebih ringan. Setiap ' +
        'penyimpangan dari pola itu dihitung sebagai error.',
    },
    s12: {
      judul: 'Skala Guttman — penerapan',
      ringkas:
        'Contoh penghitungan error pada data nyata. Syarat penerimaannya tegas: koefisien ' +
        'reprodusibilitas harus di atas 0,90 dan koefisien skalabilitas di atas 0,60. Di ' +
        'bawah itu, skalanya belum terbukti berdimensi tunggal.',
    },
    s13: {
      judul: 'Skala Likert dan teknik pengembangan skala psikologis',
      ringkas:
        'Skala Likert mengukur persepsi, sikap, atau pendapat lewat pernyataan positif dan ' +
        'negatif. Butir unfavorable harus dibalik skornya sebelum dijumlahkan — langkah ' +
        'yang paling sering terlewat dan paling merusak konsistensi internal bila terlewat.',
    },
    s14: {
      judul: 'Review skala psikologis',
      ringkas:
        'Empat tingkat skala pengukuran ditinjau ulang: nominal hanya menamai, ordinal ' +
        'menambahkan urutan, interval menambahkan jarak yang sama, rasio menambahkan nol ' +
        'mutlak. Tingkat inilah yang menentukan operasi hitung apa yang sah dikerjakan.',
    },
  },

  rumus: {
    s5a: 'r_xy = (n·ΣXY − ΣX·ΣY) / √[(n·ΣX² − (ΣX)²)(n·ΣY² − (ΣY)²)]',
    s5b: 'r kritis = t / √(t² + df),  df = N − 2',
    s6a: 'r₁₁ = 2·r½½ / (1 + r½½)',
    s6b: 'KR-20 = k/(k−1) · (1 − Σpq / S²ₜ)',
    s6c: 'α = k/(k−1) · (1 − Σs²ᵢ / s²ₜ)',
    s7a: 'z = (X − M) / s',
    s7b: 'T = 50 + 10·(X − M)/s',
    s7c: 'P = B / Js',
    s7d: 'D = BA/JA − BB/JB',
    s9a: 'S = Bb + ((0,50 − Pkb) / pm) · i',
    s9b: 'Q = K75 − K25',
    s11a: 'Kr = 1 − (e / n),  n = butir × responden',
    s11b: 'Ks = 1 − (e / x),  x = 0,5 · (n − jawaban ya)',
    s11c: 'KR-21 = K/(K−1) · (1 − U(K−U)/(K·V))',
    s13a: 'Skor terbalik = (banyak kategori + 1) − respons',
    s13b: 'Indeks = total / skor maksimum × 100',
  },

  diagram: {
    s1: {
      kiriJudul: 'Tes',
      kiri1: 'Mengungkap atribut psikologis',
      kiri2: 'Tidak ada nilai lulus',
      kiri3: 'Ditafsirkan lewat norma',
      kiri4: 'Prosedurnya dibakukan',
      kananJudul: 'Ujian',
      kanan1: 'Mengukur penguasaan materi',
      kanan2: 'Ada nilai lulus',
      kanan3: 'Ditafsirkan lewat patokan',
      kanan4: 'Prosedurnya bisa berubah',
    },
    s2: {
      l1: 'Rumuskan konstruk dari kajian teori',
      l2: 'Turunkan dimensi dan indikator perilaku',
      l3: 'Susun kisi-kisi alat ukur',
      l4: 'Tulis butir favorable dan unfavorable',
      l5: 'Uji coba pada sampel awal',
      l6: 'Analisis butir, validitas, reliabilitas',
      l7: 'Revisi dan uji coba final',
      l8: 'Susun manual dan norma',
    },
    s3: {
      l1: 'Kognitif — pengetahuan dan penalaran',
      l2: 'Afektif — sikap, minat, dan nilai',
      l3: 'Psikomotor — keterampilan bertindak',
      l4: 'Tes prestasi mengacu pada tujuan instruksional',
    },
    s4: {
      l1: 'Tegaskan tujuan dan kawasan ukur',
      l2: 'Uraikan komponen isi materi',
      l3: 'Tetapkan taraf kesukaran yang dituju',
      l4: 'Tulis butir, lalu telaah kualitatif oleh ahli',
      l5: 'Rakit untuk uji coba',
    },
    s5: {
      sumbuX: 'skor belahan ganjil',
      sumbuY: 'skor belahan genap',
    },
    s6: {
      b1: 'Belah ganjil-genap',
      b2: 'Belah awal-akhir',
      b3: 'KR-20',
      b4: 'Alpha Cronbach',
    },
    s8: {
      kiriJudul: 'Tes kognitif',
      kiri1: 'Performansi maksimal',
      kiri2: 'Ada jawaban benar',
      kiri3: 'Diberi batas waktu',
      kiri4: 'Contoh: inteligensi, prestasi',
      kananJudul: 'Tes non-kognitif',
      kanan1: 'Performansi tipikal',
      kanan2: 'Tidak ada jawaban benar',
      kanan3: 'Umumnya tanpa batas waktu',
      kanan4: 'Contoh: sikap, kepribadian',
    },
    s14: {
      n1: 'Rasio',
      d1: 'Punya nol mutlak — semua operasi hitung sah',
      n2: 'Interval',
      d2: 'Jarak antar nilai sama, nolnya sembarang',
      n3: 'Ordinal',
      d3: 'Ada urutan, jaraknya tidak diketahui',
      n4: 'Nominal',
      d4: 'Sekadar nama atau label, tanpa urutan',
    },
  },
} as const;

export type KamusModul = typeof modulId;

type Cermin<T> = {
  [K in keyof T]: T[K] extends string ? string : Cermin<T[K]>;
};

export const modulEn: Cermin<KamusModul> = {
  sesi: {
    s1: {
      judul: 'What psychological measurement is, and how instruments are classified',
      ringkas:
        'Measurement is a branch of applied statistics that builds the foundations of test ' +
        'construction so that a test works optimally, validly, and reliably. This session ' +
        'separates a test from an examination and classifies instruments by what they reveal.',
    },
    s2: {
      judul: 'The steps of building a psychological instrument',
      ringkas:
        'Three sets of steps are compared — Gable, Suryabrata, and Djaali — and all three ' +
        'agree on the core order: define the construct, derive dimensions and indicators, ' +
        'build a blueprint, write items, pilot, analyse, revise, then standardise.',
    },
    s3: {
      judul: 'Principles and kinds of achievement testing',
      ringkas:
        'An achievement test measures what has been learned. Bloom splits the learning ' +
        'domain into cognitive, affective, and psychomotor, and test construction must ' +
        'refer back to the instructional goals written in the syllabus.',
    },
    s4: {
      judul: 'Guidelines for writing achievement test items',
      ringkas:
        'Before a single item is written, the measurement domain is fixed and its content ' +
        'components are laid out. What the test is for decides the difficulty aimed at: a ' +
        'diagnostic test needs easy items, a summative test needs full coverage.',
    },
    s5: {
      judul: 'Instrument validity',
      ringkas:
        'Content, construct, and criterion validity are distinguished, then the concurrent ' +
        'validity procedure is spelled out step by step: compute the product-moment ' +
        'correlation, multiply by the criterion instrument validity coefficient, compare ' +
        'against the critical r, then categorise following Guilford.',
    },
    s6: {
      judul: 'Instrument reliability',
      ringkas:
        'Three ways to test reliability are covered — retest, equivalent forms, and internal ' +
        'consistency — then split-half is worked twice with different splits to show the ' +
        'results genuinely differ. KR-20 and Cronbach alpha are introduced as the way out.',
    },
    s7: {
      judul: 'Scoring and interpreting an achievement test',
      ringkas:
        'A raw score means nothing until it is placed within its distribution. This session ' +
        'gives z scores, T scores, and percentile ranks, then moves to item analysis: the ' +
        'difficulty index P and the discrimination index D, splitting 50 percent for small ' +
        'groups and 27 percent for large ones.',
    },
    s8: {
      judul: 'Cognitive and non-cognitive tests',
      ringkas:
        'A psychological attribute is a hypothetical construct that must be translated into ' +
        'operational behaviour before it can be measured. The key difference: cognitive ' +
        'tests reveal maximum performance, non-cognitive tests reveal typical performance.',
    },
    s9: {
      judul: 'Thurstone scale — foundations',
      ringkas:
        'A Thurstone scale yields interval data, not the ordinal data a Likert scale gives. ' +
        'Around 30 judges place each statement on a 1 to 11 range; the scale value S comes ' +
        'from the median and the spread of judgements is measured by the interquartile ' +
        'range Q.',
    },
    s10: {
      judul: 'Thurstone scale — application',
      ringkas:
        'A worked example building a scale with 25 judges. Items are chosen on two ' +
        'conditions at once: Q as small as possible so the judgements agree, and S spread ' +
        'evenly so the scale can tell attitudes apart at every level.',
    },
    s11: {
      judul: 'Guttman scale — foundations',
      ringkas:
        'A Guttman scale is cumulative and unidimensional: whoever answers yes to a hard ' +
        'item should also answer yes to every easier one. Each departure from that pattern ' +
        'is counted as an error.',
    },
    s12: {
      judul: 'Guttman scale — application',
      ringkas:
        'Error counting worked on real data. The acceptance rule is firm: the coefficient ' +
        'of reproducibility must exceed 0.90 and the coefficient of scalability 0.60. Below ' +
        'that, the scale has not been shown to be unidimensional.',
    },
    s13: {
      judul: 'Likert scales and psychological scale development',
      ringkas:
        'A Likert scale measures perception, attitude, or opinion through positive and ' +
        'negative statements. Unfavorable items must be reverse scored before summing — the ' +
        'step most often skipped, and the one whose absence most damages internal ' +
        'consistency.',
    },
    s14: {
      judul: 'Review of psychological scales',
      ringkas:
        'The four levels of measurement are revisited: nominal only names, ordinal adds ' +
        'order, interval adds equal spacing, ratio adds an absolute zero. The level is what ' +
        'decides which arithmetic is legitimate at all.',
    },
  },

  rumus: {
    s5a: 'r_xy = (n·ΣXY − ΣX·ΣY) / √[(n·ΣX² − (ΣX)²)(n·ΣY² − (ΣY)²)]',
    s5b: 'critical r = t / √(t² + df),  df = N − 2',
    s6a: 'r₁₁ = 2·r½½ / (1 + r½½)',
    s6b: 'KR-20 = k/(k−1) · (1 − Σpq / S²ₜ)',
    s6c: 'α = k/(k−1) · (1 − Σs²ᵢ / s²ₜ)',
    s7a: 'z = (X − M) / s',
    s7b: 'T = 50 + 10·(X − M)/s',
    s7c: 'P = B / Js',
    s7d: 'D = BA/JA − BB/JB',
    s9a: 'S = Lb + ((0.50 − Pcb) / pm) · i',
    s9b: 'Q = K75 − K25',
    s11a: 'Kr = 1 − (e / n),  n = items × respondents',
    s11b: 'Ks = 1 − (e / x),  x = 0.5 · (n − yes answers)',
    s11c: 'KR-21 = K/(K−1) · (1 − U(K−U)/(K·V))',
    s13a: 'Reversed score = (number of options + 1) − response',
    s13b: 'Index = total / maximum score × 100',
  },

  diagram: {
    s1: {
      kiriJudul: 'Test',
      kiri1: 'Reveals a psychological attribute',
      kiri2: 'There is no pass mark',
      kiri3: 'Interpreted against norms',
      kiri4: 'The procedure is standardised',
      kananJudul: 'Examination',
      kanan1: 'Measures mastery of material',
      kanan2: 'There is a pass mark',
      kanan3: 'Interpreted against a criterion',
      kanan4: 'The procedure may vary',
    },
    s2: {
      l1: 'Define the construct from theory',
      l2: 'Derive dimensions and behavioural indicators',
      l3: 'Build the instrument blueprint',
      l4: 'Write favorable and unfavorable items',
      l5: 'Pilot on an initial sample',
      l6: 'Analyse items, validity, reliability',
      l7: 'Revise and run a final pilot',
      l8: 'Write the manual and the norms',
    },
    s3: {
      l1: 'Cognitive — knowledge and reasoning',
      l2: 'Affective — attitude, interest, and values',
      l3: 'Psychomotor — skill in action',
      l4: 'Achievement tests refer back to instructional goals',
    },
    s4: {
      l1: 'Fix the purpose and the measurement domain',
      l2: 'Lay out the content components',
      l3: 'Set the difficulty level aimed at',
      l4: 'Write items, then have experts review them',
      l5: 'Assemble for piloting',
    },
    s5: {
      sumbuX: 'odd-half score',
      sumbuY: 'even-half score',
    },
    s6: {
      b1: 'Odd-even split',
      b2: 'First-second split',
      b3: 'KR-20',
      b4: 'Cronbach alpha',
    },
    s8: {
      kiriJudul: 'Cognitive test',
      kiri1: 'Maximum performance',
      kiri2: 'There is a right answer',
      kiri3: 'Time limited',
      kiri4: 'Example: intelligence, achievement',
      kananJudul: 'Non-cognitive test',
      kanan1: 'Typical performance',
      kanan2: 'There is no right answer',
      kanan3: 'Usually untimed',
      kanan4: 'Example: attitude, personality',
    },
    s14: {
      n1: 'Ratio',
      d1: 'Has an absolute zero — all arithmetic is valid',
      n2: 'Interval',
      d2: 'Equal spacing, but an arbitrary zero',
      n3: 'Ordinal',
      d3: 'Ordered, but the gaps are unknown',
      n4: 'Nominal',
      d4: 'Just a name or a label, with no order',
    },
  },
};
