/**
 * Permukaan bertipe untuk mesin R.
 *
 * Setiap fungsi di sini menyusun satu ekspresi R lewat penulis literal, lalu
 * memulangkan bentuk yang sudah bertipe. Tidak ada string data yang disambung
 * langsung ke ekspresi, dan tidak ada bagian lain program yang menulis kode R.
 */
import type { Mesin } from './mesin';
import { angka, logis, matriks, teks, vektor, vektorTeks } from './literal';

export type KategoriGuilford =
  | 'takValid'
  | 'sangatRendah'
  | 'rendah'
  | 'sedang'
  | 'tinggi'
  | 'sangatTinggi';

export type KategoriKesukaran = 'sukar' | 'sedang' | 'mudah';
export type KategoriDayaPembeda = 'dibuang' | 'jelek' | 'cukup' | 'baik' | 'baikSekali';
export type KategoriIndeks = 'sangatRendah' | 'rendah' | 'sedang' | 'tinggi' | 'sangatTinggi';

export interface Kuartil {
  q1: number;
  q2: number;
  q3: number;
  rentangAntarKuartil: number;
}

export interface RingkasanDeskriptif {
  n: number;
  rerata: number;
  median: number;
  modus: number[];
  sbPopulasi: number;
  sbSampel: number;
  variansPopulasi: number;
  variansSampel: number;
  minimum: number;
  maksimum: number;
  rentang: number;
  kuartil: Kuartil;
}

export interface BarisTabelR {
  n: number;
  taraf5: number;
  taraf1: number;
}

export interface ButirValiditas {
  aitem: string;
  rHitung: number | null;
  rTabel: number;
  valid: boolean;
  kategori: KategoriGuilford | null;
}

export interface HasilValiditasButir {
  n: number;
  banyakAitem: number;
  alpha: number;
  rTabel: number;
  dikoreksi: boolean;
  butir: ButirValiditas[];
  banyakValid: number;
  banyakGugur: number;
}

export interface HasilValiditasBanding {
  n: number;
  korelasi: number;
  validitasKriteria: number;
  koefisienValiditas: number;
  rTabel: number;
  alpha: number;
  valid: boolean;
  kategori: KategoriGuilford | null;
}

export interface HasilBelahDua {
  metode: string;
  aitemKiri: number[];
  aitemKanan: number[];
  skorKiri: number[];
  skorKanan: number[];
  rBelah: number;
  r11: number;
  kategori: KategoriGuilford | null;
}

export interface ButirReliabilitas {
  aitem: string;
  rerata: number;
  varians: number;
  korelasiAitemTotal: number | null;
  alphaJikaDibuang: number | null;
}

export interface HasilReliabilitas {
  n: number;
  banyakAitem: number;
  dikotomi: boolean;
  rerataTotal: number;
  sbTotal: number;
  variansTotal: number;
  alphaCronbach: number;
  kategoriAlpha: KategoriGuilford | null;
  sem: number;
  belahGanjilGenap: HasilBelahDua;
  belahAwalAkhir: HasilBelahDua;
  kr20: number | null;
  kr21: number | null;
  butir: ButirReliabilitas[];
}

export interface ButirAitem {
  aitem: string;
  benar: number;
  p: number;
  kategoriKesukaran: KategoriKesukaran | null;
  pAtas: number;
  pBawah: number;
  d: number;
  kategoriDayaPembeda: KategoriDayaPembeda | null;
  korelasiAitemTotal: number | null;
  layak: boolean;
}

export interface HasilAnalisisAitem {
  n: number;
  banyakAitem: number;
  proporsiKelompok: number;
  banyakTiapKelompok: number;
  rerataSkorTotal: number;
  butir: ButirAitem[];
}

export interface PesertaSkor {
  nama: string;
  skorMentah: number;
  z: number;
  t: number;
  stanine: number;
  jenjangPersentil: number;
}

export interface HasilKonversiSkor {
  ringkasan: RingkasanDeskriptif;
  populasi: boolean;
  peserta: PesertaSkor[];
}

export interface ButirThurstone {
  butir: string;
  /** Nilai skala butir: median lewat interpolasi terkelompok (modul sesi 9). */
  s: number;
  /** Kuartil gaya SPSS atas penilaian mentah (modul sesi 10). */
  k25: number;
  k75: number;
  q: number;
  /** Kuartil versi interpolasi terkelompok, untuk membandingkan kedua metode. */
  k25Terkelompok: number;
  k75Terkelompok: number;
  qTerkelompok: number;
}

export interface HasilThurstone {
  banyakPenilai: number;
  banyakButir: number;
  kategori: number;
  butir: ButirThurstone[];
}

export interface HasilPilihThurstone {
  diminta: number;
  terpilih: number;
  lokasiTerwakili: number;
  butir: ButirThurstone[];
}

export interface RespondenGuttman {
  responden: string;
  skor: number;
  error: number;
}

export interface HasilGuttman {
  n: number;
  banyakButir: number;
  banyakSel: number;
  jawabanYa: number;
  error: number;
  x: number;
  koefisienReprodusibilitas: number;
  koefisienSkalabilitas: number | null;
  reprodusibilitasDiterima: boolean;
  skalabilitasDiterima: boolean;
  kr21: number | null;
  skalogram: number[][];
  namaButir: string[];
  proporsiYa: number[];
  responden: RespondenGuttman[];
}

export interface ButirLikert {
  butir: string;
  favorable: boolean;
  rerataMentah: number;
  rerataTerskor: number;
  sb: number;
  indeks: number;
  korelasiAitemTotal: number | null;
  korelasiSpearman: number | null;
  alphaJikaDibuang: number | null;
}

export interface RespondenLikert {
  responden: string;
  total: number;
  indeks: number;
  kategori: KategoriIndeks | null;
}

export interface HasilLikert {
  n: number;
  banyakButir: number;
  kategori: number;
  skorMaksimumResponden: number;
  rerataTotal: number;
  sbTotal: number;
  indeksSkala: number;
  kategoriSkala: KategoriIndeks | null;
  alphaCronbach: number | null;
  kategoriAlpha: KategoriGuilford | null;
  butir: ButirLikert[];
  responden: RespondenLikert[];
}

// --- Statistik dasar -------------------------------------------------------

export function ringkasanDeskriptif(mesin: Mesin, x: readonly number[]) {
  return mesin.panggil<RingkasanDeskriptif>(`ps_ringkasan_deskriptif(${vektor(x)})`);
}

export function pearson(mesin: Mesin, x: readonly number[], y: readonly number[]) {
  return mesin.panggil<number>(`ps_pearson(${vektor(x)}, ${vektor(y)})`);
}

export function spearman(mesin: Mesin, x: readonly number[], y: readonly number[]) {
  return mesin.panggil<number>(`ps_spearman(${vektor(x)}, ${vektor(y)})`);
}

// --- Validitas -------------------------------------------------------------

export function rKritis(mesin: Mesin, n: number, alpha = 0.05) {
  return mesin.panggil<number>(`ps_r_kritis(${angka(n)}, ${angka(alpha)})`);
}

export function tabelR(mesin: Mesin, nMin = 3, nMax = 100) {
  return mesin.panggil<BarisTabelR[]>(`ps_tabel_r(${angka(nMin)}, ${angka(nMax)})`);
}

export function validitasButir(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  opsi: { dikoreksi?: boolean; alpha?: number; namaKolom?: readonly string[] } = {},
) {
  const { dikoreksi = true, alpha = 0.05, namaKolom } = opsi;
  return mesin.panggil<HasilValiditasButir>(
    `ps_validitas_butir(${matriks(m, namaKolom)}, ${dikoreksi ? 'TRUE' : 'FALSE'}, ${angka(alpha)})`,
  );
}

export function validitasBanding(
  mesin: Mesin,
  skorTes: readonly number[],
  skorKriteria: readonly number[],
  validitasKriteria = 1,
  alpha = 0.05,
) {
  return mesin.panggil<HasilValiditasBanding>(
    `ps_validitas_banding(${vektor(skorTes)}, ${vektor(skorKriteria)},` +
      ` ${angka(validitasKriteria)}, ${angka(alpha)})`,
  );
}

// --- Reliabilitas ----------------------------------------------------------

export function analisisReliabilitas(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  namaKolom?: readonly string[],
) {
  return mesin.panggil<HasilReliabilitas>(`ps_analisis_reliabilitas(${matriks(m, namaKolom)})`);
}

export function alphaCronbach(mesin: Mesin, m: readonly (readonly number[])[]) {
  return mesin.panggil<number>(`ps_alpha_cronbach(${matriks(m)})`);
}

export function kr20(mesin: Mesin, m: readonly (readonly number[])[]) {
  return mesin.panggil<number>(`ps_kr20(${matriks(m)})`);
}

export function kr21(mesin: Mesin, m: readonly (readonly number[])[]) {
  return mesin.panggil<number>(`ps_kr21(${matriks(m)})`);
}

export function spearmanBrown(mesin: Mesin, rBelah: number, k = 2) {
  return mesin.panggil<number>(`ps_spearman_brown(${angka(rBelah)}, ${angka(k)})`);
}

export function belahDua(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  metode: 'ganjilGenap' | 'awalAkhir' = 'ganjilGenap',
) {
  return mesin.panggil<HasilBelahDua>(`ps_belah_dua(${matriks(m)}, ${teks(metode)})`);
}

export function sem(mesin: Mesin, simpanganBaku: number, reliabilitas: number) {
  return mesin.panggil<number>(`ps_sem(${angka(simpanganBaku)}, ${angka(reliabilitas)})`);
}

// --- Analisis aitem --------------------------------------------------------

export function analisisAitem(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  opsi: { proporsi?: number; namaKolom?: readonly string[] } = {},
) {
  const proporsi = opsi.proporsi === undefined ? 'NULL' : angka(opsi.proporsi);
  return mesin.panggil<HasilAnalisisAitem>(
    `ps_analisis_aitem(${matriks(m, opsi.namaKolom)}, ${proporsi})`,
  );
}

// --- Skor standar ----------------------------------------------------------

export function konversiSkor(
  mesin: Mesin,
  x: readonly number[],
  opsi: { nama?: readonly string[]; populasi?: boolean } = {},
) {
  const nama = opsi.nama === undefined ? 'NULL' : vektorTeks(opsi.nama);
  const populasi = opsi.populasi === false ? 'FALSE' : 'TRUE';
  return mesin.panggil<HasilKonversiSkor>(`ps_konversi_skor(${vektor(x)}, ${nama}, ${populasi})`);
}

// --- Thurstone -------------------------------------------------------------

export function analisisThurstone(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  opsi: { kategori?: number; namaKolom?: readonly string[] } = {},
) {
  const kategori = angka(opsi.kategori ?? 11);
  return mesin.panggil<HasilThurstone>(
    `ps_analisis_thurstone(${matriks(m, opsi.namaKolom)}, ${kategori})`,
  );
}

export function pilihButirThurstone(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  opsi: { kategori?: number; maksimal?: number; namaKolom?: readonly string[] } = {},
) {
  const kategori = angka(opsi.kategori ?? 11);
  const maksimal = angka(opsi.maksimal ?? 8);
  return mesin.panggil<HasilPilihThurstone>(
    `ps_pilih_butir_thurstone(ps_analisis_thurstone(${matriks(m, opsi.namaKolom)},` +
      ` ${kategori}), ${maksimal})`,
  );
}

// --- Guttman ---------------------------------------------------------------

export function analisisGuttman(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  namaKolom?: readonly string[],
) {
  return mesin.panggil<HasilGuttman>(`ps_analisis_guttman(${matriks(m, namaKolom)})`);
}

// --- Likert ----------------------------------------------------------------

export function analisisLikert(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  opsi: { favorable?: readonly boolean[]; kategori?: number; namaKolom?: readonly string[] } = {},
) {
  const favorable = opsi.favorable === undefined ? 'NULL' : logis(opsi.favorable);
  const kategori = angka(opsi.kategori ?? 5);
  return mesin.panggil<HasilLikert>(
    `ps_analisis_likert(${matriks(m, opsi.namaKolom)}, ${favorable}, ${kategori})`,
  );
}

// --- Analisis faktor -------------------------------------------------------

export type KategoriKmo =
  | 'takDiterima'
  | 'buruk'
  | 'cukupan'
  | 'sedang'
  | 'bagus'
  | 'sangatBagus';

export interface HasilBartlett {
  n: number;
  banyakButir: number;
  penentu: number;
  khiKuadrat: number;
  db: number;
  p: number;
  layak: boolean;
}

export interface ButirKmo {
  butir: string;
  msa: number;
  kategori: KategoriKmo | null;
  layak: boolean;
}

export interface HasilKmo {
  kmo: number;
  kategori: KategoriKmo | null;
  layak: boolean;
  butir: ButirKmo[];
}

export interface BarisEigen {
  faktor: number;
  eigen: number;
  proporsi: number;
  kumulatif: number;
  diPertahankan: boolean;
}

export interface ButirFaktor {
  butir: string;
  komunalitas: number;
  keunikan: number;
  muatanTertinggi: number;
  faktor: number | null;
  bermuatanGanda: boolean;
  [muatan: string]: string | number | boolean | null;
}

export interface HasilFaktor {
  n: number;
  banyakButir: number;
  banyakFaktor: number;
  maksimumFaktor: number;
  rotasi: string;
  batasMuatan: number;
  khiKuadrat: number | null;
  db: number | null;
  pKecocokan: number | null;
  modelCukup: boolean;
  ragamPerFaktor: number[];
  ragamKumulatif: number;
  eigen: BarisEigen[];
  butir: ButirFaktor[];
  banyakTakBermuatan: number;
  banyakBermuatanGanda: number;
}

export interface HasilNormalitas {
  n: number;
  w: number;
  p: number;
  normal: boolean;
}

export function bartlett(mesin: Mesin, m: readonly (readonly number[])[]) {
  return mesin.panggil<HasilBartlett>(`ps_bartlett(${matriks(m)})`);
}

export function kmo(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  namaKolom?: readonly string[],
) {
  return mesin.panggil<HasilKmo>(`ps_kmo(${matriks(m, namaKolom)})`);
}

export function nilaiEigen(mesin: Mesin, m: readonly (readonly number[])[]) {
  return mesin.panggil<BarisEigen[]>(`ps_nilai_eigen(${matriks(m)})`);
}

export function analisisFaktor(
  mesin: Mesin,
  m: readonly (readonly number[])[],
  opsi: {
    banyakFaktor?: number | undefined;
    rotasi?: 'varimax' | 'promax' | 'none';
    batasMuatan?: number;
    namaKolom?: readonly string[];
  } = {},
) {
  const jumlah = opsi.banyakFaktor === undefined ? 'NULL' : angka(opsi.banyakFaktor);
  const rotasi = teks(opsi.rotasi ?? 'varimax');
  const batas = angka(opsi.batasMuatan ?? 0.4);
  return mesin.panggil<HasilFaktor>(
    `ps_analisis_faktor(${matriks(m, opsi.namaKolom)}, ${jumlah}, ${rotasi}, ${batas})`,
  );
}

export function normalitas(mesin: Mesin, x: readonly number[]) {
  return mesin.panggil<HasilNormalitas>(`ps_normalitas(${vektor(x)})`);
}

// --- System Usability Scale ------------------------------------------------

export type PeringkatSus =
  | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
export type AdjektivaSus =
  | 'terburuk' | 'buruk' | 'lumayan' | 'baik' | 'sangatBaik' | 'terbaik';
export type KeberterimaanSus = 'takDiterima' | 'marginal' | 'diterima';

export interface ButirSus {
  butir: number;
  favorable: boolean;
  rerataMentah: number;
  rerataSumbangan: number;
}

export interface RespondenSus {
  responden: string;
  skor: number;
  peringkat: PeringkatSus | null;
  adjektiva: AdjektivaSus | null;
  keberterimaan: KeberterimaanSus | null;
}

export interface HasilSus {
  n: number;
  rerata: number;
  median: number;
  sb: number | null;
  minimum: number;
  maksimum: number;
  galatBaku: number | null;
  selangBawah: number | null;
  selangAtas: number | null;
  peringkat: PeringkatSus | null;
  adjektiva: AdjektivaSus | null;
  keberterimaan: KeberterimaanSus | null;
  persentil: number;
  diAtasPatokan: boolean;
  alphaCronbach: number | null;
  butir: ButirSus[];
  responden: RespondenSus[];
}

export function analisisSus(mesin: Mesin, m: readonly (readonly number[])[]) {
  return mesin.panggil<HasilSus>(`ps_analisis_sus(${matriks(m)})`);
}
