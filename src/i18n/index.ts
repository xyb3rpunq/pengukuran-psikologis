/**
 * Pemilihan bahasa.
 *
 * Bahasa disimpan di localStorage supaya pilihan pengguna bertahan, dan
 * dipulangkan lewat satu fungsi `t()` yang menempuh jalur bertitik ke dalam
 * kamus. Kunci yang tidak ada tidak dibiarkan lewat diam-diam: ia memulangkan
 * penanda yang mencolok, karena teks yang hilang di antarmuka jauh lebih mudah
 * diperbaiki kalau ia berteriak daripada kalau ia menjadi ruang kosong.
 */
import { kamus, type KodeBahasa } from './kamus';

const KUNCI_SIMPANAN = 'tera.bahasa';

let sekarang: KodeBahasa = 'id';
const pendengar = new Set<(bahasa: KodeBahasa) => void>();

export function bahasaAwal(): KodeBahasa {
  try {
    const tersimpan = localStorage.getItem(KUNCI_SIMPANAN);
    if (tersimpan === 'id' || tersimpan === 'en') return tersimpan;
  } catch {
    // Peramban yang memblokir penyimpanan tetap harus bisa memakai situs ini.
  }
  return typeof navigator !== 'undefined' && navigator.language.startsWith('en') ? 'en' : 'id';
}

export function bahasa(): KodeBahasa {
  return sekarang;
}

export function pasangBahasa(kode: KodeBahasa): void {
  sekarang = kode;
  try {
    localStorage.setItem(KUNCI_SIMPANAN, kode);
  } catch {
    // Diabaikan dengan sengaja; pilihan bahasa hanya jadi tidak bertahan.
  }
  if (typeof document !== 'undefined') document.documentElement.lang = kode;
  for (const dengar of pendengar) dengar(kode);
}

export function saatBahasaBerubah(dengar: (bahasa: KodeBahasa) => void): () => void {
  pendengar.add(dengar);
  return () => pendengar.delete(dengar);
}

/**
 * Ambil satu string dari kamus lewat jalur bertitik, mis. `nav.beranda`.
 *
 * @param kode  bahasa yang diminta; kosongkan untuk memakai bahasa aktif
 */
export function t(jalur: string, kode: KodeBahasa = sekarang): string {
  const bagian = jalur.split('.');
  let simpul: unknown = kamus[kode];
  for (const nama of bagian) {
    if (typeof simpul !== 'object' || simpul === null) return `⟨${jalur}⟩`;
    simpul = (simpul as Record<string, unknown>)[nama];
  }
  return typeof simpul === 'string' ? simpul : `⟨${jalur}⟩`;
}

/**
 * Terjemahkan kode galat mesin menjadi kalimat.
 *
 * Kode galat memuat titik di dalam namanya — "data.kosong", "matriks.kosong" —
 * jadi ia TIDAK boleh dilewatkan ke t(), yang memperlakukan titik sebagai
 * pemisah jalur. Pencariannya dilakukan langsung ke dalam tabel galat.
 */
export function pesanGalat(kodeGalat: string, kode: KodeBahasa = sekarang): string {
  const tabel = kamus[kode].galat as Record<string, string | undefined>;
  return tabel[kodeGalat] ?? kamus[kode].galat.takDikenal;
}

/** Terjemahkan kode kategori mesin menjadi kalimat. */
export function namaKategori(kodeKategori: string | null, kode: KodeBahasa = sekarang): string {
  if (kodeKategori === null) return '—';
  const tabel = kamus[kode].kategori as Record<string, string | undefined>;
  return tabel[kodeKategori] ?? kodeKategori;
}

/**
 * Format angka menurut kaidah bahasa aktif.
 *
 * Bahasa Indonesia memakai koma desimal, Inggris memakai titik. Melewatkan
 * pemformatan ini berarti angka di versi Indonesia terbaca seperti angka
 * Inggris — bentuk kebocoran bahasa yang paling gampang lolos dari perhatian.
 */
export function angka(nilai: number | null, desimal = 3, kode: KodeBahasa = sekarang): string {
  if (nilai === null || !Number.isFinite(nilai)) return '—';
  return nilai.toLocaleString(kode === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  });
}

/** Format bilangan bulat menurut kaidah bahasa aktif. */
export function bulat(nilai: number | null, kode: KodeBahasa = sekarang): string {
  if (nilai === null || !Number.isFinite(nilai)) return '—';
  return nilai.toLocaleString(kode === 'id' ? 'id-ID' : 'en-US', {
    maximumFractionDigits: 0,
  });
}

export type { KodeBahasa };
export { kamus };
