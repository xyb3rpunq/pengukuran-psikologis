/**
 * Penulis literal R.
 *
 * Data dari peramban harus sampai ke R sebagai kode R yang sah. Menyusunnya
 * dengan penyambungan string mentah adalah cara paling gampang membuat lubang
 * penyuntikan kode, jadi setiap nilai di sini melewati satu fungsi yang tahu
 * bentuk apa yang boleh keluar. Angka wajib hingga, teks selalu dilolos-kan,
 * dan tidak ada jalur yang meneruskan string pemanggil apa adanya.
 */

export class RalatLiteral extends Error {
  readonly kode: string;

  constructor(kode: string) {
    super(kode);
    this.name = 'RalatLiteral';
    this.kode = kode;
  }
}

/** Satu angka sebagai literal R. Menolak NaN dan tak hingga. */
export function angka(nilai: number): string {
  if (typeof nilai !== 'number' || !Number.isFinite(nilai)) {
    throw new RalatLiteral('data.bukanAngka');
  }
  // 17 digit signifikan memulangkan double IEEE-754 secara utuh.
  return Number.isInteger(nilai) ? `${nilai}` : nilai.toPrecision(17);
}

/** Vektor numerik sebagai `c(...)`. Deret kosong menjadi `numeric(0)`. */
export function vektor(nilai: readonly number[]): string {
  if (!Array.isArray(nilai)) throw new RalatLiteral('data.bukanAngka');
  if (nilai.length === 0) return 'numeric(0)';
  return `c(${nilai.map(angka).join(',')})`;
}

/** Vektor logis sebagai `c(TRUE, FALSE, ...)`. */
export function logis(nilai: readonly boolean[]): string {
  if (!Array.isArray(nilai)) throw new RalatLiteral('data.bukanAngka');
  if (nilai.length === 0) return 'logical(0)';
  return `c(${nilai.map((v) => (v ? 'TRUE' : 'FALSE')).join(',')})`;
}

/** Satu string sebagai literal R, dengan pelolosan penuh. */
export function teks(nilai: string): string {
  if (typeof nilai !== 'string') throw new RalatLiteral('data.bukanAngka');
  const lolos = nilai
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    // Karakter kendali lain diganti kode heksadesimal supaya tetap sah di R.
    .replace(/[\u0000-\u001f\u007f]/g, (c) => {
      const kode = c.codePointAt(0) ?? 0;
      return `\\x${kode.toString(16).padStart(2, '0')}`;
    });
  return `"${lolos}"`;
}

/** Vektor teks sebagai `c("a","b")`. */
export function vektorTeks(nilai: readonly string[]): string {
  if (!Array.isArray(nilai)) throw new RalatLiteral('data.bukanAngka');
  if (nilai.length === 0) return 'character(0)';
  return `c(${nilai.map(teks).join(',')})`;
}

/**
 * Matriks baris-demi-baris sebagai `matrix(c(...), nrow = n, byrow = TRUE)`.
 *
 * Semua baris wajib sama panjang. R sendiri akan mendaur ulang nilai secara
 * diam-diam bila panjangnya tidak pas, dan diam-diam itu justru yang berbahaya
 * pada matriks respons: hasilnya tetap keluar, hanya saja salah.
 */
export function matriks(baris: readonly (readonly number[])[], namaKolom?: readonly string[]): string {
  if (!Array.isArray(baris) || baris.length === 0) throw new RalatLiteral('matriks.kosong');
  const lebar = baris[0]?.length ?? 0;
  if (lebar === 0) throw new RalatLiteral('matriks.kosong');
  for (const satuBaris of baris) {
    if (!Array.isArray(satuBaris) || satuBaris.length !== lebar) {
      throw new RalatLiteral('matriks.barisTidakSeragam');
    }
  }
  const datar = baris.flat();
  const inti = `matrix(${vektor(datar)},nrow=${baris.length},byrow=TRUE)`;
  if (namaKolom === undefined) return inti;
  if (namaKolom.length !== lebar) throw new RalatLiteral('matriks.barisTidakSeragam');
  return `{ .m <- ${inti}; colnames(.m) <- ${vektorTeks(namaKolom)}; .m }`;
}
