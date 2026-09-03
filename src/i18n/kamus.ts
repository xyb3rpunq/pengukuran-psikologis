import { modulEn, modulId } from './modul-kamus';

/**
 * Kamus dwibahasa.
 *
 * Bahasa Indonesia adalah acuannya. Tipe `Kamus` diturunkan dari objek ID,
 * sehingga kamus EN wajib memiliki setiap kunci yang sama — kompilator menolak
 * kunci yang hilang atau salah ketik sebelum berkasnya sempat dijalankan.
 *
 * Aturan isi: tidak ada kalimat berbahasa manusia di luar berkas ini. Kalau
 * sebuah string muncul di layar, string itu ada di sini dalam dua bahasa.
 */

export const id = {
  situs: {
    nama: 'TERA',
    tagline: 'Laboratorium pengukuran psikologis',
    deskripsi:
      'Mesin psikometri PSI307 yang berjalan di peramban. Ditulis dalam R, ' +
      'diverifikasi terhadap angka yang tercetak di modul kuliahnya sendiri.',
    penulis: 'Dibuat oleh .Deckyx',
    matkul: 'PSI307 Pengukuran Psikologis',
  },
  nav: {
    beranda: 'Beranda',
    aitem: 'Analisis aitem',
    validitas: 'Validitas',
    reliabilitas: 'Reliabilitas',
    skor: 'Skor standar',
    thurstone: 'Thurstone',
    guttman: 'Guttman',
    likert: 'Likert',
    tabelR: 'Tabel r',
    modul: 'Modul',
    metode: 'Metode',
  },
  umum: {
    hitung: 'Hitung',
    muatContoh: 'Muat contoh',
    kosongkan: 'Kosongkan',
    unduhCsv: 'Unduh CSV',
    salin: 'Salin',
    tersalin: 'Tersalin',
    data: 'Data',
    hasil: 'Hasil',
    memuatMesin: 'Menyalakan mesin R…',
    mesinSiap: 'Mesin R siap',
    menghitung: 'Menghitung…',
    belumAdaHasil: 'Belum ada hasil. Masukkan data lalu tekan Hitung.',
    baris: 'baris',
    kolom: 'kolom',
    responden: 'Responden',
    aitem: 'Aitem',
    butir: 'Butir',
    nilai: 'Nilai',
    keterangan: 'Keterangan',
    ya: 'Ya',
    tidak: 'Tidak',
    bahasa: 'EN',
    temaGelap: 'Tema gelap',
    temaTerang: 'Tema terang',
    tutup: 'Tutup',
    sesi: 'Sesi',
    rumus: 'Rumus',
    acuan: 'Acuan',
    pengaturan: 'Pengaturan',
    minMaks: 'Min-Maks',
    penilai: 'Penilai',
  },
  masukan: {
    judulMatriks: 'Matriks respons',
    petunjukMatriks:
      'Satu baris per responden, angka dipisah koma, spasi, atau tab. ' +
      'Boleh tempel langsung dari Excel.',
    petunjukDeret: 'Satu angka per baris, atau dipisah koma.',
    namaKolom: 'Nama aitem (opsional)',
    petunjukNamaKolom: 'Dipisah koma. Kosongkan untuk memakai A1, A2, dan seterusnya.',
    taraf: 'Taraf signifikansi',
    kategoriJawaban: 'Banyak pilihan jawaban',
    butirFavorable: 'Butir favorable',
    petunjukFavorable:
      'Nomor butir yang favorable, dipisah koma. Butir lain dianggap unfavorable dan dibalik.',
    proporsiKelompok: 'Proporsi kelompok ekstrem',
    proporsiOtomatis: 'Otomatis menurut aturan modul',
    proporsiSetengah: 'Belah dua (50%) — kelompok kecil',
    proporsiDuaTujuh: '27% teratas dan terbawah — kelompok besar',
    dikoreksi: 'Pakai korelasi aitem-total terkoreksi',
    perlakuanPopulasi: 'Perlakukan sebagai populasi (pembagi N)',
    skalaPenilaian: 'Titik skala penilaian',
    labelPeserta: 'Nama peserta (opsional)',
    validitasKriteria: 'Koefisien validitas alat pembanding',
    skorKriteria: 'Skor alat pembanding',
    jumlahButirDipilih: 'Banyak butir yang diinginkan',
  },
  galat: {
    'data.kosong': 'Datanya kosong.',
    'data.panjangBeda': 'Dua deret data harus sama panjang.',
    'data.minimalDua': 'Perlu setidaknya dua data.',
    'data.bukanAngka': 'Ada nilai yang bukan angka atau tidak berhingga.',
    'data.variansiNol': 'Data tidak punya variasi, jadi korelasinya tidak terdefinisi.',
    'matriks.kosong': 'Matriks respons kosong.',
    'matriks.barisTidakSeragam': 'Setiap baris harus punya jumlah kolom yang sama.',
    'matriks.bukanDikotomi': 'Analisis ini menuntut data dikotomi — hanya 0 dan 1.',
    'matriks.minimalDuaAitem': 'Perlu setidaknya dua aitem.',
    'matriks.minimalDuaResponden': 'Perlu setidaknya dua responden.',
    'nilai.diLuarRentang': 'Ada nilai di luar rentang yang diizinkan.',
    'nilai.harusPositif': 'Nilai ini harus positif.',
    'skala.tidakDikenal': 'Metode yang diminta tidak dikenal.',
    'thurstone.penilaianDiLuarRentang': 'Penilaian juri di luar rentang skala.',
    'guttman.responBukanBiner': 'Respons skala Guttman hanya boleh 0 atau 1.',
    'mesin.gagal': 'Mesin gagal menyelesaikan perhitungan.',
    'mesin.gagalMuat': 'Mesin R gagal dimuat.',
    'mesin.belumSiap': 'Mesin R belum siap.',
    'mesin.jawabanTakTerbaca': 'Jawaban mesin tidak terbaca.',
    takDikenal: 'Terjadi galat yang tidak dikenali.',
  },
  kategori: {
    takValid: 'Tidak valid',
    sangatRendah: 'Sangat rendah',
    rendah: 'Rendah',
    sedang: 'Sedang',
    tinggi: 'Tinggi',
    sangatTinggi: 'Sangat tinggi',
    sukar: 'Sukar',
    mudah: 'Mudah',
    dibuang: 'Dibuang',
    jelek: 'Jelek',
    cukup: 'Cukup',
    baik: 'Baik',
    baikSekali: 'Baik sekali',
  },
  beranda: {
    judul: 'Sembilan alat hitung untuk satu mata kuliah',
    intro:
      'Setiap rumus di modul PSI307 ditulis ulang sebagai kode R, dijalankan di ' +
      'peramban lewat WebAssembly, dan diuji terhadap angka yang tercetak di ' +
      'modulnya sendiri. Tidak ada data yang meninggalkan perangkat kamu.',
    kartuAitem: 'Indeks kesukaran P dan daya pembeda D, lengkap dengan kategorinya.',
    kartuValiditas: 'Korelasi aitem-total melawan r tabel yang dihitung ulang dari distribusi t.',
    kartuReliabilitas: 'Belah dua, Spearman-Brown, KR-20, KR-21, alpha Cronbach, dan SEM.',
    kartuSkor: 'Skor z, T, stanine, dan jenjang persentil beserta pita keyakinannya.',
    kartuThurstone: 'Nilai skala S dan rentang antar-kuartil Q dari penilaian juri.',
    kartuGuttman: 'Scalogram, error Goodenough, koefisien reprodusibilitas dan skalabilitas.',
    kartuLikert: 'Pembalikan butir unfavorable, indeks persentase, dan konsistensi internal.',
    kartuTabelR: 'Tabel r product moment untuk N berapa pun, bukan salinan lampiran buku.',
    kartuModul: 'Ringkasan empat belas sesi beserta rumus yang diajarkan di masing-masing.',
    angkaUji: 'uji lulus',
    angkaRumus: 'rumus psikometri',
    angkaSesi: 'sesi kuliah',
    angkaJaringan: 'permintaan jaringan saat menghitung',
  },
  aitem: {
    judul: 'Analisis aitem tes prestasi',
    penjelasan:
      'Masukkan matriks jawaban benar-salah: 1 untuk benar, 0 untuk salah. ' +
      'Mesin menghitung taraf kesukaran P dan daya pembeda D setiap butir, ' +
      'lalu menandai butir yang layak dipakai.',
    kolomBenar: 'Benar',
    kolomP: 'P',
    kolomKategoriP: 'Taraf kesukaran',
    kolomPAtas: 'P atas',
    kolomPBawah: 'P bawah',
    kolomD: 'D',
    kolomKategoriD: 'Daya pembeda',
    kolomKorelasi: 'r aitem-total',
    kolomLayak: 'Layak',
    ringkasKelompok: 'Kelompok ekstrem',
    ringkasTiapKelompok: 'Peserta tiap kelompok',
    ringkasRerata: 'Rerata skor total',
    judulPeta: 'Peta taraf kesukaran terhadap daya pembeda',
    sumbuP: 'P — taraf kesukaran',
    sumbuD: 'D — daya pembeda',
    daerahLayak: 'layak',
  },
  validitas: {
    judul: 'Validitas alat ukur',
    penjelasan:
      'Setiap aitem dikorelasikan dengan skor total sisanya, lalu dibandingkan ' +
      'dengan nilai kritis r pada taraf signifikansi yang dipilih.',
    kolomR: 'r hitung',
    kolomRTabel: 'r tabel',
    kolomValid: 'Keputusan',
    kolomKategori: 'Kategori Guilford',
    ringkasValid: 'Aitem valid',
    ringkasGugur: 'Aitem gugur',
    ringkasRTabel: 'r tabel',
    valid: 'Valid',
    gugur: 'Gugur',
    judulGrafik: 'Korelasi setiap butir terhadap r tabel',
  },
  reliabilitas: {
    judul: 'Reliabilitas alat ukur',
    penjelasan:
      'Semua metode yang berlaku bagi data kamu dijalankan berdampingan, supaya ' +
      'perbedaan hasilnya terlihat alih-alih harus dipercaya begitu saja.',
    alpha: 'Alpha Cronbach',
    kr20: 'KR-20',
    kr21: 'KR-21',
    belahGanjilGenap: 'Belah dua ganjil-genap',
    belahAwalAkhir: 'Belah dua awal-akhir',
    rBelah: 'r belahan',
    r11: 'r tes utuh',
    sem: 'Galat baku pengukuran',
    sbTotal: 'Simpangan baku total',
    rerataTotal: 'Rerata skor total',
    kolomRerata: 'Rerata',
    kolomVarians: 'Varians',
    kolomKorelasi: 'r aitem-total',
    kolomAlphaBuang: 'Alpha bila dibuang',
    catatanDikotomi: 'KR-20 dan KR-21 hanya berlaku untuk data dikotomi.',
    judulPerbandingan: 'Perbandingan antar metode',
    judulSebaranBelahan: 'Sebaran kedua belahan',
    catatanSem:
      'Skor amatan seseorang berada kira-kira dalam rentang plus minus 1,96 SEM ' +
      'dari skor sejatinya pada keyakinan 95 persen.',
  },
  skor: {
    judul: 'Skor standar dan interpretasi',
    penjelasan:
      'Skor mentah diubah menjadi z, T, stanine, dan jenjang persentil agar ' +
      'kedudukan seseorang bisa dibandingkan, bukan sekadar dibaca angkanya.',
    kolomNama: 'Peserta',
    kolomMentah: 'Skor mentah',
    kolomZ: 'z',
    kolomT: 'T',
    kolomStanine: 'Stanine',
    kolomPersentil: 'Jenjang persentil',
    judulKurva: 'Kedudukan peserta pada kurva normal',
    barisStanine: 'stanine',
    barisPersentil: 'persentil',
  },
  thurstone: {
    judul: 'Skala Thurstone',
    penjelasan:
      'Masukkan matriks penilaian juri: satu baris per penilai, satu kolom per ' +
      'pernyataan, nilainya 1 sampai 11. Mesin menghitung nilai skala S dan ' +
      'rentang antar-kuartil Q setiap butir.',
    kolomS: 'S (lokasi)',
    kolomK25: 'K25',
    kolomK75: 'K75',
    kolomQ: 'Q (sebaran)',
    kolomQTerkelompok: 'Q terkelompok',
    terpilih: 'Butir terpilih',
    lokasiTerwakili: 'Lokasi terwakili',
    judulTerpilih: 'Butir yang dipilih untuk skala akhir',
    judulKontinum: 'Lokasi butir pada kontinum',
    sumbuS: 'nilai skala S — makin ke kanan makin favorabel',
    catatanDuaMetode:
      'S memakai rumus interpolasi data terkelompok dari sesi 9; Q memakai ' +
      'persentil gaya SPSS dari sesi 10. Modulnya memang memakai dua metode ' +
      'berbeda, dan kolom Q terkelompok menunjukkan selisihnya.',
  },
  guttman: {
    judul: 'Skala Guttman',
    penjelasan:
      'Masukkan matriks respons ya-tidak: 1 untuk ya, 0 untuk tidak. Mesin ' +
      'menyusun scalogram, menghitung penyimpangan dari pola skala sempurna, ' +
      'lalu menilai reprodusibilitas dan skalabilitasnya.',
    kr: 'Koefisien reprodusibilitas',
    ks: 'Koefisien skalabilitas',
    error: 'Total error',
    jawabanYa: 'Jawaban ya',
    banyakSel: 'Total sel',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
    syaratKr: 'Syarat: lebih dari 0,90',
    syaratKs: 'Syarat: lebih dari 0,60',
    judulSkalogram: 'Scalogram',
    penjelasanSkalogram:
      'Butir termudah di kiri, responden berskor tertinggi di atas. Sel bertanda ' +
      'adalah penyimpangan dari pola skala sempurna.',
    kolomSkor: 'Skor',
    kolomError: 'Error',
  },
  likert: {
    judul: 'Skala Likert',
    penjelasan:
      'Masukkan matriks respons dengan nilai 1 sampai banyak pilihan jawaban. ' +
      'Butir unfavorable dibalik lebih dulu, lalu skor total dan indeks ' +
      'persentase dihitung.',
    indeksSkala: 'Indeks skala',
    kolomFavorable: 'Arah',
    kolomRerataMentah: 'Rerata mentah',
    kolomRerataTerskor: 'Rerata terskor',
    kolomSb: 'Simpangan baku',
    kolomIndeks: 'Indeks (%)',
    kolomKorelasi: 'r aitem-total',
    kolomSpearman: 'rho Spearman',
    kolomAlphaBuang: 'Alpha bila dibuang',
    kolomTotal: 'Total',
    kolomKategori: 'Kategori',
    favorable: 'Favorable',
    unfavorable: 'Unfavorable',
    judulSebaran: 'Sebaran pilihan jawaban',
    catatanOrdinal:
      'Respons Likert berskala ordinal. Menjumlahkannya mengandaikan jarak ' +
      'antar pilihan sama besar — andaian yang tidak dijamin datanya. Kolom rho ' +
      'Spearman disediakan agar keputusan tidak bergantung pada andaian itu saja.',
  },
  tabelR: {
    judul: 'Tabel r product moment',
    penjelasan:
      'Tabel ini tidak disalin dari lampiran buku. Setiap nilainya dihitung ' +
      'ulang dari distribusi t: r kritis sama dengan t dibagi akar dari t ' +
      'kuadrat ditambah derajat bebas. Karena dihitung, tabelnya berlaku untuk ' +
      'N berapa pun.',
    kolomN: 'N',
    kolom5: 'Taraf 5%',
    kolom1: 'Taraf 1%',
    dari: 'N dari',
    sampai: 'sampai',
  },
  modul: {
    judul: 'Empat belas sesi PSI307',
    penjelasan:
      'Ringkasan tiap sesi beserta alat hitung yang menjawabnya. Ringkasan ini ' +
      'ditulis ulang dengan kalimat sendiri; berkas modul aslinya tidak ' +
      'disertakan karena hak ciptanya ada pada penyusunnya.',
    alatTerkait: 'Alat terkait',
    tidakAdaAlat: 'Sesi teori, tanpa alat hitung.',
    judulBanding: 'Dua hal yang dipertentangkan',
    judulAlur: 'Urutan langkah',
    judulPencar: 'Hubungan dua deret skor',
    judulTangga: 'Empat tingkat skala pengukuran',
  },
  metode: {
    judul: 'Bagaimana angka-angka ini dipertanggungjawabkan',
    lapisJudul: 'Tiga lapis pemeriksaan',
    lapis1Judul: 'Melawan modul kuliahnya sendiri',
    lapis1:
      'Mesin harus menjawab soal di modul dengan angka yang sama. r tabel N = 10 ' +
      'harus 0,632. Indeks kesukaran enam butir contoh sesi 7 harus 0,50, 0,70, ' +
      '0,20, 0,45, 0,75, dan 0,30. Kalau salah satu meleset, yang salah mesinnya.',
    lapis2Judul: 'Melawan identitas matematika',
    lapis2:
      'Alpha Cronbach wajib sama persis dengan KR-20 pada data dikotomi. KR-21 ' +
      'tidak boleh melampaui KR-20. Reliabilitas belah dua wajib mengikuti ' +
      'Spearman-Brown. Kesamaan seperti ini tidak bisa lulus secara kebetulan.',
    lapis3Judul: 'Melawan numpy dan scipy',
    lapis3:
      'Rumus yang sama ditulis ulang di Python, lalu jawabannya diadu dengan ' +
      'jawaban R sampai sepuluh angka di belakang koma. Nilai kritis r di sisi ' +
      'Python datang dari scipy.stats.t, di sisi R dari qt() — dua rutin yang ' +
      'tidak berbagi satu baris kode pun.',
    temuanJudul: 'Yang ditemukan uji ini',
    temuan1Judul: 'KR-20 dengan pembagi yang tidak sepadan',
    temuan1:
      'Versi pertama memakai p dikali q di pembilang tetapi varians sampel di ' +
      'penyebut. Angkanya tampak wajar, tapi identitas alpha sama dengan KR-20 ' +
      'pecah. Uji identitas itulah yang menangkapnya.',
    temuan2Judul: 'Modul memakai dua metode untuk S dan Q',
    temuan2:
      'Sesi 9 memberi rumus interpolasi data terkelompok, sesi 10 menyuruh pakai ' +
      'kuartil SPSS. Keduanya berbeda hasil. Modul menyebut Q sama dengan nol ' +
      'bila semua penilai sepakat — hanya kuartil SPSS yang memenuhi itu.',
    temuan3Judul: 'Bug WebR di Node untuk Windows',
    temuan3:
      'WebR memuat runtime R dengan import atas jalur hasil path.resolve. Di ' +
      'Windows jalur itu berawalan huruf kandar, dan pemuat ESM Node menolaknya. ' +
      'Tambalan satu ekspresi membuat berkas R yang sama bisa diuji di terminal ' +
      'dan dijalankan di peramban.',
    tumpukanJudul: 'Tumpukan teknologi',
    tumpukanMesin: 'Mesin',
    tumpukanMesinIsi: 'R 4.6.0, hanya paket bawaan',
    tumpukanRuntime: 'Runtime',
    tumpukanRuntimeIsi: 'WebR — R dikompilasi ke WebAssembly',
    tumpukanCangkang: 'Cangkang',
    tumpukanCangkangIsi: 'TypeScript, tanpa kerangka kerja UI',
    tumpukanUji: 'Uji',
    tumpukanUjiIsi: 'Vitest menjalankan berkas R yang sama dengan situsnya',
    tumpukanBanding: 'Pembanding',
    tumpukanBandingIsi: 'numpy dan scipy lewat vektor emas',
    privasiJudul: 'Data kamu tidak ke mana-mana',
    privasi:
      'Seluruh perhitungan berjalan di dalam peramban. Runtime R diunduh sekali ' +
      'dari asal yang sama dengan situs ini, bukan dari CDN pihak ketiga. Setelah ' +
      'itu tidak ada satu pun permintaan jaringan saat kamu menghitung, dan tidak ' +
      'ada data yang dikirim ke mana pun.',
  },
} as const;

export type Kamus = typeof id;

/** Tipe rekursif yang menuntut struktur persis sama, tapi isi string bebas. */
type Cermin<T> = {
  [K in keyof T]: T[K] extends string ? string : Cermin<T[K]>;
};

export const en: Cermin<Kamus> = {
  situs: {
    nama: 'TERA',
    tagline: 'Psychological measurement laboratory',
    deskripsi:
      'The PSI307 psychometrics engine, running in your browser. Written in R, ' +
      'verified against the numbers printed in the course modules themselves.',
    penulis: 'Built by .Deckyx',
    matkul: 'PSI307 Psychological Measurement',
  },
  nav: {
    beranda: 'Home',
    aitem: 'Item analysis',
    validitas: 'Validity',
    reliabilitas: 'Reliability',
    skor: 'Standard scores',
    thurstone: 'Thurstone',
    guttman: 'Guttman',
    likert: 'Likert',
    tabelR: 'r table',
    modul: 'Modules',
    metode: 'Method',
  },
  umum: {
    hitung: 'Compute',
    muatContoh: 'Load example',
    kosongkan: 'Clear',
    unduhCsv: 'Download CSV',
    salin: 'Copy',
    tersalin: 'Copied',
    data: 'Data',
    hasil: 'Results',
    memuatMesin: 'Starting the R engine…',
    mesinSiap: 'R engine ready',
    menghitung: 'Computing…',
    belumAdaHasil: 'No results yet. Enter your data, then press Compute.',
    baris: 'rows',
    kolom: 'columns',
    responden: 'Respondents',
    aitem: 'Items',
    butir: 'Item',
    nilai: 'Value',
    keterangan: 'Note',
    ya: 'Yes',
    tidak: 'No',
    bahasa: 'ID',
    temaGelap: 'Dark theme',
    temaTerang: 'Light theme',
    tutup: 'Close',
    sesi: 'Session',
    rumus: 'Formula',
    acuan: 'Source',
    pengaturan: 'Options',
    minMaks: 'Min-Max',
    penilai: 'Judges',
  },
  masukan: {
    judulMatriks: 'Response matrix',
    petunjukMatriks:
      'One row per respondent, values separated by commas, spaces, or tabs. ' +
      'You can paste straight from Excel.',
    petunjukDeret: 'One number per line, or comma separated.',
    namaKolom: 'Item names (optional)',
    petunjukNamaKolom: 'Comma separated. Leave empty to use A1, A2, and so on.',
    taraf: 'Significance level',
    kategoriJawaban: 'Number of response options',
    butirFavorable: 'Favorable items',
    petunjukFavorable:
      'Comma-separated item numbers that are favorable. The rest are treated as ' +
      'unfavorable and reverse scored.',
    proporsiKelompok: 'Extreme group proportion',
    proporsiOtomatis: 'Automatic, following the module rule',
    proporsiSetengah: 'Split in half (50%) — small groups',
    proporsiDuaTujuh: 'Top and bottom 27% — large groups',
    dikoreksi: 'Use corrected item-total correlation',
    perlakuanPopulasi: 'Treat as a population (divide by N)',
    skalaPenilaian: 'Rating scale points',
    labelPeserta: 'Participant names (optional)',
    validitasKriteria: 'Validity coefficient of the criterion measure',
    skorKriteria: 'Criterion scores',
    jumlahButirDipilih: 'Number of items wanted',
  },
  galat: {
    'data.kosong': 'The data is empty.',
    'data.panjangBeda': 'Both series must have the same length.',
    'data.minimalDua': 'At least two data points are needed.',
    'data.bukanAngka': 'Some value is not a finite number.',
    'data.variansiNol': 'The data has no variation, so the correlation is undefined.',
    'matriks.kosong': 'The response matrix is empty.',
    'matriks.barisTidakSeragam': 'Every row must have the same number of columns.',
    'matriks.bukanDikotomi': 'This analysis requires dichotomous data — only 0 and 1.',
    'matriks.minimalDuaAitem': 'At least two items are needed.',
    'matriks.minimalDuaResponden': 'At least two respondents are needed.',
    'nilai.diLuarRentang': 'A value falls outside the allowed range.',
    'nilai.harusPositif': 'This value must be positive.',
    'skala.tidakDikenal': 'The requested method is not recognised.',
    'thurstone.penilaianDiLuarRentang': 'A judge rating falls outside the scale range.',
    'guttman.responBukanBiner': 'Guttman responses may only be 0 or 1.',
    'mesin.gagal': 'The engine could not finish the computation.',
    'mesin.gagalMuat': 'The R engine failed to load.',
    'mesin.belumSiap': 'The R engine is not ready yet.',
    'mesin.jawabanTakTerbaca': 'The engine returned something unreadable.',
    takDikenal: 'An unrecognised error occurred.',
  },
  kategori: {
    takValid: 'Not valid',
    sangatRendah: 'Very low',
    rendah: 'Low',
    sedang: 'Moderate',
    tinggi: 'High',
    sangatTinggi: 'Very high',
    sukar: 'Difficult',
    mudah: 'Easy',
    dibuang: 'Discard',
    jelek: 'Poor',
    cukup: 'Adequate',
    baik: 'Good',
    baikSekali: 'Excellent',
  },
  beranda: {
    judul: 'Nine calculators for one course',
    intro:
      'Every formula in the PSI307 modules rewritten as R code, run in the ' +
      'browser through WebAssembly, and tested against the numbers printed in ' +
      'those modules. No data ever leaves your device.',
    kartuAitem: 'Difficulty index P and discrimination index D, with their categories.',
    kartuValiditas:
      'Item-total correlation against an r table recomputed from the t distribution.',
    kartuReliabilitas: 'Split-half, Spearman-Brown, KR-20, KR-21, Cronbach alpha, and SEM.',
    kartuSkor: 'z, T, stanine, and percentile rank with their confidence bands.',
    kartuThurstone: 'Scale value S and interquartile range Q from judge ratings.',
    kartuGuttman: 'Scalogram, Goodenough errors, coefficients of reproducibility and scalability.',
    kartuLikert: 'Reverse scoring, percentage index, and internal consistency.',
    kartuTabelR: 'The product-moment r table for any N, not a copy of a textbook appendix.',
    kartuModul: 'A summary of all fourteen sessions and the formulas each one teaches.',
    angkaUji: 'tests passing',
    angkaRumus: 'psychometric formulas',
    angkaSesi: 'course sessions',
    angkaJaringan: 'network requests while computing',
  },
  aitem: {
    judul: 'Achievement test item analysis',
    penjelasan:
      'Enter a right-wrong matrix: 1 for correct, 0 for incorrect. The engine ' +
      'computes each item difficulty P and discrimination D, then flags the ' +
      'items worth keeping.',
    kolomBenar: 'Correct',
    kolomP: 'P',
    kolomKategoriP: 'Difficulty',
    kolomPAtas: 'P upper',
    kolomPBawah: 'P lower',
    kolomD: 'D',
    kolomKategoriD: 'Discrimination',
    kolomKorelasi: 'Item-total r',
    kolomLayak: 'Keep',
    ringkasKelompok: 'Extreme groups',
    ringkasTiapKelompok: 'Participants per group',
    ringkasRerata: 'Mean total score',
    judulPeta: 'Difficulty against discrimination',
    sumbuP: 'P — difficulty',
    sumbuD: 'D — discrimination',
    daerahLayak: 'keep',
  },
  validitas: {
    judul: 'Instrument validity',
    penjelasan:
      'Each item is correlated with the total of the remaining items, then ' +
      'compared against the critical r value at the chosen significance level.',
    kolomR: 'r computed',
    kolomRTabel: 'r critical',
    kolomValid: 'Decision',
    kolomKategori: 'Guilford category',
    ringkasValid: 'Valid items',
    ringkasGugur: 'Dropped items',
    ringkasRTabel: 'Critical r',
    valid: 'Valid',
    gugur: 'Dropped',
    judulGrafik: 'Each item correlation against the critical r',
  },
  reliabilitas: {
    judul: 'Instrument reliability',
    penjelasan:
      'Every method that applies to your data runs side by side, so the ' +
      'differences between them are visible instead of taken on faith.',
    alpha: 'Cronbach alpha',
    kr20: 'KR-20',
    kr21: 'KR-21',
    belahGanjilGenap: 'Odd-even split half',
    belahAwalAkhir: 'First-second split half',
    rBelah: 'Half r',
    r11: 'Full-test r',
    sem: 'Standard error of measurement',
    sbTotal: 'Total standard deviation',
    rerataTotal: 'Mean total score',
    kolomRerata: 'Mean',
    kolomVarians: 'Variance',
    kolomKorelasi: 'Item-total r',
    kolomAlphaBuang: 'Alpha if dropped',
    catatanDikotomi: 'KR-20 and KR-21 apply to dichotomous data only.',
    judulPerbandingan: 'Methods compared',
    judulSebaranBelahan: 'The two halves plotted',
    catatanSem:
      'A person observed score sits roughly within plus or minus 1.96 SEM of ' +
      'their true score at 95 percent confidence.',
  },
  skor: {
    judul: 'Standard scores and interpretation',
    penjelasan:
      'Raw scores become z, T, stanine, and percentile rank so that a person ' +
      'standing can be compared, not merely read off.',
    kolomNama: 'Participant',
    kolomMentah: 'Raw score',
    kolomZ: 'z',
    kolomT: 'T',
    kolomStanine: 'Stanine',
    kolomPersentil: 'Percentile rank',
    judulKurva: 'Where each participant falls on the normal curve',
    barisStanine: 'stanine',
    barisPersentil: 'percentile',
  },
  thurstone: {
    judul: 'Thurstone scale',
    penjelasan:
      'Enter the judge rating matrix: one row per judge, one column per ' +
      'statement, values 1 through 11. The engine computes each item scale ' +
      'value S and interquartile range Q.',
    kolomS: 'S (location)',
    kolomK25: 'K25',
    kolomK75: 'K75',
    kolomQ: 'Q (spread)',
    kolomQTerkelompok: 'Q grouped',
    terpilih: 'Items selected',
    lokasiTerwakili: 'Locations covered',
    judulTerpilih: 'Items chosen for the final scale',
    judulKontinum: 'Item locations on the continuum',
    sumbuS: 'scale value S — further right is more favorable',
    catatanDuaMetode:
      'S uses the grouped-data interpolation formula from session 9; Q uses the ' +
      'SPSS-style percentiles from session 10. The module really does use two ' +
      'different methods, and the grouped Q column shows the gap.',
  },
  guttman: {
    judul: 'Guttman scale',
    penjelasan:
      'Enter a yes-no response matrix: 1 for yes, 0 for no. The engine builds ' +
      'the scalogram, counts departures from a perfect scale pattern, then ' +
      'judges reproducibility and scalability.',
    kr: 'Coefficient of reproducibility',
    ks: 'Coefficient of scalability',
    error: 'Total errors',
    jawabanYa: 'Yes answers',
    banyakSel: 'Total cells',
    diterima: 'Accepted',
    ditolak: 'Rejected',
    syaratKr: 'Requirement: above 0.90',
    syaratKs: 'Requirement: above 0.60',
    judulSkalogram: 'Scalogram',
    penjelasanSkalogram:
      'Easiest items on the left, highest-scoring respondents on top. Marked ' +
      'cells are departures from a perfect scale pattern.',
    kolomSkor: 'Score',
    kolomError: 'Errors',
  },
  likert: {
    judul: 'Likert scale',
    penjelasan:
      'Enter a response matrix with values from 1 to the number of options. ' +
      'Unfavorable items are reversed first, then total scores and the ' +
      'percentage index are computed.',
    indeksSkala: 'Scale index',
    kolomFavorable: 'Direction',
    kolomRerataMentah: 'Raw mean',
    kolomRerataTerskor: 'Scored mean',
    kolomSb: 'Standard deviation',
    kolomIndeks: 'Index (%)',
    kolomKorelasi: 'Item-total r',
    kolomSpearman: 'Spearman rho',
    kolomAlphaBuang: 'Alpha if dropped',
    kolomTotal: 'Total',
    kolomKategori: 'Category',
    favorable: 'Favorable',
    unfavorable: 'Unfavorable',
    judulSebaran: 'Response distribution',
    catatanOrdinal:
      'Likert responses are ordinal. Summing them assumes the gaps between ' +
      'options are equal — an assumption the data does not guarantee. The ' +
      'Spearman rho column is there so the decision need not rest on it alone.',
  },
  tabelR: {
    judul: 'Product-moment r table',
    penjelasan:
      'This table is not copied from a textbook appendix. Every value is ' +
      'recomputed from the t distribution: critical r equals t divided by the ' +
      'square root of t squared plus the degrees of freedom. Because it is ' +
      'computed, it works for any N.',
    kolomN: 'N',
    kolom5: '5% level',
    kolom1: '1% level',
    dari: 'N from',
    sampai: 'to',
  },
  modul: {
    judul: 'The fourteen PSI307 sessions',
    penjelasan:
      'A summary of each session and the calculator that answers it. These ' +
      'summaries are written in our own words; the original module files are ' +
      'not included, because their copyright belongs to their author.',
    alatTerkait: 'Related tool',
    tidakAdaAlat: 'A theory session, with no calculator.',
    judulBanding: 'Two things set against each other',
    judulAlur: 'The order of steps',
    judulPencar: 'How two score series relate',
    judulTangga: 'The four levels of measurement',
  },
  metode: {
    judul: 'How these numbers are held accountable',
    lapisJudul: 'Three layers of checking',
    lapis1Judul: 'Against the course modules themselves',
    lapis1:
      'The engine must answer the module questions with the module answers. The ' +
      'critical r at N = 10 must be 0.632. The six example difficulty indices in ' +
      'session 7 must be 0.50, 0.70, 0.20, 0.45, 0.75, and 0.30. If one misses, ' +
      'the engine is what is wrong.',
    lapis2Judul: 'Against mathematical identities',
    lapis2:
      'Cronbach alpha must equal KR-20 exactly on dichotomous data. KR-21 must ' +
      'never exceed KR-20. Split-half reliability must follow Spearman-Brown. ' +
      'Identities like these cannot pass by accident.',
    lapis3Judul: 'Against numpy and scipy',
    lapis3:
      'The same formulas rewritten in Python, then matched against the R answers ' +
      'to ten decimal places. The critical r comes from scipy.stats.t on one ' +
      'side and from qt() on the other — two routines that share no code.',
    temuanJudul: 'What the tests caught',
    temuan1Judul: 'KR-20 with mismatched divisors',
    temuan1:
      'The first version used p times q in the numerator but the sample variance ' +
      'in the denominator. The number looked reasonable, but the alpha equals ' +
      'KR-20 identity broke. That identity test is what caught it.',
    temuan2Judul: 'The module uses two methods for S and Q',
    temuan2:
      'Session 9 gives a grouped-data interpolation formula; session 10 says to ' +
      'use SPSS quartiles. They disagree. The module states Q equals zero when ' +
      'all judges agree — only the SPSS quartiles satisfy that.',
    temuan3Judul: 'A WebR bug on Node for Windows',
    temuan3:
      'WebR loads the R runtime by importing a path from path.resolve. On ' +
      'Windows that path starts with a drive letter, which the Node ESM loader ' +
      'refuses. Patching one expression lets the same R files be tested in the ' +
      'terminal and run in the browser.',
    tumpukanJudul: 'Technology stack',
    tumpukanMesin: 'Engine',
    tumpukanMesinIsi: 'R 4.6.0, base packages only',
    tumpukanRuntime: 'Runtime',
    tumpukanRuntimeIsi: 'WebR — R compiled to WebAssembly',
    tumpukanCangkang: 'Shell',
    tumpukanCangkangIsi: 'TypeScript, no UI framework',
    tumpukanUji: 'Tests',
    tumpukanUjiIsi: 'Vitest running the same R files as the site',
    tumpukanBanding: 'Reference',
    tumpukanBandingIsi: 'numpy and scipy through golden vectors',
    privasiJudul: 'Your data goes nowhere',
    privasi:
      'Everything is computed inside your browser. The R runtime is downloaded ' +
      'once from this same origin, not from a third-party CDN. After that there ' +
      'is not a single network request while you compute, and no data is sent ' +
      'anywhere.',
  },
};

/**
 * Kamus lengkap: bagian inti digabung dengan bagian isi modul.
 *
 * Digabung di sini, bukan di tempat pemakaian, supaya hanya ada SATU objek
 * yang perlu ditelusuri uji kebocoran bahasa. Kalau ada kalimat yang tidak
 * bisa ditemukan di objek ini, kalimat itu ditulis di tempat yang salah.
 */
export const kamus = {
  id: { ...id, ...modulId },
  en: { ...en, ...modulEn },
} as const;

export type KodeBahasa = keyof typeof kamus;
export type KamusPenuh = (typeof kamus)['id'];
