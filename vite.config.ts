import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/pengukuran-psikologis/',
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
  },
  // Runtime R (R.wasm, vfs, pekerja) dilayani dari asal yang sama dengan
  // situsnya, bukan dari CDN pihak ketiga. Skrip salin-runtime.mjs menaruhnya
  // di dist/webr/ setelah build.
  test: {
    environment: 'node',
    include: ['uji/**/*.uji.ts'],
    // WebR menyalakan satu proses R lengkap. Satu proses tunggal untuk seluruh
    // berkas uji berarti R dinyalakan sekali, bukan sekali per berkas.
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 60_000,
    hookTimeout: 120_000,
    globalSetup: ['./uji/siapkan.ts'],
  },
});
