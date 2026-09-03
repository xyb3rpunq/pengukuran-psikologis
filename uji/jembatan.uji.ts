/**
 * Uji jembatan JavaScript-R.
 *
 * Data pengguna masuk ke mesin sebagai kode R. Itu berarti penulis literal
 * adalah batas keamanan proyek ini, bukan sekadar kemudahan. Uji di berkas ini
 * memperlakukannya begitu: setiap masukan yang bisa menyeret kode ikut masuk
 * harus ditolak sebelum menyentuh R.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { mesinUji } from './bantu';
import type { Mesin } from '../src/mesin/mesin';
import {
  RalatLiteral,
  angka,
  logis,
  matriks,
  teks,
  vektor,
  vektorTeks,
} from '../src/mesin/literal';

let mesin: Mesin;
beforeAll(async () => {
  mesin = await mesinUji();
});

describe('penulis literal — angka', () => {
  it('menulis bilangan bulat apa adanya', () => {
    expect(angka(42)).toBe('42');
    expect(angka(-7)).toBe('-7');
    expect(angka(0)).toBe('0');
  });

  it('menulis pecahan dengan presisi penuh', () => {
    expect(Number(angka(0.1 + 0.2))).toBe(0.1 + 0.2);
    expect(Number(angka(Math.PI))).toBe(Math.PI);
  });

  it('menolak NaN dan tak hingga alih-alih menulis literal rusak', () => {
    expect(() => angka(NaN)).toThrow(RalatLiteral);
    expect(() => angka(Infinity)).toThrow(RalatLiteral);
    expect(() => angka(-Infinity)).toThrow(RalatLiteral);
  });

  it('menolak nilai yang bukan angka', () => {
    expect(() => angka('1; system("rm -rf /")' as unknown as number)).toThrow(RalatLiteral);
    expect(() => angka(null as unknown as number)).toThrow(RalatLiteral);
  });
});

describe('penulis literal — vektor dan matriks', () => {
  it('menulis vektor sebagai c(...)', () => {
    expect(vektor([1, 2, 3])).toBe('c(1,2,3)');
  });

  it('memakai numeric(0) untuk vektor kosong, bukan c()', () => {
    expect(vektor([])).toBe('numeric(0)');
  });

  it('menulis vektor logis dengan TRUE dan FALSE', () => {
    expect(logis([true, false])).toBe('c(TRUE,FALSE)');
  });

  it('menulis matriks baris demi baris', () => {
    expect(matriks([
      [1, 2],
      [3, 4],
    ])).toBe('matrix(c(1,2,3,4),nrow=2,byrow=TRUE)');
  });

  it('menolak baris yang panjangnya tidak seragam', () => {
    // R akan mendaur ulang nilai secara diam-diam dan tetap memberi hasil.
    // Hasil yang salah tapi masuk akal jauh lebih berbahaya daripada galat.
    expect(() => matriks([[1, 2], [3]])).toThrow(RalatLiteral);
  });

  it('menolak matriks kosong', () => {
    expect(() => matriks([])).toThrow(RalatLiteral);
    expect(() => matriks([[]])).toThrow(RalatLiteral);
  });

  it('menolak nama kolom yang jumlahnya tidak cocok', () => {
    expect(() => matriks([[1, 2]], ['a'])).toThrow(RalatLiteral);
  });
});

describe('penulis literal — teks', () => {
  it('melolos-kan tanda kutip', () => {
    expect(teks('a"b')).toBe('"a\\"b"');
  });

  it('melolos-kan garis miring terbalik', () => {
    expect(teks('a\\b')).toBe('"a\\\\b"');
  });

  it('melolos-kan baris baru dan tab', () => {
    expect(teks('a\nb\tc')).toBe('"a\\nb\\tc"');
  });

  it('mengubah karakter kendali menjadi kode heksadesimal', () => {
    expect(teks('ab')).toBe('"a\\x07b"');
  });
});

describe('ketahanan terhadap penyuntikan kode', () => {
  const jahat = [
    '"); system("echo tembus"); ("',
    'x <- 1; print("tembus")',
    '`Sys.getenv`()',
    '\\"; q(); \\"',
    'a\nq()\n',
  ];

  it('teks berbahaya tetap kembali sebagai teks biasa, bukan kode', async () => {
    for (const isi of jahat) {
      const kembali = await mesin.panggil<string>(teks(isi));
      expect(kembali).toBe(isi);
    }
  });

  it('nama kolom berbahaya tidak mengubah struktur matriks', async () => {
    const nama = ['normal', '"); q(); ("'];
    const hasil = await mesin.panggil<string[]>(
      `ps_larik(colnames(${matriks([[1, 2], [3, 4]], nama)}))`,
    );
    expect(hasil).toEqual(nama);
  });

  it('label peserta berbahaya sampai utuh ke hasil tanpa dieksekusi', async () => {
    const nama = ['aman', 'rm(list=ls())'];
    const kembali = await mesin.panggil<string[]>(`ps_larik(${vektorTeks(nama)})`);
    expect(kembali).toEqual(nama);
    // Mesin masih hidup dan fungsinya masih ada setelah teks itu lewat.
    expect(await mesin.panggil<number>('ps_rerata(c(2, 4))')).toBe(3);
  });
});

describe('penulis JSON di sisi R', () => {
  it('memulangkan skalar sebagai skalar dan larik bertanda sebagai larik', async () => {
    expect(await mesin.panggil<number>('1.5')).toBe(1.5);
    expect(await mesin.panggil<number[]>('ps_larik(1.5)')).toEqual([1.5]);
  });

  it('mengubah NA, NaN, dan Inf menjadi null', async () => {
    const hasil = await mesin.panggil<(number | null)[]>('ps_larik(c(NA, NaN, Inf, -Inf, 1))');
    expect(hasil).toEqual([null, null, null, null, 1]);
  });

  it('memulangkan list bernama sebagai object', async () => {
    const hasil = await mesin.panggil<{ a: number; b: string }>('list(a = 1, b = "dua")');
    expect(hasil).toEqual({ a: 1, b: 'dua' });
  });

  it('memulangkan data.frame sebagai larik object per baris', async () => {
    const hasil = await mesin.panggil<{ x: number; y: string }[]>(
      'data.frame(x = c(1, 2), y = c("a", "b"), stringsAsFactors = FALSE)',
    );
    expect(hasil).toEqual([
      { x: 1, y: 'a' },
      { x: 2, y: 'b' },
    ]);
  });

  it('memulangkan matriks sebagai larik baris, bukan larik datar', async () => {
    const hasil = await mesin.panggil<number[][]>('matrix(1:6, nrow = 2, byrow = TRUE)');
    expect(hasil).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it('melolos-kan teks yang mengandung kutip dan baris baru', async () => {
    const isi = 'ada "kutip" dan\nbaris baru';
    expect(await mesin.panggil<string>(teks(isi))).toBe(isi);
  });

  it('memulangkan angka tanpa kehilangan presisi double', async () => {
    const hasil = await mesin.panggil<number>('0.1 + 0.2');
    expect(hasil).toBe(0.30000000000000004);
  });

  it('memulangkan list kosong sebagai object kosong', async () => {
    expect(await mesin.panggil<unknown>('list()')).toEqual([]);
  });
});

describe('pemetaan galat', () => {
  it('galat mesin sampai sebagai kode, bukan pesan R', async () => {
    await expect(mesin.panggil('ps_rerata(numeric(0))')).rejects.toMatchObject({
      name: 'RalatMesin',
      kode: 'data.kosong',
    });
  });

  it('galat R yang tidak terduga tetap dibungkus kode umum', async () => {
    await expect(mesin.panggil('stop("meledak")')).rejects.toMatchObject({
      kode: 'mesin.gagal',
    });
  });

  it('konteks galat ikut menyeberang untuk ditampilkan ke pengguna', async () => {
    try {
      await mesin.panggil('ps_persentil(c(1,2,3), 5)');
      expect.unreachable('seharusnya gagal');
    } catch (galat) {
      expect((galat as { kode: string }).kode).toBe('nilai.diLuarRentang');
      expect((galat as { konteks: { nilai: number } }).konteks.nilai).toBe(5);
    }
  });

  it('mesin tetap dapat dipakai setelah sebuah galat', async () => {
    await expect(mesin.panggil('stop("sekali")')).rejects.toThrow();
    expect(await mesin.panggil<number>('ps_rerata(c(1, 2, 3))')).toBe(2);
  });
});

describe('impor berkas CSV', () => {
  it('membaca tabel angka polos tanpa membuang barisnya', async () => {
    const { bacaBerkas } = await import('../src/ui/masukan');
    const hasil = bacaBerkas('1,2,3\n4,5,6\n7,8,9');
    expect(hasil.namaKolom).toBeUndefined();
    expect(hasil.baris.split('\n')).toHaveLength(3);
  });

  it('mengenali baris kepala dan memindahkannya ke nama butir', async () => {
    const { bacaBerkas } = await import('../src/ui/masukan');
    const hasil = bacaBerkas('B1,B2,B3\n1,2,3\n4,5,6');
    expect(hasil.namaKolom).toBe('B1, B2, B3');
    expect(hasil.baris.split('\n')).toHaveLength(2);
  });

  it('tidak menebak adanya kepala pada tabel yang seluruhnya angka', async () => {
    // Tabel yang barisnya semua angka memang tidak bisa dibedakan antara
    // "ada kepala" dan "tidak". Menebak salah berarti membuang satu responden
    // tanpa memberi tahu siapa pun.
    const { bacaBerkas } = await import('../src/ui/masukan');
    const hasil = bacaBerkas('1 2 3\n4 5 6');
    expect(hasil.namaKolom).toBeUndefined();
    expect(hasil.baris.split('\n')).toHaveLength(2);
  });

  it('menerima pemisah tab dari tempelan Excel', async () => {
    const { bacaBerkas } = await import('../src/ui/masukan');
    const hasil = bacaBerkas('A\tB\n1\t2\n3\t4');
    expect(hasil.namaKolom).toBe('A, B');
  });

  it('menolak berkas yang bukan tabel angka', async () => {
    const { bacaBerkas } = await import('../src/ui/masukan');
    expect(() => bacaBerkas('halo dunia\nini bukan tabel')).toThrow();
  });

  it('menolak berkas kosong', async () => {
    const { bacaBerkas } = await import('../src/ui/masukan');
    expect(() => bacaBerkas('   \n\n  ')).toThrow();
  });

  it('menolak berkas yang barisnya tidak seragam', async () => {
    const { bacaBerkas } = await import('../src/ui/masukan');
    expect(() => bacaBerkas('1,2,3\n4,5')).toThrow();
  });

  it('membaca desimal koma bila pemisah kolomnya titik koma', async () => {
    const { bacaBerkas, bacaMatriks } = await import('../src/ui/masukan');
    const hasil = bacaBerkas('1,5;2,5\n3,5;4,5');
    expect(bacaMatriks(hasil.baris)).toEqual([
      [1.5, 2.5],
      [3.5, 4.5],
    ]);
  });
});
