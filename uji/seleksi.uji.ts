/**
 * Uji analisis distraktor dan seleksi butir berulang.
 *
 * Keduanya prosedur, bukan rumus tunggal, jadi yang diuji adalah sifat dan
 * urutan keputusannya. Yang paling penting di antaranya: seleksi butir wajib
 * membuang SATU butir per putaran. Membuang seluruh butir yang gagal sekaligus
 * memberi hasil yang berbeda dan lebih buruk, dan bedanya hanya terlihat pada
 * data yang butir terburuknya menyeret butir lain ikut gagal — persis kasus
 * yang dikunci di sini.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { matriksLikert, mesinUji } from './bantu';
import type { Mesin } from '../src/mesin/mesin';
import { analisisDistraktor, seleksiButir, alphaCronbach } from '../src/mesin/api';

let mesin: Mesin;
beforeAll(async () => {
  mesin = await mesinUji();
});

/**
 * Delapan butir: lima mengukur satu sifat laten, tiga sisanya derau murni.
 * Prosedur seleksi yang benar harus menyisakan tepat kelima butir pertama.
 */
function skalaBerderau(): { matriks: number[][]; nama: string[] } {
  const sifat = [
    1.6, 1.2, 0.9, 0.7, 0.4, 0.2, 0.0, -0.2, -0.4, -0.7,
    -0.9, -1.2, -1.6, 1.4, 1.0, 0.5, -0.5, -1.0, -1.4, 0.3,
    0.8, -0.8, 1.1, -1.1, 0.6, -0.6, 0.1, -0.1, 1.3, -1.3,
  ];
  const derau = [
    2, 5, 1, 4, 3, 5, 2, 1, 4, 3, 1, 5, 2, 4, 3,
    5, 1, 3, 2, 4, 3, 1, 5, 2, 4, 1, 3, 5, 2, 4,
  ];
  const matriks = sifat.map((nilai, i) => {
    const inti = (geseran: number): number =>
      Math.min(5, Math.max(1, Math.round(3 + nilai * 1.3 + geseran)));
    return [
      inti(0),
      inti(0.2),
      inti(-0.2),
      inti(0.1),
      inti(-0.1),
      derau[i] as number,
      derau[(i + 7) % derau.length] as number,
      derau[(i + 13) % derau.length] as number,
    ];
  });
  return { matriks, nama: ['B1', 'B2', 'B3', 'B4', 'B5', 'X1', 'X2', 'X3'] };
}

describe('seleksi butir berulang', () => {
  it('menyisakan tepat butir yang mengukur sifat yang sama', async () => {
    const { matriks, nama } = skalaBerderau();
    const hasil = await seleksiButir(mesin, matriks, {
      metode: 'tetap',
      ambang: 0.3,
      namaKolom: nama,
    });
    expect(hasil.butirBertahan).toEqual(['B1', 'B2', 'B3', 'B4', 'B5']);
    expect(hasil.butirDibuang.sort()).toEqual(['X1', 'X2', 'X3']);
  });

  it('menaikkan alpha dengan membuang butir yang merusaknya', async () => {
    const { matriks, nama } = skalaBerderau();
    const hasil = await seleksiButir(mesin, matriks, {
      metode: 'tetap',
      ambang: 0.3,
      namaKolom: nama,
    });
    expect(hasil.alphaAkhir as number).toBeGreaterThan(hasil.alphaAwal as number);
    expect(hasil.selisihAlpha as number).toBeGreaterThan(0);
  });

  it('membuang tepat satu butir per putaran', async () => {
    const { matriks, nama } = skalaBerderau();
    const hasil = await seleksiButir(mesin, matriks, {
      metode: 'tetap',
      ambang: 0.3,
      namaKolom: nama,
    });
    expect(hasil.putaran).toHaveLength(hasil.banyakDibuang);
    for (const putaran of hasil.putaran) {
      expect(putaran.butirSebelum - putaran.butirSesudah).toBe(1);
    }
  });

  it('nomor putaran berurutan dan jumlah butirnya menyambung', async () => {
    const { matriks, nama } = skalaBerderau();
    const hasil = await seleksiButir(mesin, matriks, {
      metode: 'tetap',
      ambang: 0.3,
      namaKolom: nama,
    });
    hasil.putaran.forEach((putaran, i) => {
      expect(putaran.putaran).toBe(i + 1);
      if (i > 0) {
        expect(putaran.butirSebelum).toBe(hasil.putaran[i - 1]!.butirSesudah);
      }
    });
    expect(hasil.putaran.at(-1)?.butirSesudah).toBe(hasil.banyakAkhir);
  });

  it('setiap butir yang dibuang memang berada di bawah ambangnya', async () => {
    const { matriks, nama } = skalaBerderau();
    const hasil = await seleksiButir(mesin, matriks, {
      metode: 'tetap',
      ambang: 0.3,
      namaKolom: nama,
    });
    for (const putaran of hasil.putaran) {
      if (putaran.rHitung === null) continue;
      expect(putaran.rHitung).toBeLessThan(putaran.batas);
    }
  });

  it('semua butir yang bertahan lolos ambangnya', async () => {
    const { matriks, nama } = skalaBerderau();
    const hasil = await seleksiButir(mesin, matriks, {
      metode: 'tetap',
      ambang: 0.3,
      namaKolom: nama,
    });
    expect(hasil.sebabBerhenti).toBe('bersih');
    for (const butir of hasil.akhir) expect(butir.lolos).toBe(true);
  });

  it('alpha akhir yang dilaporkan sama dengan alpha butir yang bertahan', async () => {
    const { matriks, nama } = skalaBerderau();
    const hasil = await seleksiButir(mesin, matriks, {
      metode: 'tetap',
      ambang: 0.3,
      namaKolom: nama,
    });
    const indeks = hasil.butirBertahan.map((satu) => nama.indexOf(satu));
    const disaring = matriks.map((baris) => indeks.map((j) => baris[j] as number));
    expect(hasil.alphaAkhir as number).toBeCloseTo(await alphaCronbach(mesin, disaring), 10);
  });

  it('tidak membuang apa pun bila semua butir sudah lolos', async () => {
    const { matriks, nama } = skalaBerderau();
    const bersih = matriks.map((baris) => baris.slice(0, 5));
    const hasil = await seleksiButir(mesin, bersih, {
      metode: 'tetap',
      ambang: 0.3,
      namaKolom: nama.slice(0, 5),
    });
    expect(hasil.banyakDibuang).toBe(0);
    expect(hasil.putaran).toHaveLength(0);
    expect(hasil.alphaAkhir).toBeCloseTo(hasil.alphaAwal as number, 12);
  });

  it('berhenti di batas bawah alih-alih memangkas skala sampai habis', async () => {
    // Data yang seluruhnya derau: tidak ada butir yang akan pernah lolos.
    // Prosedur harus berhenti dan MENGATAKAN kenapa, bukan memotong terus
    // sampai tersisa dua butir yang sama tidak bermaknanya.
    const derau = matriksLikert(30, 6, 4321);
    const hasil = await seleksiButir(mesin, derau, {
      metode: 'tetap',
      ambang: 0.95,
      minButir: 4,
    });
    expect(hasil.banyakAkhir).toBeGreaterThanOrEqual(4);
    expect(hasil.sebabBerhenti).toBe('batasBawah');
  });

  it('memakai nilai kritis r sebagai ambang bila diminta', async () => {
    const { matriks, nama } = skalaBerderau();
    const hasil = await seleksiButir(mesin, matriks, {
      metode: 'rTabel',
      alpha: 0.05,
      namaKolom: nama,
    });
    // N = 30 pada taraf 5% memberi nilai kritis sekitar 0,361.
    expect(hasil.batas).toBeGreaterThan(0.35);
    expect(hasil.batas).toBeLessThan(0.37);
  });

  it('menolak metode yang tidak dikenal', async () => {
    const { matriks } = skalaBerderau();
    await expect(
      seleksiButir(mesin, matriks, { metode: 'acak' as 'tetap' }),
    ).rejects.toMatchObject({ kode: 'skala.tidakDikenal' });
  });
});

describe('analisis distraktor', () => {
  /**
   * Enam peserta, tiga butir, lima pilihan.
   * Butir 1: kunci 1, pengecoh 2 dipilih hanya kelompok bawah — sehat.
   * Butir 2: kunci 3, pengecoh 4 dipilih hanya kelompok atas — menyesatkan.
   * Butir 3: kunci 5, tidak ada pengecoh yang dipilih siapa pun.
   */
  const pilihan = [
    [1, 3, 5],
    [1, 4, 5],
    [1, 3, 5],
    [2, 3, 5],
    [2, 3, 5],
    [2, 3, 5],
  ];
  const kunci = [1, 3, 5];

  it('menghitung proporsi tiap pilihan pada tiap butir', async () => {
    const hasil = await analisisDistraktor(mesin, pilihan, kunci, { proporsi: 0.5 });
    const butirSatu = hasil.pilihan.filter((p) => p.butir === 'A1');
    expect(butirSatu).toHaveLength(5);
    const jumlah = butirSatu.reduce((a, b) => a + b.proporsi, 0);
    expect(jumlah).toBeCloseTo(1, 10);
  });

  it('menandai pengecoh yang tidak dipilih siapa pun sebagai tak berfungsi', async () => {
    const hasil = await analisisDistraktor(mesin, pilihan, kunci, { proporsi: 0.5 });
    const butirTiga = hasil.pilihan.filter((p) => p.butir === 'A3' && !p.kunci);
    for (const satu of butirTiga) {
      expect(satu.proporsi).toBe(0);
      expect(satu.kategori).toBe('takBerfungsi');
    }
  });

  it('tidak pernah menilai kunci sebagai pengecoh', async () => {
    const hasil = await analisisDistraktor(mesin, pilihan, kunci, { proporsi: 0.5 });
    for (const satu of hasil.pilihan.filter((p) => p.kunci)) {
      expect(satu.kategori).toBeNull();
    }
  });

  it('menandai pengecoh yang lebih disukai kelompok atas sebagai menyesatkan', async () => {
    const hasil = await analisisDistraktor(mesin, pilihan, kunci, { proporsi: 0.5 });
    const menyesatkan = hasil.pilihan.filter((p) => p.kategori === 'menyesatkan');
    expect(menyesatkan.length).toBeGreaterThan(0);
    for (const satu of menyesatkan) expect(satu.selisih).toBeLessThan(0);
  });

  it('selisih selalu proporsi kelompok bawah dikurangi kelompok atas', async () => {
    const hasil = await analisisDistraktor(mesin, pilihan, kunci, { proporsi: 0.5 });
    for (const satu of hasil.pilihan) {
      expect(satu.selisih).toBeCloseTo(satu.pBawah - satu.pAtas, 12);
    }
  });

  it('banyak pengecoh adalah butir dikali pilihan dikurangi satu', async () => {
    const hasil = await analisisDistraktor(mesin, pilihan, kunci, { proporsi: 0.5 });
    expect(hasil.banyakPengecoh).toBe(3 * 4);
  });

  it('menolak kunci yang panjangnya tidak sama dengan jumlah butir', async () => {
    await expect(analisisDistraktor(mesin, pilihan, [1, 2])).rejects.toMatchObject({
      kode: 'data.panjangBeda',
    });
  });

  it('menolak kunci di luar rentang pilihan', async () => {
    await expect(
      analisisDistraktor(mesin, pilihan, [1, 3, 9], { banyakPilihan: 5 }),
    ).rejects.toMatchObject({ kode: 'distraktor.kunciDiLuarRentang' });
  });

  it('menolak jawaban di luar rentang pilihan', async () => {
    const rusak = pilihan.map((baris) => [...baris.slice(0, 2), 8]);
    await expect(
      analisisDistraktor(mesin, rusak, kunci, { banyakPilihan: 5 }),
    ).rejects.toMatchObject({ kode: 'distraktor.pilihanDiLuarRentang' });
  });

  it('indeks kesukaran dari kunci cocok dengan proporsi pemilih kunci', async () => {
    const hasil = await analisisDistraktor(mesin, pilihan, kunci, { proporsi: 0.5 });
    for (const butir of hasil.butir) {
      const barisKunci = hasil.pilihan.find((p) => p.butir === butir.butir && p.kunci);
      expect(butir.p).toBeCloseTo(barisKunci?.proporsi ?? -1, 12);
    }
  });
});
