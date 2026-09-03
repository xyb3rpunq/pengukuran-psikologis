/**
 * Halaman peta modul.
 *
 * Empat belas sesi, masing-masing dengan satu gambar. Halaman ini sengaja
 * tidak menyentuh mesin R sama sekali: seluruh gambarnya dirakit dari angka
 * yang sudah ditetapkan di berkas, sehingga halaman terbuka seketika bahkan
 * sebelum runtime R selesai diunduh di latar belakang.
 *
 * Setiap kalimat di sini datang dari kamus lewat t(). Tidak ada satu pun
 * string berbahasa manusia yang ditulis langsung di berkas ini.
 */
import { el } from '../dom';
import { t } from '../../i18n';
import { SESI, type Sesi } from '../../data/modul';
import { NAMA_BUTIR_LIKERT, SKALA_LIKERT } from '../../data/contoh';
import {
  alurLangkah,
  batangKoefisien,
  batangLikert,
  duaKolom,
  kontinumThurstone,
  kurvaNormal,
  pencar,
  petaSkalogram,
  tanggaSkala,
} from '../visual';

/** Scalogram teladan: pola tangga yang sempurna, tanpa satu pun error. */
const SKALOGRAM_RAPI: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0],
  [1, 1, 1, 0, 0],
  [1, 1, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];

/** Scalogram yang sama, tapi tiga responden menyimpang dari polanya. */
const SKALOGRAM_MENYIMPANG: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1],
  [1, 1, 1, 0, 1],
  [1, 1, 1, 0, 0],
  [0, 1, 0, 1, 0],
  [1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];

const BUTIR_LIMA = ['G1', 'G2', 'G3', 'G4', 'G5'];
const RESPONDEN_ENAM = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'];

/** Butir Thurstone teladan: lokasi menyebar, sebagian sepakat sebagian tidak. */
const BUTIR_THURSTONE_TELADAN = [
  { nama: 'T1', s: 1.6, k25: 1.0, k75: 2.2, terpilih: true },
  { nama: 'T2', s: 3.2, k25: 2.6, k75: 3.9, terpilih: true },
  { nama: 'T3', s: 5.0, k25: 4.4, k75: 5.7, terpilih: true },
  { nama: 'T4', s: 6.4, k25: 3.1, k75: 9.6, terpilih: false },
  { nama: 'T5', s: 7.8, k25: 7.1, k75: 8.4, terpilih: true },
  { nama: 'T6', s: 9.5, k25: 8.9, k75: 10.2, terpilih: true },
  { nama: 'T7', s: 9.7, k25: 5.2, k75: 11.0, terpilih: false },
];

/** Skor belahan ganjil dan genap dari satu tes teladan, untuk sesi 5. */
const BELAH_GANJIL = [5, 4, 5, 4, 3, 4, 3, 3, 2, 3, 2, 2, 1, 2, 1, 1];
const BELAH_GENAP = [5, 5, 4, 3, 4, 3, 2, 3, 3, 2, 1, 2, 2, 1, 1, 0];

/** Koefisien teladan sesi 6 — dua pembelahan yang sengaja berbeda hasilnya. */
const KOEFISIEN_TELADAN = [0.82, 0.74, 0.79, 0.79];

function gambarSesi(nomor: number): SVGElement | null {
  switch (nomor) {
    case 1:
      return duaKolom(
        t('modul.judulBanding'),
        {
          judul: t('diagram.s1.kiriJudul'),
          butir: [
            t('diagram.s1.kiri1'),
            t('diagram.s1.kiri2'),
            t('diagram.s1.kiri3'),
            t('diagram.s1.kiri4'),
          ],
        },
        {
          judul: t('diagram.s1.kananJudul'),
          butir: [
            t('diagram.s1.kanan1'),
            t('diagram.s1.kanan2'),
            t('diagram.s1.kanan3'),
            t('diagram.s1.kanan4'),
          ],
        },
      );
    case 2:
      return alurLangkah(t('modul.judulAlur'), [
        t('diagram.s2.l1'),
        t('diagram.s2.l2'),
        t('diagram.s2.l3'),
        t('diagram.s2.l4'),
        t('diagram.s2.l5'),
        t('diagram.s2.l6'),
        t('diagram.s2.l7'),
        t('diagram.s2.l8'),
      ]);
    case 3:
      return alurLangkah(t('modul.judulAlur'), [
        t('diagram.s3.l1'),
        t('diagram.s3.l2'),
        t('diagram.s3.l3'),
        t('diagram.s3.l4'),
      ]);
    case 4:
      return alurLangkah(t('modul.judulAlur'), [
        t('diagram.s4.l1'),
        t('diagram.s4.l2'),
        t('diagram.s4.l3'),
        t('diagram.s4.l4'),
        t('diagram.s4.l5'),
      ]);
    case 5:
      return pencar(
        t('modul.judulPencar'),
        BELAH_GANJIL,
        BELAH_GENAP,
        t('diagram.s5.sumbuX'),
        t('diagram.s5.sumbuY'),
      );
    case 6:
      return batangKoefisien(t('reliabilitas.judulPerbandingan'), [
        { label: t('diagram.s6.b1'), nilai: KOEFISIEN_TELADAN[0] as number, ambang: 0.7 },
        { label: t('diagram.s6.b2'), nilai: KOEFISIEN_TELADAN[1] as number, ambang: 0.7 },
        { label: t('diagram.s6.b3'), nilai: KOEFISIEN_TELADAN[2] as number, ambang: 0.7 },
        { label: t('diagram.s6.b4'), nilai: KOEFISIEN_TELADAN[3] as number, ambang: 0.7 },
      ]);
    case 7:
      return kurvaNormal(
        {
          judul: t('skor.judulKurva'),
          stanine: t('skor.barisStanine'),
          persentil: t('skor.barisPersentil'),
        },
        [
          { z: -1.5, label: 'T 35' },
          { z: 0, label: 'T 50' },
          { z: 1.5, label: 'T 65' },
        ],
      );
    case 8:
      return duaKolom(
        t('modul.judulBanding'),
        {
          judul: t('diagram.s8.kiriJudul'),
          butir: [
            t('diagram.s8.kiri1'),
            t('diagram.s8.kiri2'),
            t('diagram.s8.kiri3'),
            t('diagram.s8.kiri4'),
          ],
        },
        {
          judul: t('diagram.s8.kananJudul'),
          butir: [
            t('diagram.s8.kanan1'),
            t('diagram.s8.kanan2'),
            t('diagram.s8.kanan3'),
            t('diagram.s8.kanan4'),
          ],
        },
      );
    case 9:
    case 10:
      return kontinumThurstone(
        { judul: t('thurstone.judulKontinum'), sumbu: t('thurstone.sumbuS') },
        BUTIR_THURSTONE_TELADAN,
      );
    case 11:
      return petaSkalogram(
        t('guttman.judulSkalogram'),
        SKALOGRAM_RAPI,
        BUTIR_LIMA,
        RESPONDEN_ENAM,
      );
    case 12:
      return petaSkalogram(
        t('guttman.judulSkalogram'),
        SKALOGRAM_MENYIMPANG,
        BUTIR_LIMA,
        RESPONDEN_ENAM,
      );
    case 13:
      // Sebaran jawaban contoh, dihitung langsung di JavaScript tanpa mesin R.
      return batangLikert(t('likert.judulSebaran'), SKALA_LIKERT, NAMA_BUTIR_LIKERT, 5);
    case 14:
      return tanggaSkala(t('modul.judulTangga'), [
        { nama: t('diagram.s14.n1'), sifat: t('diagram.s14.d1') },
        { nama: t('diagram.s14.n2'), sifat: t('diagram.s14.d2') },
        { nama: t('diagram.s14.n3'), sifat: t('diagram.s14.d3') },
        { nama: t('diagram.s14.n4'), sifat: t('diagram.s14.d4') },
      ]);
    default:
      return null;
  }
}

function kartuSesi(sesi: Sesi): HTMLElement {
  const isi = el(
    'article',
    { kelas: 'kartu-sesi' },
    el(
      'header',
      { kelas: 'kepala-sesi' },
      el('span', { kelas: 'nomor-sesi' }, String(sesi.nomor)),
      el(
        'div',
        {},
        el('h2', {}, t(`sesi.${sesi.kunci}.judul`)),
        el('p', { kelas: 'ringkas' }, t(`sesi.${sesi.kunci}.ringkas`)),
      ),
    ),
  );

  const gambar = gambarSesi(sesi.nomor);
  if (gambar !== null) {
    isi.appendChild(el('div', { kelas: 'bingkai-visual' }, gambar));
  }

  if (sesi.rumus !== undefined) {
    isi.appendChild(
      el(
        'div',
        { kelas: 'blok-rumus' },
        el('span', { kelas: 'label-kecil' }, t('umum.rumus')),
        ...sesi.rumus.map((kunci) => el('code', { kelas: 'rumus' }, t(`rumus.${kunci}`))),
      ),
    );
  }

  if (sesi.rute !== undefined) {
    isi.appendChild(
      el('a', { kelas: 'tautan-alat', href: sesi.rute }, `${t('modul.alatTerkait')} →`),
    );
  } else {
    isi.appendChild(el('p', { kelas: 'catatan' }, t('modul.tidakAdaAlat')));
  }

  return isi;
}

export function halamanModul(): HTMLElement {
  return el(
    'div',
    { kelas: 'halaman' },
    el(
      'header',
      { kelas: 'kepala-halaman' },
      el('h1', {}, t('modul.judul')),
      el('p', { kelas: 'penjelasan' }, t('modul.penjelasan')),
    ),
    el('div', { kelas: 'daftar-sesi' }, ...SESI.map(kartuSesi)),
  );
}
