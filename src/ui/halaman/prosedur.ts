/**
 * Dua alat yang bentuknya prosedur, bukan rumus tunggal.
 *
 * Analisis distraktor adalah bagian ketiga dari analisis soal yang disebut
 * sesi 7 — "taraf kesukaran, daya pembeda dan pola jawaban soal" — dan satu-
 * satunya dari ketiganya yang tidak pernah dijabarkan rumusnya, karena memang
 * tidak ada rumusnya. Yang ada hanya aturan membaca.
 *
 * Seleksi butir adalah langkah ke-11 sesi 2, "revisi instrumen", yang di modul
 * berupa satu kalimat dan di kenyataan berupa perulangan yang harus dijalankan
 * dengan hati-hati.
 */
import { el } from '../dom';
import { angka, bulat, namaKategori, t } from '../../i18n';
import {
  bidangSatuBaris,
  bidangTeks,
  catatan,
  kartu,
  lencana,
  papanAngka,
  pilihan,
  tabel,
  zonaImpor,
} from '../komponen';
import { bacaAngka, bacaDeret, bacaLabel, bacaMatriks, matriksKeTeks } from '../masukan';
import { bangunKalkulator, type KonteksKalkulator } from '../kerangka';
import { petaDistraktor, tanggaAlpha } from '../visual';
import * as api from '../../mesin/api';
import * as contoh from '../../data/contoh';

// --- Analisis distraktor ---------------------------------------------------

interface MasukanDistraktor {
  readonly matriks: number[][];
  readonly kunci: number[];
  readonly banyakPilihan: number;
  readonly namaKolom: string[] | undefined;
}

export function halamanDistraktor(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanDistraktor>(konteks, {
    judul: t('distraktor.judul'),
    penjelasan: t('distraktor.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.PILIHAN_GANDA),
        10,
      );
      const nama = bidangSatuBaris(
        t('masukan.namaKolom'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_BUTIR_PG.join(', '),
      );
      const kunci = bidangSatuBaris(
        t('masukan.kunciJawaban'),
        t('masukan.petunjukKunci'),
        contoh.KUNCI_PILIHAN_GANDA.join(', '),
      );
      const opsi = bidangSatuBaris(t('masukan.banyakPilihan'), '', '5');
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, nama.bidang, laporGalat),
          data.pembungkus,
          nama.pembungkus,
          kunci.pembungkus,
          opsi.pembungkus,
        ),
        baca: () => ({
          matriks: bacaMatriks(data.bidang.value),
          kunci: bacaDeret(kunci.bidang.value),
          banyakPilihan: bacaAngka(opsi.bidang.value, 5),
          namaKolom: bacaLabel(nama.bidang.value),
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const opsi: { banyakPilihan: number; namaKolom?: readonly string[] } = {
        banyakPilihan: masukan.banyakPilihan,
      };
      if (masukan.namaKolom !== undefined) opsi.namaKolom = masukan.namaKolom;
      const hasil = await api.analisisDistraktor(mesin, masukan.matriks, masukan.kunci, opsi);

      const perButir = hasil.butir.map((butir) => ({
        butir: butir.butir,
        pilihan: hasil.pilihan
          .filter((p) => p.butir === butir.butir)
          .sort((a, b) => a.pilihan - b.pilihan)
          .map((p) => ({ proporsi: p.proporsi, kunci: p.kunci, kategori: p.kategori })),
      }));

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          { label: t('umum.responden'), nilai: bulat(hasil.n) },
          { label: t('umum.butir'), nilai: bulat(hasil.banyakButir) },
          { label: t('distraktor.ringkasPengecoh'), nilai: bulat(hasil.banyakPengecoh) },
          {
            label: t('distraktor.ringkasTakBerfungsi'),
            nilai: bulat(hasil.totalTakBerfungsi),
            nada: hasil.totalTakBerfungsi === 0 ? 'baik' : 'buruk',
          },
          {
            label: t('distraktor.ringkasMenyesatkan'),
            nilai: bulat(hasil.totalMenyesatkan),
            nada: hasil.totalMenyesatkan === 0 ? 'baik' : 'buruk',
          },
        ]),
        kartu(
          t('distraktor.judulPeta'),
          petaDistraktor(t('distraktor.judulPeta'), t('distraktor.labelKunci'), perButir),
          catatan(t('distraktor.catatanAmbang')),
          catatan(t('distraktor.catatanMenyesatkan')),
        ),
        kartu(
          t('umum.butir'),
          tabel(
            [
              { kunci: 'b', judul: t('umum.butir'), nilai: (b) => b.butir },
              { kunci: 'k', judul: t('distraktor.kolomKunci'), angka: true, nilai: (b) => bulat(b.kunci) },
              { kunci: 'p', judul: t('aitem.kolomP'), angka: true, nilai: (b) => angka(b.p) },
              {
                kunci: 'bf',
                judul: t('distraktor.kolomBerfungsi'),
                angka: true,
                nilai: (b) => bulat(b.pengecohBerfungsi),
              },
              {
                kunci: 'tf',
                judul: t('distraktor.kolomTakBerfungsi'),
                angka: true,
                nilai: (b) => bulat(b.pengecohTakBerfungsi),
                kelas: (b) => (b.pengecohTakBerfungsi > 0 ? 'buruk' : ''),
              },
              {
                kunci: 'ms',
                judul: t('distraktor.kolomMenyesatkan'),
                angka: true,
                nilai: (b) => bulat(b.pengecohMenyesatkan),
                kelas: (b) => (b.pengecohMenyesatkan > 0 ? 'buruk' : ''),
              },
              {
                kunci: 'sa',
                judul: t('distraktor.kolomSemuaBerfungsi'),
                nilai: (b) => (b.semuaBerfungsi ? t('umum.ya') : t('umum.tidak')),
                kelas: (b) => (b.semuaBerfungsi ? 'baik' : 'buruk'),
              },
            ],
            hasil.butir,
            'distraktor-butir',
          ),
        ),
        kartu(
          t('distraktor.kolomPilihan'),
          tabel(
            [
              { kunci: 'b', judul: t('umum.butir'), nilai: (p) => p.butir },
              {
                kunci: 'o',
                judul: t('distraktor.kolomPilihan'),
                angka: true,
                nilai: (p) => bulat(p.pilihan),
              },
              {
                kunci: 'k',
                judul: t('distraktor.kolomKunci'),
                nilai: (p) => (p.kunci ? t('umum.ya') : t('umum.tidak')),
                kelas: (p) => (p.kunci ? 'baik' : ''),
              },
              {
                kunci: 'n',
                judul: t('distraktor.kolomBanyak'),
                angka: true,
                nilai: (p) => bulat(p.banyak),
              },
              {
                kunci: 'pr',
                judul: t('distraktor.kolomProporsi'),
                angka: true,
                nilai: (p) => angka(p.proporsi),
              },
              {
                kunci: 'pa',
                judul: t('distraktor.kolomPAtas'),
                angka: true,
                nilai: (p) => angka(p.pAtas),
              },
              {
                kunci: 'pb',
                judul: t('distraktor.kolomPBawah'),
                angka: true,
                nilai: (p) => angka(p.pBawah),
              },
              {
                kunci: 's',
                judul: t('distraktor.kolomSelisih'),
                angka: true,
                nilai: (p) => angka(p.selisih),
              },
              {
                kunci: 'kt',
                judul: t('distraktor.kolomKategori'),
                nilai: (p) => (p.kategori === null ? '—' : namaKategori(p.kategori)),
                kelas: (p) =>
                  p.kategori === 'berfungsi'
                    ? 'baik'
                    : p.kategori === null
                      ? ''
                      : 'buruk',
              },
            ],
            hasil.pilihan,
            'distraktor-pilihan',
          ),
        ),
      );
    },
  });
}

// --- Seleksi butir berulang ------------------------------------------------

interface MasukanSeleksi {
  readonly matriks: number[][];
  readonly namaKolom: string[] | undefined;
  readonly metode: 'rTabel' | 'tetap';
  readonly ambang: number;
  readonly alpha: number;
  readonly minButir: number;
}

export function halamanSeleksi(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanSeleksi>(konteks, {
    judul: t('seleksi.judul'),
    penjelasan: t('seleksi.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.SKALA_BERDERAU),
        10,
      );
      const nama = bidangSatuBaris(
        t('masukan.namaKolom'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_BUTIR_SELEKSI.join(', '),
      );
      const metode = pilihan(
        t('masukan.metodeSeleksi'),
        [
          { nilai: 'rTabel', teks: t('masukan.metodeRTabel') },
          { nilai: 'tetap', teks: t('masukan.metodeTetap') },
        ],
        'tetap',
      );
      const ambang = bidangSatuBaris(t('masukan.ambangTetap'), '', '0,30');
      const taraf = pilihan(
        t('masukan.taraf'),
        [
          { nilai: '0.05', teks: '5%' },
          { nilai: '0.01', teks: '1%' },
        ],
        '0.05',
      );
      const minimum = bidangSatuBaris(t('masukan.minButir'), '', '3');
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, nama.bidang, laporGalat),
          data.pembungkus,
          nama.pembungkus,
          metode.pembungkus,
          ambang.pembungkus,
          taraf.pembungkus,
          minimum.pembungkus,
        ),
        baca: () => ({
          matriks: bacaMatriks(data.bidang.value),
          namaKolom: bacaLabel(nama.bidang.value),
          metode: metode.bidang.value as 'rTabel' | 'tetap',
          ambang: bacaAngka(ambang.bidang.value, 0.3),
          alpha: Number(taraf.bidang.value),
          minButir: bacaAngka(minimum.bidang.value, 3),
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const opsi: {
        metode: 'rTabel' | 'tetap';
        ambang: number;
        alpha: number;
        minButir: number;
        namaKolom?: readonly string[];
      } = {
        metode: masukan.metode,
        ambang: masukan.ambang,
        alpha: masukan.alpha,
        minButir: masukan.minButir,
      };
      if (masukan.namaKolom !== undefined) opsi.namaKolom = masukan.namaKolom;
      const hasil = await api.seleksiButir(mesin, masukan.matriks, opsi);

      // Titik pertama adalah keadaan sebelum apa pun dibuang; sisanya satu
      // titik per putaran. Tanpa titik awal, kenaikan alpha tidak punya
      // pembanding dan grafiknya kehilangan seluruh maksudnya.
      const langkah = [
        {
          label: t('seleksi.awal'),
          alpha: hasil.alphaAwal,
          banyakButir: hasil.banyakAwal,
        },
        ...hasil.putaran.map((putaran) => ({
          label: String(putaran.putaran),
          alpha: putaran.alphaSesudah,
          banyakButir: putaran.butirSesudah,
        })),
      ];

      const naik = (hasil.selisihAlpha ?? 0) > 0;

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          { label: t('seleksi.banyakAwal'), nilai: bulat(hasil.banyakAwal) },
          {
            label: t('seleksi.banyakAkhir'),
            nilai: bulat(hasil.banyakAkhir),
            nada: 'baik',
          },
          {
            label: t('seleksi.banyakDibuang'),
            nilai: bulat(hasil.banyakDibuang),
            nada: hasil.banyakDibuang === 0 ? 'baik' : 'buruk',
          },
          {
            label: t('seleksi.alphaAkhir'),
            nilai: angka(hasil.alphaAkhir),
            catatan: `${t('seleksi.alphaAwal')} ${angka(hasil.alphaAwal)}`,
            nada: naik ? 'baik' : 'netral',
          },
          { label: t('seleksi.ambang'), nilai: angka(hasil.batas) },
        ]),
        el(
          'div',
          { kelas: 'baris-lencana' },
          lencana(
            hasil.sebabBerhenti === 'bersih' ? t('seleksi.bersih') : t('seleksi.batasBawah'),
            hasil.sebabBerhenti === 'bersih' ? 'baik' : 'buruk',
          ),
        ),
        kartu(
          t('seleksi.judulTangga'),
          tanggaAlpha(t('seleksi.judulTangga'), t('seleksi.sumbuTangga'), langkah),
          catatan(t('seleksi.catatanSatuPerSatu')),
        ),
        kartu(
          t('seleksi.judulPutaran'),
          hasil.putaran.length === 0
            ? catatan(t('seleksi.takAdaYangDibuang'))
            : tabel(
                [
                  {
                    kunci: 'p',
                    judul: t('seleksi.kolomPutaran'),
                    angka: true,
                    nilai: (r) => bulat(r.putaran),
                  },
                  { kunci: 'd', judul: t('seleksi.kolomDibuang'), nilai: (r) => r.dibuang },
                  { kunci: 'r', judul: t('seleksi.kolomR'), angka: true, nilai: (r) => angka(r.rHitung) },
                  { kunci: 'b', judul: t('seleksi.kolomBatas'), angka: true, nilai: (r) => angka(r.batas) },
                  {
                    kunci: 'as',
                    judul: t('seleksi.kolomAlphaSebelum'),
                    angka: true,
                    nilai: (r) => angka(r.alphaSebelum),
                  },
                  {
                    kunci: 'ah',
                    judul: t('seleksi.kolomAlphaSesudah'),
                    angka: true,
                    nilai: (r) => angka(r.alphaSesudah),
                  },
                  {
                    kunci: 's',
                    judul: t('seleksi.kolomSelisih'),
                    angka: true,
                    nilai: (r) => angka(r.selisihAlpha),
                    kelas: (r) => ((r.selisihAlpha ?? 0) > 0 ? 'baik' : 'buruk'),
                  },
                ],
                hasil.putaran,
                'seleksi-putaran',
              ),
        ),
        kartu(
          t('seleksi.judulAkhir'),
          tabel(
            [
              { kunci: 'b', judul: t('umum.butir'), nilai: (b) => b.butir },
              { kunci: 'r', judul: t('seleksi.kolomR'), angka: true, nilai: (b) => angka(b.rHitung) },
              { kunci: 'a', judul: t('seleksi.kolomBatas'), angka: true, nilai: (b) => angka(b.batas) },
              {
                kunci: 'l',
                judul: t('seleksi.kolomLolos'),
                nilai: (b) => (b.lolos ? t('umum.ya') : t('umum.tidak')),
                kelas: (b) => (b.lolos ? 'baik' : 'buruk'),
              },
            ],
            hasil.akhir,
            'seleksi-akhir',
          ),
        ),
      );
    },
  });
}
