/**
 * Pustaka visualisasi SVG.
 *
 * Ditulis sendiri, tanpa pustaka grafik. Alasannya bukan gengsi: runtime R
 * sudah berat, dan menambah pustaka grafik berarti menambah unduhan di atas
 * beban yang sudah ada demi grafik yang bentuknya sudah kita tahu persis.
 * Semuanya SVG statis yang dirakit sekali, jadi tidak ada kerja ulang saat
 * digulir dan tidak ada canvas yang perlu digambar ulang.
 *
 * Warna diambil dari variabel CSS, sehingga tema terang dan gelap bekerja
 * tanpa satu pun cabang di kode ini.
 */

const NS = 'http://www.w3.org/2000/svg';

type IsiSvg = SVGElement | string | number | null | undefined | false;

export function s<K extends keyof SVGElementTagNameMap>(
  tag: K,
  atribut: Record<string, string | number> = {},
  ...anak: IsiSvg[]
): SVGElementTagNameMap[K] {
  const simpul = document.createElementNS(NS, tag);
  for (const [kunci, nilai] of Object.entries(atribut)) {
    simpul.setAttribute(kunci, String(nilai));
  }
  for (const isi of anak) {
    if (isi === null || isi === undefined || isi === false) continue;
    simpul.appendChild(
      typeof isi === 'object' ? isi : document.createTextNode(String(isi)),
    );
  }
  return simpul;
}

export function kanvas(lebar: number, tinggi: number, judul: string): SVGSVGElement {
  const svg = s('svg', {
    viewBox: `0 0 ${lebar} ${tinggi}`,
    class: 'visual',
    role: 'img',
    'aria-label': judul,
    preserveAspectRatio: 'xMidYMid meet',
  });
  svg.appendChild(s('title', {}, judul));
  return svg;
}

function teks(
  x: number,
  y: number,
  isi: string,
  kelas = 'v-teks',
  anchor: 'start' | 'middle' | 'end' = 'middle',
): SVGTextElement {
  return s('text', { x, y, class: kelas, 'text-anchor': anchor }, isi);
}

// --- Kurva normal dengan empat skala sejajar ------------------------------

export interface PenandaKurva {
  readonly z: number;
  readonly label: string;
}

/**
 * Kurva normal dengan sumbu z, T, stanine, dan jenjang persentil disejajarkan.
 *
 * Ini gambar paling berguna di seluruh mata kuliah: ia menunjukkan bahwa
 * keempat skala itu bukan empat hal berbeda, melainkan satu sebaran yang
 * dibaca dengan empat penggaris. Sekali seseorang melihat T = 60 berdiri
 * tepat di atas z = 1, hubungan itu tidak perlu dihafal lagi.
 */
export function kurvaNormal(penanda: readonly PenandaKurva[] = []): SVGSVGElement {
  const L = 720;
  const T = 300;
  const kiri = 40;
  const kanan = L - 40;
  const dasar = 190;
  const puncak = 30;
  const svg = kanvas(L, T, 'Kurva normal dengan skala z, T, stanine, dan persentil');

  const keX = (z: number): number => kiri + ((z + 4) / 8) * (kanan - kiri);
  const keY = (z: number): number => dasar - Math.exp(-0.5 * z * z) * (dasar - puncak);

  // Pita simpangan baku, dari yang terluar ke terdalam supaya bertumpuk rapi.
  const pita: readonly { readonly dari: number; readonly ke: number; readonly buram: number }[] = [
    { dari: -3, ke: 3, buram: 0.08 },
    { dari: -2, ke: 2, buram: 0.1 },
    { dari: -1, ke: 1, buram: 0.14 },
  ];
  for (const p of pita) {
    const titik: string[] = [`M ${keX(p.dari)} ${dasar}`];
    for (let z = p.dari; z <= p.ke + 1e-9; z += 0.05) titik.push(`L ${keX(z)} ${keY(z)}`);
    titik.push(`L ${keX(p.ke)} ${dasar} Z`);
    svg.appendChild(s('path', { d: titik.join(' '), class: 'v-pita', 'fill-opacity': p.buram }));
  }

  const kurva: string[] = [];
  for (let z = -4; z <= 4 + 1e-9; z += 0.04) {
    kurva.push(`${kurva.length === 0 ? 'M' : 'L'} ${keX(z)} ${keY(z)}`);
  }
  svg.appendChild(s('path', { d: kurva.join(' '), class: 'v-kurva' }));
  svg.appendChild(
    s('line', { x1: kiri, y1: dasar, x2: kanan, y2: dasar, class: 'v-sumbu' }),
  );

  // Garis tegak pada tiap simpangan baku bulat.
  for (let z = -3; z <= 3; z += 1) {
    svg.appendChild(
      s('line', { x1: keX(z), y1: keY(z), x2: keX(z), y2: dasar, class: 'v-kisi' }),
    );
  }

  const barisSkala: readonly {
    readonly y: number;
    readonly nama: string;
    readonly nilai: (z: number) => string;
  }[] = [
    { y: dasar + 24, nama: 'z', nilai: (z) => String(z) },
    { y: dasar + 46, nama: 'T', nilai: (z) => String(50 + 10 * z) },
    { y: dasar + 68, nama: 'stanine', nilai: (z) => String(Math.min(9, Math.max(1, Math.round(2 * z + 5)))) },
    {
      y: dasar + 90,
      nama: 'persentil',
      nilai: (z) => {
        const p = [0.1, 2.3, 15.9, 50, 84.1, 97.7, 99.9][z + 3] as number;
        return String(p);
      },
    },
  ];

  for (const baris of barisSkala) {
    svg.appendChild(teks(kiri - 6, baris.y + 4, baris.nama, 'v-label', 'end'));
    for (let z = -3; z <= 3; z += 1) {
      svg.appendChild(teks(keX(z), baris.y + 4, baris.nilai(z), 'v-angka'));
    }
  }

  for (const tanda of penanda) {
    const x = keX(Math.max(-3.6, Math.min(3.6, tanda.z)));
    svg.appendChild(s('line', { x1: x, y1: puncak - 12, x2: x, y2: dasar, class: 'v-penanda' }));
    svg.appendChild(teks(x, puncak - 16, tanda.label, 'v-penanda-label'));
  }

  return svg;
}

// --- Sebaran pencar dengan garis regresi ----------------------------------

export function pencar(
  x: readonly number[],
  y: readonly number[],
  labelX: string,
  labelY: string,
): SVGSVGElement {
  const L = 520;
  const T = 360;
  const pad = { kiri: 52, kanan: 18, atas: 18, bawah: 44 };
  const svg = kanvas(L, T, `${labelY} terhadap ${labelX}`);

  const minX = Math.min(...x);
  const maksX = Math.max(...x);
  const minY = Math.min(...y);
  const maksY = Math.max(...y);
  const bentangX = maksX - minX || 1;
  const bentangY = maksY - minY || 1;

  const keX = (v: number): number =>
    pad.kiri + ((v - minX) / bentangX) * (L - pad.kiri - pad.kanan);
  const keY = (v: number): number =>
    T - pad.bawah - ((v - minY) / bentangY) * (T - pad.atas - pad.bawah);

  for (let i = 0; i <= 4; i += 1) {
    const y = pad.atas + (i / 4) * (T - pad.atas - pad.bawah);
    svg.appendChild(s('line', { x1: pad.kiri, y1: y, x2: L - pad.kanan, y2: y, class: 'v-kisi' }));
    svg.appendChild(
      teks(pad.kiri - 8, y + 4, (maksY - (i / 4) * bentangY).toFixed(1), 'v-angka', 'end'),
    );
  }

  // Garis kuadrat terkecil — hubungan yang diukur r, digambar apa adanya.
  const n = x.length;
  const rerataX = x.reduce((a, b) => a + b, 0) / n;
  const rerataY = y.reduce((a, b) => a + b, 0) / n;
  let atas = 0;
  let bawah = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = (x[i] as number) - rerataX;
    atas += dx * ((y[i] as number) - rerataY);
    bawah += dx * dx;
  }
  if (bawah > 0) {
    const kemiringan = atas / bawah;
    const potong = rerataY - kemiringan * rerataX;
    svg.appendChild(
      s('line', {
        x1: keX(minX),
        y1: keY(kemiringan * minX + potong),
        x2: keX(maksX),
        y2: keY(kemiringan * maksX + potong),
        class: 'v-regresi',
      }),
    );
  }

  for (let i = 0; i < n; i += 1) {
    svg.appendChild(
      s('circle', { cx: keX(x[i] as number), cy: keY(y[i] as number), r: 4.5, class: 'v-titik' }),
    );
  }

  svg.appendChild(
    s('line', {
      x1: pad.kiri,
      y1: T - pad.bawah,
      x2: L - pad.kanan,
      y2: T - pad.bawah,
      class: 'v-sumbu',
    }),
  );
  svg.appendChild(teks((L + pad.kiri) / 2, T - 10, labelX, 'v-label'));
  const judulY = teks(0, 0, labelY, 'v-label');
  judulY.setAttribute('transform', `translate(14 ${(T - pad.bawah + pad.atas) / 2}) rotate(-90)`);
  svg.appendChild(judulY);
  return svg;
}

// --- Peta kuadran aitem: kesukaran melawan daya pembeda -------------------

export interface TitikAitem {
  readonly nama: string;
  readonly p: number;
  readonly d: number;
  readonly layak: boolean;
}

/**
 * Peta P terhadap D.
 *
 * Dua syarat modul digambar sebagai satu daerah: taraf kesukaran antara 0,30
 * dan 0,70, daya pembeda di atas 0,20. Butir di dalam kotak itu layak; butir
 * di luarnya perlu ditimbang ulang. Melihatnya sebagai daerah jauh lebih cepat
 * dipahami daripada membaca dua kolom kategori.
 */
export function petaAitem(butir: readonly TitikAitem[]): SVGSVGElement {
  const L = 520;
  const T = 380;
  const pad = { kiri: 52, kanan: 20, atas: 20, bawah: 46 };
  const svg = kanvas(L, T, 'Peta taraf kesukaran terhadap daya pembeda');

  const keX = (p: number): number => pad.kiri + p * (L - pad.kiri - pad.kanan);
  const keY = (d: number): number =>
    T - pad.bawah - ((d + 0.4) / 1.4) * (T - pad.atas - pad.bawah);

  svg.appendChild(
    s('rect', {
      x: keX(0.3),
      y: keY(1),
      width: keX(0.7) - keX(0.3),
      height: keY(0.2) - keY(1),
      class: 'v-daerah-baik',
      rx: 4,
    }),
  );
  svg.appendChild(teks((keX(0.3) + keX(0.7)) / 2, keY(1) + 16, 'layak', 'v-daerah-label'));

  for (const p of [0, 0.3, 0.7, 1]) {
    svg.appendChild(
      s('line', { x1: keX(p), y1: pad.atas, x2: keX(p), y2: T - pad.bawah, class: 'v-kisi' }),
    );
    svg.appendChild(teks(keX(p), T - pad.bawah + 18, p.toFixed(1), 'v-angka'));
  }
  for (const d of [-0.4, 0, 0.2, 0.4, 0.7, 1]) {
    svg.appendChild(
      s('line', {
        x1: pad.kiri,
        y1: keY(d),
        x2: L - pad.kanan,
        y2: keY(d),
        class: d === 0 ? 'v-sumbu-nol' : 'v-kisi',
      }),
    );
    svg.appendChild(teks(pad.kiri - 8, keY(d) + 4, d.toFixed(1), 'v-angka', 'end'));
  }

  for (const satu of butir) {
    const x = keX(Math.max(0, Math.min(1, satu.p)));
    const y = keY(Math.max(-0.4, Math.min(1, satu.d)));
    svg.appendChild(
      s('circle', { cx: x, cy: y, r: 6, class: satu.layak ? 'v-titik-baik' : 'v-titik-buruk' }),
    );
    svg.appendChild(teks(x, y - 11, satu.nama, 'v-titik-label'));
  }

  svg.appendChild(teks((L + pad.kiri) / 2, T - 10, 'P — taraf kesukaran', 'v-label'));
  const judulY = teks(0, 0, 'D — daya pembeda', 'v-label');
  judulY.setAttribute('transform', `translate(14 ${(T - pad.bawah + pad.atas) / 2}) rotate(-90)`);
  svg.appendChild(judulY);
  return svg;
}

// --- Kontinum Thurstone ---------------------------------------------------

export interface TitikKontinum {
  readonly nama: string;
  readonly s: number;
  readonly k25: number;
  readonly k75: number;
  readonly terpilih: boolean;
}

/**
 * Butir Thurstone di atas kontinum 1..11.
 *
 * Titik menandai lokasi S, batang menandai rentang antar-kuartil Q. Dua hal
 * yang dicari modul langsung terbaca dari gambarnya: butir dengan batang
 * pendek berarti penilainya sepakat, dan lokasi yang menyebar merata berarti
 * skalanya sanggup membedakan sikap di semua tingkat.
 */
export function kontinumThurstone(butir: readonly TitikKontinum[]): SVGSVGElement {
  const L = 640;
  const tinggiBaris = 30;
  const T = 74 + butir.length * tinggiBaris;
  const kiri = 62;
  const kanan = L - 28;
  const svg = kanvas(L, T, 'Lokasi butir Thurstone pada kontinum 1 sampai 11');

  const keX = (nilai: number): number => kiri + ((nilai - 1) / 10) * (kanan - kiri);

  for (let n = 1; n <= 11; n += 1) {
    svg.appendChild(s('line', { x1: keX(n), y1: 34, x2: keX(n), y2: T - 26, class: 'v-kisi' }));
    svg.appendChild(teks(keX(n), 24, String(n), 'v-angka'));
  }
  svg.appendChild(teks((kiri + kanan) / 2, T - 8, 'nilai skala S — makin ke kanan makin favorabel', 'v-label'));

  butir.forEach((satu, i) => {
    const y = 50 + i * tinggiBaris;
    svg.appendChild(teks(kiri - 10, y + 4, satu.nama, 'v-titik-label', 'end'));
    svg.appendChild(
      s('line', {
        x1: keX(Math.max(1, satu.k25)),
        y1: y,
        x2: keX(Math.min(11, satu.k75)),
        y2: y,
        class: satu.terpilih ? 'v-batang-baik' : 'v-batang',
      }),
    );
    svg.appendChild(
      s('circle', {
        cx: keX(Math.max(1, Math.min(11, satu.s))),
        cy: y,
        r: 5.5,
        class: satu.terpilih ? 'v-titik-baik' : 'v-titik',
      }),
    );
  });

  return svg;
}

// --- Scalogram Guttman ----------------------------------------------------

/**
 * Peta panas scalogram dengan sel menyimpang ditandai.
 *
 * Skala Guttman yang baik terlihat seperti tangga. Gambar ini membuat
 * penilaian itu bisa dilakukan dengan sekali lihat, jauh sebelum koefisiennya
 * dibaca: kalau tangganya rapi, Kr-nya pasti tinggi.
 */
export function petaSkalogram(
  matriks: readonly (readonly number[])[],
  namaButir: readonly string[],
  namaResponden: readonly string[],
): SVGSVGElement {
  const sel = 22;
  const kiri = 54;
  const atas = 30;
  const L = kiri + namaButir.length * sel + 20;
  const T = atas + matriks.length * sel + 14;
  const svg = kanvas(L, T, 'Scalogram Guttman');

  namaButir.forEach((nama, j) => {
    svg.appendChild(teks(kiri + j * sel + sel / 2, atas - 10, nama, 'v-angka'));
  });

  matriks.forEach((baris, i) => {
    svg.appendChild(
      teks(kiri - 8, atas + i * sel + sel / 2 + 4, namaResponden[i] ?? '', 'v-angka', 'end'),
    );
    const skor = baris.reduce((a, b) => a + b, 0);
    baris.forEach((nilai, j) => {
      const ideal = j < skor ? 1 : 0;
      const menyimpang = nilai !== ideal;
      svg.appendChild(
        s('rect', {
          x: kiri + j * sel + 1.5,
          y: atas + i * sel + 1.5,
          width: sel - 3,
          height: sel - 3,
          rx: 3,
          class: nilai === 1 ? 'v-sel-ya' : 'v-sel-tidak',
        }),
      );
      if (menyimpang) {
        svg.appendChild(
          s('rect', {
            x: kiri + j * sel + 1.5,
            y: atas + i * sel + 1.5,
            width: sel - 3,
            height: sel - 3,
            rx: 3,
            class: 'v-sel-error',
          }),
        );
      }
    });
  });

  return svg;
}

// --- Batang perbandingan koefisien ----------------------------------------

export interface BatangKoefisien {
  readonly label: string;
  readonly nilai: number | null;
  readonly ambang?: number;
}

/**
 * Beberapa koefisien reliabilitas berdampingan, dengan ambangnya.
 *
 * Modul menghitung belah dua dua kali dengan hasil berbeda lalu menyimpulkan
 * itulah kelemahannya. Menggambar semuanya bersebelahan membuat kesimpulan itu
 * terlihat, bukan sekadar dibaca.
 */
export function batangKoefisien(daftar: readonly BatangKoefisien[]): SVGSVGElement {
  const L = 560;
  const tinggiBaris = 38;
  const T = 24 + daftar.length * tinggiBaris;
  const kiri = 168;
  const kanan = L - 54;
  const svg = kanvas(L, T, 'Perbandingan koefisien');

  const keX = (nilai: number): number => kiri + Math.max(0, Math.min(1, nilai)) * (kanan - kiri);

  for (const patokan of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    svg.appendChild(s('line', { x1: keX(patokan), y1: 8, x2: keX(patokan), y2: T - 14, class: 'v-kisi' }));
  }

  daftar.forEach((satu, i) => {
    const y = 20 + i * tinggiBaris;
    svg.appendChild(teks(kiri - 10, y + 12, satu.label, 'v-label', 'end'));
    if (satu.nilai === null || !Number.isFinite(satu.nilai)) {
      svg.appendChild(teks(kiri + 8, y + 12, '—', 'v-angka', 'start'));
      return;
    }
    const lebar = keX(satu.nilai) - kiri;
    const memenuhi = satu.ambang === undefined || satu.nilai > satu.ambang;
    svg.appendChild(
      s('rect', {
        x: kiri,
        y: y - 1,
        width: Math.max(2, lebar),
        height: 18,
        rx: 4,
        class: memenuhi ? 'v-batang-baik-isi' : 'v-batang-buruk-isi',
      }),
    );
    svg.appendChild(teks(kanan + 6, y + 12, satu.nilai.toFixed(3), 'v-angka', 'start'));
    if (satu.ambang !== undefined) {
      svg.appendChild(
        s('line', { x1: keX(satu.ambang), y1: y - 5, x2: keX(satu.ambang), y2: y + 22, class: 'v-ambang' }),
      );
    }
  });

  return svg;
}

// --- Sebaran respons Likert per butir --------------------------------------

/**
 * Sebaran pilihan jawaban tiap butir sebagai batang bertumpuk.
 *
 * Butir yang jawabannya menumpuk di satu ujung tidak membedakan siapa pun,
 * betapapun bagus koefisiennya. Bentuk seperti itu langsung kelihatan di sini.
 */
export function batangLikert(
  matriks: readonly (readonly number[])[],
  namaButir: readonly string[],
  kategori: number,
): SVGSVGElement {
  const L = 560;
  const tinggiBaris = 30;
  const T = 46 + namaButir.length * tinggiBaris;
  const kiri = 68;
  const kanan = L - 18;
  const svg = kanvas(L, T, 'Sebaran pilihan jawaban tiap butir');
  const n = matriks.length;

  namaButir.forEach((nama, j) => {
    const y = 26 + j * tinggiBaris;
    svg.appendChild(teks(kiri - 10, y + 14, nama, 'v-titik-label', 'end'));
    const hitungan = new Array<number>(kategori).fill(0);
    for (const baris of matriks) {
      const nilai = baris[j];
      if (nilai !== undefined && nilai >= 1 && nilai <= kategori) {
        hitungan[nilai - 1] = (hitungan[nilai - 1] as number) + 1;
      }
    }
    let x = kiri;
    hitungan.forEach((banyak, k) => {
      const lebar = (banyak / n) * (kanan - kiri);
      if (lebar <= 0) return;
      svg.appendChild(
        s('rect', {
          x,
          y,
          width: lebar,
          height: 20,
          class: `v-likert v-likert-${k + 1}`,
          rx: 2,
        }),
      );
      if (lebar > 20) svg.appendChild(teks(x + lebar / 2, y + 14, String(banyak), 'v-angka-kecil'));
      x += lebar;
    });
  });

  const legenda = s('g', {});
  for (let k = 1; k <= kategori; k += 1) {
    const x = kiri + (k - 1) * 44;
    legenda.appendChild(s('rect', { x, y: T - 16, width: 12, height: 12, rx: 2, class: `v-likert v-likert-${k}` }));
    legenda.appendChild(teks(x + 20, T - 6, String(k), 'v-angka-kecil', 'start'));
  }
  svg.appendChild(legenda);
  return svg;
}

// --- Tangga tingkat skala pengukuran (sesi 14) -----------------------------

export interface AnakTangga {
  readonly nama: string;
  readonly sifat: string;
}

export function tanggaSkala(anak: readonly AnakTangga[]): SVGSVGElement {
  const L = 620;
  const tinggiAnak = 62;
  const T = 20 + anak.length * tinggiAnak;
  const svg = kanvas(L, T, 'Empat tingkat skala pengukuran');

  anak.forEach((satu, i) => {
    const dariBawah = anak.length - 1 - i;
    const y = 10 + i * tinggiAnak;
    const lebar = 150 + dariBawah * ((L - 190) / Math.max(1, anak.length - 1));
    svg.appendChild(
      s('rect', { x: 20, y, width: lebar, height: tinggiAnak - 12, rx: 8, class: `v-tangga v-tangga-${i + 1}` }),
    );
    svg.appendChild(teks(36, y + 24, satu.nama, 'v-tangga-nama', 'start'));
    svg.appendChild(teks(36, y + 42, satu.sifat, 'v-tangga-sifat', 'start'));
  });

  return svg;
}

// --- Diagram alur bertahap -------------------------------------------------

/** Rantai langkah bernomor — dipakai sesi yang isinya prosedur. */
export function alurLangkah(langkah: readonly string[]): SVGSVGElement {
  const L = 640;
  const tinggi = 46;
  const T = langkah.length * tinggi + 10;
  const svg = kanvas(L, T, 'Urutan langkah');

  langkah.forEach((isi, i) => {
    const y = i * tinggi + 6;
    svg.appendChild(s('rect', { x: 34, y, width: L - 54, height: tinggi - 12, rx: 8, class: 'v-langkah' }));
    svg.appendChild(s('circle', { cx: 18, cy: y + (tinggi - 12) / 2, r: 13, class: 'v-langkah-nomor' }));
    svg.appendChild(teks(18, y + (tinggi - 12) / 2 + 4, String(i + 1), 'v-angka-terang'));
    svg.appendChild(teks(48, y + (tinggi - 12) / 2 + 4, isi, 'v-langkah-teks', 'start'));
    if (i < langkah.length - 1) {
      svg.appendChild(
        s('line', { x1: 18, y1: y + tinggi - 12, x2: 18, y2: y + tinggi + 6, class: 'v-langkah-garis' }),
      );
    }
  });

  return svg;
}

// --- Pembanding dua kolom --------------------------------------------------

export interface KolomBanding {
  readonly judul: string;
  readonly butir: readonly string[];
}

/** Dua kolom bersanding — dipakai untuk pasangan konsep yang dipertentangkan. */
export function duaKolom(kiri: KolomBanding, kanan: KolomBanding): SVGSVGElement {
  const L = 640;
  const banyak = Math.max(kiri.butir.length, kanan.butir.length);
  const T = 56 + banyak * 26;
  const svg = kanvas(L, T, `${kiri.judul} dibandingkan ${kanan.judul}`);
  const lebar = (L - 36) / 2;

  [kiri, kanan].forEach((kolom, k) => {
    const x = 12 + k * (lebar + 12);
    svg.appendChild(
      s('rect', { x, y: 8, width: lebar, height: T - 20, rx: 10, class: `v-kolom v-kolom-${k + 1}` }),
    );
    svg.appendChild(teks(x + lebar / 2, 32, kolom.judul, 'v-kolom-judul'));
    kolom.butir.forEach((isi, i) => {
      svg.appendChild(teks(x + 16, 58 + i * 26, `· ${isi}`, 'v-kolom-teks', 'start'));
    });
  });

  return svg;
}
