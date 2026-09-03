/**
 * Uji validitas dan reliabilitas.
 *
 * Beberapa uji di sini menguji identitas matematika, bukan sekadar sebuah
 * angka: alpha Cronbach wajib sama dengan KR-20 pada data dikotomi, dan
 * reliabilitas belah dua wajib naik sesuai Spearman-Brown. Identitas seperti
 * itu tidak bisa lulus secara kebetulan — kalau salah satu rumusnya keliru,
 * kesamaannya langsung pecah.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { deret, matriksDikotomi, matriksLikert, mesinUji } from './bantu';
import type { Mesin } from '../src/mesin/mesin';
import {
  alphaCronbach,
  analisisReliabilitas,
  belahDua,
  kr20,
  kr21,
  sem,
  tabelR,
  validitasBanding,
  validitasButir,
} from '../src/mesin/api';

let mesin: Mesin;
beforeAll(async () => {
  mesin = await mesinUji();
});

describe('tabel r product moment', () => {
  it('dibangkitkan untuk rentang N mana pun, bukan disalin dari lampiran buku', async () => {
    const tabel = await tabelR(mesin, 3, 60);
    expect(tabel).toHaveLength(58);
    expect(tabel[0]?.n).toBe(3);
    expect(tabel.at(-1)?.n).toBe(60);
  });

  it('menurun monoton seiring N bertambah pada kedua taraf', async () => {
    const tabel = await tabelR(mesin, 5, 80);
    for (let i = 1; i < tabel.length; i += 1) {
      expect(tabel[i]!.taraf5).toBeLessThan(tabel[i - 1]!.taraf5);
      expect(tabel[i]!.taraf1).toBeLessThan(tabel[i - 1]!.taraf1);
    }
  });

  it('setiap nilai berada di dalam rentang korelasi yang mungkin', async () => {
    const tabel = await tabelR(mesin, 3, 100);
    for (const baris of tabel) {
      expect(baris.taraf5).toBeGreaterThan(0);
      expect(baris.taraf1).toBeLessThanOrEqual(1);
    }
  });

  it('menolak N di bawah 3 karena derajat bebasnya nol', async () => {
    await expect(mesin.panggil('ps_r_kritis(2)')).rejects.toMatchObject({
      kode: 'nilai.harusPositif',
    });
  });
});

describe('kategori Guilford', () => {
  it('memetakan setiap pita ke kode yang benar, termasuk di batasnya', async () => {
    const kode = await mesin.panggil<string[]>(
      'ps_larik(ps_kategori_guilford(c(-0.5, 0, 0.20, 0.21, 0.40, 0.41, 0.60, 0.61, 0.80, 0.81, 1)))',
    );
    expect(kode).toEqual([
      'takValid',
      'takValid',
      'sangatRendah',
      'rendah',
      'rendah',
      'sedang',
      'sedang',
      'tinggi',
      'tinggi',
      'sangatTinggi',
      'sangatTinggi',
    ]);
  });
});

describe('validitas butir', () => {
  const m = matriksDikotomi(30, 8, 2026);

  it('memutuskan valid dengan membandingkan r hitung terhadap r tabel', async () => {
    const hasil = await validitasButir(mesin, m);
    expect(hasil.n).toBe(30);
    expect(hasil.banyakAitem).toBe(8);
    for (const butir of hasil.butir) {
      if (butir.rHitung === null) continue;
      expect(butir.valid).toBe(butir.rHitung >= hasil.rTabel);
    }
  });

  it('banyak valid dan gugur selalu berjumlah sebanyak aitemnya', async () => {
    const hasil = await validitasButir(mesin, m);
    expect(hasil.banyakValid + hasil.banyakGugur).toBe(hasil.banyakAitem);
  });

  it('memakai nama kolom yang diberikan pemanggil', async () => {
    const nama = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
    const hasil = await validitasButir(mesin, m, { namaKolom: nama });
    expect(hasil.butir.map((b) => b.aitem)).toEqual(nama);
  });

  it('r tabel mengecil bila respondennya lebih banyak, sehingga lebih mudah lolos', async () => {
    const kecil = await validitasButir(mesin, matriksDikotomi(12, 6, 5));
    const besar = await validitasButir(mesin, matriksDikotomi(80, 6, 5));
    expect(besar.rTabel).toBeLessThan(kecil.rTabel);
  });
});

describe('validitas banding', () => {
  it('mengalikan korelasi dengan koefisien validitas alat pembanding', async () => {
    const tes = deret(20, 77, 40, 95);
    const kriteria = tes.map((nilai, i) => nilai * 0.9 + (i % 5));
    const penuh = await validitasBanding(mesin, tes, kriteria, 1);
    const separuh = await validitasBanding(mesin, tes, kriteria, 0.8);
    expect(separuh.koefisienValiditas).toBeCloseTo(penuh.korelasi * 0.8, 12);
    expect(separuh.koefisienValiditas).toBeLessThan(penuh.koefisienValiditas);
  });

  it('menolak koefisien pembanding di luar rentang 0 sampai 1', async () => {
    const tes = deret(10, 3);
    const kriteria = deret(10, 4);
    await expect(validitasBanding(mesin, tes, kriteria, 1.5)).rejects.toMatchObject({
      kode: 'nilai.diLuarRentang',
    });
  });
});

describe('reliabilitas', () => {
  const dikotomi = matriksDikotomi(40, 10, 11);
  const likert = matriksLikert(40, 10, 13);

  it('alpha Cronbach sama persis dengan KR-20 pada data dikotomi', async () => {
    // Identitas ini yang membuat KR-20 disebut kasus khusus alpha. Kalau salah
    // satu rumusnya menyimpang, kesamaannya langsung pecah.
    const alpha = await alphaCronbach(mesin, dikotomi);
    const kr = await kr20(mesin, dikotomi);
    expect(alpha).toBeCloseTo(kr, 12);
  });

  it('KR-21 tidak pernah melampaui KR-20', async () => {
    // KR-21 mengandaikan semua aitem sama sukarnya. Andaian itu hanya bisa
    // membuat estimasinya lebih rendah, tidak pernah lebih tinggi.
    const kr20Nilai = await kr20(mesin, dikotomi);
    const kr21Nilai = await kr21(mesin, dikotomi);
    expect(kr21Nilai).toBeLessThanOrEqual(kr20Nilai + 1e-12);
  });

  it('menolak KR-20 pada data Likert karena bukan dikotomi', async () => {
    await expect(kr20(mesin, likert)).rejects.toMatchObject({
      kode: 'matriks.bukanDikotomi',
    });
  });

  it('alpha Cronbach tetap bekerja pada data Likert', async () => {
    const alpha = await alphaCronbach(mesin, likert);
    expect(Number.isFinite(alpha)).toBe(true);
    expect(alpha).toBeLessThanOrEqual(1);
  });

  it('belah dua ganjil-genap dan awal-akhir membelah aitem yang berbeda', async () => {
    const ganjilGenap = await belahDua(mesin, dikotomi, 'ganjilGenap');
    const awalAkhir = await belahDua(mesin, dikotomi, 'awalAkhir');
    expect(ganjilGenap.aitemKiri).toEqual([1, 3, 5, 7, 9]);
    expect(ganjilGenap.aitemKanan).toEqual([2, 4, 6, 8, 10]);
    expect(awalAkhir.aitemKiri).toEqual([1, 2, 3, 4, 5]);
    expect(awalAkhir.aitemKanan).toEqual([6, 7, 8, 9, 10]);
  });

  it('r11 belah dua sama dengan Spearman-Brown atas r belahannya', async () => {
    const hasil = await belahDua(mesin, dikotomi, 'ganjilGenap');
    expect(hasil.r11).toBeCloseTo((2 * hasil.rBelah) / (1 + hasil.rBelah), 12);
  });

  it('menolak metode belah yang tidak dikenal', async () => {
    await expect(mesin.panggil(`ps_belah_dua(matrix(c(1,0,1,0,1,1), nrow=3), "acak")`))
      .rejects.toMatchObject({ kode: 'skala.tidakDikenal' });
  });

  it('SEM mengecil saat reliabilitas naik, dan nol saat reliabilitas sempurna', async () => {
    const rendah = await sem(mesin, 10, 0.5);
    const tinggi = await sem(mesin, 10, 0.9);
    const sempurna = await sem(mesin, 10, 1);
    expect(tinggi).toBeLessThan(rendah);
    expect(sempurna).toBe(0);
  });

  it('SEM sama dengan simpangan baku dikali akar satu dikurangi reliabilitas', async () => {
    expect(await sem(mesin, 12, 0.64)).toBeCloseTo(12 * Math.sqrt(0.36), 12);
  });
});

describe('laporan reliabilitas lengkap', () => {
  it('menjalankan setiap metode yang berlaku bagi data dikotomi', async () => {
    const hasil = await analisisReliabilitas(mesin, matriksDikotomi(35, 8, 21));
    expect(hasil.dikotomi).toBe(true);
    expect(hasil.kr20).not.toBeNull();
    expect(hasil.kr21).not.toBeNull();
    expect(hasil.butir).toHaveLength(8);
    expect(hasil.sem).toBeCloseTo(hasil.sbTotal * Math.sqrt(1 - hasil.alphaCronbach), 10);
  });

  it('melewati KR-20 dan KR-21 pada data politomi alih-alih gagal', async () => {
    const hasil = await analisisReliabilitas(mesin, matriksLikert(35, 8, 23));
    expect(hasil.dikotomi).toBe(false);
    expect(hasil.kr20).toBeNull();
    expect(hasil.kr21).toBeNull();
    expect(Number.isFinite(hasil.alphaCronbach)).toBe(true);
  });

  it('alpha-jika-dibuang tersedia untuk setiap aitem', async () => {
    const hasil = await analisisReliabilitas(mesin, matriksLikert(30, 6, 31));
    expect(hasil.butir).toHaveLength(6);
    for (const butir of hasil.butir) {
      expect(butir.alphaJikaDibuang).not.toBeNull();
    }
  });

  it('membuang aitem terburuk menaikkan alpha — dan laporan sudah meramalkannya', async () => {
    // Aitem terakhir sengaja dibuat berlawanan arah dengan aitem lainnya.
    const dasar = matriksLikert(40, 5, 41);
    const denganPengganggu = dasar.map((baris) => [...baris, 6 - (baris[0] as number)]);
    const hasil = await analisisReliabilitas(mesin, denganPengganggu);
    const pengganggu = hasil.butir.at(-1)!;
    expect(pengganggu.alphaJikaDibuang).toBeGreaterThan(hasil.alphaCronbach);
  });
});
