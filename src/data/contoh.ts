/**
 * Data contoh untuk setiap alat hitung.
 *
 * Semua angka di sini disusun sendiri, bukan data responden sungguhan. Tiap
 * contoh dibuat agar memperlihatkan sesuatu: matriks tes prestasi punya butir
 * yang jelas jelek supaya daya pembedanya negatif, skala Likert punya butir
 * unfavorable supaya pembalikan skornya terlihat bekerja, dan matriks Guttman
 * hampir — tapi tidak sepenuhnya — berpola tangga sempurna.
 */

/** Tes prestasi: 20 peserta, 10 butir dikotomi. Butir 9 sengaja terbalik. */
export const TES_PRESTASI: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 0, 1, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 0, 1, 0, 0],
  [1, 1, 1, 0, 1, 1, 0, 0, 1, 1],
  [1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 0, 0, 1, 0],
  [1, 1, 0, 1, 0, 1, 0, 0, 1, 1],
  [1, 0, 1, 1, 0, 0, 1, 0, 1, 0],
  [1, 1, 1, 0, 0, 0, 0, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 1, 0, 0, 1, 0],
  [1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 0, 0, 0, 0, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
];

export const NAMA_BUTIR_TES = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];

/** Skala Likert lima titik: 20 responden, 8 butir. Butir 3 dan 6 unfavorable. */
export const SKALA_LIKERT: readonly (readonly number[])[] = [
  [5, 5, 1, 4, 5, 2, 5, 4],
  [4, 5, 2, 4, 4, 1, 4, 5],
  [5, 4, 1, 5, 5, 2, 5, 5],
  [4, 4, 2, 3, 4, 2, 4, 4],
  [3, 4, 3, 4, 3, 3, 4, 3],
  [4, 3, 2, 3, 4, 2, 3, 4],
  [3, 3, 3, 3, 3, 3, 3, 3],
  [2, 3, 4, 2, 3, 4, 2, 3],
  [3, 2, 3, 3, 2, 3, 3, 2],
  [2, 2, 4, 2, 2, 4, 2, 2],
  [1, 2, 5, 1, 2, 5, 2, 1],
  [2, 1, 4, 2, 1, 4, 1, 2],
  [1, 1, 5, 1, 1, 5, 1, 1],
  [5, 4, 2, 5, 4, 1, 5, 4],
  [4, 5, 1, 4, 5, 2, 4, 5],
  [3, 3, 3, 4, 3, 2, 3, 4],
  [2, 3, 4, 3, 3, 3, 3, 3],
  [4, 4, 2, 4, 4, 2, 4, 4],
  [5, 5, 1, 5, 5, 1, 5, 5],
  [1, 2, 4, 2, 1, 4, 2, 2],
];

export const NAMA_BUTIR_LIKERT = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'];
export const FAVORABLE_LIKERT = '1, 2, 4, 5, 7, 8';

/** Skala Guttman: 16 responden, 6 butir, hampir berpola tangga sempurna. */
export const SKALA_GUTTMAN: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 1, 0, 1, 0],
  [1, 1, 0, 0, 0, 0],
  [1, 1, 0, 1, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [1, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0],
  [1, 0, 1, 0, 0, 0],
  [1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

export const NAMA_BUTIR_GUTTMAN = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];

/**
 * Penilaian juri Thurstone: 15 penilai, 9 pernyataan, rentang 1..11.
 *
 * Pernyataan disusun agar lokasinya menyebar dari sangat tidak favorabel
 * sampai sangat favorabel, dan dua di antaranya sengaja diperdebatkan supaya
 * Q-nya besar dan gugur saat pemilihan butir.
 */
export const PENILAIAN_THURSTONE: readonly (readonly number[])[] = [
  [1, 2, 4, 5, 6, 8, 9, 11, 6],
  [1, 3, 4, 5, 7, 8, 10, 11, 1],
  [2, 2, 3, 5, 6, 9, 9, 10, 11],
  [1, 2, 4, 6, 6, 8, 10, 11, 2],
  [1, 3, 4, 5, 7, 8, 9, 11, 10],
  [2, 2, 4, 5, 6, 8, 10, 11, 3],
  [1, 2, 3, 6, 7, 9, 9, 10, 9],
  [1, 3, 4, 5, 6, 8, 10, 11, 1],
  [2, 2, 4, 5, 7, 8, 9, 11, 11],
  [1, 2, 4, 6, 6, 9, 10, 10, 4],
  [1, 3, 3, 5, 7, 8, 9, 11, 8],
  [2, 2, 4, 5, 6, 8, 10, 11, 2],
  [1, 2, 4, 5, 7, 9, 9, 10, 10],
  [1, 3, 4, 6, 6, 8, 10, 11, 5],
  [2, 2, 3, 5, 7, 8, 9, 11, 7],
];

export const NAMA_BUTIR_THURSTONE = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'];

/** Skor mentah ujian akhir 24 peserta, untuk halaman skor standar. */
export const SKOR_MENTAH: readonly number[] = [
  42, 48, 51, 53, 55, 58, 60, 61, 63, 65, 66, 68, 68, 70, 71, 73, 75, 77, 79, 82, 84, 87, 91, 95,
];

export const NAMA_PESERTA: readonly string[] = [
  'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08',
  'P09', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16',
  'P17', 'P18', 'P19', 'P20', 'P21', 'P22', 'P23', 'P24',
];

/** Pasangan skor tes dan skor alat pembanding, untuk validitas banding. */
export const SKOR_TES_BANDING: readonly number[] = [
  72, 65, 80, 58, 90, 76, 61, 85, 70, 55, 88, 67, 74, 62, 79,
];

export const SKOR_KRITERIA_BANDING: readonly number[] = [
  75, 68, 82, 60, 87, 73, 66, 84, 71, 59, 85, 70, 72, 64, 81,
];

/**
 * Respons System Usability Scale: 24 responden, 10 butir baku, nilai 1..5.
 *
 * Disusun agar reratanya berada sedikit di atas patokan 68, sehingga halaman
 * contohnya memperlihatkan kasus yang lulus — dan pembaca bisa melihat bahwa
 * "lulus" pada SUS berarti melewati rerata penelitian terdahulu, bukan
 * melewati angka 70 dari nilai ujian.
 */
export const RESPON_SUS: readonly (readonly number[])[] = [
  [3, 4, 3, 2, 3, 3, 4, 2, 2, 3],
  [5, 2, 4, 2, 5, 2, 4, 1, 4, 2],
  [4, 3, 4, 3, 4, 1, 4, 1, 4, 1],
  [3, 2, 5, 2, 4, 1, 4, 3, 4, 2],
  [3, 2, 3, 3, 4, 2, 4, 3, 4, 3],
  [5, 3, 4, 2, 4, 2, 5, 2, 4, 3],
  [4, 2, 4, 1, 4, 2, 5, 3, 5, 2],
  [4, 2, 5, 1, 4, 3, 5, 2, 5, 1],
  [5, 1, 5, 1, 4, 1, 5, 2, 5, 1],
  [4, 2, 5, 1, 4, 1, 5, 2, 5, 1],
  [4, 2, 2, 3, 5, 3, 3, 2, 4, 4],
  [4, 3, 4, 3, 4, 1, 5, 3, 5, 2],
  [2, 3, 2, 4, 2, 4, 3, 3, 3, 4],
  [4, 1, 4, 3, 5, 1, 4, 1, 5, 2],
  [5, 1, 3, 2, 5, 1, 5, 1, 5, 2],
  [4, 1, 4, 1, 5, 1, 4, 2, 5, 1],
  [3, 4, 2, 3, 2, 2, 2, 4, 3, 4],
  [4, 2, 4, 1, 3, 3, 5, 3, 5, 2],
  [3, 2, 3, 2, 2, 3, 3, 2, 4, 3],
  [5, 1, 3, 2, 4, 3, 4, 2, 5, 1],
  [4, 1, 4, 2, 5, 2, 3, 1, 3, 2],
  [4, 2, 4, 2, 4, 1, 4, 3, 5, 2],
  [4, 2, 4, 2, 3, 2, 5, 2, 4, 2],
  [4, 2, 4, 2, 3, 2, 3, 1, 4, 1],
];

/**
 * Respons untuk analisis faktor: 40 responden, 8 butir, dua dimensi.
 *
 * Empat butir pertama dibangkitkan dari satu peubah tersembunyi dan empat
 * berikutnya dari peubah lain, sehingga strukturnya memang ada untuk
 * ditemukan. Tanpa struktur seperti itu, halaman contoh hanya akan
 * memperlihatkan analisis faktor yang gagal — yang benar, tapi tidak
 * mengajarkan apa-apa.
 */
export const RESPON_FAKTOR: readonly (readonly number[])[] = [
  [4, 3, 4, 4, 5, 4, 3, 3],
  [2, 2, 2, 2, 3, 3, 3, 3],
  [3, 3, 2, 2, 1, 1, 3, 2],
  [3, 2, 3, 2, 5, 4, 5, 3],
  [2, 4, 3, 2, 3, 4, 3, 3],
  [4, 4, 4, 5, 3, 3, 3, 3],
  [4, 2, 3, 2, 2, 3, 3, 2],
  [4, 4, 4, 5, 4, 4, 5, 4],
  [2, 2, 2, 2, 4, 4, 4, 5],
  [4, 5, 5, 5, 5, 4, 4, 5],
  [3, 4, 4, 4, 4, 5, 4, 4],
  [3, 4, 3, 3, 5, 5, 5, 5],
  [3, 3, 4, 4, 3, 2, 3, 2],
  [4, 3, 4, 3, 5, 5, 3, 5],
  [3, 4, 4, 3, 3, 4, 3, 3],
  [4, 5, 4, 5, 3, 3, 4, 4],
  [2, 1, 1, 2, 4, 4, 4, 4],
  [3, 3, 4, 4, 1, 1, 1, 1],
  [2, 2, 2, 2, 4, 4, 3, 4],
  [4, 3, 4, 3, 2, 2, 1, 1],
  [4, 3, 3, 3, 1, 2, 2, 1],
  [4, 2, 3, 3, 4, 5, 4, 5],
  [4, 3, 3, 4, 3, 3, 4, 4],
  [4, 4, 3, 3, 5, 5, 5, 5],
  [4, 3, 4, 5, 5, 5, 4, 3],
  [4, 3, 4, 3, 4, 4, 3, 5],
  [3, 3, 3, 2, 3, 4, 3, 2],
  [5, 3, 5, 3, 4, 3, 3, 4],
  [3, 2, 3, 3, 1, 2, 3, 1],
  [2, 2, 2, 2, 5, 5, 4, 5],
  [5, 5, 4, 5, 3, 2, 3, 3],
  [1, 1, 1, 1, 3, 3, 2, 3],
  [4, 5, 3, 4, 4, 5, 5, 5],
  [1, 3, 1, 2, 4, 4, 5, 5],
  [1, 1, 1, 1, 3, 3, 3, 4],
  [1, 1, 1, 1, 3, 3, 1, 2],
  [3, 4, 3, 3, 1, 2, 3, 2],
  [3, 5, 3, 4, 4, 4, 4, 3],
  [4, 5, 4, 4, 4, 4, 4, 3],
  [1, 3, 4, 3, 4, 3, 4, 3],
];

export const NAMA_BUTIR_FAKTOR = ['D1', 'D2', 'D3', 'D4', 'E1', 'E2', 'E3', 'E4'];

/**
 * Jawaban pilihan ganda: 30 peserta, 8 butir, 5 opsi, nilainya nomor pilihan.
 *
 * Butir 6 sengaja dibuat punya pengecoh yang justru menarik peserta kuat —
 * pola yang di kelas sering disebut "kunci ganda" dan yang harus tertangkap
 * analisis distraktor sebagai menyesatkan. Tanpa satu butir seperti itu,
 * halaman contohnya hanya akan menunjukkan tabel yang semuanya hijau.
 */
export const PILIHAN_GANDA: readonly (readonly number[])[] = [
  [1, 3, 2, 5, 4, 4, 1, 3],
  [1, 3, 2, 5, 4, 4, 3, 1],
  [1, 3, 2, 5, 4, 1, 1, 3],
  [1, 1, 2, 5, 1, 4, 2, 2],
  [1, 3, 2, 5, 4, 4, 1, 3],
  [1, 3, 2, 5, 4, 4, 1, 3],
  [1, 1, 2, 1, 1, 4, 1, 3],
  [1, 3, 2, 5, 4, 2, 1, 3],
  [3, 3, 2, 1, 4, 1, 3, 4],
  [3, 3, 1, 4, 4, 1, 4, 5],
  [1, 3, 1, 1, 4, 1, 4, 3],
  [1, 3, 1, 5, 1, 2, 1, 1],
  [1, 3, 5, 2, 3, 4, 3, 3],
  [3, 3, 2, 5, 4, 2, 1, 3],
  [1, 3, 5, 1, 5, 2, 5, 1],
  [2, 3, 2, 5, 5, 1, 1, 3],
  [1, 1, 4, 1, 1, 2, 1, 4],
  [1, 3, 2, 1, 1, 2, 3, 4],
  [2, 1, 1, 5, 4, 2, 2, 3],
  [4, 3, 4, 1, 1, 1, 5, 1],
  [1, 2, 5, 5, 5, 1, 1, 3],
  [5, 3, 2, 5, 1, 5, 2, 1],
  [1, 4, 2, 2, 2, 1, 2, 1],
  [1, 3, 1, 1, 5, 1, 5, 5],
  [4, 1, 1, 1, 1, 4, 1, 4],
  [1, 3, 3, 5, 4, 1, 4, 5],
  [1, 3, 1, 4, 4, 3, 2, 1],
  [1, 3, 5, 3, 1, 1, 2, 2],
  [3, 1, 2, 5, 4, 1, 4, 1],
  [4, 3, 5, 1, 1, 1, 2, 1],
];

/** Kunci jawaban untuk PILIHAN_GANDA, satu nomor pilihan per butir. */
export const KUNCI_PILIHAN_GANDA: readonly number[] = [1, 3, 2, 5, 4, 2, 1, 3];

export const NAMA_BUTIR_PG = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];

/**
 * Skala untuk halaman seleksi butir: 32 responden, 8 butir.
 *
 * Lima butir pertama dibangkitkan dari satu sifat laten yang sama; tiga
 * terakhir angka acak murni. Prosedur seleksi yang benar harus menyisakan
 * tepat kelima butir pertama, dan alpha-nya harus naik saat ketiga butir
 * derau itu pergi. Itulah yang membuat contoh ini mengajarkan sesuatu.
 */
export const SKALA_BERDERAU: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1, 4, 4, 5],
  [4, 3, 3, 3, 3, 3, 3, 2],
  [5, 4, 5, 5, 5, 5, 1, 4],
  [3, 4, 4, 4, 4, 1, 3, 1],
  [3, 2, 4, 3, 3, 1, 3, 2],
  [3, 4, 5, 3, 4, 2, 5, 1],
  [5, 5, 5, 5, 5, 3, 2, 4],
  [1, 1, 1, 1, 1, 2, 5, 3],
  [2, 1, 2, 3, 2, 1, 1, 1],
  [3, 4, 4, 2, 4, 1, 1, 3],
  [2, 2, 1, 3, 1, 4, 5, 1],
  [4, 5, 5, 4, 5, 5, 5, 5],
  [2, 2, 1, 1, 1, 1, 4, 4],
  [2, 3, 2, 3, 3, 5, 3, 5],
  [5, 5, 5, 4, 5, 1, 2, 5],
  [1, 1, 2, 2, 1, 4, 5, 3],
  [3, 3, 2, 3, 2, 5, 3, 2],
  [4, 3, 3, 4, 3, 5, 1, 4],
  [5, 4, 4, 4, 3, 4, 3, 4],
  [5, 5, 3, 4, 5, 2, 1, 2],
  [1, 1, 2, 1, 2, 1, 1, 1],
  [1, 1, 2, 2, 2, 2, 5, 1],
  [4, 4, 4, 3, 4, 4, 1, 5],
  [3, 3, 3, 3, 2, 3, 1, 1],
  [1, 1, 1, 1, 1, 5, 1, 5],
  [3, 2, 3, 3, 3, 4, 2, 1],
  [3, 3, 4, 4, 4, 2, 3, 3],
  [4, 4, 3, 4, 4, 5, 4, 5],
  [1, 1, 2, 1, 1, 3, 4, 4],
  [5, 5, 4, 5, 4, 1, 1, 5],
  [3, 3, 2, 2, 3, 4, 2, 5],
  [1, 2, 2, 2, 2, 3, 4, 3],
];

export const NAMA_BUTIR_SELEKSI = ['B1', 'B2', 'B3', 'B4', 'B5', 'X1', 'X2', 'X3'];
