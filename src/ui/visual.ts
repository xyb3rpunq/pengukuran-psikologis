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

function label(
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
 * Teks yang muncul di dalam gambar.
 *
 * Diteruskan pemanggil, tidak ditulis di berkas ini. Judulnya bukan hiasan:
 * ia menjadi <title> dan aria-label, yakni satu-satunya bentuk gambar ini bagi
 * pembaca layar. Menuliskannya keras di sini berarti pengguna tunanetra selalu
 * mendengar bahasa Indonesia betapapun bahasa yang dipilihnya.
 */
export interface TeksKurva {
  readonly judul: string;
  readonly stanine: string;
  readonly persentil: string;
}

/**
 * Kurva normal dengan sumbu z, T, stanine, dan jenjang persentil disejajarkan.
 *
 * Ini gambar paling berguna di seluruh mata kuliah: ia menunjukkan bahwa
 * keempat skala itu bukan empat hal berbeda, melainkan satu sebaran yang
 * dibaca dengan empat penggaris. Sekali seseorang melihat T = 60 berdiri
 * tepat di atas z = 1, hubungan itu tidak perlu dihafal lagi.
 */
export function kurvaNormal(
  teks: TeksKurva,
  penanda: readonly PenandaKurva[] = [],
): SVGSVGElement {
  const L = 720;
  const T = 300;
  const kiri = 40;
  const kanan = L - 40;
  const dasar = 190;
  const puncak = 30;
  const svg = kanvas(L, T, teks.judul);

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
    {
      y: dasar + 68,
      nama: teks.stanine,
      nilai: (z) => String(Math.min(9, Math.max(1, Math.round(2 * z + 5)))),
    },
    {
      y: dasar + 90,
      nama: teks.persentil,
      nilai: (z) => {
        const p = [0.1, 2.3, 15.9, 50, 84.1, 97.7, 99.9][z + 3] as number;
        return String(p);
      },
    },
  ];

  for (const baris of barisSkala) {
    svg.appendChild(label(kiri - 6, baris.y + 4, baris.nama, 'v-label', 'end'));
    for (let z = -3; z <= 3; z += 1) {
      svg.appendChild(label(keX(z), baris.y + 4, baris.nilai(z), 'v-angka'));
    }
  }

  for (const tanda of penanda) {
    const x = keX(Math.max(-3.6, Math.min(3.6, tanda.z)));
    svg.appendChild(s('line', { x1: x, y1: puncak - 12, x2: x, y2: dasar, class: 'v-penanda' }));
    svg.appendChild(label(x, puncak - 16, tanda.label, 'v-penanda-label'));
  }

  return svg;
}

// --- Sebaran pencar dengan garis regresi ----------------------------------

export function pencar(
  judul: string,
  x: readonly number[],
  y: readonly number[],
  labelX: string,
  labelY: string,
): SVGSVGElement {
  const L = 520;
  const T = 360;
  const pad = { kiri: 52, kanan: 18, atas: 18, bawah: 44 };
  const svg = kanvas(L, T, judul);

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
      label(pad.kiri - 8, y + 4, (maksY - (i / 4) * bentangY).toFixed(1), 'v-angka', 'end'),
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
  svg.appendChild(label((L + pad.kiri) / 2, T - 10, labelX, 'v-label'));
  const judulY = label(0, 0, labelY, 'v-label');
  judulY.setAttribute('transform', `translate(14 ${(T - pad.bawah + pad.atas) / 2}) rotate(-90)`);
  svg.appendChild(judulY);
  return svg;
}

// --- Peta kuadran aitem: kesukaran melawan daya pembeda -------------------

export interface TeksPetaAitem {
  readonly judul: string;
  readonly sumbuP: string;
  readonly sumbuD: string;
  readonly daerahLayak: string;
}

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
export function petaAitem(
  teks: TeksPetaAitem,
  butir: readonly TitikAitem[],
): SVGSVGElement {
  const L = 520;
  const T = 380;
  const pad = { kiri: 52, kanan: 20, atas: 20, bawah: 46 };
  const svg = kanvas(L, T, teks.judul);

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
  svg.appendChild(
    label((keX(0.3) + keX(0.7)) / 2, keY(1) + 16, teks.daerahLayak, 'v-daerah-label'),
  );

  for (const p of [0, 0.3, 0.7, 1]) {
    svg.appendChild(
      s('line', { x1: keX(p), y1: pad.atas, x2: keX(p), y2: T - pad.bawah, class: 'v-kisi' }),
    );
    svg.appendChild(label(keX(p), T - pad.bawah + 18, p.toFixed(1), 'v-angka'));
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
    svg.appendChild(label(pad.kiri - 8, keY(d) + 4, d.toFixed(1), 'v-angka', 'end'));
  }

  for (const satu of butir) {
    const x = keX(Math.max(0, Math.min(1, satu.p)));
    const y = keY(Math.max(-0.4, Math.min(1, satu.d)));
    svg.appendChild(
      s('circle', { cx: x, cy: y, r: 6, class: satu.layak ? 'v-titik-baik' : 'v-titik-buruk' }),
    );
    svg.appendChild(label(x, y - 11, satu.nama, 'v-titik-label'));
  }

  svg.appendChild(label((L + pad.kiri) / 2, T - 10, teks.sumbuP, 'v-label'));
  const judulY = label(0, 0, teks.sumbuD, 'v-label');
  judulY.setAttribute('transform', `translate(14 ${(T - pad.bawah + pad.atas) / 2}) rotate(-90)`);
  svg.appendChild(judulY);
  return svg;
}

// --- Kontinum Thurstone ---------------------------------------------------

export interface TeksKontinum {
  readonly judul: string;
  readonly sumbu: string;
}

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
export function kontinumThurstone(
  teks: TeksKontinum,
  butir: readonly TitikKontinum[],
): SVGSVGElement {
  const L = 640;
  const tinggiBaris = 30;
  const T = 74 + butir.length * tinggiBaris;
  const kiri = 62;
  const kanan = L - 28;
  const svg = kanvas(L, T, teks.judul);

  const keX = (nilai: number): number => kiri + ((nilai - 1) / 10) * (kanan - kiri);

  for (let n = 1; n <= 11; n += 1) {
    svg.appendChild(s('line', { x1: keX(n), y1: 34, x2: keX(n), y2: T - 26, class: 'v-kisi' }));
    svg.appendChild(label(keX(n), 24, String(n), 'v-angka'));
  }
  svg.appendChild(label((kiri + kanan) / 2, T - 8, teks.sumbu, 'v-label'));

  butir.forEach((satu, i) => {
    const y = 50 + i * tinggiBaris;
    svg.appendChild(label(kiri - 10, y + 4, satu.nama, 'v-titik-label', 'end'));
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
  judul: string,
  matriks: readonly (readonly number[])[],
  namaButir: readonly string[],
  namaResponden: readonly string[],
): SVGSVGElement {
  const sel = 22;
  const kiri = 54;
  const atas = 30;
  const L = kiri + namaButir.length * sel + 20;
  const T = atas + matriks.length * sel + 14;
  const svg = kanvas(L, T, judul);

  namaButir.forEach((nama, j) => {
    svg.appendChild(label(kiri + j * sel + sel / 2, atas - 10, nama, 'v-angka'));
  });

  matriks.forEach((baris, i) => {
    svg.appendChild(
      label(kiri - 8, atas + i * sel + sel / 2 + 4, namaResponden[i] ?? '', 'v-angka', 'end'),
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
export function batangKoefisien(
  judul: string,
  daftar: readonly BatangKoefisien[],
): SVGSVGElement {
  const L = 560;
  const tinggiBaris = 38;
  const T = 24 + daftar.length * tinggiBaris;
  const kiri = 168;
  const kanan = L - 54;
  const svg = kanvas(L, T, judul);

  const keX = (nilai: number): number => kiri + Math.max(0, Math.min(1, nilai)) * (kanan - kiri);

  for (const patokan of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    svg.appendChild(s('line', { x1: keX(patokan), y1: 8, x2: keX(patokan), y2: T - 14, class: 'v-kisi' }));
  }

  daftar.forEach((satu, i) => {
    const y = 20 + i * tinggiBaris;
    svg.appendChild(label(kiri - 10, y + 12, satu.label, 'v-label', 'end'));
    if (satu.nilai === null || !Number.isFinite(satu.nilai)) {
      svg.appendChild(label(kiri + 8, y + 12, '—', 'v-angka', 'start'));
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
    svg.appendChild(label(kanan + 6, y + 12, satu.nilai.toFixed(3), 'v-angka', 'start'));
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
  judul: string,
  matriks: readonly (readonly number[])[],
  namaButir: readonly string[],
  kategori: number,
): SVGSVGElement {
  const L = 560;
  const tinggiBaris = 30;
  const T = 46 + namaButir.length * tinggiBaris;
  const kiri = 68;
  const kanan = L - 18;
  const svg = kanvas(L, T, judul);
  const n = matriks.length;

  namaButir.forEach((nama, j) => {
    const y = 26 + j * tinggiBaris;
    svg.appendChild(label(kiri - 10, y + 14, nama, 'v-titik-label', 'end'));
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
      if (lebar > 20) svg.appendChild(label(x + lebar / 2, y + 14, String(banyak), 'v-angka-kecil'));
      x += lebar;
    });
  });

  const legenda = s('g', {});
  for (let k = 1; k <= kategori; k += 1) {
    const x = kiri + (k - 1) * 44;
    legenda.appendChild(s('rect', { x, y: T - 16, width: 12, height: 12, rx: 2, class: `v-likert v-likert-${k}` }));
    legenda.appendChild(label(x + 20, T - 6, String(k), 'v-angka-kecil', 'start'));
  }
  svg.appendChild(legenda);
  return svg;
}

// --- Tangga tingkat skala pengukuran (sesi 14) -----------------------------

export interface AnakTangga {
  readonly nama: string;
  readonly sifat: string;
}

export function tanggaSkala(judul: string, anak: readonly AnakTangga[]): SVGSVGElement {
  const L = 620;
  const tinggiAnak = 62;
  const T = 20 + anak.length * tinggiAnak;
  const svg = kanvas(L, T, judul);

  anak.forEach((satu, i) => {
    const dariBawah = anak.length - 1 - i;
    const y = 10 + i * tinggiAnak;
    const lebar = 150 + dariBawah * ((L - 190) / Math.max(1, anak.length - 1));
    svg.appendChild(
      s('rect', { x: 20, y, width: lebar, height: tinggiAnak - 12, rx: 8, class: `v-tangga v-tangga-${i + 1}` }),
    );
    svg.appendChild(label(36, y + 24, satu.nama, 'v-tangga-nama', 'start'));
    svg.appendChild(label(36, y + 42, satu.sifat, 'v-tangga-sifat', 'start'));
  });

  return svg;
}

// --- Diagram alur bertahap -------------------------------------------------

/** Rantai langkah bernomor — dipakai sesi yang isinya prosedur. */
export function alurLangkah(judul: string, langkah: readonly string[]): SVGSVGElement {
  const L = 640;
  const tinggi = 46;
  const T = langkah.length * tinggi + 10;
  const svg = kanvas(L, T, judul);

  langkah.forEach((isi, i) => {
    const y = i * tinggi + 6;
    svg.appendChild(s('rect', { x: 34, y, width: L - 54, height: tinggi - 12, rx: 8, class: 'v-langkah' }));
    svg.appendChild(s('circle', { cx: 18, cy: y + (tinggi - 12) / 2, r: 13, class: 'v-langkah-nomor' }));
    svg.appendChild(label(18, y + (tinggi - 12) / 2 + 4, String(i + 1), 'v-angka-terang'));
    svg.appendChild(label(48, y + (tinggi - 12) / 2 + 4, isi, 'v-langkah-teks', 'start'));
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
export function duaKolom(
  judul: string,
  kiri: KolomBanding,
  kanan: KolomBanding,
): SVGSVGElement {
  const L = 640;
  const banyak = Math.max(kiri.butir.length, kanan.butir.length);
  const T = 56 + banyak * 26;
  const svg = kanvas(L, T, judul);
  const lebar = (L - 36) / 2;

  [kiri, kanan].forEach((kolom, k) => {
    const x = 12 + k * (lebar + 12);
    svg.appendChild(
      s('rect', { x, y: 8, width: lebar, height: T - 20, rx: 10, class: `v-kolom v-kolom-${k + 1}` }),
    );
    svg.appendChild(label(x + lebar / 2, 32, kolom.judul, 'v-kolom-judul'));
    kolom.butir.forEach((isi, i) => {
      svg.appendChild(label(x + 16, 58 + i * 26, `· ${isi}`, 'v-kolom-teks', 'start'));
    });
  });

  return svg;
}

// --- Scree plot -----------------------------------------------------------

export interface TitikEigen {
  readonly faktor: number;
  readonly eigen: number;
  readonly diPertahankan: boolean;
}

/**
 * Nilai eigen terhadap nomor faktor, dengan garis Kaiser di ketinggian satu.
 *
 * Gambar ini menjawab satu pertanyaan yang tidak bisa dijawab tabel: berapa
 * banyak faktor yang pantas dipertahankan. Kriteria Kaiser membaca berapa
 * titik yang berada di atas garis; kriteria siku membaca di mana kurvanya
 * mendatar. Keduanya sering tidak sepakat, dan ketidaksepakatan itu sendiri
 * adalah informasi yang layak dilihat.
 */
export function screePlot(judul: string, sumbuY: string, titik: readonly TitikEigen[]): SVGSVGElement {
  const L = 560;
  const T = 320;
  const pad = { kiri: 52, kanan: 20, atas: 20, bawah: 46 };
  const svg = kanvas(L, T, judul);
  if (titik.length === 0) return svg;

  const maks = Math.max(1.2, ...titik.map((t) => t.eigen));
  const keX = (i: number): number =>
    pad.kiri + (titik.length === 1 ? 0.5 : i / (titik.length - 1)) * (L - pad.kiri - pad.kanan);
  const keY = (v: number): number =>
    T - pad.bawah - (v / maks) * (T - pad.atas - pad.bawah);

  for (let i = 0; i <= 4; i += 1) {
    const nilai = (maks * i) / 4;
    svg.appendChild(
      s('line', { x1: pad.kiri, y1: keY(nilai), x2: L - pad.kanan, y2: keY(nilai), class: 'v-kisi' }),
    );
    svg.appendChild(label(pad.kiri - 8, keY(nilai) + 4, nilai.toFixed(1), 'v-angka', 'end'));
  }

  // Garis Kaiser: sebuah faktor layak dipertahankan hanya bila ia menjelaskan
  // lebih banyak daripada satu butir tunggal, yakni nilai eigennya di atas 1.
  svg.appendChild(
    s('line', { x1: pad.kiri, y1: keY(1), x2: L - pad.kanan, y2: keY(1), class: 'v-ambang' }),
  );
  svg.appendChild(label(L - pad.kanan, keY(1) - 6, '1', 'v-angka', 'end'));

  const jalur = titik
    .map((t, i) => `${i === 0 ? 'M' : 'L'} ${keX(i)} ${keY(t.eigen)}`)
    .join(' ');
  svg.appendChild(s('path', { d: jalur, class: 'v-kurva' }));

  titik.forEach((t, i) => {
    svg.appendChild(
      s('circle', {
        cx: keX(i),
        cy: keY(t.eigen),
        r: 5,
        class: t.diPertahankan ? 'v-titik-baik' : 'v-titik',
      }),
    );
    svg.appendChild(label(keX(i), T - pad.bawah + 18, String(t.faktor), 'v-angka'));
  });

  svg.appendChild(label((L + pad.kiri) / 2, T - 10, sumbuY, 'v-label'));
  return svg;
}

// --- Peta panas muatan faktor ---------------------------------------------

export interface BarisMuatan {
  readonly butir: string;
  readonly muatan: readonly number[];
  readonly faktor: number | null;
}

/**
 * Muatan tiap butir pada tiap faktor sebagai peta panas.
 *
 * Struktur faktor yang bersih terlihat sebagai blok-blok pekat yang tidak
 * bertumpang tindih. Butir yang pucat di semua kolom tidak dijelaskan faktor
 * mana pun; butir yang pekat di dua kolom sekaligus tidak jelas miliknya
 * siapa. Keduanya biasanya dibuang, dan keduanya lebih cepat terlihat di sini
 * daripada di tabel angka.
 */
export function petaMuatan(
  judul: string,
  labelFaktor: string,
  batas: number,
  baris: readonly BarisMuatan[],
): SVGSVGElement {
  const banyakFaktor = baris[0]?.muatan.length ?? 0;
  const lebarSel = 74;
  const tinggiSel = 26;
  const kiri = 62;
  const atas = 34;
  const L = kiri + banyakFaktor * lebarSel + 16;
  const T = atas + baris.length * tinggiSel + 12;
  const svg = kanvas(L, T, judul);

  for (let f = 0; f < banyakFaktor; f += 1) {
    svg.appendChild(
      label(kiri + f * lebarSel + lebarSel / 2, atas - 12, `${labelFaktor} ${f + 1}`, 'v-angka'),
    );
  }

  baris.forEach((satu, i) => {
    const y = atas + i * tinggiSel;
    svg.appendChild(label(kiri - 8, y + tinggiSel / 2 + 4, satu.butir, 'v-titik-label', 'end'));
    satu.muatan.forEach((nilai, f) => {
      const kuat = Math.min(1, Math.abs(nilai));
      const x = kiri + f * lebarSel;
      svg.appendChild(
        s('rect', {
          x: x + 2,
          y: y + 2,
          width: lebarSel - 4,
          height: tinggiSel - 4,
          rx: 3,
          class: nilai < 0 ? 'v-muatan-negatif' : 'v-muatan-positif',
          'fill-opacity': (0.08 + 0.82 * kuat).toFixed(3),
        }),
      );
      if (Math.abs(nilai) >= batas) {
        svg.appendChild(
          s('rect', {
            x: x + 2,
            y: y + 2,
            width: lebarSel - 4,
            height: tinggiSel - 4,
            rx: 3,
            class: 'v-muatan-terpilih',
          }),
        );
      }
      svg.appendChild(
        label(x + lebarSel / 2, y + tinggiSel / 2 + 4, nilai.toFixed(2), 'v-muatan-teks'),
      );
    });
  });

  return svg;
}

// --- Termometer SUS -------------------------------------------------------

export interface PitaSus {
  readonly dari: number;
  readonly sampai: number;
  readonly kelas: string;
  readonly label: string;
}

/**
 * Skor SUS di atas skala 0..100 beserta pita peringkatnya.
 *
 * Yang dijawab gambar ini adalah salah paham paling umum tentang SUS: bahwa
 * 70 itu nilai pas-pasan. Begitu skor 70 terlihat berdiri di sebelah kanan
 * garis patokan 68, salah paham itu selesai tanpa perlu dijelaskan.
 */
export function termometerSus(
  judul: string,
  labelPatokan: string,
  skor: number,
  selang: { readonly bawah: number | null; readonly atas: number | null },
  pita: readonly PitaSus[],
): SVGSVGElement {
  const L = 640;
  const T = 148;
  const kiri = 24;
  const kanan = L - 24;
  const yPita = 54;
  const tinggiPita = 30;
  const svg = kanvas(L, T, judul);

  const keX = (nilai: number): number =>
    kiri + (Math.max(0, Math.min(100, nilai)) / 100) * (kanan - kiri);

  for (const satu of pita) {
    svg.appendChild(
      s('rect', {
        x: keX(satu.dari),
        y: yPita,
        width: Math.max(1, keX(satu.sampai) - keX(satu.dari)),
        height: tinggiPita,
        class: satu.kelas,
      }),
    );
    if (keX(satu.sampai) - keX(satu.dari) > 34) {
      svg.appendChild(
        label((keX(satu.dari) + keX(satu.sampai)) / 2, yPita + 19, satu.label, 'v-angka-kecil'),
      );
    }
  }

  for (const tanda of [0, 25, 50, 75, 100]) {
    svg.appendChild(label(keX(tanda), yPita + tinggiPita + 16, String(tanda), 'v-angka'));
  }

  // Garis patokan 68: rerata seluruh penelitian SUS yang pernah dihimpun.
  svg.appendChild(
    s('line', { x1: keX(68), y1: yPita - 10, x2: keX(68), y2: yPita + tinggiPita + 4, class: 'v-ambang' }),
  );
  svg.appendChild(label(keX(68), yPita - 14, labelPatokan, 'v-angka'));

  if (selang.bawah !== null && selang.atas !== null) {
    svg.appendChild(
      s('line', {
        x1: keX(selang.bawah),
        y1: yPita + tinggiPita / 2,
        x2: keX(selang.atas),
        y2: yPita + tinggiPita / 2,
        class: 'v-selang',
      }),
    );
  }

  svg.appendChild(
    s('circle', { cx: keX(skor), cy: yPita + tinggiPita / 2, r: 8, class: 'v-penunjuk' }),
  );
  svg.appendChild(label(keX(skor), T - 14, skor.toFixed(1), 'v-penanda-label'));
  return svg;
}
