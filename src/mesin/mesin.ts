/**
 * Jembatan ke mesin R.
 *
 * Satu-satunya kelas yang tahu WebR itu ada. Semua bagian lain program
 * memanggil `Mesin.panggil()` dengan ekspresi R dan menerima objek biasa.
 *
 * Kontraknya sempit dengan sengaja: setiap pemanggilan dibungkus `ps_jalankan()`
 * di sisi R, jadi hasil sukses dan hasil gagal sama-sama kembali sebagai JSON
 * yang sudah berbentuk. Pesan galat bawaan R tidak pernah sampai ke pengguna —
 * yang menyeberang hanyalah kode yang bisa diterjemahkan ke ID maupun EN.
 */
import { WebR } from 'webr';
import { sumberGabungan } from './sumber';

export class RalatMesin extends Error {
  readonly kode: string;
  readonly konteks: Readonly<Record<string, unknown>>;

  constructor(kode: string, konteks: Record<string, unknown> = {}) {
    super(kode);
    this.name = 'RalatMesin';
    this.kode = kode;
    this.konteks = Object.freeze({ ...konteks });
  }
}

interface HasilMentah {
  readonly ok: boolean;
  readonly hasil?: unknown;
  readonly kode?: string;
  readonly konteks?: Record<string, unknown>;
}

export interface OpsiMesin {
  /**
   * Tempat berkas runtime WebR (R.wasm, vfs, webr-worker.js) dilayani.
   * Di Node: './node_modules/webr/dist/'. Di peramban: jalur hasil salinan
   * saat build. Tidak pernah menunjuk CDN pihak ketiga — seluruh runtime
   * dilayani dari asal yang sama dengan situsnya.
   */
  readonly baseUrl: string;
  /**
   * Saluran komunikasi ke worker. GitHub Pages tidak mengirim header COOP/COEP,
   * jadi SharedArrayBuffer tidak tersedia di sana dan saluran PostMessage yang
   * dipakai. Saluran itu tidak bisa memblokir untuk membaca masukan interaktif,
   * yang tidak jadi soal: mesin ini tidak pernah meminta masukan dari R.
   */
  readonly saluran?: 'otomatis' | 'postMessage';
}

const SALURAN_POST_MESSAGE = 3;

export class Mesin {
  readonly #webR: WebR;
  #siap = false;

  private constructor(webR: WebR) {
    this.#webR = webR;
  }

  /** Nyalakan R, muat seluruh berkas mesin, dan pastikan mesinnya menjawab. */
  static async mulai(opsi: OpsiMesin): Promise<Mesin> {
    const konfigurasi: Record<string, unknown> = {
      baseUrl: opsi.baseUrl,
      interactive: false,
    };
    if (opsi.saluran === 'postMessage') {
      konfigurasi['channelType'] = SALURAN_POST_MESSAGE;
    }
    const webR = new WebR(konfigurasi as ConstructorParameters<typeof WebR>[0]);
    await webR.init();
    const mesin = new Mesin(webR);
    await mesin.#muatSumber();
    return mesin;
  }

  async #muatSumber(): Promise<void> {
    // Sumber dititipkan sebagai variabel R, bukan disisipkan ke dalam ekspresi.
    // Menyisipkannya berarti seluruh mesin harus lolos-kan dirinya sendiri
    // sebagai literal string setiap kali dimuat — sekali salah lolos, R melihat
    // kode yang berbeda dari yang tertulis di berkas .R.
    await this.#webR.objs.globalEnv.bind('.ps_sumber', sumberGabungan());
    // Dievaluasi sebagai satu blok: berkas R saling bergantung berurutan, dan
    // memuatnya sepotong-sepotong hanya menambah titik gagal tanpa manfaat.
    const hasil = await this.#webR.evalRString(
      'tryCatch({ eval(parse(text = .ps_sumber), envir = globalenv()); "ok" },' +
        ' error = function(e) paste0("gagal: ", conditionMessage(e)))',
    );
    if (hasil !== 'ok') throw new RalatMesin('mesin.gagalMuat', { pesan: hasil });
    this.#siap = true;
  }

  /** Kirim satu ekspresi R, terima hasilnya yang sudah terurai. */
  async panggil<T>(ekspresi: string): Promise<T> {
    if (!this.#siap) throw new RalatMesin('mesin.belumSiap');
    const teks = await this.#webR.evalRString(`ps_jalankan(${ekspresi})`);
    let terurai: HasilMentah;
    try {
      terurai = JSON.parse(teks) as HasilMentah;
    } catch {
      throw new RalatMesin('mesin.jawabanTakTerbaca', { jawaban: teks.slice(0, 200) });
    }
    if (!terurai.ok) {
      throw new RalatMesin(terurai.kode ?? 'mesin.gagal', terurai.konteks ?? {});
    }
    return terurai.hasil as T;
  }

  async tutup(): Promise<void> {
    this.#siap = false;
    await this.#webR.close();
  }
}

/** Sumber R sebagai satu string — dipakai Mesin dan uji conformance. */
export function sumberMesin(): string {
  return sumberGabungan();
}
