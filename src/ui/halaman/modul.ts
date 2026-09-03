/**
 * Halaman peta modul.
 *
 * Empat belas sesi, masing-masing dengan satu gambar. Halaman ini sengaja
 * tidak menyentuh mesin R sama sekali: seluruh gambarnya dirakit dari angka
 * yang sudah ditetapkan di sini, sehingga halaman terbuka seketika bahkan
 * sebelum runtime R selesai diunduh di latar belakang.
 */
import { el } from '../dom';
import { bahasa, t } from '../../i18n';
import { SESI, type Sesi } from '../../data/modul';
import { SKALA_LIKERT, NAMA_BUTIR_LIKERT } from '../../data/contoh';
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

/** Scalogram yang sama, tapi dua responden menyimpang dari polanya. */
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

/** Skor belahan ganjil dan genap dari satu tes teladan, untuk sesi 6. */
const BELAH_GANJIL = [5, 4, 5, 4, 3, 4, 3, 3, 2, 3, 2, 2, 1, 2, 1, 1];
const BELAH_GENAP = [5, 5, 4, 3, 4, 3, 2, 3, 3, 2, 1, 2, 2, 1, 1, 0];

function gambarSesi(nomor: number): SVGElement | null {
  const id = bahasa() === 'id';
  switch (nomor) {
    case 1:
      return duaKolom(
        { judul: id ? 'Tes' : 'Test', butir: id
          ? ['Mengungkap atribut psikologis', 'Tidak ada nilai lulus', 'Ditafsirkan lewat norma', 'Dibakukan prosedurnya']
          : ['Reveals a psychological attribute', 'No pass mark', 'Interpreted against norms', 'Standardised procedure'] },
        { judul: id ? 'Ujian' : 'Examination', butir: id
          ? ['Mengukur penguasaan materi', 'Ada nilai lulus', 'Ditafsirkan lewat patokan', 'Prosedurnya bisa berubah']
          : ['Measures mastery of material', 'Has a pass mark', 'Interpreted against a criterion', 'Procedure may vary'] },
      );
    case 2:
      return alurLangkah(
        id
          ? [
              'Rumuskan konstruk dari kajian teori',
              'Turunkan dimensi dan indikator perilaku',
              'Susun kisi-kisi alat ukur',
              'Tulis butir favorable dan unfavorable',
              'Uji coba pada sampel awal',
              'Analisis butir, validitas, reliabilitas',
              'Revisi dan uji coba final',
              'Susun manual dan norma',
            ]
          : [
              'Define the construct from theory',
              'Derive dimensions and behavioural indicators',
              'Build the instrument blueprint',
              'Write favorable and unfavorable items',
              'Pilot on an initial sample',
              'Analyse items, validity, reliability',
              'Revise and run a final pilot',
              'Write the manual and norms',
            ],
      );
    case 3:
      return alurLangkah(
        id
          ? [
              'Kognitif — pengetahuan dan penalaran',
              'Afektif — sikap, minat, nilai',
              'Psikomotor — keterampilan bertindak',
              'Tes prestasi mengacu pada tujuan instruksional',
            ]
          : [
              'Cognitive — knowledge and reasoning',
              'Affective — attitude, interest, values',
              'Psychomotor — skill in action',
              'Achievement tests refer back to instructional goals',
            ],
      );
    case 4:
      return alurLangkah(
        id
          ? [
              'Tegaskan tujuan dan kawasan ukur',
              'Uraikan komponen isi materi',
              'Tetapkan taraf kesukaran yang dituju',
              'Tulis butir, telaah kualitatif oleh ahli',
              'Rakit untuk uji coba',
            ]
          : [
              'Fix the purpose and measurement domain',
              'Lay out the content components',
              'Set the difficulty level aimed at',
              'Write items, expert qualitative review',
              'Assemble for piloting',
            ],
      );
    case 5:
      return pencar(
        BELAH_GANJIL,
        BELAH_GENAP,
        id ? 'skor butir' : 'item score',
        id ? 'skor total' : 'total score',
      );
    case 6:
      return batangKoefisien([
        { label: id ? 'Belah ganjil-genap' : 'Odd-even split', nilai: 0.82, ambang: 0.7 },
        { label: id ? 'Belah awal-akhir' : 'First-second split', nilai: 0.74, ambang: 0.7 },
        { label: 'KR-20', nilai: 0.79, ambang: 0.7 },
        { label: id ? 'Alpha Cronbach' : 'Cronbach alpha', nilai: 0.79, ambang: 0.7 },
      ]);
    case 7:
      return kurvaNormal([
        { z: -1.5, label: 'T 35' },
        { z: 0, label: 'T 50' },
        { z: 1.5, label: 'T 65' },
      ]);
    case 8:
      return duaKolom(
        { judul: id ? 'Tes kognitif' : 'Cognitive test', butir: id
          ? ['Performansi maksimal', 'Ada jawaban benar', 'Diberi batas waktu', 'Contoh: inteligensi, prestasi']
          : ['Maximum performance', 'There is a right answer', 'Time limited', 'Example: intelligence, achievement'] },
        { judul: id ? 'Tes non-kognitif' : 'Non-cognitive test', butir: id
          ? ['Performansi tipikal', 'Tidak ada jawaban benar', 'Umumnya tanpa batas waktu', 'Contoh: sikap, kepribadian']
          : ['Typical performance', 'No right answer', 'Usually untimed', 'Example: attitude, personality'] },
      );
    case 9:
    case 10:
      return kontinumThurstone(BUTIR_THURSTONE_TELADAN);
    case 11:
      return petaSkalogram(SKALOGRAM_RAPI, BUTIR_LIMA, RESPONDEN_ENAM);
    case 12:
      return petaSkalogram(SKALOGRAM_MENYIMPANG, BUTIR_LIMA, RESPONDEN_ENAM);
    case 13:
      return null;
    case 14:
      return tanggaSkala(
        id
          ? [
              { nama: 'Rasio', sifat: 'Punya nol mutlak — semua operasi hitung sah' },
              { nama: 'Interval', sifat: 'Jarak antar nilai sama, nolnya sembarang' },
              { nama: 'Ordinal', sifat: 'Ada urutan, jaraknya tidak diketahui' },
              { nama: 'Nominal', sifat: 'Sekadar nama atau label, tanpa urutan' },
            ]
          : [
              { nama: 'Ratio', sifat: 'Has an absolute zero — all arithmetic is valid' },
              { nama: 'Interval', sifat: 'Equal spacing, but an arbitrary zero' },
              { nama: 'Ordinal', sifat: 'Ordered, but the gaps are unknown' },
              { nama: 'Nominal', sifat: 'Just a name or label, with no order' },
            ],
      );
    default:
      return null;
  }
}

function kartuSesi(sesi: Sesi): HTMLElement {
  const id = bahasa() === 'id';
  const gambar = sesi.nomor === 13 ? null : gambarSesi(sesi.nomor);

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
        el('h2', {}, id ? sesi.judulId : sesi.judulEn),
        el('p', { kelas: 'ringkas' }, id ? sesi.ringkasId : sesi.ringkasEn),
      ),
    ),
  );

  if (sesi.nomor === 13) {
    // Sebaran jawaban contoh, dihitung langsung di JavaScript tanpa mesin R.
    isi.appendChild(
      el(
        'div',
        { kelas: 'bingkai-visual' },
        batangLikert(SKALA_LIKERT, NAMA_BUTIR_LIKERT, 5),
      ),
    );
  } else if (gambar !== null) {
    isi.appendChild(el('div', { kelas: 'bingkai-visual' }, gambar));
  }

  if (sesi.rumus !== undefined) {
    isi.appendChild(
      el(
        'div',
        { kelas: 'blok-rumus' },
        el('span', { kelas: 'label-kecil' }, t('umum.rumus')),
        ...sesi.rumus.map((baris) => el('code', { kelas: 'rumus' }, baris)),
      ),
    );
  }

  if (sesi.rute !== undefined) {
    isi.appendChild(
      el(
        'a',
        { kelas: 'tautan-alat', href: sesi.rute },
        `${t('modul.alatTerkait')} →`,
      ),
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
