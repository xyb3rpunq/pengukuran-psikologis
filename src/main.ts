/**
 * Cangkang aplikasi: navigasi, tema, bahasa, dan penyalaan mesin R.
 *
 * Satu keputusan menentukan bagaimana situs ini terasa. Runtime R berukuran
 * puluhan megabyte, dan menunggunya sebelum menggambar apa pun akan membuat
 * halaman pertama kosong selama beberapa detik. Karena itu mesin TIDAK
 * disentuh saat situs dibuka: beranda, peta modul, dan halaman metode dirakit
 * dari data yang sudah ada di berkas dan tampil seketika.
 *
 * Mesin baru dinyalakan pada dua keadaan: saat peramban menganggur, atau saat
 * halaman kalkulator dibuka — mana pun yang lebih dulu. Pada pemakaian biasa
 * yang menang adalah yang pertama, jadi ketika pengguna sampai ke kalkulator
 * mesinnya sudah siap dan hasilnya muncul tanpa jeda.
 */
import './style.css';
import { el, ganti } from './ui/dom';
import {
  bahasa,
  bahasaAwal,
  pasangBahasa,
  pesanGalat,
  saatBahasaBerubah,
  t,
  type KodeBahasa,
} from './i18n';
import { Mesin } from './mesin/mesin';
import type { KonteksKalkulator } from './ui/kerangka';
import { halamanBeranda, halamanMetode } from './ui/halaman/statis';
import { halamanModul } from './ui/halaman/modul';
import {
  halamanAitem,
  halamanGuttman,
  halamanLikert,
  halamanReliabilitas,
  halamanSkor,
  halamanTabelR,
  halamanThurstone,
  halamanValiditas,
} from './ui/halaman/kalkulator';
import { halamanFaktor, halamanSus } from './ui/halaman/lanjutan';
import { halamanDistraktor, halamanSeleksi } from './ui/halaman/prosedur';

const KUNCI_TEMA = 'tera.tema';
const BASE_URL_WEBR = `${import.meta.env.BASE_URL}webr/`;

// --- Mesin ------------------------------------------------------------------

let janjiMesin: Promise<Mesin> | undefined;

function ambilMesin(): Promise<Mesin> {
  janjiMesin ??= Mesin.mulai({ baseUrl: BASE_URL_WEBR, saluran: 'postMessage' });
  return janjiMesin;
}

/**
 * Panaskan mesin saat peramban menganggur.
 *
 * requestIdleCallback menjadwalkannya setelah cat pertama dan setelah semua
 * kerja yang mendesak selesai, jadi unduhan runtime R tidak pernah bersaing
 * dengan penggambaran halaman pertama. Peramban yang belum mendukungnya cukup
 * memakai timer panjang — hasilnya sama, hanya kurang cermat.
 */
function panaskanMesin(): void {
  const jalankan = (): void => {
    void ambilMesin().then(
      () => tandaiMesin('siap'),
      () => tandaiMesin('gagal'),
    );
  };
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  if (typeof idle === 'function') idle(jalankan);
  else window.setTimeout(jalankan, 1200);
}

type StatusMesin = 'diam' | 'memuat' | 'siap' | 'gagal';
let statusMesin: StatusMesin = 'diam';
const penandaMesin = el('span', { kelas: 'status-mesin', aria: { live: 'polite' } });

function tandaiMesin(status: StatusMesin): void {
  statusMesin = status;
  gambarStatusMesin();
}

function gambarStatusMesin(): void {
  penandaMesin.className = `status-mesin ${statusMesin}`;
  penandaMesin.textContent =
    statusMesin === 'memuat'
      ? t('umum.memuatMesin')
      : statusMesin === 'siap'
        ? t('umum.mesinSiap')
        : statusMesin === 'gagal'
          ? pesanGalat('mesin.gagalMuat')
          : '';
}

const konteks: KonteksKalkulator = {
  ambilMesin: () => {
    if (statusMesin !== 'siap') tandaiMesin('memuat');
    return ambilMesin().then(
      (mesin) => {
        tandaiMesin('siap');
        return mesin;
      },
      (galat: unknown) => {
        tandaiMesin('gagal');
        throw galat;
      },
    );
  },
  saatMemuat: (sedang) => {
    if (sedang && statusMesin !== 'siap') tandaiMesin('memuat');
  },
};

// --- Rute -------------------------------------------------------------------

interface Rute {
  readonly jalur: string;
  readonly nav: string;
  readonly bangun: () => HTMLElement;
}

const RUTE: readonly Rute[] = [
  { jalur: '#/', nav: 'nav.beranda', bangun: halamanBeranda },
  { jalur: '#/aitem', nav: 'nav.aitem', bangun: () => halamanAitem(konteks) },
  { jalur: '#/validitas', nav: 'nav.validitas', bangun: () => halamanValiditas(konteks) },
  { jalur: '#/reliabilitas', nav: 'nav.reliabilitas', bangun: () => halamanReliabilitas(konteks) },
  { jalur: '#/skor', nav: 'nav.skor', bangun: () => halamanSkor(konteks) },
  { jalur: '#/thurstone', nav: 'nav.thurstone', bangun: () => halamanThurstone(konteks) },
  { jalur: '#/guttman', nav: 'nav.guttman', bangun: () => halamanGuttman(konteks) },
  { jalur: '#/likert', nav: 'nav.likert', bangun: () => halamanLikert(konteks) },
  { jalur: '#/distraktor', nav: 'nav.distraktor', bangun: () => halamanDistraktor(konteks) },
  { jalur: '#/seleksi', nav: 'nav.seleksi', bangun: () => halamanSeleksi(konteks) },
  { jalur: '#/faktor', nav: 'nav.faktor', bangun: () => halamanFaktor(konteks) },
  { jalur: '#/sus', nav: 'nav.sus', bangun: () => halamanSus(konteks) },
  { jalur: '#/tabel-r', nav: 'nav.tabelR', bangun: () => halamanTabelR(konteks) },
  { jalur: '#/modul', nav: 'nav.modul', bangun: halamanModul },
  { jalur: '#/metode', nav: 'nav.metode', bangun: halamanMetode },
];

function ruteSekarang(): Rute {
  const jalur = window.location.hash === '' ? '#/' : window.location.hash;
  return RUTE.find((rute) => rute.jalur === jalur) ?? (RUTE[0] as Rute);
}

// --- Tema -------------------------------------------------------------------

function temaAwal(): 'terang' | 'gelap' {
  try {
    const tersimpan = localStorage.getItem(KUNCI_TEMA);
    if (tersimpan === 'terang' || tersimpan === 'gelap') return tersimpan;
  } catch {
    // Peramban yang memblokir penyimpanan tetap harus bisa memakai situs ini.
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'terang' : 'gelap';
}

let tema = temaAwal();

function pasangTema(baru: 'terang' | 'gelap'): void {
  tema = baru;
  document.documentElement.dataset['tema'] = baru;
  try {
    localStorage.setItem(KUNCI_TEMA, baru);
  } catch {
    // Diabaikan dengan sengaja; pilihan tema hanya jadi tidak bertahan.
  }
}

// --- Rangka -----------------------------------------------------------------

const wadahIsi = el('main', { id: 'isi' });
const daftarNav = el('nav', { kelas: 'nav', aria: { label: 'utama' } });

function gambarNav(): void {
  const aktif = ruteSekarang().jalur;
  ganti(
    daftarNav,
    ...RUTE.map((rute) =>
      el(
        'a',
        {
          href: rute.jalur,
          kelas: rute.jalur === aktif ? 'tautan-nav aktif' : 'tautan-nav',
          aria: rute.jalur === aktif ? { current: 'page' } : {},
        },
        t(rute.nav),
      ),
    ),
  );
}

function gambarHalaman(): void {
  const rute = ruteSekarang();
  ganti(wadahIsi, rute.bangun());
  gambarNav();
  document.title = `${t(rute.nav)} · ${t('situs.nama')}`;
  wadahIsi.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

const tombolBahasa = el('button', {
  tipe: 'button',
  kelas: 'tombol kecil',
  saat: {
    click: () => {
      pasangBahasa(bahasa() === 'id' ? 'en' : 'id');
    },
  },
});

const tombolTema = el('button', {
  tipe: 'button',
  kelas: 'tombol kecil',
  saat: {
    click: () => {
      pasangTema(tema === 'gelap' ? 'terang' : 'gelap');
      gambarKendali();
    },
  },
});

function gambarKendali(): void {
  tombolBahasa.textContent = t('umum.bahasa');
  tombolBahasa.title = t('umum.bahasa');
  tombolTema.textContent = tema === 'gelap' ? '☀' : '☾';
  tombolTema.title = tema === 'gelap' ? t('umum.temaTerang') : t('umum.temaGelap');
  gambarStatusMesin();
}

function bangunRangka(): void {
  const kepala = el(
    'header',
    { kelas: 'kepala' },
    el(
      'a',
      { kelas: 'merek', href: '#/' },
      el('span', { kelas: 'merek-nama' }, t('situs.nama')),
      el('span', { kelas: 'merek-tagline' }, t('situs.tagline')),
    ),
    daftarNav,
    el('div', { kelas: 'kendali' }, penandaMesin, tombolBahasa, tombolTema),
  );

  const kaki = el(
    'footer',
    { kelas: 'kaki' },
    el('span', {}, t('situs.penulis')),
    el(
      'a',
      { href: 'https://github.com/xyb3rpunq/pengukuran-psikologis' },
      'github.com/xyb3rpunq/pengukuran-psikologis',
    ),
  );

  wadahIsi.setAttribute('tabindex', '-1');
  ganti(document.body, kepala, wadahIsi, kaki);
}

function gambarSemua(): void {
  bangunRangka();
  gambarKendali();
  gambarHalaman();
}

// --- Nyalakan ---------------------------------------------------------------

pasangBahasa(bahasaAwal());
pasangTema(tema);
gambarSemua();

window.addEventListener('hashchange', () => {
  gambarHalaman();
});

// Mengganti bahasa berarti menggambar ulang seluruh halaman. Pada situs sebesar
// ini itu lebih murah daripada memelihara ikatan dua arah untuk setiap teks —
// dan yang lebih penting, tidak ada satu pun teks yang bisa tertinggal di
// bahasa lama, yang justru bentuk kebocoran paling sering lolos dari perhatian.
saatBahasaBerubah(() => {
  gambarSemua();
});

panaskanMesin();

export type { KodeBahasa };
