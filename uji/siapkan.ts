/**
 * Persiapan global sebelum uji dijalankan.
 *
 * WebR di Node/Windows perlu satu tambalan agar runtime R bisa dimuat. Itu
 * dikerjakan di sini, bukan sebagai postinstall npm, supaya sekali `npm test`
 * dijalankan di mesin bersih hasilnya tetap sama tanpa langkah manual.
 */
import { tambal } from '../scripts/tambal-webr.mjs';

export default function siapkan(): void {
  const status = tambal();
  if (status === 'ditambal') {
    console.log('[siapkan] webr ditambal untuk Node di Windows');
  }
}
