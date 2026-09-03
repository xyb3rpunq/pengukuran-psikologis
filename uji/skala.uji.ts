/**
 * Uji analisis aitem, skor standar, dan ketiga model penskalaan.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { matriksDikotomi, matriksLikert, mesinUji } from './bantu';
import type { Mesin } from '../src/mesin/mesin';
import {
  analisisAitem,
  analisisGuttman,
  analisisLikert,
  analisisThurstone,
  konversiSkor,
  pilihButirThurstone,
} from '../src/mesin/api';

let mesin: Mesin;
beforeAll(async () => {
  mesin = await mesinUji();
});

describe('analisis aitem', () => {
  it('D = 1 saat hanya kelompok atas yang menjawab benar', async () => {
    const m = [
      [1, 1],
      [1, 1],
      [0, 1],
      [0, 1],
    ];
    const hasil = await analisisAitem(mesin, m, { proporsi: 0.5 });
    expect(hasil.butir[0]?.d).toBe(1);
  });

  it('D = 0 saat semua peserta menjawab sama', async () => {
    const m = [
      [1, 1, 0],
      [1, 0, 0],
      [1, 1, 0],
      [1, 0, 0],
    ];
    const hasil = await analisisAitem(mesin, m, { proporsi: 0.5 });
    // Aitem 1 dijawab benar semua orang, aitem 3 salah semua orang.
    expect(hasil.butir[0]?.d).toBe(0);
    expect(hasil.butir[2]?.d).toBe(0);
  });

  it('D negatif menandai aitem terbalik dan mengategorikannya sebagai dibuang', async () => {
    const m = [
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1],
    ];
    const hasil = await analisisAitem(mesin, m, { proporsi: 0.5 });
    expect(hasil.butir[1]?.d).toBeLessThan(0);
    expect(hasil.butir[1]?.kategoriDayaPembeda).toBe('dibuang');
  });

  it('memilih aturan kelompok modul secara otomatis dari banyak peserta', async () => {
    const kecil = await analisisAitem(mesin, matriksDikotomi(40, 5, 9));
    const besar = await analisisAitem(mesin, matriksDikotomi(120, 5, 9));
    expect(kecil.proporsiKelompok).toBe(0.5);
    expect(besar.proporsiKelompok).toBe(0.27);
  });

  it('D selalu selisih proporsi benar kelompok atas dan bawah', async () => {
    const hasil = await analisisAitem(mesin, matriksDikotomi(50, 8, 17));
    for (const butir of hasil.butir) {
      expect(butir.d).toBeCloseTo(butir.pAtas - butir.pBawah, 12);
    }
  });

  it('menandai layak hanya bila kesukarannya sedang dan daya pembedanya memadai', async () => {
    const hasil = await analisisAitem(mesin, matriksDikotomi(60, 10, 19));
    for (const butir of hasil.butir) {
      const seharusnya =
        butir.kategoriKesukaran === 'sedang' &&
        ['cukup', 'baik', 'baikSekali'].includes(butir.kategoriDayaPembeda ?? '');
      expect(butir.layak).toBe(seharusnya);
    }
  });

  it('hasilnya dapat diulang persis untuk data yang sama', async () => {
    const m = matriksDikotomi(37, 7, 101);
    const a = await analisisAitem(mesin, m);
    const b = await analisisAitem(mesin, m);
    expect(a.butir.map((x) => x.d)).toEqual(b.butir.map((x) => x.d));
  });

  it('menolak matriks yang bukan dikotomi', async () => {
    await expect(analisisAitem(mesin, matriksLikert(10, 4, 3))).rejects.toMatchObject({
      kode: 'matriks.bukanDikotomi',
    });
  });
});

describe('skor standar', () => {
  const skor = [50, 60, 70, 80, 90];

  it('skor z punya rerata nol dan simpangan baku satu', async () => {
    const hasil = await konversiSkor(mesin, skor);
    const z = hasil.peserta.map((p) => p.z);
    const rerata = z.reduce((a, b) => a + b, 0) / z.length;
    expect(rerata).toBeCloseTo(0, 12);
    const sigma = Math.sqrt(z.reduce((a, b) => a + b * b, 0) / z.length);
    expect(sigma).toBeCloseTo(1, 12);
  });

  it('skor T adalah 50 + 10z, jadi reratanya 50', async () => {
    const hasil = await konversiSkor(mesin, skor);
    for (const peserta of hasil.peserta) {
      expect(peserta.t).toBeCloseTo(50 + 10 * peserta.z, 12);
    }
    const rerataT = hasil.peserta.reduce((a, p) => a + p.t, 0) / hasil.peserta.length;
    expect(rerataT).toBeCloseTo(50, 10);
  });

  it('skor tepat di rerata menjadi z = 0, T = 50, dan stanine 5', async () => {
    const hasil = await konversiSkor(mesin, skor);
    const tengah = hasil.peserta.find((p) => p.skorMentah === 70)!;
    expect(tengah.z).toBeCloseTo(0, 12);
    expect(tengah.t).toBeCloseTo(50, 12);
    expect(tengah.stanine).toBe(5);
  });

  it('stanine selalu berada di antara 1 dan 9', async () => {
    const hasil = await konversiSkor(mesin, [1, 2, 3, 4, 5, 50, 95, 96, 97, 98, 99]);
    for (const peserta of hasil.peserta) {
      expect(peserta.stanine).toBeGreaterThanOrEqual(1);
      expect(peserta.stanine).toBeLessThanOrEqual(9);
    }
  });

  it('urutan jenjang persentil mengikuti urutan skor mentah', async () => {
    const hasil = await konversiSkor(mesin, [12, 45, 45, 67, 89, 91]);
    const urut = [...hasil.peserta].sort((a, b) => a.skorMentah - b.skorMentah);
    for (let i = 1; i < urut.length; i += 1) {
      expect(urut[i]!.jenjangPersentil).toBeGreaterThanOrEqual(urut[i - 1]!.jenjangPersentil);
    }
  });

  it('memakai pembagi N-1 saat diminta memperlakukan data sebagai sampel', async () => {
    const populasi = await konversiSkor(mesin, skor, { populasi: true });
    const sampel = await konversiSkor(mesin, skor, { populasi: false });
    // Pembagi lebih kecil berarti simpangan baku lebih besar, jadi z mengecil.
    expect(Math.abs(sampel.peserta[0]!.z)).toBeLessThan(Math.abs(populasi.peserta[0]!.z));
  });

  it('menolak deret tanpa variasi karena z-nya tidak terdefinisi', async () => {
    await expect(konversiSkor(mesin, [70, 70, 70])).rejects.toMatchObject({
      kode: 'data.variansiNol',
    });
  });

  it('memakai label peserta yang diberikan', async () => {
    const hasil = await konversiSkor(mesin, [10, 20, 30], { nama: ['Ani', 'Budi', 'Cita'] });
    expect(hasil.peserta.map((p) => p.nama)).toEqual(['Ani', 'Budi', 'Cita']);
  });
});

describe('skala Thurstone', () => {
  /**
   * Sepuluh penilai, tiga butir. Butir pertama disepakati rendah, butir kedua
   * disepakati tinggi, butir ketiga diperdebatkan — jadi Q butir ketiga wajib
   * paling besar dan justru butir itulah yang harus gugur saat pemilihan.
   */
  const penilaian = [
    [2, 9, 1],
    [2, 9, 11],
    [2, 9, 2],
    [3, 9, 10],
    [2, 10, 1],
    [3, 9, 11],
    [2, 9, 3],
    [2, 10, 9],
    [3, 9, 2],
    [2, 9, 10],
  ];

  it('S butir yang disepakati tinggi lebih besar daripada yang disepakati rendah', async () => {
    const hasil = await analisisThurstone(mesin, penilaian, {
      namaKolom: ['rendah', 'tinggi', 'berdebat'],
    });
    const rendah = hasil.butir.find((b) => b.butir === 'rendah')!;
    const tinggi = hasil.butir.find((b) => b.butir === 'tinggi')!;
    expect(tinggi.s).toBeGreaterThan(rendah.s);
  });

  it('Q butir yang diperdebatkan paling besar', async () => {
    const hasil = await analisisThurstone(mesin, penilaian, {
      namaKolom: ['rendah', 'tinggi', 'berdebat'],
    });
    const berdebat = hasil.butir.find((b) => b.butir === 'berdebat')!;
    for (const butir of hasil.butir) {
      if (butir.butir === 'berdebat') continue;
      expect(berdebat.q).toBeGreaterThan(butir.q);
    }
  });

  it('Q selalu sama dengan K75 dikurangi K25 dan tidak pernah negatif', async () => {
    const hasil = await analisisThurstone(mesin, penilaian);
    for (const butir of hasil.butir) {
      expect(butir.q).toBeCloseTo(butir.k75 - butir.k25, 12);
      expect(butir.q).toBeGreaterThanOrEqual(0);
    }
  });

  it('butir yang semua penilainya sepakat memberi Q nol', async () => {
    const sepakat = Array.from({ length: 8 }, () => [3, 7]);
    const hasil = await analisisThurstone(mesin, sepakat);
    for (const butir of hasil.butir) {
      expect(butir.q).toBe(0);
    }
  });

  it('S berada di dalam rentang skala penilaian', async () => {
    const hasil = await analisisThurstone(mesin, penilaian, { kategori: 11 });
    for (const butir of hasil.butir) {
      expect(butir.s).toBeGreaterThanOrEqual(0.5);
      expect(butir.s).toBeLessThanOrEqual(11.5);
    }
  });

  it('butir terurut naik menurut S', async () => {
    const hasil = await analisisThurstone(mesin, penilaian);
    const s = hasil.butir.map((b) => b.s);
    expect([...s].sort((a, b) => a - b)).toEqual(s);
  });

  it('pemilihan butir menyisakan satu butir per lokasi', async () => {
    const hasil = await pilihButirThurstone(mesin, penilaian, { maksimal: 8 });
    const lokasi = hasil.butir.map((b) => Math.round(b.s));
    expect(new Set(lokasi).size).toBe(lokasi.length);
  });

  it('pemilihan butir tidak pernah memulangkan lebih banyak dari yang diminta', async () => {
    const hasil = await pilihButirThurstone(mesin, penilaian, { maksimal: 2 });
    expect(hasil.terpilih).toBeLessThanOrEqual(2);
  });

  it('menolak penilaian di luar rentang skala', async () => {
    await expect(
      analisisThurstone(mesin, [
        [1, 12],
        [2, 3],
      ]),
    ).rejects.toMatchObject({ kode: 'thurstone.penilaianDiLuarRentang' });
  });

  it('skor responden adalah rerata S butir yang ditandai', async () => {
    const hasil = await mesin.panggil<{ skor: number; banyakDitandai: number }>(
      'ps_skor_thurstone(c(2, 5, 8, 11), c(TRUE, FALSE, TRUE, TRUE))',
    );
    expect(hasil.banyakDitandai).toBe(3);
    expect(hasil.skor).toBeCloseTo((2 + 8 + 11) / 3, 12);
  });

  it('responden yang tidak menandai apa pun tidak diberi skor palsu', async () => {
    const hasil = await mesin.panggil<{ skor: number | null }>(
      'ps_skor_thurstone(c(2, 5, 8), c(FALSE, FALSE, FALSE))',
    );
    expect(hasil.skor).toBeNull();
  });
});

describe('skala Guttman', () => {
  it('menyusun butir termudah lebih dulu di scalogram', async () => {
    const m = [
      [0, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
    ];
    const hasil = await analisisGuttman(mesin, m, ['sulit', 'sedang', 'mudah']);
    expect(hasil.namaButir).toEqual(['mudah', 'sedang', 'sulit']);
    // Proporsi "ya" harus menurun dari kiri ke kanan.
    for (let i = 1; i < hasil.proporsiYa.length; i += 1) {
      expect(hasil.proporsiYa[i]!).toBeLessThanOrEqual(hasil.proporsiYa[i - 1]!);
    }
  });

  it('dimensi skalogram sama dengan dimensi matriks masukan', async () => {
    const m = matriksDikotomi(12, 5, 61);
    const hasil = await analisisGuttman(mesin, m);
    expect(hasil.skalogram).toHaveLength(12);
    for (const baris of hasil.skalogram) {
      expect(baris).toHaveLength(5);
    }
  });

  it('jumlah error per responden sama dengan error total', async () => {
    const hasil = await analisisGuttman(mesin, matriksDikotomi(20, 6, 71));
    const jumlah = hasil.responden.reduce((a, r) => a + r.error, 0);
    expect(jumlah).toBe(hasil.error);
  });

  it('skor responden pada scalogram sama dengan jumlah jawaban ya', async () => {
    const hasil = await analisisGuttman(mesin, matriksDikotomi(15, 5, 73));
    const jumlahSkor = hasil.responden.reduce((a, r) => a + r.skor, 0);
    expect(jumlahSkor).toBe(hasil.jawabanYa);
  });

  it('memulangkan skalabilitas kosong saat semua jawaban ya', async () => {
    const m = [
      [1, 1],
      [1, 1],
      [1, 1],
    ];
    const hasil = await analisisGuttman(mesin, m);
    expect(hasil.x).toBe(0);
    expect(hasil.koefisienSkalabilitas).toBeNull();
  });
});

describe('skala Likert', () => {
  const respon = [
    [5, 1, 4],
    [4, 2, 4],
    [3, 3, 3],
    [2, 4, 2],
    [1, 5, 1],
  ];

  it('membalik butir unfavorable sebelum menjumlahkan', async () => {
    // Butir kedua unfavorable: 1 menjadi 5, 5 menjadi 1. Setelah dibalik,
    // butir kedua bergerak searah butir pertama.
    const hasil = await analisisLikert(mesin, respon, {
      favorable: [true, false, true],
      kategori: 5,
    });
    const butirKedua = hasil.butir[1]!;
    expect(butirKedua.favorable).toBe(false);
    expect(butirKedua.rerataMentah).toBe(3);
    expect(butirKedua.rerataTerskor).toBe(3);
    // Responden pertama: 5 + (6-1) + 4 = 14
    expect(hasil.responden[0]?.total).toBe(14);
  });

  it('tanpa pembalikan, butir berlawanan menghancurkan alpha', async () => {
    const dibalik = await analisisLikert(mesin, respon, { favorable: [true, false, true] });
    const tidak = await analisisLikert(mesin, respon, { favorable: [true, true, true] });
    expect(dibalik.alphaCronbach!).toBeGreaterThan(tidak.alphaCronbach!);
  });

  it('indeks skala adalah persentase terhadap skor maksimum yang mungkin', async () => {
    const hasil = await analisisLikert(mesin, respon, { favorable: [true, false, true] });
    const totalSemua = hasil.responden.reduce((a, r) => a + r.total, 0);
    const maksimum = hasil.n * hasil.skorMaksimumResponden;
    expect(hasil.indeksSkala).toBeCloseTo((totalSemua / maksimum) * 100, 10);
  });

  it('skor maksimum responden adalah banyak butir dikali banyak kategori', async () => {
    const hasil = await analisisLikert(mesin, respon, { kategori: 5 });
    expect(hasil.skorMaksimumResponden).toBe(15);
  });

  it('menganggap semua butir favorable bila tidak disebutkan', async () => {
    const hasil = await analisisLikert(mesin, respon);
    expect(hasil.butir.every((b) => b.favorable)).toBe(true);
  });

  it('menolak nilai di luar rentang kategori', async () => {
    await expect(
      analisisLikert(mesin, [
        [1, 6],
        [2, 3],
      ], { kategori: 5 }),
    ).rejects.toMatchObject({ kode: 'nilai.diLuarRentang' });
  });

  it('mengategorikan indeks pada lima jenjang yang benar', async () => {
    const kode = await mesin.panggil<string[]>(
      'ps_larik(ps_kategori_indeks(c(0, 20, 21, 40, 41, 60, 61, 80, 81, 100)))',
    );
    expect(kode).toEqual([
      'sangatRendah',
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

  it('bekerja pada skala 4 titik tanpa titik tengah', async () => {
    const empat = matriksLikert(20, 6, 91, 4);
    const hasil = await analisisLikert(mesin, empat, { kategori: 4 });
    expect(hasil.kategori).toBe(4);
    expect(hasil.skorMaksimumResponden).toBe(24);
  });
});
