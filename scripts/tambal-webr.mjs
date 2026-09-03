/**
 * Tambalan WebR untuk Node.js di Windows.
 *
 * `webr-worker.js` memuat runtime R dengan `await import(path.resolve(berkas))`.
 * Di Windows hasilnya berupa jalur bergaya `C:\...\R.js`, dan pemuat ESM Node
 * menolaknya:
 *
 *   Only URLs with a scheme in: file, data, and node are supported by the
 *   default ESM loader. Received protocol 'c:'
 *
 * Tambalan ini membungkus jalur itu dengan `pathToFileURL(...).href` sehingga
 * WebR bisa dijalankan dari Node. Efeknya: berkas R yang sama diuji di terminal
 * dan dijalankan di peramban — tidak ada dua salinan rumus. Idempoten, aman
 * dipanggil berulang. Di Linux dan macOS berkasnya tidak disentuh sama sekali,
 * jadi CI tetap memakai WebR asli tanpa modifikasi.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ASLI = 'await import((await import("path")).default.resolve(e))';
const TAMBALAN =
  'await import((await import("url")).pathToFileURL((await import("path")).default.resolve(e)).href)';

export function berkasPekerja() {
  const require = createRequire(import.meta.url);
  return path.join(path.dirname(require.resolve('webr')), 'webr-worker.js');
}

/**
 * @param {string} [berkas]
 * @returns {'dilewati'|'sudah'|'ditambal'}
 */
export function tambal(berkas = berkasPekerja()) {
  if (process.platform !== 'win32') return 'dilewati';
  const isi = readFileSync(berkas, 'utf8');
  if (isi.includes(TAMBALAN)) return 'sudah';
  if (!isi.includes(ASLI)) return 'dilewati';
  writeFileSync(berkas, isi.replace(ASLI, TAMBALAN), 'utf8');
  return 'ditambal';
}

const dijalankanLangsung =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (dijalankanLangsung) {
  console.log(`tambal-webr: ${tambal()}`);
}
