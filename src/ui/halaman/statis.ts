/**
 * Halaman yang tidak menghitung apa-apa: beranda dan metode.
 *
 * Keduanya sengaja tidak menyentuh mesin R, jadi tampil seketika sementara
 * runtime R masih diunduh di latar belakang.
 */
import { el } from '../dom';
import { t } from '../../i18n';
import { SESI } from '../../data/modul';
import { kurvaNormal } from '../visual';

interface Pintu {
  readonly rute: string;
  readonly judul: string;
  readonly isi: string;
  readonly ikon: string;
}

function pintu(): readonly Pintu[] {
  return [
    { rute: '#/aitem', judul: t('nav.aitem'), isi: t('beranda.kartuAitem'), ikon: 'P·D' },
    { rute: '#/validitas', judul: t('nav.validitas'), isi: t('beranda.kartuValiditas'), ikon: 'r' },
    { rute: '#/reliabilitas', judul: t('nav.reliabilitas'), isi: t('beranda.kartuReliabilitas'), ikon: 'α' },
    { rute: '#/skor', judul: t('nav.skor'), isi: t('beranda.kartuSkor'), ikon: 'z·T' },
    { rute: '#/thurstone', judul: t('nav.thurstone'), isi: t('beranda.kartuThurstone'), ikon: 'S·Q' },
    { rute: '#/guttman', judul: t('nav.guttman'), isi: t('beranda.kartuGuttman'), ikon: 'Kr' },
    { rute: '#/likert', judul: t('nav.likert'), isi: t('beranda.kartuLikert'), ikon: '1–5' },
    { rute: '#/tabel-r', judul: t('nav.tabelR'), isi: t('beranda.kartuTabelR'), ikon: 'r∗' },
    { rute: '#/modul', judul: t('nav.modul'), isi: t('beranda.kartuModul'), ikon: '14' },
  ];
}

export function halamanBeranda(): HTMLElement {
  return el(
    'div',
    { kelas: 'halaman' },
    el(
      'header',
      { kelas: 'hero' },
      el('p', { kelas: 'kapsul' }, t('situs.matkul')),
      el('h1', {}, t('beranda.judul')),
      el('p', { kelas: 'penjelasan besar' }, t('beranda.intro')),
      el(
        'div',
        { kelas: 'angka-baris' },
        el('div', { kelas: 'angka-ringkas' }, el('strong', {}, '162'), el('span', {}, t('beranda.angkaUji'))),
        el('div', { kelas: 'angka-ringkas' }, el('strong', {}, '30+'), el('span', {}, t('beranda.angkaRumus'))),
        el('div', { kelas: 'angka-ringkas' }, el('strong', {}, String(SESI.length)), el('span', {}, t('beranda.angkaSesi'))),
        el('div', { kelas: 'angka-ringkas' }, el('strong', {}, '0'), el('span', {}, t('beranda.angkaJaringan'))),
      ),
    ),
    el(
      'div',
      { kelas: 'bingkai-visual sorot' },
      kurvaNormal(
        {
          judul: t('skor.judulKurva'),
          stanine: t('skor.barisStanine'),
          persentil: t('skor.barisPersentil'),
        },
        [{ z: 1, label: 'z 1 · T 60' }],
      ),
    ),
    el(
      'div',
      { kelas: 'kisi-pintu' },
      ...pintu().map((satu) =>
        el(
          'a',
          { kelas: 'pintu', href: satu.rute },
          el('span', { kelas: 'pintu-ikon' }, satu.ikon),
          el('span', { kelas: 'pintu-judul' }, satu.judul),
          el('span', { kelas: 'pintu-isi' }, satu.isi),
        ),
      ),
    ),
  );
}

function lapis(judul: string, isi: string, nomor: string): HTMLElement {
  return el(
    'article',
    { kelas: 'lapis' },
    el('span', { kelas: 'lapis-nomor' }, nomor),
    el('div', {}, el('h3', {}, judul), el('p', {}, isi)),
  );
}

function temuan(judul: string, isi: string): HTMLElement {
  return el('article', { kelas: 'temuan' }, el('h3', {}, judul), el('p', {}, isi));
}

function barisTumpukan(label: string, isi: string): HTMLElement {
  return el(
    'div',
    { kelas: 'baris-tumpukan' },
    el('span', { kelas: 'tumpukan-label' }, label),
    el('span', { kelas: 'tumpukan-isi' }, isi),
  );
}

export function halamanMetode(): HTMLElement {
  return el(
    'div',
    { kelas: 'halaman' },
    el('header', { kelas: 'kepala-halaman' }, el('h1', {}, t('metode.judul'))),
    el(
      'section',
      { kelas: 'kartu' },
      el('h2', {}, t('metode.lapisJudul')),
      el(
        'div',
        { kelas: 'daftar-lapis' },
        lapis(t('metode.lapis1Judul'), t('metode.lapis1'), '1'),
        lapis(t('metode.lapis2Judul'), t('metode.lapis2'), '2'),
        lapis(t('metode.lapis3Judul'), t('metode.lapis3'), '3'),
      ),
    ),
    el(
      'section',
      { kelas: 'kartu' },
      el('h2', {}, t('metode.temuanJudul')),
      el(
        'div',
        { kelas: 'kisi-temuan' },
        temuan(t('metode.temuan1Judul'), t('metode.temuan1')),
        temuan(t('metode.temuan2Judul'), t('metode.temuan2')),
        temuan(t('metode.temuan3Judul'), t('metode.temuan3')),
        temuan(t('metode.temuan4Judul'), t('metode.temuan4')),
      ),
    ),
    el(
      'section',
      { kelas: 'kartu' },
      el('h2', {}, t('metode.tumpukanJudul')),
      el(
        'div',
        { kelas: 'daftar-tumpukan' },
        barisTumpukan(t('metode.tumpukanMesin'), t('metode.tumpukanMesinIsi')),
        barisTumpukan(t('metode.tumpukanRuntime'), t('metode.tumpukanRuntimeIsi')),
        barisTumpukan(t('metode.tumpukanCangkang'), t('metode.tumpukanCangkangIsi')),
        barisTumpukan(t('metode.tumpukanUji'), t('metode.tumpukanUjiIsi')),
        barisTumpukan(t('metode.tumpukanBanding'), t('metode.tumpukanBandingIsi')),
      ),
    ),
    el(
      'section',
      { kelas: 'kartu' },
      el('h2', {}, t('metode.privasiJudul')),
      el('p', { kelas: 'penjelasan' }, t('metode.privasi')),
    ),
  );
}
