/**
 * Salin runtime WebR ke dalam hasil build.
 *
 * Berkas R.wasm, filesystem virtual, dan skrip pekerja tidak dilewatkan ke
 * bundler: mereka aset biner yang dimuat WebR sendiri lewat baseUrl saat
 * dijalankan. Skrip ini menaruhnya di dist/webr/ supaya seluruh runtime
 * dilayani dari asal yang sama dengan situsnya.
 *
 * Alasan tidak memakai CDN: halaman ini boleh dibuka tanpa satu pun permintaan
 * ke pihak ketiga. Klaim "data kamu tidak ke mana-mana" di halaman Metode
 * hanya benar kalau runtime-nya pun tidak diambil dari server orang lain.
 *
 * Binernya juga tidak ikut masuk repositori — repositori hanya menyimpan
 * ketergantungan npm-nya, dan alur kerja deploy menjalankan skrip ini.
 */
import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const asal = path.dirname(require.resolve('webr'));
const tujuan = path.resolve('dist', 'webr');

async function ukuranTotal(direktori) {
  let total = 0;
  for (const isi of await readdir(direktori, { withFileTypes: true })) {
    const jalur = path.join(direktori, isi.name);
    total += isi.isDirectory() ? await ukuranTotal(jalur) : (await stat(jalur)).size;
  }
  return total;
}

await mkdir(tujuan, { recursive: true });
await cp(asal, tujuan, { recursive: true });

const megabyte = (await ukuranTotal(tujuan)) / 1024 / 1024;
console.log(`runtime WebR disalin ke dist/webr (${megabyte.toFixed(1)} MB)`);
