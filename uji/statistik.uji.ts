/**
 * Uji statistik deskriptif dan korelasi.
 *
 * Dua lapis pemeriksaan dipakai di sini. Pertama, nilai yang bisa dihitung
 * tangan diperiksa langsung. Kedua, rumus buatan sendiri diadu dengan fungsi
 * bawaan R pada data acak yang dapat diulang — ps_pearson melawan cor(),
 * ps_sb_sampel melawan sd(), ps_persentil melawan quantile(type = 7). Lapis
 * kedua itulah yang menangkap galat yang hanya muncul pada data tertentu.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { deret, mesinUji } from './bantu';
import type { Mesin } from '../src/mesin/mesin';
import { pearson, ringkasanDeskriptif, spearman } from '../src/mesin/api';
import { vektor } from '../src/mesin/literal';

let mesin: Mesin;
beforeAll(async () => {
  mesin = await mesinUji();
});

describe('ringkasan deskriptif', () => {
  const x = [2, 4, 4, 4, 5, 5, 7, 9];

  it('menghitung rerata, median, dan modus pada contoh yang bisa dihitung tangan', async () => {
    const r = await ringkasanDeskriptif(mesin, x);
    expect(r.n).toBe(8);
    expect(r.rerata).toBe(5);
    expect(r.median).toBe(4.5);
    expect(r.modus).toEqual([4]);
  });

  it('membedakan simpangan baku populasi dari sampel', async () => {
    const r = await ringkasanDeskriptif(mesin, x);
    // Sum kuadrat simpangan = 32. Populasi: 32/8 = 4 -> sigma = 2.
    // Sampel: 32/7 -> s = 2,138...
    expect(r.variansPopulasi).toBeCloseTo(4, 12);
    expect(r.sbPopulasi).toBeCloseTo(2, 12);
    expect(r.variansSampel).toBeCloseTo(32 / 7, 12);
    expect(r.sbSampel).toBeGreaterThan(r.sbPopulasi);
  });

  it('memulangkan semua nilai berfrekuensi tertinggi bila modusnya kembar', async () => {
    const r = await ringkasanDeskriptif(mesin, [1, 1, 2, 2, 3]);
    expect(r.modus).toEqual([1, 2]);
  });

  it('menyamai sd() dan var() bawaan R pada data acak', async () => {
    for (const benih of [1, 7, 99, 2026]) {
      const data = deret(40, benih);
      const r = await ringkasanDeskriptif(mesin, data);
      const bawaan = await mesin.panggil<number[]>(
        `c(sd(${vektor(data)}), var(${vektor(data)}), median(${vektor(data)}))`,
      );
      expect(r.sbSampel).toBeCloseTo(bawaan[0] as number, 12);
      expect(r.variansSampel).toBeCloseTo(bawaan[1] as number, 12);
      expect(r.median).toBeCloseTo(bawaan[2] as number, 12);
    }
  });

  it('menyamai quantile(type = 7) bawaan R untuk kuartil', async () => {
    for (const benih of [3, 42, 555]) {
      const data = deret(33, benih);
      const r = await ringkasanDeskriptif(mesin, data);
      const bawaan = await mesin.panggil<number[]>(
        `as.numeric(quantile(${vektor(data)}, c(0.25, 0.5, 0.75), type = 7))`,
      );
      expect(r.kuartil.q1).toBeCloseTo(bawaan[0] as number, 12);
      expect(r.kuartil.q2).toBeCloseTo(bawaan[1] as number, 12);
      expect(r.kuartil.q3).toBeCloseTo(bawaan[2] as number, 12);
      expect(r.kuartil.rentangAntarKuartil).toBeCloseTo(
        (bawaan[2] as number) - (bawaan[0] as number),
        12,
      );
    }
  });

  it('menolak deret kosong dengan kode galat, bukan lemparan R mentah', async () => {
    await expect(mesin.panggil('ps_rerata(numeric(0))')).rejects.toMatchObject({
      kode: 'data.kosong',
    });
  });

  it('menolak nilai tak hingga', async () => {
    await expect(mesin.panggil('ps_rerata(c(1, 2, Inf))')).rejects.toMatchObject({
      kode: 'data.bukanAngka',
    });
  });
});

describe('jenjang persentil', () => {
  it('memberi 50 kepada skor median walau ada skor kembar', async () => {
    const pr = await mesin.panggil<number>('ps_jenjang_persentil(c(1,2,2,2,3), 2)');
    expect(pr).toBe(50);
  });

  it('memberi angka di bawah 100 kepada skor tertinggi', async () => {
    // Definisi titik-tengah tidak pernah memberi 100, karena skor itu sendiri
    // dihitung setengah. Skor tertinggi dari 4 data: (3 + 0,5)/4 = 87,5.
    const pr = await mesin.panggil<number>('ps_jenjang_persentil(c(10,20,30,40), 40)');
    expect(pr).toBe(87.5);
  });
});

describe('korelasi', () => {
  it('menghasilkan 1 untuk hubungan linier positif sempurna', async () => {
    const r = await pearson(mesin, [1, 2, 3, 4, 5], [2, 4, 6, 8, 10]);
    expect(r).toBeCloseTo(1, 12);
  });

  it('menghasilkan -1 untuk hubungan linier negatif sempurna', async () => {
    const r = await pearson(mesin, [1, 2, 3, 4, 5], [10, 8, 6, 4, 2]);
    expect(r).toBeCloseTo(-1, 12);
  });

  it('rumus angka kasar menyamai cor() bawaan R pada data acak', async () => {
    for (const benih of [11, 222, 3333, 44444]) {
      const x = deret(50, benih);
      const y = deret(50, benih + 1);
      const milikKami = await pearson(mesin, x, y);
      const bawaan = await mesin.panggil<number>(`cor(${vektor(x)}, ${vektor(y)})`);
      expect(milikKami).toBeCloseTo(bawaan, 12);
    }
  });

  it('Spearman menyamai cor(method = "spearman") termasuk saat ada nilai kembar', async () => {
    const x = [1, 2, 2, 3, 4, 4, 4, 5];
    const y = [2, 1, 3, 3, 5, 4, 6, 6];
    const milikKami = await spearman(mesin, x, y);
    const bawaan = await mesin.panggil<number>(
      `cor(${vektor(x)}, ${vektor(y)}, method = "spearman")`,
    );
    expect(milikKami).toBeCloseTo(bawaan, 12);
  });

  it('menolak dua deret berbeda panjang', async () => {
    await expect(pearson(mesin, [1, 2, 3], [1, 2])).rejects.toMatchObject({
      kode: 'data.panjangBeda',
    });
  });

  it('menolak deret tanpa variasi, alih-alih memulangkan NaN diam-diam', async () => {
    await expect(pearson(mesin, [5, 5, 5, 5], [1, 2, 3, 4])).rejects.toMatchObject({
      kode: 'data.variansiNol',
    });
  });
});

describe('korelasi aitem-total', () => {
  const m = [
    [1, 1, 1, 0],
    [1, 1, 0, 0],
    [1, 0, 1, 1],
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
  ];

  it('versi terkoreksi selalu lebih rendah daripada versi tak terkoreksi', async () => {
    const dikoreksi = await mesin.panggil<(number | null)[]>(
      `ps_korelasi_aitem_total(matrix(c(${m.flat().join(',')}), nrow = 6, byrow = TRUE), TRUE)`,
    );
    const mentah = await mesin.panggil<(number | null)[]>(
      `ps_korelasi_aitem_total(matrix(c(${m.flat().join(',')}), nrow = 6, byrow = TRUE), FALSE)`,
    );
    dikoreksi.forEach((nilai, i) => {
      if (nilai === null || mentah[i] === null) return;
      expect(nilai).toBeLessThan(mentah[i] as number);
    });
  });
});
