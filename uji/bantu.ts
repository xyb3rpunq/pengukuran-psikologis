/**
 * Perkakas bersama untuk seluruh berkas uji.
 *
 * Satu instans Mesin dipakai bersama semua uji. WebR menyalakan proses R
 * lengkap; menyalakannya ulang per berkas uji akan mengubah suite yang
 * berjalan dua detik menjadi suite yang berjalan setengah menit, dan suite
 * yang lambat adalah suite yang tidak dijalankan.
 */
import { Mesin } from '../src/mesin/mesin';

const BASE_URL_NODE = './node_modules/webr/dist/';

let janji: Promise<Mesin> | undefined;

export function mesinUji(): Promise<Mesin> {
  janji ??= Mesin.mulai({ baseUrl: BASE_URL_NODE });
  return janji;
}

/** Bandingkan dua angka sampai toleransi tertentu. */
export function hampirSama(a: number, b: number, toleransi = 1e-10): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= toleransi;
}

/**
 * Data uji yang dapat diulang, tanpa ketergantungan pada Math.random().
 *
 * Generator kongruensial linier dengan tetapan dari Numerical Recipes. Bukan
 * generator yang layak untuk kriptografi, tapi uji statistik butuh dua hal
 * yang justru dipenuhinya: sebaran yang cukup acak, dan deret yang sama persis
 * setiap kali dijalankan sehingga kegagalan bisa ditelusuri.
 */
export function acakan(benih: number): () => number {
  let keadaan = benih >>> 0;
  return () => {
    keadaan = (Math.imul(1664525, keadaan) + 1013904223) >>> 0;
    return keadaan / 4294967296;
  };
}

/** Matriks respons dikotomi acak yang dapat diulang. */
export function matriksDikotomi(baris: number, kolom: number, benih: number): number[][] {
  const acak = acakan(benih);
  // Tiap aitem diberi taraf kesukaran sendiri supaya matriksnya punya varians
  // aitem yang bervariasi — matriks dengan p seragam menyembunyikan galat pada
  // rumus yang membobot aitem.
  const kesukaran = Array.from({ length: kolom }, () => 0.25 + acak() * 0.5);
  return Array.from({ length: baris }, () =>
    Array.from({ length: kolom }, (_, j) => (acak() < (kesukaran[j] as number) ? 1 : 0)),
  );
}

/** Matriks respons Likert acak yang dapat diulang, nilai 1..kategori. */
export function matriksLikert(
  baris: number,
  kolom: number,
  benih: number,
  kategori = 5,
): number[][] {
  const acak = acakan(benih);
  return Array.from({ length: baris }, () => {
    // Kecenderungan responden ditambahkan supaya aitem berkorelasi satu sama
    // lain; tanpa itu alpha Cronbach selalu mendekati nol dan ujinya tumpul.
    const kecenderungan = acak();
    return Array.from({ length: kolom }, () => {
      const nilai = Math.round(1 + (kategori - 1) * (0.6 * kecenderungan + 0.4 * acak()));
      return Math.min(kategori, Math.max(1, nilai));
    });
  });
}

/** Vektor angka acak yang dapat diulang. */
export function deret(panjang: number, benih: number, bawah = 0, atas = 100): number[] {
  const acak = acakan(benih);
  return Array.from({ length: panjang }, () => bawah + acak() * (atas - bawah));
}
