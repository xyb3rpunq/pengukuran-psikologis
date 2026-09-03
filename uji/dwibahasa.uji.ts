/**
 * Uji kebocoran bahasa.
 *
 * Cara paling umum menguji dwibahasa adalah memeriksa kelengkapan kamus: kalau
 * setiap kunci ada di kedua bahasa, dianggap beres. Pemeriksaan itu tidak
 * pernah menemukan apa pun. Yang bocor bukan kunci yang hilang, melainkan
 * kalimat yang tidak pernah masuk kamus sejak awal — ditulis langsung di
 * komponen dan karenanya sama di bahasa mana pun.
 *
 * Cara kedua yang juga sering dipakai adalah mencari kata fungsi Indonesia
 * ("yang", "dan", "dari") di dalam render bahasa Inggris. Itu pun tumpul:
 * "Min-Maks" dan "Penilai" tidak memuat satu pun kata fungsi, dan keduanya
 * memang lolos dari pemeriksaan semacam itu di proyek ini sebelum uji berikut
 * ditulis.
 *
 * Berkas ini memakai cara ketiga: setiap halaman dirender sungguhan di DOM
 * dalam kedua bahasa, seluruh teks yang muncul dikumpulkan, lalu SETIAP frasa
 * yang ada di kamus dikurangkan dari teks itu. Apa pun yang tersisa — di luar
 * angka, lambang matematika, dan kode butir — adalah kalimat yang ditulis di
 * tempat yang salah. Metode ini tidak bergantung pada perbendaharaan kata
 * bahasa mana pun, jadi ia menangkap kata benda sama baiknya dengan kata kerja.
 */
import { JSDOM } from 'jsdom';
import { beforeAll, describe, expect, it } from 'vitest';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'https://uji.local/',
});

// Global DOM dipasang sebelum modul UI diimpor: berkas-berkas itu memanggil
// document dan localStorage saat dimuat, bukan hanya saat dipakai.
// Node 24 memasang `navigator` sebagai getter tanpa setter, jadi penugasan
// biasa gagal. defineProperty dipakai untuk seluruhnya agar seragam.
function pasangGlobal(nama: string, nilai: unknown): void {
  Object.defineProperty(globalThis, nama, {
    value: nilai,
    writable: true,
    configurable: true,
  });
}

pasangGlobal('window', dom.window);
pasangGlobal('document', dom.window.document);
pasangGlobal('navigator', dom.window.navigator);
pasangGlobal('localStorage', dom.window.localStorage);
pasangGlobal('SVGElement', dom.window.SVGElement);
pasangGlobal('Node', dom.window.Node);
// Perhitungan otomatis dijadwalkan lewat requestAnimationFrame. Di sini ia
// sengaja tidak pernah memanggil balik: yang diuji tampilannya, bukan mesinnya.
pasangGlobal('requestAnimationFrame', (): number => 0);

type Kamus = typeof import('../src/i18n/kamus').kamus;
type KodeBahasa = 'id' | 'en';

let kamus: Kamus;
let pasangBahasa: (kode: KodeBahasa) => void;
let halaman: {
  nama: string;
  bangun: () => HTMLElement;
}[];

beforeAll(async () => {
  const i18n = await import('../src/i18n');
  const kamusModul = await import('../src/i18n/kamus');
  const statis = await import('../src/ui/halaman/statis');
  const modul = await import('../src/ui/halaman/modul');
  const kalkulator = await import('../src/ui/halaman/kalkulator');

  kamus = kamusModul.kamus;
  pasangBahasa = i18n.pasangBahasa;

  // Mesin tidak pernah dinyalakan: janji yang tidak pernah selesai membuat
  // halaman berhenti di keadaan "sedang menghitung", dan keadaan itu justru
  // yang perlu ikut diperiksa terjemahannya.
  const konteks = {
    ambilMesin: () => new Promise<never>(() => {}),
    saatMemuat: () => {},
  } as unknown as Parameters<typeof kalkulator.halamanAitem>[0];

  halaman = [
    { nama: 'beranda', bangun: statis.halamanBeranda },
    { nama: 'metode', bangun: statis.halamanMetode },
    { nama: 'modul', bangun: modul.halamanModul },
    { nama: 'aitem', bangun: () => kalkulator.halamanAitem(konteks) },
    { nama: 'validitas', bangun: () => kalkulator.halamanValiditas(konteks) },
    { nama: 'reliabilitas', bangun: () => kalkulator.halamanReliabilitas(konteks) },
    { nama: 'skor', bangun: () => kalkulator.halamanSkor(konteks) },
    { nama: 'thurstone', bangun: () => kalkulator.halamanThurstone(konteks) },
    { nama: 'guttman', bangun: () => kalkulator.halamanGuttman(konteks) },
    { nama: 'likert', bangun: () => kalkulator.halamanLikert(konteks) },
    { nama: 'tabelR', bangun: () => kalkulator.halamanTabelR(konteks) },
  ];
});

/** Kumpulkan seluruh string daun dari kamus satu bahasa. */
function frasaKamus(kode: KodeBahasa, panjangMinimum = 3): string[] {
  const keluar: string[] = [];
  const telusuri = (simpul: unknown): void => {
    if (typeof simpul === 'string') {
      keluar.push(simpul);
      return;
    }
    if (typeof simpul === 'object' && simpul !== null) {
      for (const isi of Object.values(simpul)) telusuri(isi);
    }
  };
  telusuri(kamus[kode]);
  return (
    keluar
      // Frasa satu-dua huruf tidak dikurangkan: mengurangkan "P" akan
      // memotong "Perbandingan" menjadi "erbandingan" dan melaporkannya
      // sebagai kebocoran. Lambang sependek itu ditangani daftar DIIZINKAN.
      .filter((frasa) => frasa.trim().length >= panjangMinimum)
      // Frasa terpanjang lebih dulu, supaya frasa pendek yang kebetulan
      // menjadi bagian frasa panjang tidak memotongnya di tengah.
      .sort((a, b) => b.length - a.length)
  );
}

/** Kumpulkan seluruh teks yang benar-benar terlihat di sebuah pohon DOM. */
function teksTerlihat(akar: Element): string {
  const potongan: string[] = [];
  const jelajah = (simpul: Node): void => {
    if (simpul.nodeType === 3) {
      const isi = simpul.textContent ?? '';
      if (isi.trim().length > 0) potongan.push(isi);
      return;
    }
    if (simpul.nodeType !== 1) return;
    const elemen = simpul as Element;
    // Judul SVG dan label aksesibilitas juga dibaca orang — lewat pembaca
    // layar — jadi keduanya ikut diperiksa.
    const label = elemen.getAttribute('aria-label');
    if (label !== null) potongan.push(label);
    const judul = elemen.getAttribute('title');
    if (judul !== null) potongan.push(judul);
    for (const anak of Array.from(elemen.childNodes)) jelajah(anak);
  };
  jelajah(akar);
  return potongan.join('\n');
}

/**
 * Token yang boleh muncul tanpa ada di kamus.
 *
 * Isinya hanya tiga jenis: lambang matematika dan statistik yang sama di
 * bahasa mana pun, nama diri, dan kode data contoh. Daftar ini sengaja
 * pendek — setiap tambahan ke sini adalah pengakuan bahwa ada teks yang
 * lolos dari kamus, jadi menambahnya harus terasa berat.
 */
const DIIZINKAN = new Set([
  // Lambang statistik
  'N', 'M', 'Md', 'z', 'T', 'P', 'D', 'Q', 'S', 'r', 'k', 'e', 'n', 'x',
  'σ', 's', 'α', 'ρ', 'Kr', 'Ks', 'SEM', 'PR',
  'K25', 'K75', 'KR', 'KR-20', 'KR-21',
  // Nama diri dan istilah baku yang tidak diterjemahkan
  'TERA', 'Deckyx', 'PSI307', 'R', 'CSV', 'ID', 'EN', 'Excel', 'SPSS',
  'WebAssembly', 'Guilford', 'Cronbach', 'Spearman', 'Brown', 'Thurstone',
  'Guttman', 'Likert', 'Arikunto', 'Goodenough', 'numpy', 'scipy', 'Bloom',
  'Gable', 'Suryabrata', 'Djaali', 'github', 'com', 'xyb3rpunq',
  'pengukuran', 'psikologis', 'alpha', 'Alpha', 'Bb', 'Pkb', 'pm', 'df',
  'BA', 'JA', 'BB', 'JB', 'Js', 'XY', 'X', 'Y', 'U', 'V', 'K', 'i',
  'r∗', 'P·D', 'z·T', 'S·Q', 'Lb', 'Pcb',
]);

/** Kode butir dan responden pada data contoh: S1, B3, G2, T7, R14, P01, A5. */
const POLA_KODE = /^[A-Z][0-9]{1,3}$/;

/**
 * Sisakan hanya kata yang tidak dapat dijelaskan.
 *
 * Seluruh frasa kamus dikurangkan dari teks, lalu angka, tanda baca, dan
 * lambang matematika dibuang. Yang tersisa adalah kata yang ditulis langsung
 * di komponen.
 */
function sisaTakDikenal(
  teks: string,
  frasa: readonly string[],
  pendek: ReadonlySet<string>,
): string[] {
  let sisa = teks;
  for (const satu of frasa) {
    if (satu.length === 0) continue;
    sisa = sisa.split(satu).join(' ');
  }

  // Kode butir dibuang UTUH dan lebih dulu. Kalau angkanya dihapus duluan,
  // "G1" menyusut menjadi "G" dan lolos dari pengenalan kode — cacat yang
  // sempat membuat uji ini melaporkan huruf tunggal sebagai kebocoran.
  sisa = sisa.replace(/\b[A-Z][0-9]{1,3}\b/g, ' ');

  // Rumus matematika dibuang utuh: isinya lambang, bukan kalimat, dan sama
  // persis di kedua bahasa.
  sisa = sisa.replace(/[=+\-*/^()[\]{}<>|·×÷√≤≥≈∑Σαβρσ₀₁₂₃₄ᵢₜ½]/g, ' ');
  sisa = sisa.replace(/[0-9]+([.,][0-9]+)?%?/g, ' ');
  sisa = sisa.replace(/[.,;:!?"'`—–→←…]/g, ' ');

  return sisa
    .split(/\s+/)
    .map((kata) => kata.trim())
    .filter((kata) => kata.length > 0)
    .filter((kata) => !DIIZINKAN.has(kata))
    // Nilai kamus yang terlalu pendek untuk dikurangkan dengan aman tetap
    // nilai kamus. Ia diizinkan sebagai token, bukan diampuni diam-diam.
    .filter((kata) => !pendek.has(kata))
    .filter((kata) => !POLA_KODE.test(kata));
}

describe('kelengkapan kamus', () => {
  it('kamus Inggris punya persis kunci yang sama dengan kamus Indonesia', () => {
    const jalur = (simpul: unknown, awalan = ''): string[] => {
      if (typeof simpul !== 'object' || simpul === null) return [awalan];
      return Object.entries(simpul).flatMap(([kunci, isi]) =>
        jalur(isi, awalan === '' ? kunci : `${awalan}.${kunci}`),
      );
    };
    expect(jalur(kamus.en).sort()).toEqual(jalur(kamus.id).sort());
  });

  it('tidak ada nilai kamus yang kosong di bahasa mana pun', () => {
    for (const kode of ['id', 'en'] as const) {
      for (const frasa of frasaKamus(kode)) {
        expect(frasa.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('tidak ada terjemahan Inggris yang sekadar menyalin bahasa Indonesia', () => {
    // Nama diri dan singkatan memang sama di kedua bahasa; sisanya tidak boleh.
    const kembar = new Set([
      'TERA',
      'KR-20',
      'KR-21',
      'Thurstone',
      'Guttman',
      'Likert',
      'P',
      'D',
      'z',
      'T',
      'Data',
      'Stanine',
      'stanine',
      'Interval',
      'Ordinal',
      'Nominal',
      'Scalogram',
      'Favorable',
      'Unfavorable',
      'Total',
      'Runtime',
      'Valid',
      'K25',
      'K75',
      'N',
      'Q (spread)',
    ]);
    const kunciKembar: string[] = [];
    const bandingkan = (a: unknown, b: unknown, awalan: string): void => {
      // Rumus matematika dikecualikan seluruhnya. Sebagiannya memang tidak
      // memuat satu pun kata, jadi terjemahannya wajar identik — yang tidak
      // wajar adalah memaksanya berbeda.
      if (awalan.startsWith('rumus')) return;
      if (typeof a === 'string' && typeof b === 'string') {
        if (a === b && !kembar.has(a)) kunciKembar.push(`${awalan} = ${a}`);
        return;
      }
      if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return;
      for (const kunci of Object.keys(a)) {
        bandingkan(
          (a as Record<string, unknown>)[kunci],
          (b as Record<string, unknown>)[kunci],
          awalan === '' ? kunci : `${awalan}.${kunci}`,
        );
      }
    };
    bandingkan(kamus.id, kamus.en, '');
    expect(kunciKembar).toEqual([]);
  });
});

describe('render sungguhan dalam kedua bahasa', () => {
  for (const kode of ['id', 'en'] as const) {
    it(`tidak ada kalimat di luar kamus — bahasa ${kode}`, () => {
      pasangBahasa(kode);
      const frasa = frasaKamus(kode);
      const pendek = new Set(frasaKamus(kode, 0).filter((satu) => satu.trim().length < 3));
      const bocor: string[] = [];

      for (const satu of halaman) {
        const pohon = satu.bangun();
        const sisa = sisaTakDikenal(teksTerlihat(pohon), frasa, pendek);
        for (const kata of sisa) bocor.push(`${satu.nama}: ${kata}`);
      }

      expect([...new Set(bocor)]).toEqual([]);
    });
  }

  it('setiap halaman menghasilkan teks yang benar-benar berbeda antar bahasa', () => {
    // Pengaman terhadap kegagalan diam: kalau pengalih bahasa berhenti bekerja,
    // uji di atas tetap lulus karena teksnya tetap ada di salah satu kamus.
    for (const satu of halaman) {
      pasangBahasa('id');
      const indonesia = teksTerlihat(satu.bangun());
      pasangBahasa('en');
      const inggris = teksTerlihat(satu.bangun());
      expect(indonesia, `halaman ${satu.nama} tidak berubah saat bahasa diganti`).not.toBe(
        inggris,
      );
    }
  });

  it('angka diformat menurut kaidah bahasanya', async () => {
    const { angka } = await import('../src/i18n');
    // Indonesia memakai koma desimal, Inggris memakai titik. Kalau ini lolos,
    // versi Indonesia akan menampilkan angka bergaya Inggris tanpa ada satu
    // kata pun yang salah.
    expect(angka(0.8512, 3, 'id')).toBe('0,851');
    expect(angka(0.8512, 3, 'en')).toBe('0.851');
  });
});
