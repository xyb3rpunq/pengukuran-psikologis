/**
 * Dua alat hitung yang berdiri di luar urutan modul.
 *
 * Analisis faktor disebut sesi 5 sebagai bukti validitas konstruk, tetapi
 * hitungannya diserahkan ke SPSS dan tidak pernah dijabarkan. SUS tidak
 * disebut sama sekali, dan justru karena itu ia layak ada: ia contoh terbaik
 * dari yang diajarkan sesi 13, dan satu-satunya alat ukur di seluruh berkas
 * ini yang dipakai orang di luar ruang kuliah setiap hari.
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
import { bacaDeret, bacaLabel, bacaMatriks, matriksKeTeks } from '../masukan';
import { bangunKalkulator, type KonteksKalkulator } from '../kerangka';
import { petaMuatan, screePlot, termometerSus } from '../visual';
import * as api from '../../mesin/api';
import * as contoh from '../../data/contoh';

// --- Analisis faktor -------------------------------------------------------

interface MasukanFaktor {
  readonly matriks: number[][];
  readonly namaKolom: string[] | undefined;
  readonly banyakFaktor: number | undefined;
  readonly rotasi: 'varimax' | 'promax' | 'none';
  readonly batasMuatan: number;
}

export function halamanFaktor(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanFaktor>(konteks, {
    judul: t('faktor.judul'),
    penjelasan: t('faktor.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.RESPON_FAKTOR),
        10,
      );
      const nama = bidangSatuBaris(
        t('masukan.namaKolom'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_BUTIR_FAKTOR.join(', '),
      );
      const jumlah = bidangSatuBaris(t('masukan.banyakFaktor'), t('masukan.otomatisKaiser'), '');
      const rotasi = pilihan(
        t('masukan.rotasi'),
        [
          { nilai: 'varimax', teks: t('masukan.rotasiVarimax') },
          { nilai: 'promax', teks: t('masukan.rotasiPromax') },
          { nilai: 'none', teks: t('masukan.rotasiTanpa') },
        ],
        'varimax',
      );
      const batas = bidangSatuBaris(t('masukan.batasMuatan'), '', '0,40');
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, nama.bidang, laporGalat),
          data.pembungkus,
          nama.pembungkus,
          jumlah.pembungkus,
          rotasi.pembungkus,
          batas.pembungkus,
        ),
        baca: () => {
          const diminta = jumlah.bidang.value.trim();
          return {
            matriks: bacaMatriks(data.bidang.value),
            namaKolom: bacaLabel(nama.bidang.value),
            banyakFaktor: diminta === '' ? undefined : (bacaDeret(diminta)[0] as number),
            rotasi: rotasi.bidang.value as 'varimax' | 'promax' | 'none',
            batasMuatan: bacaDeret(batas.bidang.value)[0] ?? 0.4,
          };
        },
      };
    },
    hitung: async (mesin, masukan) => {
      const opsiFaktor: {
        banyakFaktor?: number | undefined;
        rotasi: 'varimax' | 'promax' | 'none';
        batasMuatan: number;
        namaKolom?: readonly string[];
      } = { rotasi: masukan.rotasi, batasMuatan: masukan.batasMuatan };
      if (masukan.banyakFaktor !== undefined) opsiFaktor.banyakFaktor = masukan.banyakFaktor;
      if (masukan.namaKolom !== undefined) opsiFaktor.namaKolom = masukan.namaKolom;

      // Ketiganya dijalankan berurutan di satu proses R yang sama; menyusunnya
      // sebagai satu Promise.all tidak akan memparalelkan apa pun, hanya
      // menyembunyikan urutan kegagalannya.
      const uji = await api.bartlett(mesin, masukan.matriks);
      const kecukupan = await api.kmo(mesin, masukan.matriks, masukan.namaKolom);
      const hasil = await api.analisisFaktor(mesin, masukan.matriks, opsiFaktor);

      const ambilMuatan = (butir: api.ButirFaktor, f: number): number =>
        (butir[`f${f + 1}`] as number | undefined) ?? 0;

      const barisMuatan = hasil.butir.map((b) => ({
        butir: b.butir,
        muatan: Array.from({ length: hasil.banyakFaktor }, (_, f) => ambilMuatan(b, f)),
        faktor: b.faktor,
      }));

      const kolomMuatan = Array.from({ length: hasil.banyakFaktor }, (_, f) => ({
        kunci: `f${f + 1}`,
        judul: `${t('faktor.labelFaktor')} ${f + 1}`,
        angka: true,
        nilai: (b: api.ButirFaktor) => angka(ambilMuatan(b, f), 3),
        kelas: (b: api.ButirFaktor) =>
          Math.abs(ambilMuatan(b, f)) >= hasil.batasMuatan ? 'baik' : '',
      }));

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          {
            label: t('faktor.kmo'),
            nilai: angka(kecukupan.kmo),
            catatan: namaKategori(kecukupan.kategori),
            nada: kecukupan.layak ? 'baik' : 'buruk',
          },
          {
            label: t('faktor.bartlett'),
            nilai: angka(uji.p, uji.p < 0.001 ? 5 : 3),
            catatan: uji.layak ? t('faktor.layak') : t('faktor.takLayak'),
            nada: uji.layak ? 'baik' : 'buruk',
          },
          { label: t('faktor.banyakFaktor'), nilai: bulat(hasil.banyakFaktor) },
          { label: t('faktor.ragamKumulatif'), nilai: `${angka(hasil.ragamKumulatif * 100, 1)}%` },
          {
            label: t('faktor.kecocokan'),
            nilai: angka(hasil.pKecocokan, 3),
            catatan: hasil.modelCukup ? t('faktor.cukup') : t('faktor.belumCukup'),
            nada: hasil.modelCukup ? 'baik' : 'buruk',
          },
        ]),
        kartu(
          t('faktor.bartlett'),
          catatan(t('faktor.bartlettPenjelasan')),
          papanAngka([
            { label: t('faktor.khiKuadrat'), nilai: angka(uji.khiKuadrat, 2) },
            { label: t('faktor.db'), nilai: bulat(uji.db) },
            { label: t('faktor.penentu'), nilai: angka(uji.penentu, 5) },
          ]),
        ),
        kartu(
          t('faktor.kmo'),
          catatan(t('faktor.kmoPenjelasan')),
          tabel(
            [
              { kunci: 'b', judul: t('umum.butir'), nilai: (b) => b.butir },
              { kunci: 'msa', judul: t('faktor.kolomMsa'), angka: true, nilai: (b) => angka(b.msa) },
              {
                kunci: 'k',
                judul: t('validitas.kolomKategori'),
                nilai: (b) => namaKategori(b.kategori),
              },
              {
                kunci: 'l',
                judul: t('validitas.kolomValid'),
                nilai: (b) => (b.layak ? t('umum.ya') : t('umum.tidak')),
                kelas: (b) => (b.layak ? 'baik' : 'buruk'),
              },
            ],
            kecukupan.butir,
            'kmo-butir',
          ),
        ),
        kartu(
          t('faktor.judulScree'),
          screePlot(
            t('faktor.judulScree'),
            t('faktor.sumbuFaktor'),
            hasil.eigen.map((e) => ({
              faktor: e.faktor,
              eigen: e.eigen,
              diPertahankan: e.diPertahankan,
            })),
          ),
          tabel(
            [
              {
                kunci: 'f',
                judul: t('faktor.labelFaktor'),
                angka: true,
                nilai: (e) => bulat(e.faktor),
              },
              { kunci: 'e', judul: t('faktor.kolomEigen'), angka: true, nilai: (e) => angka(e.eigen) },
              {
                kunci: 'p',
                judul: t('faktor.kolomProporsi'),
                angka: true,
                nilai: (e) => angka(e.proporsi * 100, 1),
              },
              {
                kunci: 'k',
                judul: t('faktor.kolomKumulatif'),
                angka: true,
                nilai: (e) => angka(e.kumulatif * 100, 1),
              },
            ],
            hasil.eigen,
            'nilai-eigen',
          ),
        ),
        kartu(
          t('faktor.judulMuatan'),
          petaMuatan(
            t('faktor.judulMuatan'),
            t('faktor.labelFaktor'),
            hasil.batasMuatan,
            barisMuatan,
          ),
          catatan(t('faktor.catatanKecocokan')),
        ),
        kartu(
          t('umum.butir'),
          el(
            'div',
            { kelas: 'baris-lencana' },
            lencana(
              `${t('faktor.takBermuatan')}: ${bulat(hasil.banyakTakBermuatan)}`,
              hasil.banyakTakBermuatan === 0 ? 'baik' : 'buruk',
            ),
            lencana(
              `${t('faktor.bermuatanGanda')}: ${bulat(hasil.banyakBermuatanGanda)}`,
              hasil.banyakBermuatanGanda === 0 ? 'baik' : 'buruk',
            ),
          ),
          tabel(
            [
              { kunci: 'b', judul: t('umum.butir'), nilai: (b) => b.butir },
              ...kolomMuatan,
              {
                kunci: 'h',
                judul: t('faktor.kolomKomunalitas'),
                angka: true,
                nilai: (b) => angka(b.komunalitas),
              },
              {
                kunci: 'u',
                judul: t('faktor.kolomKeunikan'),
                angka: true,
                nilai: (b) => angka(b.keunikan),
              },
              {
                kunci: 'fu',
                judul: t('faktor.kolomFaktorUtama'),
                nilai: (b) => (b.faktor === null ? '—' : bulat(b.faktor)),
                kelas: (b) => (b.faktor === null ? 'buruk' : ''),
              },
              {
                kunci: 'g',
                judul: t('faktor.kolomGanda'),
                nilai: (b) => (b.bermuatanGanda ? t('umum.ya') : t('umum.tidak')),
                kelas: (b) => (b.bermuatanGanda ? 'buruk' : ''),
              },
            ],
            hasil.butir,
            'muatan-faktor',
          ),
          catatan(t('faktor.catatanButir')),
        ),
      );
    },
  });
}

// --- System Usability Scale ------------------------------------------------

interface MasukanSus {
  readonly matriks: number[][];
}

/**
 * Pita peringkat pada termometer.
 *
 * Batasnya diambil dari kurva Sauro dan Lewis yang sama dengan yang dipakai
 * mesin, supaya gambar dan tabel tidak pernah bercerita dua hal berbeda.
 */
const PITA_SUS = [
  { dari: 0, sampai: 51.7, kelas: 'v-pita-f', label: 'F' },
  { dari: 51.7, sampai: 62.7, kelas: 'v-pita-d', label: 'D' },
  { dari: 62.7, sampai: 71.1, kelas: 'v-pita-c', label: 'C' },
  { dari: 71.1, sampai: 78.9, kelas: 'v-pita-b', label: 'B' },
  { dari: 78.9, sampai: 100, kelas: 'v-pita-a', label: 'A' },
];

export function halamanSus(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanSus>(konteks, {
    judul: t('sus.judul'),
    penjelasan: t('sus.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.RESPON_SUS),
        12,
      );
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, undefined, laporGalat),
          data.pembungkus,
        ),
        baca: () => ({ matriks: bacaMatriks(data.bidang.value) }),
      };
    },
    hitung: async (mesin, masukan) => {
      const hasil = await api.analisisSus(mesin, masukan.matriks);

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          {
            label: t('sus.skor'),
            nilai: angka(hasil.rerata, 1),
            catatan: hasil.diAtasPatokan ? t('sus.diAtasPatokan') : t('sus.diBawahPatokan'),
            nada: hasil.diAtasPatokan ? 'baik' : 'buruk',
          },
          { label: t('sus.peringkat'), nilai: hasil.peringkat ?? '—' },
          { label: t('sus.adjektiva'), nilai: namaKategori(hasil.adjektiva) },
          {
            label: t('sus.keberterimaan'),
            nilai: namaKategori(hasil.keberterimaan),
            nada: hasil.keberterimaan === 'diterima' ? 'baik' : 'buruk',
          },
          { label: t('sus.persentil'), nilai: angka(hasil.persentil, 1) },
        ]),
        kartu(
          t('sus.judulTermometer'),
          termometerSus(
            t('sus.judulTermometer'),
            t('sus.patokan'),
            hasil.rerata,
            { bawah: hasil.selangBawah, atas: hasil.selangAtas },
            PITA_SUS,
          ),
          papanAngka([
            { label: t('umum.responden'), nilai: bulat(hasil.n) },
            {
              label: t('sus.selang'),
              nilai: `${angka(hasil.selangBawah, 1)} – ${angka(hasil.selangAtas, 1)}`,
            },
            { label: 'Md', nilai: angka(hasil.median, 1) },
            { label: 's', nilai: angka(hasil.sb, 2) },
            { label: t('reliabilitas.alpha'), nilai: angka(hasil.alphaCronbach) },
          ]),
          catatan(t('sus.catatanBukanPersen')),
        ),
        kartu(
          t('umum.butir'),
          tabel(
            [
              { kunci: 'b', judul: t('umum.butir'), angka: true, nilai: (b) => bulat(b.butir) },
              {
                kunci: 'a',
                judul: t('sus.kolomArah'),
                nilai: (b) => (b.favorable ? t('likert.favorable') : t('likert.unfavorable')),
              },
              {
                kunci: 'm',
                judul: t('sus.kolomRerataMentah'),
                angka: true,
                nilai: (b) => angka(b.rerataMentah, 2),
              },
              {
                kunci: 's',
                judul: t('sus.kolomSumbangan'),
                angka: true,
                nilai: (b) => angka(b.rerataSumbangan, 2),
              },
            ],
            hasil.butir,
            'sus-butir',
          ),
        ),
        kartu(
          t('umum.responden'),
          tabel(
            [
              { kunci: 'r', judul: t('umum.responden'), nilai: (r) => r.responden },
              { kunci: 's', judul: t('sus.kolomSkor'), angka: true, nilai: (r) => angka(r.skor, 1) },
              { kunci: 'p', judul: t('sus.kolomPeringkat'), nilai: (r) => r.peringkat ?? '—' },
              {
                kunci: 'a',
                judul: t('sus.kolomAdjektiva'),
                nilai: (r) => namaKategori(r.adjektiva),
              },
              {
                kunci: 'k',
                judul: t('sus.kolomKeberterimaan'),
                nilai: (r) => namaKategori(r.keberterimaan),
                kelas: (r) => (r.keberterimaan === 'diterima' ? 'baik' : ''),
              },
            ],
            hasil.responden,
            'sus-responden',
          ),
          catatan(t('sus.catatanPersentil')),
        ),
      );
    },
  });
}
