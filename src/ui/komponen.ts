/**
 * Komponen tampilan yang dipakai berulang di semua halaman.
 */
import { el } from './dom';
import { angka, bulat, t } from '../i18n';
import { RalatMasukan, bacaBerkas } from './masukan';

export interface KolomTabel<T> {
  readonly kunci: string;
  readonly judul: string;
  readonly angka?: boolean;
  readonly nilai: (baris: T, indeks: number) => string;
  readonly kelas?: (baris: T) => string | undefined;
}

/** Tabel hasil dengan kepala tetap dan tombol unduh CSV. */
export function tabel<T>(
  kolom: readonly KolomTabel<T>[],
  data: readonly T[],
  namaBerkas: string,
): HTMLElement {
  const kepala = el(
    'thead',
    {},
    el(
      'tr',
      {},
      ...kolom.map((k) => el('th', { kelas: k.angka === true ? 'angka' : undefined }, k.judul)),
    ),
  );

  const badan = el(
    'tbody',
    {},
    ...data.map((baris, i) =>
      el(
        'tr',
        {},
        ...kolom.map((k) =>
          el(
            'td',
            {
              kelas: [k.angka === true ? 'angka' : '', k.kelas?.(baris) ?? '']
                .filter(Boolean)
                .join(' ') || undefined,
            },
            k.nilai(baris, i),
          ),
        ),
      ),
    ),
  );

  return el(
    'div',
    { kelas: 'blok-tabel' },
    el(
      'div',
      { kelas: 'aksi-tabel' },
      el(
        'button',
        {
          tipe: 'button',
          kelas: 'tombol kecil',
          saat: { click: () => unduhCsv(kolom, data, namaBerkas) },
        },
        t('umum.unduhCsv'),
      ),
    ),
    el('div', { kelas: 'gulung' }, el('table', {}, kepala, badan)),
  );
}

/** Ekspor tabel apa adanya ke CSV, memakai pemisah yang sesuai bahasanya. */
export function unduhCsv<T>(
  kolom: readonly KolomTabel<T>[],
  data: readonly T[],
  namaBerkas: string,
): void {
  // Angka dalam bahasa Indonesia memakai koma desimal, jadi pemisah kolomnya
  // titik koma — persis yang diharapkan Excel dengan pengaturan wilayah
  // Indonesia. Memakai koma di kedua kasus akan memecah kolom di tempat salah.
  const pemisah = t('umum.bahasa') === 'EN' ? ';' : ',';
  const lolos = (isi: string): string =>
    /["\n;,]/.test(isi) ? `"${isi.replace(/"/g, '""')}"` : isi;

  const garis = [
    kolom.map((k) => lolos(k.judul)).join(pemisah),
    ...data.map((baris, i) => kolom.map((k) => lolos(k.nilai(baris, i))).join(pemisah)),
  ];

  // BOM UTF-8 supaya Excel membaca huruf beraksen dengan benar.
  const berkas = new Blob(['﻿', garis.join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const tautan = el('a', { href: URL.createObjectURL(berkas) });
  tautan.download = `${namaBerkas}.csv`;
  document.body.appendChild(tautan);
  tautan.click();
  document.body.removeChild(tautan);
  URL.revokeObjectURL(tautan.href);
}

export interface Angka {
  readonly label: string;
  readonly nilai: string;
  readonly catatan?: string;
  readonly nada?: 'baik' | 'buruk' | 'netral';
}

/** Deretan angka penting di kepala hasil. */
export function papanAngka(daftar: readonly Angka[]): HTMLElement {
  return el(
    'div',
    { kelas: 'papan-angka' },
    ...daftar.map((satu) =>
      el(
        'div',
        { kelas: `angka-kartu ${satu.nada ?? 'netral'}` },
        el('div', { kelas: 'angka-label' }, satu.label),
        el('div', { kelas: 'angka-nilai' }, satu.nilai),
        satu.catatan !== undefined ? el('div', { kelas: 'angka-catatan' }, satu.catatan) : null,
      ),
    ),
  );
}

export function kartu(judul: string, ...isi: (Node | string | null)[]): HTMLElement {
  return el('section', { kelas: 'kartu' }, el('h2', {}, judul), ...isi);
}

export function catatan(isi: string): HTMLElement {
  return el('p', { kelas: 'catatan' }, isi);
}

export function lencana(isi: string, nada: 'baik' | 'buruk' | 'netral' = 'netral'): HTMLElement {
  return el('span', { kelas: `lencana ${nada}` }, isi);
}

/** Bidang teks berlabel dengan petunjuk pengisian di bawahnya. */
export function bidangTeks(
  label: string,
  petunjuk: string,
  nilai: string,
  baris = 8,
): { pembungkus: HTMLElement; bidang: HTMLTextAreaElement } {
  const bidang = el('textarea', { kelas: 'bidang', baris, nilai });
  bidang.value = nilai;
  return {
    pembungkus: el(
      'label',
      { kelas: 'bidang-label' },
      el('span', { kelas: 'label-teks' }, label),
      bidang,
      el('span', { kelas: 'label-petunjuk' }, petunjuk),
    ),
    bidang,
  };
}

export function bidangSatuBaris(
  label: string,
  petunjuk: string,
  nilai: string,
): { pembungkus: HTMLElement; bidang: HTMLInputElement } {
  const bidang = el('input', { kelas: 'bidang', tipe: 'text', nilai });
  bidang.value = nilai;
  return {
    pembungkus: el(
      'label',
      { kelas: 'bidang-label' },
      el('span', { kelas: 'label-teks' }, label),
      bidang,
      el('span', { kelas: 'label-petunjuk' }, petunjuk),
    ),
    bidang,
  };
}

export function pilihan(
  label: string,
  opsi: readonly { readonly nilai: string; readonly teks: string }[],
  terpilih: string,
): { pembungkus: HTMLElement; bidang: HTMLSelectElement } {
  const bidang = el(
    'select',
    { kelas: 'bidang' },
    ...opsi.map((o) => {
      const pilih = el('option', { nilai: o.nilai }, o.teks);
      pilih.value = o.nilai;
      if (o.nilai === terpilih) pilih.selected = true;
      return pilih;
    }),
  );
  return {
    pembungkus: el(
      'label',
      { kelas: 'bidang-label' },
      el('span', { kelas: 'label-teks' }, label),
      bidang,
    ),
    bidang,
  };
}

export function kotakCentang(
  label: string,
  tercentang: boolean,
): { pembungkus: HTMLElement; bidang: HTMLInputElement } {
  const bidang = el('input', { tipe: 'checkbox' });
  bidang.checked = tercentang;
  return {
    pembungkus: el('label', { kelas: 'centang' }, bidang, el('span', {}, label)),
    bidang,
  };
}

export { angka, bulat };

/**
 * Zona seret-dan-lepas untuk mengimpor berkas CSV.
 *
 * Menempel data dari Excel sudah bekerja, tapi orang yang punya berkas .csv
 * harus membukanya dulu di suatu tempat untuk bisa menyalinnya. Zona ini
 * memotong langkah itu. Seluruh pembacaan terjadi di dalam peramban lewat
 * FileReader — berkasnya tidak pernah dikirim ke mana pun.
 */
export function zonaImpor(
  bidangData: HTMLTextAreaElement,
  bidangNama: HTMLInputElement | undefined,
  saatGagal: (kode: string) => void,
): HTMLElement {
  const masukanBerkas = el('input', { tipe: 'file', kelas: 'berkas-tersembunyi' });
  masukanBerkas.accept = '.csv,.tsv,.txt,text/csv,text/plain';

  const zona = el(
    'div',
    { kelas: 'zona-impor', peran: 'button', judul: t('masukan.imporBerkas') },
    el('span', { kelas: 'zona-judul' }, t('masukan.imporBerkas')),
    el('span', { kelas: 'zona-petunjuk' }, t('masukan.petunjukImpor')),
    masukanBerkas,
  );
  zona.tabIndex = 0;

  function terapkan(isi: string): void {
    try {
      const hasil = bacaBerkas(isi);
      bidangData.value = hasil.baris;
      if (bidangNama !== undefined && hasil.namaKolom !== undefined) {
        bidangNama.value = hasil.namaKolom;
      }
      zona.classList.remove('gagal');
    } catch (galat) {
      zona.classList.add('gagal');
      saatGagal(galat instanceof RalatMasukan ? galat.kode : 'berkas.takTerbaca');
    }
  }

  function muat(berkas: File | undefined): void {
    if (berkas === undefined) return;
    const pembaca = new FileReader();
    pembaca.onload = () => terapkan(String(pembaca.result ?? ''));
    pembaca.onerror = () => saatGagal('berkas.takTerbaca');
    pembaca.readAsText(berkas);
  }

  masukanBerkas.addEventListener('change', () => {
    muat(masukanBerkas.files?.[0]);
    // Dikosongkan supaya memilih berkas yang sama dua kali tetap memicu event.
    masukanBerkas.value = '';
  });
  zona.addEventListener('click', (peristiwa) => {
    if (peristiwa.target !== masukanBerkas) masukanBerkas.click();
  });
  zona.addEventListener('keydown', (peristiwa) => {
    const tombol = (peristiwa as KeyboardEvent).key;
    if (tombol === 'Enter' || tombol === ' ') {
      peristiwa.preventDefault();
      masukanBerkas.click();
    }
  });
  zona.addEventListener('dragover', (peristiwa) => {
    peristiwa.preventDefault();
    zona.classList.add('menerima');
  });
  zona.addEventListener('dragleave', () => zona.classList.remove('menerima'));
  zona.addEventListener('drop', (peristiwa) => {
    peristiwa.preventDefault();
    zona.classList.remove('menerima');
    muat((peristiwa as DragEvent).dataTransfer?.files?.[0]);
  });

  return zona;
}
