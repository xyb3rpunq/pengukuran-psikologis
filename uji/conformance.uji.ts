/**
 * Uji konformansi: mesin R melawan implementasi pembanding di Python.
 *
 * Vektor emas di conformance/vektor.json dibangkitkan numpy dan scipy oleh
 * conformance/referensi.py. Berkas ini menjalankan mesin R atas data yang sama
 * dan menuntut kedua jawaban bertemu.
 *
 * Yang membuat uji ini berarti adalah kemandiriannya. Nilai kritis r di sisi
 * Python datang dari scipy.stats.t.ppf, di sisi R dari qt() — dua rutin
 * distribusi t yang tidak berbagi satu baris kode pun. Korelasi di sisi Python
 * datang dari scipy.stats.pearsonr, di sisi R dari rumus angka kasar yang
 * ditulis tangan mengikuti modul. Kalau keduanya bertemu sampai 1e-10 pada 118
 * nilai N dan lima matriks respons, rumusnya bukan kebetulan benar.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { mesinUji } from './bantu';
import type { Mesin } from '../src/mesin/mesin';
import {
  alphaCronbach,
  analisisAitem,
  analisisGuttman,
  konversiSkor,
  kr20,
  kr21,
  pearson,
  rKritis,
  ringkasanDeskriptif,
  spearman,
} from '../src/mesin/api';
import { vektor } from '../src/mesin/literal';

interface Kasus {
  jenis: string;
  nama: string;
  x?: number[];
  y?: number[];
  matriks?: number[][];
  harapan: Record<string, unknown>;
}

interface VektorEmas {
  versi: number;
  dibangkitkanOleh: Record<string, string>;
  kasus: Kasus[];
}

const emas = JSON.parse(
  readFileSync(new URL('../conformance/vektor.json', import.meta.url), 'utf8'),
) as VektorEmas;

const TOLERANSI = 1e-10;

let mesin: Mesin;
beforeAll(async () => {
  mesin = await mesinUji();
});

function ambil(kasus: Kasus, kunci: string): number {
  return (kasus.harapan as Record<string, number>)[kunci] as number;
}

describe('konformansi terhadap numpy dan scipy', () => {
  it('vektor emas menyebut versi pustaka yang membangkitkannya', () => {
    expect(emas.versi).toBe(1);
    expect(emas.dibangkitkanOleh['numpy']).toBeTruthy();
    expect(emas.dibangkitkanOleh['scipy']).toBeTruthy();
  });

  const deskriptif = emas.kasus.filter((k) => k.jenis === 'deskriptif');
  for (const kasus of deskriptif) {
    it(`statistik deskriptif dan korelasi cocok — ${kasus.nama}`, async () => {
      const x = kasus.x as number[];
      const y = kasus.y as number[];
      const r = await ringkasanDeskriptif(mesin, x);

      expect(r.rerata).toBeCloseTo(ambil(kasus, 'rerata'), 10);
      expect(r.variansPopulasi).toBeCloseTo(ambil(kasus, 'variansPopulasi'), 10);
      expect(r.variansSampel).toBeCloseTo(ambil(kasus, 'variansSampel'), 10);
      expect(r.sbPopulasi).toBeCloseTo(ambil(kasus, 'sbPopulasi'), 10);
      expect(r.sbSampel).toBeCloseTo(ambil(kasus, 'sbSampel'), 10);
      expect(r.median).toBeCloseTo(ambil(kasus, 'median'), 10);
      expect(r.kuartil.q1).toBeCloseTo(ambil(kasus, 'q1'), 10);
      expect(r.kuartil.q3).toBeCloseTo(ambil(kasus, 'q3'), 10);

      expect(await pearson(mesin, x, y)).toBeCloseTo(ambil(kasus, 'pearson'), 10);
      expect(await spearman(mesin, x, y)).toBeCloseTo(ambil(kasus, 'spearman'), 10);
    });

    it(`persentil gaya SPSS cocok — ${kasus.nama}`, async () => {
      const x = kasus.x as number[];
      const p25 = await mesin.panggil<number>(`ps_persentil_spss(${vektor(x)}, 0.25)`);
      const p75 = await mesin.panggil<number>(`ps_persentil_spss(${vektor(x)}, 0.75)`);
      expect(p25).toBeCloseTo(ambil(kasus, 'persentilSpss25'), 10);
      expect(p75).toBeCloseTo(ambil(kasus, 'persentilSpss75'), 10);
    });
  }

  it('nilai kritis r dari qt() R cocok dengan scipy.stats.t.ppf untuk N 3 sampai 120', async () => {
    const kasus = emas.kasus.find((k) => k.jenis === 'rKritis');
    expect(kasus).toBeDefined();
    const taraf5 = (kasus!.harapan as { taraf5: Record<string, number> }).taraf5;
    const taraf1 = (kasus!.harapan as { taraf1: Record<string, number> }).taraf1;

    // Tabel dihitung sekali di R, bukan 118 kali bolak-balik lewat jembatan.
    const tabel = await mesin.panggil<{ n: number; taraf5: number; taraf1: number }[]>(
      'ps_tabel_r(3, 120)',
    );
    expect(tabel).toHaveLength(118);
    for (const baris of tabel) {
      expect(Math.abs(baris.taraf5 - (taraf5[String(baris.n)] as number))).toBeLessThan(TOLERANSI);
      expect(Math.abs(baris.taraf1 - (taraf1[String(baris.n)] as number))).toBeLessThan(TOLERANSI);
    }
  });

  it('r kritis satu per satu juga cocok pada N yang lazim dipakai skripsi', async () => {
    const kasus = emas.kasus.find((k) => k.jenis === 'rKritis')!;
    const taraf5 = (kasus.harapan as { taraf5: Record<string, number> }).taraf5;
    for (const n of [10, 20, 30, 48, 50, 100]) {
      const milikKami = await rKritis(mesin, n, 0.05);
      expect(milikKami).toBeCloseTo(taraf5[String(n)] as number, 10);
    }
  });

  const dikotomi = emas.kasus.filter((k) => k.jenis === 'dikotomi');
  for (const kasus of dikotomi) {
    it(`reliabilitas cocok — ${kasus.nama}`, async () => {
      const m = kasus.matriks as number[][];
      expect(await alphaCronbach(mesin, m)).toBeCloseTo(ambil(kasus, 'alphaCronbach'), 10);
      expect(await kr20(mesin, m)).toBeCloseTo(ambil(kasus, 'kr20'), 10);
      expect(await kr21(mesin, m)).toBeCloseTo(ambil(kasus, 'kr21'), 10);
    });

    it(`analisis aitem cocok — ${kasus.nama}`, async () => {
      const m = kasus.matriks as number[][];
      const p = (kasus.harapan as { indeksKesukaran: number[] }).indeksKesukaran;
      const d50 = (kasus.harapan as { dayaPembeda50: number[] }).dayaPembeda50;
      const d27 = (kasus.harapan as { dayaPembeda27: number[] }).dayaPembeda27;

      const setengah = await analisisAitem(mesin, m, { proporsi: 0.5 });
      const duaTujuh = await analisisAitem(mesin, m, { proporsi: 0.27 });

      setengah.butir.forEach((butir, j) => {
        expect(butir.p).toBeCloseTo(p[j] as number, 10);
        expect(butir.d).toBeCloseTo(d50[j] as number, 10);
      });
      duaTujuh.butir.forEach((butir, j) => {
        expect(butir.d).toBeCloseTo(d27[j] as number, 10);
      });
    });

    it(`korelasi aitem-total terkoreksi cocok — ${kasus.nama}`, async () => {
      const m = kasus.matriks as number[][];
      const harapan = (kasus.harapan as { korelasiAitemTotal: (number | null)[] })
        .korelasiAitemTotal;
      const milikKami = await mesin.panggil<(number | null)[]>(
        `ps_larik(ps_korelasi_aitem_total(matrix(c(${m.flat().join(',')}),` +
          ` nrow = ${m.length}, byrow = TRUE), TRUE))`,
      );
      milikKami.forEach((nilai, j) => {
        if (nilai === null || harapan[j] === null || harapan[j] === undefined) {
          expect(nilai).toBe(harapan[j] ?? null);
          return;
        }
        expect(nilai).toBeCloseTo(harapan[j] as number, 10);
      });
    });

    it(`koefisien Guttman cocok — ${kasus.nama}`, async () => {
      const m = kasus.matriks as number[][];
      const harapan = (kasus.harapan as {
        guttman: {
          error: number;
          banyakSel: number;
          jawabanYa: number;
          x: number;
          koefisienReprodusibilitas: number;
          koefisienSkalabilitas: number | null;
        };
      }).guttman;
      const hasil = await analisisGuttman(mesin, m);
      expect(hasil.error).toBe(harapan.error);
      expect(hasil.banyakSel).toBe(harapan.banyakSel);
      expect(hasil.jawabanYa).toBe(harapan.jawabanYa);
      expect(hasil.x).toBeCloseTo(harapan.x, 10);
      expect(hasil.koefisienReprodusibilitas).toBeCloseTo(
        harapan.koefisienReprodusibilitas,
        10,
      );
      if (harapan.koefisienSkalabilitas !== null) {
        expect(hasil.koefisienSkalabilitas).toBeCloseTo(harapan.koefisienSkalabilitas, 10);
      }
    });
  }

  const likert = emas.kasus.filter((k) => k.jenis === 'likert');
  for (const kasus of likert) {
    it(`alpha Cronbach politomi cocok — ${kasus.nama}`, async () => {
      const m = kasus.matriks as number[][];
      expect(await alphaCronbach(mesin, m)).toBeCloseTo(ambil(kasus, 'alphaCronbach'), 10);
    });
  }

  it('skor z, T, dan stanine cocok', async () => {
    const kasus = emas.kasus.find((k) => k.jenis === 'skor')!;
    const harapan = kasus.harapan as { z: number[]; t: number[]; stanine: number[] };
    const hasil = await konversiSkor(mesin, kasus.x as number[]);
    hasil.peserta.forEach((peserta, i) => {
      expect(peserta.z).toBeCloseTo(harapan.z[i] as number, 10);
      expect(peserta.t).toBeCloseTo(harapan.t[i] as number, 10);
      expect(peserta.stanine).toBe(harapan.stanine[i]);
    });
  });
});
