/**
 * Pembuat elemen seadanya.
 *
 * Proyek ini tidak memakai kerangka kerja UI. Halamannya sedikit, keadaannya
 * sederhana, dan seluruh kerja beratnya ada di mesin R — menambah kerangka
 * kerja hanya akan menambah beban unduh di atas runtime R yang sudah besar.
 * Yang dibutuhkan cuma satu fungsi yang membuat elemen tanpa innerHTML,
 * sehingga teks apa pun dari pengguna tidak pernah menjadi markup.
 */

type Anak = Node | string | number | null | undefined | false;

export interface Atribut {
  readonly kelas?: string | undefined;
  readonly id?: string | undefined;
  readonly tipe?: string | undefined;
  readonly nilai?: string | undefined;
  readonly href?: string | undefined;
  readonly judul?: string | undefined;
  readonly peran?: string | undefined;
  readonly rentangKolom?: number | undefined;
  readonly baris?: number | undefined;
  readonly petunjuk?: string | undefined;
  readonly aria?: Readonly<Record<string, string>> | undefined;
  readonly data?: Readonly<Record<string, string>> | undefined;
  readonly saat?: Readonly<Record<string, (peristiwa: Event) => void>> | undefined;
}

const PETA_ATRIBUT: Record<string, string> = {
  kelas: 'class',
  id: 'id',
  tipe: 'type',
  href: 'href',
  judul: 'title',
  peran: 'role',
  rentangKolom: 'colspan',
  baris: 'rows',
  petunjuk: 'placeholder',
};

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  atribut: Atribut = {},
  ...anak: Anak[]
): HTMLElementTagNameMap[K] {
  const simpul = document.createElement(tag);

  for (const [kunci, nilai] of Object.entries(atribut)) {
    if (nilai === undefined || nilai === null) continue;
    if (kunci === 'nilai') {
      (simpul as HTMLInputElement).value = String(nilai);
      continue;
    }
    if (kunci === 'aria') {
      for (const [nama, isi] of Object.entries(nilai as Record<string, string>)) {
        simpul.setAttribute(`aria-${nama}`, isi);
      }
      continue;
    }
    if (kunci === 'data') {
      for (const [nama, isi] of Object.entries(nilai as Record<string, string>)) {
        simpul.dataset[nama] = isi;
      }
      continue;
    }
    if (kunci === 'saat') {
      for (const [nama, tangani] of Object.entries(
        nilai as Record<string, (peristiwa: Event) => void>,
      )) {
        simpul.addEventListener(nama, tangani);
      }
      continue;
    }
    const namaAtribut = PETA_ATRIBUT[kunci];
    if (namaAtribut !== undefined) simpul.setAttribute(namaAtribut, String(nilai));
  }

  tambah(simpul, anak);
  return simpul;
}

export function tambah(induk: Node, anak: readonly Anak[]): void {
  for (const isi of anak) {
    if (isi === null || isi === undefined || isi === false) continue;
    // String dan angka selalu lewat createTextNode, tidak pernah innerHTML.
    induk.appendChild(typeof isi === 'object' ? isi : document.createTextNode(String(isi)));
  }
}

export function kosongkan(simpul: Element): void {
  while (simpul.firstChild) simpul.removeChild(simpul.firstChild);
}

export function ganti(simpul: Element, ...anak: Anak[]): void {
  kosongkan(simpul);
  tambah(simpul, anak);
}
