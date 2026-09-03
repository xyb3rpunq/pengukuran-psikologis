/**
 * Pengurai masukan pengguna.
 *
 * Orang menempel data dari Excel, dari Google Sheets, dari catatan tulis
 * tangan yang diketik ulang. Pemisahnya bisa tab, koma, titik koma, atau
 * spasi berlebih; desimalnya bisa titik atau koma. Pengurai ini menerima
 * semuanya dan menolak dengan kode galat yang sama seperti mesin, sehingga
 * pesan yang dilihat pengguna tetap satu gaya dari mana pun galatnya datang.
 */

export class RalatMasukan extends Error {
  readonly kode: string;

  constructor(kode: string) {
    super(kode);
    this.name = 'RalatMasukan';
    this.kode = kode;
  }
}

/**
 * Ubah satu potongan teks menjadi angka.
 *
 * Koma diperlakukan sebagai pemisah desimal hanya bila ia satu-satunya dan
 * tidak ada titik. "1,5" menjadi 1,5 sedangkan "1,234.5" menjadi 1234,5 —
 * yang pertama gaya Indonesia, yang kedua gaya Inggris.
 */
export function keAngka(potongan: string): number {
  const bersih = potongan.trim();
  if (bersih === '') throw new RalatMasukan('data.bukanAngka');
  let siap = bersih;
  if (siap.includes(',') && !siap.includes('.')) {
    siap = siap.replace(',', '.');
  } else {
    siap = siap.replace(/,/g, '');
  }
  const nilai = Number(siap);
  if (!Number.isFinite(nilai)) throw new RalatMasukan('data.bukanAngka');
  return nilai;
}

function belahBaris(teks: string): string[] {
  return teks
    .split(/\r?\n/)
    .map((baris) => baris.trim())
    .filter((baris) => baris.length > 0);
}

/**
 * Belah satu baris menjadi sel.
 *
 * Ada satu ambiguitas yang tidak bisa diselesaikan dengan menebak: koma bisa
 * berarti pemisah kolom atau pemisah desimal. Aturannya dibuat dari konteks,
 * bukan dari isi angkanya. Kalau baris itu mengandung tab atau titik koma,
 * pemisah kolomnya sudah jelas dan koma dibebaskan menjadi desimal — inilah
 * bentuk tempelan dari Excel berpengaturan Indonesia. Kalau tidak ada, koma
 * dianggap pemisah kolom seperti pada CSV biasa.
 */
function belahSel(baris: string): string[] {
  const pemisahJelas = /[\t;]/.test(baris);
  const pola = pemisahJelas ? /[\t;\s]+/ : /[\s,]+/;
  return baris
    .split(pola)
    .map((sel) => sel.trim())
    .filter((sel) => sel.length > 0);
}

/** Baca satu deret angka: satu per baris, atau dipisah koma dan spasi. */
export function bacaDeret(teks: string): number[] {
  const pemisahJelas = /[\t;]/.test(teks);
  const pola = pemisahJelas ? /[\t;\s]+/ : /[\s,]+/;
  const potongan = teks
    .split(pola)
    .map((bagian) => bagian.trim())
    .filter((bagian) => bagian.length > 0);
  if (potongan.length === 0) throw new RalatMasukan('data.kosong');
  return potongan.map(keAngka);
}

/** Baca matriks respons: satu baris teks menjadi satu baris matriks. */
export function bacaMatriks(teks: string): number[][] {
  const baris = belahBaris(teks);
  if (baris.length === 0) throw new RalatMasukan('matriks.kosong');
  const matriks = baris.map((satuBaris) => belahSel(satuBaris).map(keAngka));
  const lebar = matriks[0]?.length ?? 0;
  if (lebar === 0) throw new RalatMasukan('matriks.kosong');
  for (const satuBaris of matriks) {
    if (satuBaris.length !== lebar) throw new RalatMasukan('matriks.barisTidakSeragam');
  }
  return matriks;
}

/** Baca daftar label yang dipisah koma. Kosong berarti tidak ada label. */
export function bacaLabel(teks: string): string[] | undefined {
  const bagian = teks
    .split(/[,;\n]+/)
    .map((satu) => satu.trim())
    .filter((satu) => satu.length > 0);
  return bagian.length > 0 ? bagian : undefined;
}

/**
 * Baca nomor butir favorable menjadi vektor logis sepanjang jumlah butir.
 *
 * Kosong berarti semua butir favorable — tafsir yang aman, karena skala tanpa
 * butir unfavorable adalah skala yang sah, sedangkan menebak butir mana yang
 * negatif tidak pernah aman.
 */
export function bacaFavorable(teks: string, banyakButir: number): boolean[] {
  const bersih = teks.trim();
  if (bersih === '') return Array.from({ length: banyakButir }, () => true);
  const nomor = new Set(
    bersih
      .split(/[\s,;]+/)
      .filter((satu) => satu.length > 0)
      .map((satu) => {
        const nilai = Number(satu);
        if (!Number.isInteger(nilai) || nilai < 1 || nilai > banyakButir) {
          throw new RalatMasukan('nilai.diLuarRentang');
        }
        return nilai;
      }),
  );
  return Array.from({ length: banyakButir }, (_, i) => nomor.has(i + 1));
}

/** Ubah matriks kembali menjadi teks, untuk mengisi bidang dengan contoh. */
export function matriksKeTeks(m: readonly (readonly number[])[]): string {
  return m.map((baris) => baris.join(' ')).join('\n');
}

export function deretKeTeks(x: readonly number[]): string {
  return x.join(', ');
}

export interface BerkasTerbaca {
  /** Baris data, sudah tanpa baris kepala bila ada. */
  readonly baris: string;
  /** Nama kolom dari baris kepala, atau undefined bila tidak ada. */
  readonly namaKolom: string | undefined;
}

/**
 * Baca isi berkas CSV atau TSV menjadi isi bidang.
 *
 * Baris pertama dianggap kepala tabel hanya bila ADA satu selnya yang bukan
 * angka. Aturan ini sengaja tidak menebak lebih jauh: tabel yang barisnya
 * semua angka memang tidak bisa dibedakan antara "ada kepala" dan "tidak",
 * dan menebak salah berarti membuang satu responden tanpa memberi tahu.
 */
export function bacaBerkas(isi: string): BerkasTerbaca {
  const baris = isi
    .split(/\r?\n/)
    .map((satu) => satu.trim())
    .filter((satu) => satu.length > 0);
  if (baris.length === 0) throw new RalatMasukan('berkas.takTerbaca');

  // Baris kepala dibelah dengan aturan pemisah yang SAMA seperti baris data.
  // Memakai aturan yang berbeda pernah membuat baris "1 2 3" terbaca sebagai
  // satu sel yang bukan angka, lalu dikira kepala tabel — dan satu responden
  // terbuang tanpa ada yang memberi tahu.
  const pertama = baris[0] as string;
  const sel = belahSel(pertama);
  const adaKepala =
    sel.length > 0 && sel.some((satu) => !Number.isFinite(Number(satu.replace(',', '.'))));

  const isiData = adaKepala ? baris.slice(1) : baris;
  if (isiData.length === 0) throw new RalatMasukan('berkas.takTerbaca');

  // Diurai sekali di sini supaya berkas yang bukan tabel angka ditolak saat
  // diimpor, bukan nanti saat tombol Hitung ditekan dan pengguna sudah lupa
  // berkas mana yang ia buka.
  bacaMatriks(isiData.join('\n'));

  return {
    baris: isiData.join('\n'),
    namaKolom: adaKepala ? sel.join(', ') : undefined,
  };
}

/**
 * Baca satu bidang yang isinya SATU angka.
 *
 * Ini bukan kemudahan, melainkan perbaikan atas cacat yang nyata. Bidang satu
 * angka sebelumnya dibaca dengan bacaDeret(), yang memperlakukan koma sebagai
 * pemisah kolom karena memang itu tugasnya pada data tabel. Akibatnya "0,30"
 * terbaca sebagai dua angka, 0 dan 30, lalu yang diambil angka pertamanya —
 * dan ambang gugur 0,30 diam-diam menjadi 0,00. Tidak ada galat, tidak ada
 * bidang merah; hanya seluruh butir yang tiba-tiba lolos.
 *
 * Di bidang satu angka, koma tidak pernah berarti pemisah. Ia selalu desimal.
 */
export function bacaAngka(teks: string, bawaan?: number): number {
  const bersih = teks.trim();
  if (bersih === '') {
    if (bawaan !== undefined) return bawaan;
    throw new RalatMasukan('data.kosong');
  }
  return keAngka(bersih);
}
