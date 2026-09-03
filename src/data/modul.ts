/**
 * Peta empat belas sesi PSI307 — bagian yang tidak berbahasa.
 *
 * Judul dan ringkasan tiap sesi ada di src/i18n/modul-kamus.ts, bukan di sini,
 * supaya seluruh kalimat yang bisa muncul di layar terkumpul di satu tempat
 * yang bisa ditelusuri uji kebocoran bahasa. Yang tinggal di berkas ini hanya
 * hal yang sama di bahasa mana pun: nomor sesi, rumusnya, dan alat hitung mana
 * yang menjawabnya.
 *
 * Rumus ditulis apa adanya. Rumus matematika bukan objek hak ciptanya
 * penyusun modul, dan justru rumusnyalah yang harus bisa dicocokkan pembaca
 * dengan bahan kuliahnya sendiri.
 */

export interface Sesi {
  readonly nomor: number;
  /** Kunci ke dalam kamus: `sesi.s1.judul` dan `sesi.s1.ringkas`. */
  readonly kunci: string;
  /** Kunci ke dalam kamus, mis. `rumus.s5a`. Bukan teksnya. */
  readonly rumus?: readonly string[];
  /** Rute alat hitung yang menjawab sesi ini. */
  readonly rute?: string;
}

export const SESI: readonly Sesi[] = [
  { nomor: 1, kunci: 's1' },
  { nomor: 2, kunci: 's2' },
  { nomor: 3, kunci: 's3' },
  { nomor: 4, kunci: 's4', rute: '#/aitem' },
  {
    nomor: 5,
    kunci: 's5',
    rumus: [
      's5a',
      's5b',
    ],
    rute: '#/validitas',
  },
  {
    nomor: 6,
    kunci: 's6',
    rumus: [
      's6a',
      's6b',
      's6c',
    ],
    rute: '#/reliabilitas',
  },
  {
    nomor: 7,
    kunci: 's7',
    rumus: ['s7a', 's7b', 's7c', 's7d'],
    rute: '#/skor',
  },
  { nomor: 8, kunci: 's8' },
  {
    nomor: 9,
    kunci: 's9',
    rumus: ['s9a', 's9b'],
    rute: '#/thurstone',
  },
  { nomor: 10, kunci: 's10', rute: '#/thurstone' },
  {
    nomor: 11,
    kunci: 's11',
    rumus: [
      's11a',
      's11b',
      's11c',
    ],
    rute: '#/guttman',
  },
  { nomor: 12, kunci: 's12', rute: '#/guttman' },
  {
    nomor: 13,
    kunci: 's13',
    rumus: [
      's13a',
      's13b',
    ],
    rute: '#/likert',
  },
  { nomor: 14, kunci: 's14', rute: '#/tabel-r' },
];
