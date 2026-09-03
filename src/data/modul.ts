/**
 * Peta empat belas sesi PSI307.
 *
 * Ringkasan ini ditulis ulang dengan kalimat sendiri dari bahan kuliah
 * Pengukuran Psikologis (PSI307) Universitas Esa Unggul. Berkas modul aslinya
 * tidak disertakan di repositori ini dan tidak dikutip panjang, karena hak
 * ciptanya ada pada penyusunnya. Yang direproduksi hanyalah rumus — dan rumus
 * matematika bukan objek hak cipta.
 */

export interface Sesi {
  readonly nomor: number;
  readonly judulId: string;
  readonly judulEn: string;
  readonly ringkasId: string;
  readonly ringkasEn: string;
  /** Rumus utama yang diajarkan, ditulis apa adanya. */
  readonly rumus?: readonly string[];
  /** Rute alat hitung yang menjawab sesi ini. */
  readonly rute?: string;
}

export const SESI: readonly Sesi[] = [
  {
    nomor: 1,
    judulId: 'Pengertian pengukuran psikologis dan penggolongan alat ukur',
    judulEn: 'What psychological measurement is, and how instruments are classified',
    ringkasId:
      'Pengukuran adalah cabang statistika terapan yang membangun dasar penyusunan tes ' +
      'agar tes itu berfungsi optimal, valid, dan reliabel. Sesi ini memisahkan tes dari ' +
      'ujian, dan menggolongkan alat ukur menurut apa yang diungkapnya.',
    ringkasEn:
      'Measurement is a branch of applied statistics that builds the foundations of test ' +
      'construction so that a test works optimally, validly, and reliably. This session ' +
      'separates a test from an examination and classifies instruments by what they reveal.',
  },
  {
    nomor: 2,
    judulId: 'Langkah-langkah penyusunan alat ukur psikologis',
    judulEn: 'The steps of building a psychological instrument',
    ringkasId:
      'Tiga daftar langkah dibandingkan — Gable, Suryabrata, dan Djaali — dan ketiganya ' +
      'sepakat pada urutan intinya: rumuskan konstruk, turunkan dimensi dan indikator, ' +
      'susun kisi-kisi, tulis butir, uji coba, analisis, revisi, baru bakukan.',
    ringkasEn:
      'Three sets of steps are compared — Gable, Suryabrata, and Djaali — and all three ' +
      'agree on the core order: define the construct, derive dimensions and indicators, ' +
      'build a blueprint, write items, pilot, analyse, revise, then standardise.',
  },
  {
    nomor: 3,
    judulId: 'Prinsip dan jenis pengukuran tes prestatif',
    judulEn: 'Principles and kinds of achievement testing',
    ringkasId:
      'Tes prestasi mengukur apa yang sudah dipelajari. Kawasan belajar dibagi menurut ' +
      'Bloom menjadi kognitif, afektif, dan psikomotor, dan konstruksi tesnya harus ' +
      'mengacu pada tujuan instruksional yang tertulis di silabus.',
    ringkasEn:
      'An achievement test measures what has been learned. Bloom splits the learning ' +
      'domain into cognitive, affective, and psychomotor, and test construction must ' +
      'refer back to the instructional goals written in the syllabus.',
  },
  {
    nomor: 4,
    judulId: 'Pedoman penulisan aitem tes prestatif',
    judulEn: 'Guidelines for writing achievement test items',
    ringkasId:
      'Sebelum satu butir pun ditulis, kawasan ukurnya ditegaskan dan komponen isinya ' +
      'diuraikan. Fungsi tes menentukan taraf kesukaran yang dituju: tes diagnostik ' +
      'butuh butir mudah, tes sumatif butuh cakupan menyeluruh.',
    ringkasEn:
      'Before a single item is written, the measurement domain is fixed and its content ' +
      'components are laid out. What the test is for decides the difficulty aimed at: a ' +
      'diagnostic test needs easy items, a summative test needs full coverage.',
    rute: '#/aitem',
  },
  {
    nomor: 5,
    judulId: 'Validitas alat ukur',
    judulEn: 'Instrument validity',
    ringkasId:
      'Validitas isi, konstruk, dan kriteria dibedakan, lalu prosedur uji validitas ' +
      'banding dijabarkan langkah demi langkah: hitung korelasi produk momen, kalikan ' +
      'dengan koefisien validitas alat pembanding, bandingkan dengan r tabel, ' +
      'kategorikan menurut Guilford.',
    ringkasEn:
      'Content, construct, and criterion validity are distinguished, then the concurrent ' +
      'validity procedure is spelled out step by step: compute the product-moment ' +
      'correlation, multiply by the criterion instrument validity coefficient, compare ' +
      'against the critical r, then categorise following Guilford.',
    rumus: [
      'r_xy = (n·ΣXY − ΣX·ΣY) / √[(n·ΣX² − (ΣX)²)(n·ΣY² − (ΣY)²)]',
      'r kritis = t / √(t² + df),  df = N − 2',
    ],
    rute: '#/validitas',
  },
  {
    nomor: 6,
    judulId: 'Reliabilitas alat ukur',
    judulEn: 'Instrument reliability',
    ringkasId:
      'Tiga cara menguji reliabilitas dibahas — tes ulang, tes ekuivalen, dan konsistensi ' +
      'internal — lalu teknik belah dua dikerjakan dua kali dengan pembelahan berbeda ' +
      'untuk menunjukkan hasilnya memang tidak sama. Dari situ KR-20 dan alpha Cronbach ' +
      'diperkenalkan sebagai jalan keluarnya.',
    ringkasEn:
      'Three ways to test reliability are covered — retest, equivalent forms, and internal ' +
      'consistency — then split-half is worked twice with different splits to show the ' +
      'results genuinely differ. KR-20 and Cronbach alpha are introduced as the way out.',
    rumus: [
      'r₁₁ = 2·r½½ / (1 + r½½)',
      'KR-20 = k/(k−1) · (1 − Σpq / S²ₜ)',
      'α = k/(k−1) · (1 − Σs²ᵢ / s²ₜ)',
    ],
    rute: '#/reliabilitas',
  },
  {
    nomor: 7,
    judulId: 'Skor dan interpretasi alat ukur tes prestasi',
    judulEn: 'Scoring and interpreting an achievement test',
    ringkasId:
      'Skor mentah tidak berarti apa-apa sampai diletakkan pada sebarannya. Sesi ini ' +
      'memberi skor z, skor T, dan jenjang persentil, lalu masuk ke analisis aitem: ' +
      'indeks kesukaran P dan indeks daya pembeda D, dengan aturan 50 persen untuk ' +
      'kelompok kecil dan 27 persen untuk kelompok besar.',
    ringkasEn:
      'A raw score means nothing until it is placed within its distribution. This session ' +
      'gives z scores, T scores, and percentile ranks, then moves to item analysis: the ' +
      'difficulty index P and the discrimination index D, splitting 50 percent for small ' +
      'groups and 27 percent for large ones.',
    rumus: ['z = (X − M) / s', 'T = 50 + 10·(X − M)/s', 'P = B / Js', 'D = BA/JA − BB/JB'],
    rute: '#/skor',
  },
  {
    nomor: 8,
    judulId: 'Tes kognitif dan non kognitif',
    judulEn: 'Cognitive and non-cognitive tests',
    ringkasId:
      'Atribut psikologis adalah konstrak hipotetik yang harus diterjemahkan menjadi ' +
      'perilaku operasional sebelum bisa diukur. Perbedaan pokoknya: tes kognitif ' +
      'mengungkap performansi maksimal, tes non-kognitif mengungkap performansi tipikal.',
    ringkasEn:
      'A psychological attribute is a hypothetical construct that must be translated into ' +
      'operational behaviour before it can be measured. The key difference: cognitive ' +
      'tests reveal maximum performance, non-cognitive tests reveal typical performance.',
  },
  {
    nomor: 9,
    judulId: 'Skala Thurstone — dasar',
    judulEn: 'Thurstone scale — foundations',
    ringkasId:
      'Skala Thurstone menghasilkan data interval, bukan ordinal seperti Likert. Sekitar ' +
      '30 penilai meletakkan tiap pernyataan pada rentang 1 sampai 11; nilai skala S ' +
      'diambil dari mediannya dan sebaran penilaian diukur dengan rentang antar-kuartil Q.',
    ringkasEn:
      'A Thurstone scale yields interval data, not the ordinal data a Likert scale gives. ' +
      'Around 30 judges place each statement on a 1 to 11 range; the scale value S comes ' +
      'from the median and the spread of judgements is measured by the interquartile ' +
      'range Q.',
    rumus: ['S = Bb + ((0,50 − Pkb) / pm) · i', 'Q = K75 − K25'],
    rute: '#/thurstone',
  },
  {
    nomor: 10,
    judulId: 'Skala Thurstone — penerapan',
    judulEn: 'Thurstone scale — application',
    ringkasId:
      'Contoh lengkap penyusunan skala tawakkal dengan 25 penilai. Butir dipilih dengan ' +
      'dua syarat sekaligus: Q sekecil mungkin supaya penilaiannya sepakat, dan S ' +
      'menyebar merata supaya skala bisa membedakan sikap di semua tingkat.',
    ringkasEn:
      'A worked example building a scale with 25 judges. Items are chosen on two ' +
      'conditions at once: Q as small as possible so the judgements agree, and S spread ' +
      'evenly so the scale can tell attitudes apart at every level.',
    rute: '#/thurstone',
  },
  {
    nomor: 11,
    judulId: 'Skala Guttman — dasar',
    judulEn: 'Guttman scale — foundations',
    ringkasId:
      'Skala Guttman bersifat kumulatif dan unidimensional: siapa yang menjawab ya pada ' +
      'butir berat semestinya juga menjawab ya pada butir yang lebih ringan. Setiap ' +
      'penyimpangan dari pola itu dihitung sebagai error.',
    ringkasEn:
      'A Guttman scale is cumulative and unidimensional: whoever answers yes to a hard ' +
      'item should also answer yes to every easier one. Each departure from that pattern ' +
      'is counted as an error.',
    rumus: [
      'Kr = 1 − (e / n),  n = butir × responden',
      'Ks = 1 − (e / x),  x = 0,5 · (n − jawaban ya)',
      'KR-21 = K/(K−1) · (1 − U(K−U)/(K·V))',
    ],
    rute: '#/guttman',
  },
  {
    nomor: 12,
    judulId: 'Skala Guttman — penerapan',
    judulEn: 'Guttman scale — application',
    ringkasId:
      'Contoh penghitungan error pada data nyata. Syarat penerimaannya tegas: koefisien ' +
      'reprodusibilitas harus di atas 0,90 dan koefisien skalabilitas di atas 0,60. Di ' +
      'bawah itu, skalanya belum terbukti berdimensi tunggal.',
    ringkasEn:
      'Error counting worked on real data. The acceptance rule is firm: the coefficient ' +
      'of reproducibility must exceed 0.90 and the coefficient of scalability 0.60. Below ' +
      'that, the scale has not been shown to be unidimensional.',
    rute: '#/guttman',
  },
  {
    nomor: 13,
    judulId: 'Skala Likert dan teknik pengembangan skala psikologis',
    judulEn: 'Likert scales and psychological scale development',
    ringkasId:
      'Skala Likert mengukur persepsi, sikap, atau pendapat lewat pernyataan positif dan ' +
      'negatif. Butir unfavorable harus dibalik skornya sebelum dijumlahkan — langkah ' +
      'yang paling sering terlewat dan paling merusak konsistensi internal bila terlewat.',
    ringkasEn:
      'A Likert scale measures perception, attitude, or opinion through positive and ' +
      'negative statements. Unfavorable items must be reverse scored before summing — the ' +
      'step most often skipped, and the one whose absence most damages internal ' +
      'consistency.',
    rumus: ['Skor terbalik = (banyak kategori + 1) − respons', 'Indeks = total / skor maksimum × 100'],
    rute: '#/likert',
  },
  {
    nomor: 14,
    judulId: 'Review skala psikologis',
    judulEn: 'Review of psychological scales',
    ringkasId:
      'Empat tingkat skala pengukuran ditinjau ulang: nominal hanya menamai, ordinal ' +
      'menambahkan urutan, interval menambahkan jarak yang sama, rasio menambahkan nol ' +
      'mutlak. Tingkat inilah yang menentukan operasi hitung apa yang sah dikerjakan.',
    ringkasEn:
      'The four levels of measurement are revisited: nominal only names, ordinal adds ' +
      'order, interval adds equal spacing, ratio adds an absolute zero. The level is what ' +
      'decides which arithmetic is legitimate at all.',
    rute: '#/tabel-r',
  },
];
