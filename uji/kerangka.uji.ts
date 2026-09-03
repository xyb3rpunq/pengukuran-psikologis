/**
 * Uji kerangka halaman kalkulator.
 *
 * Berkas ini ada karena satu bug yang lolos dari seluruh uji lain dan baru
 * ketahuan saat situsnya dibuka sungguhan: perhitungan pertama dijadwalkan
 * lewat requestAnimationFrame, dan peramban tidak pernah menjalankan callback
 * rAF pada tab yang tidak terlihat. Halaman yang dibuka di tab latar berhenti
 * selamanya di keadaan "belum ada hasil", dan pengguna baru menemukannya
 * kosong ketika ia berpindah ke tab itu.
 *
 * Uji di bawah menirukan keadaan itu dengan tepat: requestAnimationFrame
 * dipasang sebagai fungsi yang tidak pernah memanggil balik.
 */
import { JSDOM } from 'jsdom';
import { beforeAll, describe, expect, it } from 'vitest';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://uji.local/',
});

function pasangGlobal(nama: string, nilai: unknown): void {
  Object.defineProperty(globalThis, nama, { value: nilai, writable: true, configurable: true });
}

pasangGlobal('window', dom.window);
pasangGlobal('document', dom.window.document);
pasangGlobal('navigator', dom.window.navigator);
pasangGlobal('localStorage', dom.window.localStorage);
pasangGlobal('Node', dom.window.Node);
// Inilah tab yang tidak terlihat: rAF menerima callback lalu melupakannya.
pasangGlobal('requestAnimationFrame', (): number => 0);

type Kerangka = typeof import('../src/ui/kerangka');
let bangunKalkulator: Kerangka['bangunKalkulator'];

beforeAll(async () => {
  ({ bangunKalkulator } = await import('../src/ui/kerangka'));
});

/** Beri kesempatan tugas mikro dan setTimeout(0) selesai berjalan. */
async function tunggu(): Promise<void> {
  await new Promise((selesai) => setTimeout(selesai, 5));
}

function konteksPalsu(): Parameters<typeof bangunKalkulator>[0] {
  return {
    ambilMesin: () => Promise.resolve({} as never),
    saatMemuat: () => {},
  };
}

describe('perhitungan otomatis', () => {
  it('tetap berjalan walau requestAnimationFrame tidak pernah memanggil balik', async () => {
    let dipanggil = 0;
    const simpul = bangunKalkulator<number>(konteksPalsu(), {
      judul: 'judul',
      penjelasan: 'penjelasan',
      hitungOtomatis: true,
      panel: () => ({ simpul: document.createElement('div'), baca: () => 1 }),
      hitung: async () => {
        dipanggil += 1;
        const hasil = document.createElement('div');
        hasil.textContent = 'selesai';
        return hasil;
      },
    });
    document.body.appendChild(simpul);

    await tunggu();
    expect(dipanggil).toBe(1);
    expect(simpul.textContent).toContain('selesai');
  });

  it('tidak menghitung apa-apa bila hitungOtomatis tidak diminta', async () => {
    let dipanggil = 0;
    bangunKalkulator<number>(konteksPalsu(), {
      judul: 'judul',
      penjelasan: 'penjelasan',
      panel: () => ({ simpul: document.createElement('div'), baca: () => 1 }),
      hitung: async () => {
        dipanggil += 1;
        return document.createElement('div');
      },
    });

    await tunggu();
    expect(dipanggil).toBe(0);
  });

  it('menampilkan galat masukan tanpa pernah menyentuh mesin', async () => {
    const { RalatMasukan } = await import('../src/ui/masukan');
    let mesinDiminta = 0;
    const simpul = bangunKalkulator<number>(
      {
        ambilMesin: () => {
          mesinDiminta += 1;
          return Promise.resolve({} as never);
        },
        saatMemuat: () => {},
      },
      {
        judul: 'judul',
        penjelasan: 'penjelasan',
        hitungOtomatis: true,
        panel: () => ({
          simpul: document.createElement('div'),
          baca: () => {
            throw new RalatMasukan('matriks.bukanDikotomi');
          },
        }),
        hitung: async () => document.createElement('div'),
      },
    );

    await tunggu();
    // Masukan yang salah tidak perlu menyalakan proses R seberat itu untuk
    // ditolak; penolakannya sudah pasti sebelum satu angka pun dihitung.
    expect(mesinDiminta).toBe(0);
    const galat = simpul.querySelector('.galat');
    expect(galat?.classList.contains('tampil')).toBe(true);
    expect(galat?.textContent ?? '').not.toBe('');
  });

  it('memulihkan diri setelah mesin gagal, dan tetap bisa dihitung ulang', async () => {
    let gagalDulu = true;
    let dipanggil = 0;
    const simpul = bangunKalkulator<number>(konteksPalsu(), {
      judul: 'judul',
      penjelasan: 'penjelasan',
      hitungOtomatis: true,
      panel: () => ({ simpul: document.createElement('div'), baca: () => 1 }),
      hitung: async () => {
        dipanggil += 1;
        if (gagalDulu) {
          gagalDulu = false;
          throw Object.assign(new Error('data.kosong'), { kode: 'data.kosong' });
        }
        const hasil = document.createElement('div');
        hasil.textContent = 'selesai';
        return hasil;
      },
    });
    document.body.appendChild(simpul);

    await tunggu();
    expect(dipanggil).toBe(1);
    expect(simpul.querySelector('.galat')?.classList.contains('tampil')).toBe(true);

    const tombol = simpul.querySelector('button.utama') as HTMLButtonElement;
    tombol.click();
    await tunggu();

    expect(dipanggil).toBe(2);
    expect(simpul.textContent).toContain('selesai');
    expect(simpul.querySelector('.galat')?.classList.contains('tampil')).toBe(false);
  });
});
