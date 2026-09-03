/**
 * Tujuh halaman kalkulator.
 *
 * Semuanya memakai kerangka yang sama, jadi yang tertulis di sini hanya dua
 * hal per alat: bagaimana masukannya dibaca, dan bagaimana hasilnya digambar.
 */
import { el } from '../dom';
import { angka, bulat, namaKategori, t } from '../../i18n';
import {
  bidangSatuBaris,
  bidangTeks,
  catatan,
  kartu,
  kotakCentang,
  lencana,
  papanAngka,
  pilihan,
  tabel,
  zonaImpor,
} from '../komponen';
import { bacaDeret, bacaFavorable, bacaLabel, bacaMatriks, matriksKeTeks } from '../masukan';
import { bangunKalkulator, type KonteksKalkulator } from '../kerangka';
import {
  batangKoefisien,
  batangLikert,
  kontinumThurstone,
  kurvaNormal,
  pencar,
  petaAitem,
  petaSkalogram,
} from '../visual';
import * as api from '../../mesin/api';
import * as contoh from '../../data/contoh';

// --- Analisis aitem --------------------------------------------------------

interface MasukanAitem {
  readonly matriks: number[][];
  readonly namaKolom: string[] | undefined;
  readonly proporsi: number | undefined;
}

export function halamanAitem(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanAitem>(konteks, {
    judul: t('aitem.judul'),
    penjelasan: t('aitem.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.TES_PRESTASI),
        10,
      );
      const nama = bidangSatuBaris(
        t('masukan.namaKolom'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_BUTIR_TES.join(', '),
      );
      const kelompok = pilihan(
        t('masukan.proporsiKelompok'),
        [
          { nilai: 'auto', teks: t('masukan.proporsiOtomatis') },
          { nilai: '0.5', teks: t('masukan.proporsiSetengah') },
          { nilai: '0.27', teks: t('masukan.proporsiDuaTujuh') },
        ],
        'auto',
      );
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, nama.bidang, laporGalat),
          data.pembungkus,
          nama.pembungkus,
          kelompok.pembungkus,
        ),
        baca: () => ({
          matriks: bacaMatriks(data.bidang.value),
          namaKolom: bacaLabel(nama.bidang.value),
          proporsi: kelompok.bidang.value === 'auto' ? undefined : Number(kelompok.bidang.value),
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const opsi: { proporsi?: number; namaKolom?: readonly string[] } = {};
      if (masukan.proporsi !== undefined) opsi.proporsi = masukan.proporsi;
      if (masukan.namaKolom !== undefined) opsi.namaKolom = masukan.namaKolom;
      const hasil = await api.analisisAitem(mesin, masukan.matriks, opsi);

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          { label: t('umum.responden'), nilai: bulat(hasil.n) },
          { label: t('umum.aitem'), nilai: bulat(hasil.banyakAitem) },
          {
            label: t('aitem.ringkasKelompok'),
            nilai: `${Math.round(hasil.proporsiKelompok * 100)}%`,
            catatan: `${bulat(hasil.banyakTiapKelompok)} × 2`,
          },
          { label: t('aitem.ringkasRerata'), nilai: angka(hasil.rerataSkorTotal, 2) },
          {
            label: t('aitem.kolomLayak'),
            nilai: `${hasil.butir.filter((b) => b.layak).length} / ${hasil.banyakAitem}`,
            nada: 'baik',
          },
        ]),
        kartu(
          t('aitem.judulPeta'),
          petaAitem(
            {
              judul: t('aitem.judulPeta'),
              sumbuP: t('aitem.sumbuP'),
              sumbuD: t('aitem.sumbuD'),
              daerahLayak: t('aitem.daerahLayak'),
            },
            hasil.butir.map((b) => ({ nama: b.aitem, p: b.p, d: b.d, layak: b.layak })),
          ),
        ),
        kartu(
          t('umum.hasil'),
          tabel(
            [
              { kunci: 'aitem', judul: t('umum.butir'), nilai: (b) => b.aitem },
              { kunci: 'benar', judul: t('aitem.kolomBenar'), angka: true, nilai: (b) => bulat(b.benar) },
              { kunci: 'p', judul: t('aitem.kolomP'), angka: true, nilai: (b) => angka(b.p) },
              {
                kunci: 'kp',
                judul: t('aitem.kolomKategoriP'),
                nilai: (b) => namaKategori(b.kategoriKesukaran),
              },
              { kunci: 'pa', judul: t('aitem.kolomPAtas'), angka: true, nilai: (b) => angka(b.pAtas) },
              { kunci: 'pb', judul: t('aitem.kolomPBawah'), angka: true, nilai: (b) => angka(b.pBawah) },
              { kunci: 'd', judul: t('aitem.kolomD'), angka: true, nilai: (b) => angka(b.d) },
              {
                kunci: 'kd',
                judul: t('aitem.kolomKategoriD'),
                nilai: (b) => namaKategori(b.kategoriDayaPembeda),
                kelas: (b) => (b.kategoriDayaPembeda === 'dibuang' ? 'buruk' : ''),
              },
              {
                kunci: 'r',
                judul: t('aitem.kolomKorelasi'),
                angka: true,
                nilai: (b) => angka(b.korelasiAitemTotal),
              },
              {
                kunci: 'layak',
                judul: t('aitem.kolomLayak'),
                nilai: (b) => (b.layak ? t('umum.ya') : t('umum.tidak')),
                kelas: (b) => (b.layak ? 'baik' : 'buruk'),
              },
            ],
            hasil.butir,
            'analisis-aitem',
          ),
        ),
      );
    },
  });
}

// --- Validitas -------------------------------------------------------------

interface MasukanValiditas {
  readonly matriks: number[][];
  readonly namaKolom: string[] | undefined;
  readonly alpha: number;
  readonly dikoreksi: boolean;
}

export function halamanValiditas(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanValiditas>(konteks, {
    judul: t('validitas.judul'),
    penjelasan: t('validitas.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.SKALA_LIKERT),
        10,
      );
      const nama = bidangSatuBaris(
        t('masukan.namaKolom'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_BUTIR_LIKERT.join(', '),
      );
      const taraf = pilihan(
        t('masukan.taraf'),
        [
          { nilai: '0.05', teks: '5%' },
          { nilai: '0.01', teks: '1%' },
        ],
        '0.05',
      );
      const koreksi = kotakCentang(t('masukan.dikoreksi'), true);
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, nama.bidang, laporGalat),
          data.pembungkus,
          nama.pembungkus,
          taraf.pembungkus,
          koreksi.pembungkus,
        ),
        baca: () => ({
          matriks: bacaMatriks(data.bidang.value),
          namaKolom: bacaLabel(nama.bidang.value),
          alpha: Number(taraf.bidang.value),
          dikoreksi: koreksi.bidang.checked,
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const opsi: { dikoreksi: boolean; alpha: number; namaKolom?: readonly string[] } = {
        dikoreksi: masukan.dikoreksi,
        alpha: masukan.alpha,
      };
      if (masukan.namaKolom !== undefined) opsi.namaKolom = masukan.namaKolom;
      const hasil = await api.validitasButir(mesin, masukan.matriks, opsi);

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          { label: t('umum.responden'), nilai: bulat(hasil.n) },
          { label: t('umum.aitem'), nilai: bulat(hasil.banyakAitem) },
          { label: t('validitas.ringkasRTabel'), nilai: angka(hasil.rTabel) },
          { label: t('validitas.ringkasValid'), nilai: bulat(hasil.banyakValid), nada: 'baik' },
          {
            label: t('validitas.ringkasGugur'),
            nilai: bulat(hasil.banyakGugur),
            nada: hasil.banyakGugur > 0 ? 'buruk' : 'netral',
          },
        ]),
        kartu(
          t('validitas.judulGrafik'),
          batangKoefisien(
            t('validitas.judulGrafik'),
            hasil.butir.map((b) => ({
              label: b.aitem,
              nilai: b.rHitung,
              ambang: hasil.rTabel,
            })),
          ),
        ),
        kartu(
          t('umum.hasil'),
          tabel(
            [
              { kunci: 'aitem', judul: t('umum.butir'), nilai: (b) => b.aitem },
              { kunci: 'r', judul: t('validitas.kolomR'), angka: true, nilai: (b) => angka(b.rHitung) },
              { kunci: 'rt', judul: t('validitas.kolomRTabel'), angka: true, nilai: (b) => angka(b.rTabel) },
              {
                kunci: 'k',
                judul: t('validitas.kolomKategori'),
                nilai: (b) => namaKategori(b.kategori),
              },
              {
                kunci: 'v',
                judul: t('validitas.kolomValid'),
                nilai: (b) => (b.valid ? t('validitas.valid') : t('validitas.gugur')),
                kelas: (b) => (b.valid ? 'baik' : 'buruk'),
              },
            ],
            hasil.butir,
            'validitas-butir',
          ),
        ),
      );
    },
  });
}

// --- Reliabilitas ----------------------------------------------------------

interface MasukanReliabilitas {
  readonly matriks: number[][];
  readonly namaKolom: string[] | undefined;
}

export function halamanReliabilitas(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanReliabilitas>(konteks, {
    judul: t('reliabilitas.judul'),
    penjelasan: t('reliabilitas.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.TES_PRESTASI),
        10,
      );
      const nama = bidangSatuBaris(
        t('masukan.namaKolom'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_BUTIR_TES.join(', '),
      );
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, nama.bidang, laporGalat),
          data.pembungkus,
          nama.pembungkus,
        ),
        baca: () => ({
          matriks: bacaMatriks(data.bidang.value),
          namaKolom: bacaLabel(nama.bidang.value),
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const hasil = await api.analisisReliabilitas(mesin, masukan.matriks, masukan.namaKolom);

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          {
            label: t('reliabilitas.alpha'),
            nilai: angka(hasil.alphaCronbach),
            catatan: namaKategori(hasil.kategoriAlpha),
            nada: hasil.alphaCronbach >= 0.7 ? 'baik' : 'buruk',
          },
          { label: t('reliabilitas.sem'), nilai: angka(hasil.sem, 2) },
          { label: t('reliabilitas.rerataTotal'), nilai: angka(hasil.rerataTotal, 2) },
          { label: t('reliabilitas.sbTotal'), nilai: angka(hasil.sbTotal, 2) },
          { label: t('umum.responden'), nilai: bulat(hasil.n) },
        ]),
        kartu(
          t('reliabilitas.judulPerbandingan'),
          batangKoefisien(t('reliabilitas.judulPerbandingan'), [
            { label: t('reliabilitas.alpha'), nilai: hasil.alphaCronbach, ambang: 0.7 },
            { label: t('reliabilitas.kr20'), nilai: hasil.kr20, ambang: 0.7 },
            { label: t('reliabilitas.kr21'), nilai: hasil.kr21, ambang: 0.7 },
            { label: t('reliabilitas.belahGanjilGenap'), nilai: hasil.belahGanjilGenap.r11, ambang: 0.7 },
            { label: t('reliabilitas.belahAwalAkhir'), nilai: hasil.belahAwalAkhir.r11, ambang: 0.7 },
          ]),
          !hasil.dikotomi ? catatan(t('reliabilitas.catatanDikotomi')) : null,
          catatan(t('reliabilitas.catatanSem')),
        ),
        kartu(
          t('reliabilitas.judulSebaranBelahan'),
          pencar(
            t('reliabilitas.judulSebaranBelahan'),
            hasil.belahGanjilGenap.skorKiri,
            hasil.belahGanjilGenap.skorKanan,
            `${t('umum.butir')} 1, 3, 5…`,
            `${t('umum.butir')} 2, 4, 6…`,
          ),
          papanAngka([
            { label: t('reliabilitas.rBelah'), nilai: angka(hasil.belahGanjilGenap.rBelah) },
            { label: t('reliabilitas.r11'), nilai: angka(hasil.belahGanjilGenap.r11) },
          ]),
        ),
        kartu(
          t('umum.butir'),
          tabel(
            [
              { kunci: 'aitem', judul: t('umum.butir'), nilai: (b) => b.aitem },
              { kunci: 'm', judul: t('reliabilitas.kolomRerata'), angka: true, nilai: (b) => angka(b.rerata) },
              { kunci: 'v', judul: t('reliabilitas.kolomVarians'), angka: true, nilai: (b) => angka(b.varians) },
              {
                kunci: 'r',
                judul: t('reliabilitas.kolomKorelasi'),
                angka: true,
                nilai: (b) => angka(b.korelasiAitemTotal),
              },
              {
                kunci: 'a',
                judul: t('reliabilitas.kolomAlphaBuang'),
                angka: true,
                nilai: (b) => angka(b.alphaJikaDibuang),
                kelas: (b) =>
                  b.alphaJikaDibuang !== null && b.alphaJikaDibuang > hasil.alphaCronbach
                    ? 'buruk'
                    : '',
              },
            ],
            hasil.butir,
            'reliabilitas-butir',
          ),
        ),
      );
    },
  });
}

// --- Skor standar ----------------------------------------------------------

interface MasukanSkor {
  readonly skor: number[];
  readonly nama: string[] | undefined;
  readonly populasi: boolean;
}

export function halamanSkor(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanSkor>(konteks, {
    judul: t('skor.judul'),
    penjelasan: t('skor.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('umum.data'),
        t('masukan.petunjukDeret'),
        contoh.SKOR_MENTAH.join(', '),
        6,
      );
      const nama = bidangTeks(
        t('masukan.labelPeserta'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_PESERTA.join(', '),
        3,
      );
      const populasi = kotakCentang(t('masukan.perlakuanPopulasi'), true);
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, undefined, laporGalat),
          data.pembungkus,
          nama.pembungkus,
          populasi.pembungkus,
        ),
        baca: () => ({
          skor: bacaDeret(data.bidang.value),
          nama: bacaLabel(nama.bidang.value),
          populasi: populasi.bidang.checked,
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const opsi: { nama?: readonly string[]; populasi: boolean } = { populasi: masukan.populasi };
      if (masukan.nama !== undefined && masukan.nama.length === masukan.skor.length) {
        opsi.nama = masukan.nama;
      }
      const hasil = await api.konversiSkor(mesin, masukan.skor, opsi);
      const r = hasil.ringkasan;

      // Hanya beberapa penanda yang digambar; kurva penuh penanda tidak terbaca.
      const urut = [...hasil.peserta].sort((a, b) => a.skorMentah - b.skorMentah);
      const penanda = [urut[0], urut[Math.floor(urut.length / 2)], urut.at(-1)]
        .filter((p): p is NonNullable<typeof p> => p !== undefined)
        .map((p) => ({ z: p.z, label: p.nama }));

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          { label: 'N', nilai: bulat(r.n) },
          { label: 'M', nilai: angka(r.rerata, 2) },
          { label: masukan.populasi ? 'σ' : 's', nilai: angka(masukan.populasi ? r.sbPopulasi : r.sbSampel, 2) },
          { label: 'Md', nilai: angka(r.median, 2) },
          { label: t('umum.minMaks'), nilai: `${bulat(r.minimum)}–${bulat(r.maksimum)}` },
        ]),
        kartu(
          t('skor.judulKurva'),
          kurvaNormal(
            {
              judul: t('skor.judulKurva'),
              stanine: t('skor.barisStanine'),
              persentil: t('skor.barisPersentil'),
            },
            penanda,
          ),
        ),
        kartu(
          t('umum.hasil'),
          tabel(
            [
              { kunci: 'n', judul: t('skor.kolomNama'), nilai: (p) => p.nama },
              { kunci: 'x', judul: t('skor.kolomMentah'), angka: true, nilai: (p) => angka(p.skorMentah, 0) },
              { kunci: 'z', judul: t('skor.kolomZ'), angka: true, nilai: (p) => angka(p.z, 2) },
              { kunci: 't', judul: t('skor.kolomT'), angka: true, nilai: (p) => angka(p.t, 1) },
              { kunci: 's', judul: t('skor.kolomStanine'), angka: true, nilai: (p) => bulat(p.stanine) },
              {
                kunci: 'pr',
                judul: t('skor.kolomPersentil'),
                angka: true,
                nilai: (p) => angka(p.jenjangPersentil, 1),
              },
            ],
            hasil.peserta,
            'skor-standar',
          ),
        ),
      );
    },
  });
}

// --- Thurstone -------------------------------------------------------------

interface MasukanThurstone {
  readonly matriks: number[][];
  readonly namaKolom: string[] | undefined;
  readonly kategori: number;
  readonly maksimal: number;
}

export function halamanThurstone(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanThurstone>(konteks, {
    judul: t('thurstone.judul'),
    penjelasan: t('thurstone.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.PENILAIAN_THURSTONE),
        10,
      );
      const nama = bidangSatuBaris(
        t('masukan.namaKolom'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_BUTIR_THURSTONE.join(', '),
      );
      const skala = bidangSatuBaris(t('masukan.skalaPenilaian'), '1–11', '11');
      const jumlah = bidangSatuBaris(t('masukan.jumlahButirDipilih'), '', '6');
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, nama.bidang, laporGalat),
          data.pembungkus,
          nama.pembungkus,
          skala.pembungkus,
          jumlah.pembungkus,
        ),
        baca: () => ({
          matriks: bacaMatriks(data.bidang.value),
          namaKolom: bacaLabel(nama.bidang.value),
          kategori: bacaDeret(skala.bidang.value)[0] ?? 11,
          maksimal: bacaDeret(jumlah.bidang.value)[0] ?? 8,
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const opsi: { kategori: number; namaKolom?: readonly string[] } = {
        kategori: masukan.kategori,
      };
      if (masukan.namaKolom !== undefined) opsi.namaKolom = masukan.namaKolom;
      const hasil = await api.analisisThurstone(mesin, masukan.matriks, opsi);
      const terpilih = await api.pilihButirThurstone(mesin, masukan.matriks, {
        ...opsi,
        maksimal: masukan.maksimal,
      });
      const namaTerpilih = new Set(terpilih.butir.map((b) => b.butir));

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          { label: t('umum.penilai'), nilai: bulat(hasil.banyakPenilai) },
          { label: t('umum.butir'), nilai: bulat(hasil.banyakButir) },
          { label: t('thurstone.terpilih'), nilai: bulat(terpilih.terpilih), nada: 'baik' },
          { label: t('thurstone.lokasiTerwakili'), nilai: bulat(terpilih.lokasiTerwakili) },
        ]),
        kartu(
          t('thurstone.judulKontinum'),
          kontinumThurstone(
            { judul: t('thurstone.judulKontinum'), sumbu: t('thurstone.sumbuS') },
            hasil.butir.map((b) => ({
              nama: b.butir,
              s: b.s,
              k25: b.k25,
              k75: b.k75,
              terpilih: namaTerpilih.has(b.butir),
            })),
          ),
          catatan(t('thurstone.catatanDuaMetode')),
        ),
        kartu(
          t('umum.hasil'),
          tabel(
            [
              { kunci: 'b', judul: t('umum.butir'), nilai: (b) => b.butir },
              { kunci: 's', judul: t('thurstone.kolomS'), angka: true, nilai: (b) => angka(b.s, 2) },
              { kunci: 'k25', judul: t('thurstone.kolomK25'), angka: true, nilai: (b) => angka(b.k25, 2) },
              { kunci: 'k75', judul: t('thurstone.kolomK75'), angka: true, nilai: (b) => angka(b.k75, 2) },
              { kunci: 'q', judul: t('thurstone.kolomQ'), angka: true, nilai: (b) => angka(b.q, 2) },
              {
                kunci: 'qt',
                judul: t('thurstone.kolomQTerkelompok'),
                angka: true,
                nilai: (b) => angka(b.qTerkelompok, 2),
              },
              {
                kunci: 'p',
                judul: t('thurstone.terpilih'),
                nilai: (b) => (namaTerpilih.has(b.butir) ? t('umum.ya') : t('umum.tidak')),
                kelas: (b) => (namaTerpilih.has(b.butir) ? 'baik' : ''),
              },
            ],
            hasil.butir,
            'thurstone',
          ),
        ),
      );
    },
  });
}

// --- Guttman ---------------------------------------------------------------

interface MasukanGuttman {
  readonly matriks: number[][];
  readonly namaKolom: string[] | undefined;
}

export function halamanGuttman(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanGuttman>(konteks, {
    judul: t('guttman.judul'),
    penjelasan: t('guttman.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.SKALA_GUTTMAN),
        10,
      );
      const nama = bidangSatuBaris(
        t('masukan.namaKolom'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_BUTIR_GUTTMAN.join(', '),
      );
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, nama.bidang, laporGalat),
          data.pembungkus,
          nama.pembungkus,
        ),
        baca: () => ({
          matriks: bacaMatriks(data.bidang.value),
          namaKolom: bacaLabel(nama.bidang.value),
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const hasil = await api.analisisGuttman(mesin, masukan.matriks, masukan.namaKolom);

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          {
            label: t('guttman.kr'),
            nilai: angka(hasil.koefisienReprodusibilitas),
            catatan: t('guttman.syaratKr'),
            nada: hasil.reprodusibilitasDiterima ? 'baik' : 'buruk',
          },
          {
            label: t('guttman.ks'),
            nilai: angka(hasil.koefisienSkalabilitas),
            catatan: t('guttman.syaratKs'),
            nada: hasil.skalabilitasDiterima ? 'baik' : 'buruk',
          },
          { label: t('guttman.error'), nilai: bulat(hasil.error) },
          { label: t('guttman.jawabanYa'), nilai: `${bulat(hasil.jawabanYa)} / ${bulat(hasil.banyakSel)}` },
          { label: t('reliabilitas.kr21'), nilai: angka(hasil.kr21) },
        ]),
        kartu(
          t('guttman.judulSkalogram'),
          petaSkalogram(
            t('guttman.judulSkalogram'),
            hasil.skalogram,
            hasil.namaButir,
            hasil.responden.map((r) => r.responden),
          ),
          catatan(t('guttman.penjelasanSkalogram')),
        ),
        kartu(
          t('umum.hasil'),
          el(
            'div',
            { kelas: 'baris-lencana' },
            lencana(
              `${t('guttman.kr')}: ${hasil.reprodusibilitasDiterima ? t('guttman.diterima') : t('guttman.ditolak')}`,
              hasil.reprodusibilitasDiterima ? 'baik' : 'buruk',
            ),
            lencana(
              `${t('guttman.ks')}: ${hasil.skalabilitasDiterima ? t('guttman.diterima') : t('guttman.ditolak')}`,
              hasil.skalabilitasDiterima ? 'baik' : 'buruk',
            ),
          ),
          tabel(
            [
              { kunci: 'r', judul: t('umum.responden'), nilai: (r) => r.responden },
              { kunci: 's', judul: t('guttman.kolomSkor'), angka: true, nilai: (r) => bulat(r.skor) },
              {
                kunci: 'e',
                judul: t('guttman.kolomError'),
                angka: true,
                nilai: (r) => bulat(r.error),
                kelas: (r) => (r.error > 0 ? 'buruk' : 'baik'),
              },
            ],
            hasil.responden,
            'guttman-responden',
          ),
        ),
      );
    },
  });
}

// --- Likert ----------------------------------------------------------------

interface MasukanLikert {
  readonly matriks: number[][];
  readonly namaKolom: string[] | undefined;
  readonly kategori: number;
  readonly favorableTeks: string;
}

export function halamanLikert(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanLikert>(konteks, {
    judul: t('likert.judul'),
    penjelasan: t('likert.penjelasan'),
    hitungOtomatis: true,
    panel: (laporGalat) => {
      const data = bidangTeks(
        t('masukan.judulMatriks'),
        t('masukan.petunjukMatriks'),
        matriksKeTeks(contoh.SKALA_LIKERT),
        10,
      );
      const nama = bidangSatuBaris(
        t('masukan.namaKolom'),
        t('masukan.petunjukNamaKolom'),
        contoh.NAMA_BUTIR_LIKERT.join(', '),
      );
      const kategori = pilihan(
        t('masukan.kategoriJawaban'),
        [
          { nilai: '4', teks: '4' },
          { nilai: '5', teks: '5' },
          { nilai: '6', teks: '6' },
          { nilai: '7', teks: '7' },
        ],
        '5',
      );
      const favorable = bidangSatuBaris(
        t('masukan.butirFavorable'),
        t('masukan.petunjukFavorable'),
        contoh.FAVORABLE_LIKERT,
      );
      return {
        simpul: el(
          'div',
          { kelas: 'panel-isi' },
          zonaImpor(data.bidang, nama.bidang, laporGalat),
          data.pembungkus,
          nama.pembungkus,
          kategori.pembungkus,
          favorable.pembungkus,
        ),
        baca: () => ({
          matriks: bacaMatriks(data.bidang.value),
          namaKolom: bacaLabel(nama.bidang.value),
          kategori: Number(kategori.bidang.value),
          favorableTeks: favorable.bidang.value,
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const favorable = bacaFavorable(masukan.favorableTeks, masukan.matriks[0]?.length ?? 0);
      const opsi: {
        favorable: readonly boolean[];
        kategori: number;
        namaKolom?: readonly string[];
      } = { favorable, kategori: masukan.kategori };
      if (masukan.namaKolom !== undefined) opsi.namaKolom = masukan.namaKolom;
      const hasil = await api.analisisLikert(mesin, masukan.matriks, opsi);

      return el(
        'div',
        { kelas: 'tumpuk' },
        papanAngka([
          {
            label: t('likert.indeksSkala'),
            nilai: `${angka(hasil.indeksSkala, 1)}%`,
            catatan: namaKategori(hasil.kategoriSkala),
            nada: 'netral',
          },
          {
            label: t('reliabilitas.alpha'),
            nilai: angka(hasil.alphaCronbach),
            catatan: namaKategori(hasil.kategoriAlpha),
            nada: (hasil.alphaCronbach ?? 0) >= 0.7 ? 'baik' : 'buruk',
          },
          { label: t('umum.responden'), nilai: bulat(hasil.n) },
          { label: t('umum.butir'), nilai: bulat(hasil.banyakButir) },
          { label: t('reliabilitas.rerataTotal'), nilai: angka(hasil.rerataTotal, 2) },
        ]),
        kartu(
          t('likert.judulSebaran'),
          batangLikert(
            t('likert.judulSebaran'),
            masukan.matriks,
            hasil.butir.map((b) => b.butir),
            masukan.kategori,
          ),
        ),
        kartu(
          t('umum.butir'),
          tabel(
            [
              { kunci: 'b', judul: t('umum.butir'), nilai: (b) => b.butir },
              {
                kunci: 'f',
                judul: t('likert.kolomFavorable'),
                nilai: (b) => (b.favorable ? t('likert.favorable') : t('likert.unfavorable')),
              },
              {
                kunci: 'rm',
                judul: t('likert.kolomRerataMentah'),
                angka: true,
                nilai: (b) => angka(b.rerataMentah, 2),
              },
              {
                kunci: 'rt',
                judul: t('likert.kolomRerataTerskor'),
                angka: true,
                nilai: (b) => angka(b.rerataTerskor, 2),
              },
              { kunci: 'i', judul: t('likert.kolomIndeks'), angka: true, nilai: (b) => angka(b.indeks, 1) },
              {
                kunci: 'r',
                judul: t('likert.kolomKorelasi'),
                angka: true,
                nilai: (b) => angka(b.korelasiAitemTotal),
              },
              {
                kunci: 'rho',
                judul: t('likert.kolomSpearman'),
                angka: true,
                nilai: (b) => angka(b.korelasiSpearman),
              },
              {
                kunci: 'a',
                judul: t('likert.kolomAlphaBuang'),
                angka: true,
                nilai: (b) => angka(b.alphaJikaDibuang),
              },
            ],
            hasil.butir,
            'likert-butir',
          ),
          catatan(t('likert.catatanOrdinal')),
        ),
        kartu(
          t('umum.responden'),
          tabel(
            [
              { kunci: 'r', judul: t('umum.responden'), nilai: (r) => r.responden },
              { kunci: 't', judul: t('likert.kolomTotal'), angka: true, nilai: (r) => bulat(r.total) },
              { kunci: 'i', judul: t('likert.kolomIndeks'), angka: true, nilai: (r) => angka(r.indeks, 1) },
              { kunci: 'k', judul: t('likert.kolomKategori'), nilai: (r) => namaKategori(r.kategori) },
            ],
            hasil.responden,
            'likert-responden',
          ),
        ),
      );
    },
  });
}

// --- Tabel r ---------------------------------------------------------------

interface MasukanTabelR {
  readonly nMin: number;
  readonly nMaks: number;
}

export function halamanTabelR(konteks: KonteksKalkulator): HTMLElement {
  return bangunKalkulator<MasukanTabelR>(konteks, {
    judul: t('tabelR.judul'),
    penjelasan: t('tabelR.penjelasan'),
    hitungOtomatis: true,
    panel: (_laporGalat) => {
      const dari = bidangSatuBaris(t('tabelR.dari'), '', '3');
      const sampai = bidangSatuBaris(t('tabelR.sampai'), '', '100');
      return {
        simpul: el('div', { kelas: 'panel-isi' }, dari.pembungkus, sampai.pembungkus),
        baca: () => ({
          nMin: bacaDeret(dari.bidang.value)[0] ?? 3,
          nMaks: bacaDeret(sampai.bidang.value)[0] ?? 100,
        }),
      };
    },
    hitung: async (mesin, masukan) => {
      const baris = await api.tabelR(mesin, masukan.nMin, masukan.nMaks);
      return el(
        'div',
        { kelas: 'tumpuk' },
        kartu(
          t('umum.hasil'),
          tabel(
            [
              { kunci: 'n', judul: t('tabelR.kolomN'), angka: true, nilai: (b) => bulat(b.n) },
              { kunci: '5', judul: t('tabelR.kolom5'), angka: true, nilai: (b) => angka(b.taraf5) },
              { kunci: '1', judul: t('tabelR.kolom1'), angka: true, nilai: (b) => angka(b.taraf1) },
            ],
            baris,
            'tabel-r',
          ),
        ),
      );
    },
  });
}
