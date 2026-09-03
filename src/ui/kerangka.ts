/**
 * Kerangka halaman kalkulator.
 *
 * Ketujuh alat hitung punya bentuk yang sama: panel data di kiri, panel hasil
 * di kanan, satu tombol Hitung, dan satu tempat galat. Kerangka ini yang
 * memegang bentuk itu sekaligus seluruh keadaan yang menyertainya — sedang
 * memuat, sedang menghitung, gagal — sehingga tiap halaman cukup menjawab dua
 * pertanyaan: bagaimana membaca masukannya, dan bagaimana menggambar hasilnya.
 */
import { el, ganti } from './dom';
import { t, pesanGalat } from '../i18n';
import type { Mesin } from '../mesin/mesin';
import { RalatMasukan } from './masukan';

export interface KonteksKalkulator {
  /** Menyalakan mesin R bila belum menyala, lalu memulangkannya. */
  readonly ambilMesin: () => Promise<Mesin>;
  /** Memberi tahu cangkang bahwa mesin sedang disiapkan. */
  readonly saatMemuat: (sedang: boolean) => void;
}

export interface OpsiKalkulator<M> {
  readonly judul: string;
  readonly penjelasan: string;
  /** Panel masukan; memulangkan pembaca yang melempar RalatMasukan bila salah. */
  readonly panel: () => { readonly simpul: HTMLElement; readonly baca: () => M };
  readonly hitung: (mesin: Mesin, masukan: M) => Promise<HTMLElement>;
  /** Isi ulang panel dengan data contoh, lalu hitung sekali. */
  readonly muatContoh?: () => void;
  /** Hitung otomatis saat halaman dibuka, memakai isi bidang bawaannya. */
  readonly hitungOtomatis?: boolean;
}

export function bangunKalkulator<M>(
  konteks: KonteksKalkulator,
  opsi: OpsiKalkulator<M>,
): HTMLElement {
  const { simpul: panelMasukan, baca } = opsi.panel();
  const wadahHasil = el('div', { kelas: 'wadah-hasil' });
  const wadahGalat = el('div', { kelas: 'galat', aria: { live: 'polite' } });
  let sedangHitung = false;

  function tampilkanGalat(pesan: string | null): void {
    if (pesan === null) {
      wadahGalat.textContent = '';
      wadahGalat.classList.remove('tampil');
      return;
    }
    wadahGalat.textContent = pesan;
    wadahGalat.classList.add('tampil');
  }

  async function jalankan(): Promise<void> {
    if (sedangHitung) return;
    sedangHitung = true;
    tampilkanGalat(null);

    let masukan: M;
    try {
      masukan = baca();
    } catch (galat) {
      sedangHitung = false;
      const kode = galat instanceof RalatMasukan ? galat.kode : 'takDikenal';
      tampilkanGalat(pesanGalat(kode));
      return;
    }

    ganti(wadahHasil, el('div', { kelas: 'menunggu' }, t('umum.menghitung')));
    try {
      konteks.saatMemuat(true);
      const mesin = await konteks.ambilMesin();
      konteks.saatMemuat(false);
      const hasil = await opsi.hitung(mesin, masukan);
      ganti(wadahHasil, hasil);
    } catch (galat) {
      konteks.saatMemuat(false);
      const kode = (galat as { kode?: string }).kode ?? 'takDikenal';
      ganti(wadahHasil, el('div', { kelas: 'kosong' }, t('umum.belumAdaHasil')));
      tampilkanGalat(pesanGalat(kode));
    } finally {
      sedangHitung = false;
    }
  }

  const tombolHitung = el(
    'button',
    { tipe: 'button', kelas: 'tombol utama', saat: { click: () => void jalankan() } },
    t('umum.hitung'),
  );

  const aksi = el('div', { kelas: 'aksi-panel' }, tombolHitung);
  if (opsi.muatContoh !== undefined) {
    aksi.appendChild(
      el(
        'button',
        {
          tipe: 'button',
          kelas: 'tombol',
          saat: {
            click: () => {
              opsi.muatContoh?.();
              void jalankan();
            },
          },
        },
        t('umum.muatContoh'),
      ),
    );
  }

  ganti(wadahHasil, el('div', { kelas: 'kosong' }, t('umum.belumAdaHasil')));

  // Perhitungan pertama dijadwalkan setelah pohon ini dipasang ke halaman,
  // bukan di tengah perakitannya, supaya halaman muncul lengkap lebih dulu.
  //
  // setTimeout, bukan requestAnimationFrame. Peramban tidak pernah menjalankan
  // callback rAF pada tab yang tidak terlihat, jadi halaman yang dibuka di tab
  // latar akan berhenti selamanya di keadaan "belum ada hasil" — dan baru
  // ketahuan saat pengguna berpindah ke tab itu dan menemukannya kosong.
  // setTimeout tetap berjalan di tab latar, hanya dilambatkan.
  if (opsi.hitungOtomatis === true) {
    setTimeout(() => void jalankan(), 0);
  }

  return el(
    'div',
    { kelas: 'halaman kalkulator' },
    el(
      'header',
      { kelas: 'kepala-halaman' },
      el('h1', {}, opsi.judul),
      el('p', { kelas: 'penjelasan' }, opsi.penjelasan),
    ),
    el(
      'div',
      { kelas: 'meja' },
      el(
        'aside',
        { kelas: 'panel-data' },
        el('h2', {}, t('umum.data')),
        panelMasukan,
        aksi,
        wadahGalat,
      ),
      el('div', { kelas: 'panel-hasil' }, wadahHasil),
    ),
  );
}
