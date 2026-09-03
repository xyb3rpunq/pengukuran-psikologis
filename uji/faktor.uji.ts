/**
 * Uji analisis faktor, uji normalitas, dan System Usability Scale.
 *
 * Analisis faktor sulit diuji dengan satu angka yang benar, karena hasilnya
 * bergantung pada data. Yang bisa diuji adalah sifat-sifatnya, dan sifat itu
 * yang dipakai di sini: nilai eigen matriks korelasi selalu berjumlah sebanyak
 * butirnya, komunalitas selalu satu dikurangi keunikan, dan data yang memang
 * dibangkitkan dari dua peubah tersembunyi harus memulangkan dua faktor
 * dengan butir yang terkelompok persis seperti asalnya.
 *
 * SUS sebaliknya punya jawaban pasti yang bisa dihitung tangan, dan beberapa
 * di antaranya cukup mengejutkan untuk layak dikunci: menjawab 5 pada semua
 * butir dan menjawab 1 pada semua butir sama-sama memberi skor 50.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { matriksLikert, mesinUji } from './bantu';
import type { Mesin } from '../src/mesin/mesin';
import {
  analisisFaktor,
  analisisSus,
  bartlett,
  kmo,
  nilaiEigen,
  normalitas,
} from '../src/mesin/api';
import { NAMA_BUTIR_FAKTOR, RESPON_FAKTOR, RESPON_SUS } from '../src/data/contoh';

let mesin: Mesin;
beforeAll(async () => {
  mesin = await mesinUji();
});

describe('uji kebolaan Bartlett', () => {
  it('menerima data yang butirnya memang saling berkorelasi', async () => {
    const hasil = await bartlett(mesin, RESPON_FAKTOR);
    expect(hasil.p).toBeLessThan
      ? expect(hasil.p).toBeLessThan(0.05)
      : expect(hasil.layak).toBe(true);
    expect(hasil.layak).toBe(true);
  });

  it('memakai derajat bebas p(p-1)/2', async () => {
    const hasil = await bartlett(mesin, RESPON_FAKTOR);
    const p = hasil.banyakButir;
    expect(hasil.db).toBe((p * (p - 1)) / 2);
  });

  it('penentu matriks korelasi selalu di antara nol dan satu', async () => {
    const hasil = await bartlett(mesin, RESPON_FAKTOR);
    expect(hasil.penentu).toBeGreaterThan(0);
    expect(hasil.penentu).toBeLessThanOrEqual(1);
  });

  it('menolak data yang salah satu butirnya salinan butir lain', async () => {
    // Butir kembar membuat matriks korelasinya singular: penentunya nol dan
    // logaritmanya tidak terdefinisi.
    const dasar = matriksLikert(30, 3, 5);
    const kembar = dasar.map((baris) => [...baris, baris[0] as number]);
    await expect(bartlett(mesin, kembar)).rejects.toMatchObject({
      kode: 'faktor.matriksSingular',
    });
  });
});

describe('kecukupan sampel Kaiser-Meyer-Olkin', () => {
  it('memulangkan nilai di antara nol dan satu', async () => {
    const hasil = await kmo(mesin, RESPON_FAKTOR, NAMA_BUTIR_FAKTOR);
    expect(hasil.kmo).toBeGreaterThan(0);
    expect(hasil.kmo).toBeLessThan(1);
  });

  it('menyatakan data contoh layak difaktorkan', async () => {
    const hasil = await kmo(mesin, RESPON_FAKTOR, NAMA_BUTIR_FAKTOR);
    expect(hasil.layak).toBe(true);
    expect(hasil.kmo).toBeGreaterThanOrEqual(0.5);
  });

  it('memberi satu nilai MSA untuk setiap butir', async () => {
    const hasil = await kmo(mesin, RESPON_FAKTOR, NAMA_BUTIR_FAKTOR);
    expect(hasil.butir).toHaveLength(RESPON_FAKTOR[0]?.length ?? 0);
    expect(hasil.butir.map((b) => b.butir)).toEqual(NAMA_BUTIR_FAKTOR);
    for (const butir of hasil.butir) {
      expect(butir.msa).toBeGreaterThan(0);
      expect(butir.msa).toBeLessThan(1);
      expect(butir.layak).toBe(butir.msa >= 0.5);
    }
  });

  it('mengategorikan menurut ambang Kaiser', async () => {
    const kode = await mesin.panggil<string[]>(
      'ps_larik(ps_kategori_kmo(c(0.45, 0.55, 0.65, 0.75, 0.85, 0.95)))',
    );
    expect(kode).toEqual([
      'takDiterima',
      'buruk',
      'cukupan',
      'sedang',
      'bagus',
      'sangatBagus',
    ]);
  });
});

describe('nilai eigen', () => {
  it('berjumlah sebanyak butirnya', async () => {
    // Sifat matriks korelasi: jejaknya sama dengan banyak butir, dan jejak
    // sama dengan jumlah nilai eigennya.
    const eigen = await nilaiEigen(mesin, RESPON_FAKTOR);
    const jumlah = eigen.reduce((a, b) => a + b.eigen, 0);
    expect(jumlah).toBeCloseTo(RESPON_FAKTOR[0]?.length ?? 0, 8);
  });

  it('terurut menurun', async () => {
    const eigen = await nilaiEigen(mesin, RESPON_FAKTOR);
    for (let i = 1; i < eigen.length; i += 1) {
      expect(eigen[i]!.eigen).toBeLessThanOrEqual(eigen[i - 1]!.eigen);
    }
  });

  it('proporsi kumulatifnya berakhir di satu', async () => {
    const eigen = await nilaiEigen(mesin, RESPON_FAKTOR);
    expect(eigen.at(-1)?.kumulatif).toBeCloseTo(1, 10);
  });

  it('menandai faktor yang bernilai eigen di atas satu', async () => {
    const eigen = await nilaiEigen(mesin, RESPON_FAKTOR);
    for (const baris of eigen) {
      expect(baris.diPertahankan).toBe(baris.eigen > 1);
    }
  });
});

describe('analisis faktor eksploratori', () => {
  it('menemukan dua dimensi yang memang dipakai membangkitkan datanya', async () => {
    const hasil = await analisisFaktor(mesin, RESPON_FAKTOR, {
      namaKolom: NAMA_BUTIR_FAKTOR,
    });
    expect(hasil.banyakFaktor).toBe(2);

    // Empat butir pertama berasal dari satu peubah tersembunyi, empat
    // berikutnya dari peubah lain. Nomor faktornya boleh tertukar — yang
    // penting keempatnya sekelompok, dan kedua kelompoknya berbeda.
    const kelompok = hasil.butir.map((b) => b.faktor);
    const awal = new Set(kelompok.slice(0, 4));
    const akhir = new Set(kelompok.slice(4));
    expect(awal.size).toBe(1);
    expect(akhir.size).toBe(1);
    expect([...awal][0]).not.toBe([...akhir][0]);
  });

  it('komunalitas selalu satu dikurangi keunikan', async () => {
    const hasil = await analisisFaktor(mesin, RESPON_FAKTOR);
    for (const butir of hasil.butir) {
      expect(butir.komunalitas).toBeCloseTo(1 - butir.keunikan, 10);
      expect(butir.komunalitas).toBeGreaterThanOrEqual(0);
      expect(butir.komunalitas).toBeLessThanOrEqual(1.0000001);
    }
  });

  it('ragam kumulatif sama dengan jumlah ragam tiap faktor', async () => {
    const hasil = await analisisFaktor(mesin, RESPON_FAKTOR);
    const jumlah = hasil.ragamPerFaktor.reduce((a, b) => a + b, 0);
    expect(hasil.ragamKumulatif).toBeCloseTo(jumlah, 10);
    expect(hasil.ragamKumulatif).toBeGreaterThan(0);
    expect(hasil.ragamKumulatif).toBeLessThanOrEqual(1);
  });

  it('rotasi promax dan varimax sama-sama bekerja pada data yang sama', async () => {
    const varimax = await analisisFaktor(mesin, RESPON_FAKTOR, { rotasi: 'varimax' });
    const promax = await analisisFaktor(mesin, RESPON_FAKTOR, { rotasi: 'promax' });
    // Rotasi tidak mengubah berapa banyak yang dijelaskan, hanya membagi
    // ulang penjelasan itu di antara faktornya.
    expect(varimax.banyakFaktor).toBe(promax.banyakFaktor);
    for (let i = 0; i < varimax.butir.length; i += 1) {
      expect(varimax.butir[i]!.komunalitas).toBeCloseTo(promax.butir[i]!.komunalitas, 6);
    }
  });

  it('menolak jumlah faktor yang melampaui batas derajat bebas model', async () => {
    await expect(
      analisisFaktor(mesin, RESPON_FAKTOR, { banyakFaktor: 7 }),
    ).rejects.toMatchObject({ kode: 'faktor.terlaluBanyak' });
  });

  it('menolak rotasi yang tidak dikenal', async () => {
    await expect(
      mesin.panggil(`ps_analisis_faktor(matrix(c(${RESPON_FAKTOR.flat().join(',')}),` +
        ` nrow=${RESPON_FAKTOR.length}, byrow=TRUE), 2, "oblimin")`),
    ).rejects.toMatchObject({ kode: 'skala.tidakDikenal' });
  });

  it('menandai butir yang muatannya kuat di lebih dari satu faktor', async () => {
    // Dengan ambang yang diturunkan drastis, hampir semua butir akan bermuatan
    // ganda — dan penandanya harus ikut menyala.
    const longgar = await analisisFaktor(mesin, RESPON_FAKTOR, { batasMuatan: 0.05 });
    expect(longgar.banyakBermuatanGanda).toBeGreaterThan(0);
  });

  it('butir yang tidak mencapai ambang tidak dipaksa masuk faktor mana pun', async () => {
    const ketat = await analisisFaktor(mesin, RESPON_FAKTOR, { batasMuatan: 0.99 });
    expect(ketat.banyakTakBermuatan).toBe(ketat.banyakButir);
    for (const butir of ketat.butir) expect(butir.faktor).toBeNull();
  });
});

describe('uji normalitas Shapiro-Wilk', () => {
  it('menyatakan sebaran simetris sebagai normal', async () => {
    // Sebaran yang dibangun simetris di sekitar tengahnya.
    const data = [
      -2.5, -2, -1.6, -1.3, -1, -0.8, -0.6, -0.4, -0.2, 0,
      0, 0.2, 0.4, 0.6, 0.8, 1, 1.3, 1.6, 2, 2.5,
    ];
    const hasil = await normalitas(mesin, data);
    expect(hasil.p).toBeGreaterThan(0.05);
    expect(hasil.normal).toBe(true);
  });

  it('menolak sebaran yang jelas menjulur', async () => {
    const menjulur = Array.from({ length: 30 }, (_, i) => (i < 27 ? 1 : 40 + i));
    const hasil = await normalitas(mesin, menjulur);
    expect(hasil.p).toBeLessThan(0.05);
    expect(hasil.normal).toBe(false);
  });

  it('statistik W berada di antara nol dan satu', async () => {
    const hasil = await normalitas(mesin, [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]);
    expect(hasil.w).toBeGreaterThan(0);
    expect(hasil.w).toBeLessThanOrEqual(1);
  });

  it('menolak deret tanpa variasi', async () => {
    await expect(normalitas(mesin, [4, 4, 4, 4, 4])).rejects.toMatchObject({
      kode: 'data.variansiNol',
    });
  });
});

describe('System Usability Scale', () => {
  it('menjawab 5 pada semua butir memberi skor 50, bukan 100', async () => {
    // Jebakan paling terkenal pada SUS. Separuh butirnya unfavorable, jadi
    // responden yang menyetujui segalanya menyatakan dua hal yang saling
    // bertentangan dan mendarat tepat di tengah.
    const semuaLima = Array.from({ length: 3 }, () => new Array(10).fill(5));
    const hasil = await analisisSus(mesin, semuaLima);
    expect(hasil.rerata).toBe(50);
  });

  it('menjawab 1 pada semua butir juga memberi skor 50', async () => {
    const semuaSatu = Array.from({ length: 3 }, () => new Array(10).fill(1));
    const hasil = await analisisSus(mesin, semuaSatu);
    expect(hasil.rerata).toBe(50);
  });

  it('pola sempurna memberi 100 dan pola terburuk memberi 0', async () => {
    const terbaik = Array.from({ length: 2 }, () =>
      Array.from({ length: 10 }, (_, j) => (j % 2 === 0 ? 5 : 1)),
    );
    const terburuk = Array.from({ length: 2 }, () =>
      Array.from({ length: 10 }, (_, j) => (j % 2 === 0 ? 1 : 5)),
    );
    expect((await analisisSus(mesin, terbaik)).rerata).toBe(100);
    expect((await analisisSus(mesin, terburuk)).rerata).toBe(0);
  });

  it('setiap skor adalah kelipatan 2,5 di dalam rentang 0 sampai 100', async () => {
    const hasil = await analisisSus(mesin, RESPON_SUS);
    for (const responden of hasil.responden) {
      expect(responden.skor).toBeGreaterThanOrEqual(0);
      expect(responden.skor).toBeLessThanOrEqual(100);
      expect(Math.round(responden.skor / 2.5)).toBeCloseTo(responden.skor / 2.5, 10);
    }
  });

  it('data contoh berada di atas patokan 68', async () => {
    const hasil = await analisisSus(mesin, RESPON_SUS);
    expect(hasil.diAtasPatokan).toBe(true);
    expect(hasil.keberterimaan).toBe('diterima');
    expect(hasil.persentil).toBeGreaterThan(50);
  });

  it('peringkat huruf mengikuti kurva Sauro dan Lewis di titik batasnya', async () => {
    const kode = await mesin.panggil<string[]>(
      'ps_larik(ps_peringkat_sus(c(84.1, 80.8, 78.9, 77.2, 74.1, 72.6, 71.1, 65, 62.7, 51.7, 51.6)))',
    );
    expect(kode).toEqual(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']);
  });

  it('patokan 68 mendarat tepat di persentil 50', async () => {
    const persentil = await mesin.panggil<number[]>('ps_larik(ps_persentil_sus(68))');
    expect(persentil[0]).toBeCloseTo(50, 8);
  });

  it('selang kepercayaan mengurung reratanya', async () => {
    const hasil = await analisisSus(mesin, RESPON_SUS);
    expect(hasil.selangBawah).not.toBeNull();
    expect(hasil.selangBawah as number).toBeLessThan(hasil.rerata);
    expect(hasil.selangAtas as number).toBeGreaterThan(hasil.rerata);
  });

  it('menolak matriks yang bukan sepuluh butir', async () => {
    await expect(analisisSus(mesin, matriksLikert(10, 8, 3))).rejects.toMatchObject({
      kode: 'sus.bukanSepuluhButir',
    });
  });

  it('menolak jawaban di luar rentang satu sampai lima', async () => {
    const rusak = Array.from({ length: 3 }, () => new Array(10).fill(6));
    await expect(analisisSus(mesin, rusak)).rejects.toMatchObject({
      kode: 'nilai.diLuarRentang',
    });
  });
});
