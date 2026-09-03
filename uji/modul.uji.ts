/**
 * Uji terhadap angka yang tercetak di modul PSI307.
 *
 * Ini berkas uji terpenting di proyek ini. Uji lain memastikan mesinnya
 * konsisten dengan dirinya sendiri; berkas ini memastikan mesinnya menjawab
 * soal yang sama dengan jawaban yang sama seperti bahan kuliahnya. Kalau salah
 * satu di sini gagal, yang salah mesinnya — bukan modulnya.
 *
 * Setiap uji menyebut sesi dan halaman asal angkanya.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { mesinUji } from './bantu';
import type { Mesin } from '../src/mesin/mesin';
import { analisisAitem, analisisGuttman, rKritis, spearmanBrown } from '../src/mesin/api';

let mesin: Mesin;
beforeAll(async () => {
  mesin = await mesinUji();
});

describe('sesi 5 & 6 — nilai r tabel Pearson', () => {
  it('N = 10 pada alpha 0,05 menghasilkan 0,632 seperti yang dipakai modul', async () => {
    // Modul sesi 6, langkah (8): "isi dengan angka r tabel Pearson untuk
    // alpha = 0,05 dengan n = 10, yaitu sebesar 0,632".
    const r = await rKritis(mesin, 10, 0.05);
    expect(Number(r.toFixed(3))).toBe(0.632);
  });

  it('N = 48 pada alpha 0,05 menghasilkan 0,284 seperti pembanding di sesi 12', async () => {
    // Modul sesi 12: "Berdasarkan koefisien Cronbach's Alpha sebesar 0.851 >
    // 0.284 maka instrumen ..." — 0,284 adalah r tabel untuk N = 48.
    const r = await rKritis(mesin, 48, 0.05);
    expect(r).toBeGreaterThan(0.2835);
    expect(r).toBeLessThan(0.2855);
  });

  it('nilai kritis mengecil seiring bertambahnya responden', async () => {
    const kecil = await rKritis(mesin, 10, 0.05);
    const sedang = await rKritis(mesin, 30, 0.05);
    const besar = await rKritis(mesin, 100, 0.05);
    expect(kecil).toBeGreaterThan(sedang);
    expect(sedang).toBeGreaterThan(besar);
  });

  it('taraf 1 persen selalu menuntut korelasi lebih tinggi daripada 5 persen', async () => {
    for (const n of [10, 25, 48, 100]) {
      const taraf5 = await rKritis(mesin, n, 0.05);
      const taraf1 = await rKritis(mesin, n, 0.01);
      expect(taraf1).toBeGreaterThan(taraf5);
    }
  });
});

describe('sesi 7 — indeks kesukaran pada contoh 20 peserta', () => {
  /**
   * Modul sesi 7 memberi enam butir yang dikerjakan 20 siswa beserta nilai P
   * masing-masing. Matriks di bawah disusun agar banyak jawaban benar tiap
   * butir persis sama dengan angka B di modul: 10, 14, 4, 9, 15, dan 6.
   */
  const B_MODUL = [10, 14, 4, 9, 15, 6];
  const P_MODUL = [0.5, 0.7, 0.2, 0.45, 0.75, 0.3];
  const JS = 20;

  function matriksDariB(benar: readonly number[], peserta: number): number[][] {
    return Array.from({ length: peserta }, (_, i) =>
      benar.map((b) => (i < b ? 1 : 0)),
    );
  }

  it('P setiap butir sama dengan yang tercetak di modul', async () => {
    const m = matriksDariB(B_MODUL, JS);
    const hasil = await analisisAitem(mesin, m);
    const p = hasil.butir.map((butir) => butir.p);
    expect(p).toEqual(P_MODUL);
  });

  it('banyak jawaban benar cocok dengan nilai B di modul', async () => {
    const m = matriksDariB(B_MODUL, JS);
    const hasil = await analisisAitem(mesin, m);
    expect(hasil.butir.map((butir) => butir.benar)).toEqual(B_MODUL);
  });

  it('kategori kesukaran mengikuti batas 0,30 dan 0,70', async () => {
    const m = matriksDariB(B_MODUL, JS);
    const hasil = await analisisAitem(mesin, m);
    // P = 0,20 sukar; 0,30 masih sukar (batas atas tertutup); 0,45/0,50/0,70
    // sedang; 0,75 mudah.
    expect(hasil.butir.map((butir) => butir.kategoriKesukaran)).toEqual([
      'sedang',
      'sedang',
      'sukar',
      'sedang',
      'mudah',
      'sukar',
    ]);
  });
});

describe('sesi 6 — formula Spearman-Brown', () => {
  it('r belahan 0,5 menjadi 0,667 untuk tes utuh', async () => {
    // 2 * 0,5 / (1 + 0,5) = 0,6667 — contoh aritmetika langsung dari rumus
    // =2*J17/(1+J17) yang ditulis modul sebagai formula Excel.
    const r11 = await spearmanBrown(mesin, 0.5);
    expect(r11).toBeCloseTo(2 / 3, 12);
  });

  it('selalu menaikkan koefisien positif, tidak pernah menurunkannya', async () => {
    for (const r of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      const r11 = await spearmanBrown(mesin, r);
      expect(r11).toBeGreaterThan(r);
      expect(r11).toBeLessThanOrEqual(1);
    }
  });

  it('koefisien belahan negatif tetap negatif setelah dikoreksi', async () => {
    const r11 = await spearmanBrown(mesin, -0.4);
    expect(r11).toBeLessThan(0);
  });
});

describe('sesi 11 & 12 — koefisien skala Guttman', () => {
  it('skala sempurna tanpa penyimpangan menghasilkan Kr = 1', async () => {
    // Pola tangga sempurna: tiap responden menjawab "ya" pada butir termudah
    // berturut-turut, lalu berhenti. Inilah bentuk ideal yang jadi acuan error.
    const m = [
      [1, 1, 1, 1],
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const hasil = await analisisGuttman(mesin, m);
    expect(hasil.error).toBe(0);
    expect(hasil.koefisienReprodusibilitas).toBe(1);
    expect(hasil.reprodusibilitasDiterima).toBe(true);
  });

  it('Kr memakai pembagi jumlah pernyataan dikali jumlah responden', async () => {
    const m = [
      [1, 1, 1, 0],
      [1, 1, 0, 1],
      [1, 0, 0, 0],
      [1, 1, 0, 0],
    ];
    const hasil = await analisisGuttman(mesin, m);
    expect(hasil.banyakSel).toBe(16);
    expect(hasil.koefisienReprodusibilitas).toBeCloseTo(1 - hasil.error / 16, 12);
  });

  it('Ks memakai x = 0,5 dikali selisih total sel dan jumlah jawaban ya', async () => {
    const m = [
      [1, 1, 1, 0],
      [1, 1, 0, 1],
      [1, 0, 0, 0],
      [1, 1, 0, 0],
    ];
    const hasil = await analisisGuttman(mesin, m);
    const x = 0.5 * (hasil.banyakSel - hasil.jawabanYa);
    expect(hasil.x).toBeCloseTo(x, 12);
    expect(hasil.koefisienSkalabilitas).toBeCloseTo(1 - hasil.error / x, 12);
  });

  it('menghitung satu error per sel yang menyimpang, bukan per responden', async () => {
    // Responden tunggal berskor 2 yang gagal di butir termudah dan justru
    // berhasil di butir tersulit: dua sel menyimpang, jadi dua error.
    const m = [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 0, 0],
      [0, 1, 0, 1],
    ];
    const hasil = await analisisGuttman(mesin, m);
    const respondenMenyimpang = hasil.responden.find((r) => r.error > 0);
    expect(respondenMenyimpang?.error).toBe(2);
  });

  it('ambang penerimaan modul dipakai apa adanya: Kr > 0,90 dan Ks > 0,60', async () => {
    const m = [
      [1, 1, 1, 1],
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
    ];
    const hasil = await analisisGuttman(mesin, m);
    expect(hasil.reprodusibilitasDiterima).toBe(hasil.koefisienReprodusibilitas > 0.9);
    expect(hasil.skalabilitasDiterima).toBe(
      hasil.koefisienSkalabilitas !== null && hasil.koefisienSkalabilitas > 0.6,
    );
  });
});
