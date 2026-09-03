/**
 * Sumber mesin R sebagai teks.
 *
 * Berkas .R di folder R/ adalah satu-satunya tempat rumus psikometri ditulis.
 * Modul ini menariknya sebagai string mentah lewat `?raw`, sehingga baik situs
 * di peramban maupun test suite di Node menjalankan bytes yang sama persis.
 * Tidak ada salinan kedua yang bisa menyimpang.
 *
 * Urutan penting: 00-galat menyediakan ps_pastikan yang dipakai semua berkas
 * berikutnya, 01-json menyediakan ps_jalankan yang membungkus setiap hasil.
 */
import galat from '../../R/00-galat.R?raw';
import json from '../../R/01-json.R?raw';
import statistik from '../../R/02-statistik.R?raw';
import korelasi from '../../R/03-korelasi.R?raw';
import validitas from '../../R/04-validitas.R?raw';
import reliabilitas from '../../R/05-reliabilitas.R?raw';
import aitem from '../../R/06-aitem.R?raw';
import skor from '../../R/07-skor.R?raw';
import thurstone from '../../R/08-thurstone.R?raw';
import guttman from '../../R/09-guttman.R?raw';
import likert from '../../R/10-likert.R?raw';
import faktor from '../../R/11-faktor.R?raw';
import sus from '../../R/12-sus.R?raw';
import distraktor from '../../R/13-distraktor.R?raw';
import seleksi from '../../R/14-seleksi.R?raw';

export interface BerkasR {
  readonly nama: string;
  readonly isi: string;
}

export const SUMBER_R: readonly BerkasR[] = [
  { nama: '00-galat.R', isi: galat },
  { nama: '01-json.R', isi: json },
  { nama: '02-statistik.R', isi: statistik },
  { nama: '03-korelasi.R', isi: korelasi },
  { nama: '04-validitas.R', isi: validitas },
  { nama: '05-reliabilitas.R', isi: reliabilitas },
  { nama: '06-aitem.R', isi: aitem },
  { nama: '07-skor.R', isi: skor },
  { nama: '08-thurstone.R', isi: thurstone },
  { nama: '09-guttman.R', isi: guttman },
  { nama: '10-likert.R', isi: likert },
  { nama: '11-faktor.R', isi: faktor },
  { nama: '12-sus.R', isi: sus },
  { nama: '13-distraktor.R', isi: distraktor },
  { nama: '14-seleksi.R', isi: seleksi },
];

/** Seluruh mesin sebagai satu blok R, siap dievaluasi sekali jalan. */
export function sumberGabungan(): string {
  return SUMBER_R.map((berkas) => berkas.isi).join('\n');
}
