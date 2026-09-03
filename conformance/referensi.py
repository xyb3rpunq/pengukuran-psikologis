"""Implementasi pembanding di Python untuk mesin psikometri R.

Mesin proyek ini ditulis di R. Berkas ini menulis ulang rumus yang sama di
Python dengan numpy dan scipy, lalu menerbitkan jawabannya sebagai vektor emas
di conformance/vektor.json. Uji di uji/conformance.uji.ts menjalankan mesin R
atas data yang sama dan menuntut kedua jawaban bertemu sampai 1e-10.

Kenapa repot? Karena uji yang membandingkan sebuah rumus dengan dirinya sendiri
tidak membuktikan apa pun. Dua implementasi yang ditulis terpisah, di dua
bahasa, dengan dua pustaka numerik yang berbeda, hanya akan sepakat kalau
rumusnya memang benar. Nilai t kritis di sini datang dari scipy.stats.t,
sementara di R datang dari qt() — dua rutin distribusi yang sama sekali tidak
berbagi kode.

Jalankan:  python conformance/referensi.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from scipy import stats

BERKAS_KELUARAN = Path(__file__).with_name("vektor.json")


def acakan(benih: int):
    """Generator kongruensial linier — deret yang sama persis di sisi mana pun.

    Tetapannya sama dengan yang dipakai uji/bantu.ts, tetapi data tidak
    dibangkitkan dua kali: seluruh masukan diterbitkan ke vektor.json dan sisi R
    membacanya dari sana. Generator ini hanya dipakai agar berkas ini sendiri
    dapat diulang.
    """
    keadaan = benih & 0xFFFFFFFF

    def berikutnya() -> float:
        nonlocal keadaan
        keadaan = (1664525 * keadaan + 1013904223) & 0xFFFFFFFF
        return keadaan / 4294967296

    return berikutnya


def deret(panjang: int, benih: int, bawah: float = 0.0, atas: float = 100.0) -> list[float]:
    acak = acakan(benih)
    return [bawah + acak() * (atas - bawah) for _ in range(panjang)]


def matriks_dikotomi(baris: int, kolom: int, benih: int) -> list[list[int]]:
    acak = acakan(benih)
    kesukaran = [0.25 + acak() * 0.5 for _ in range(kolom)]
    return [[1 if acak() < kesukaran[j] else 0 for j in range(kolom)] for _ in range(baris)]


def matriks_likert(baris: int, kolom: int, benih: int, kategori: int = 5) -> list[list[int]]:
    acak = acakan(benih)
    hasil = []
    for _ in range(baris):
        kecenderungan = acak()
        hasil.append(
            [
                int(min(kategori, max(1, round(1 + (kategori - 1) * (0.6 * kecenderungan + 0.4 * acak())))))
                for _ in range(kolom)
            ]
        )
    return hasil


# --- Rumus pembanding ------------------------------------------------------


def r_kritis(n: int, alpha: float = 0.05) -> float:
    """Nilai kritis r product moment lewat distribusi t scipy."""
    df = n - 2
    t = stats.t.ppf(1 - alpha / 2, df)
    return float(t / np.sqrt(t**2 + df))


def alpha_cronbach(m: np.ndarray) -> float:
    k = m.shape[1]
    varians_aitem = m.var(axis=0, ddof=1).sum()
    varians_total = m.sum(axis=1).var(ddof=1)
    return float(k / (k - 1) * (1 - varians_aitem / varians_total))


def kr20(m: np.ndarray) -> float:
    k = m.shape[1]
    p = m.mean(axis=0)
    pq = (p * (1 - p)).sum()
    varians_total = m.sum(axis=1).var(ddof=0)
    return float(k / (k - 1) * (1 - pq / varians_total))


def kr21(m: np.ndarray) -> float:
    k = m.shape[1]
    total = m.sum(axis=1)
    u = total.mean()
    v = total.var(ddof=0)
    return float(k / (k - 1) * (1 - (u * (k - u)) / (k * v)))


def korelasi_aitem_total(m: np.ndarray) -> list[float]:
    total = m.sum(axis=1)
    keluar = []
    for j in range(m.shape[1]):
        aitem = m[:, j]
        sisa = total - aitem
        if aitem.std() == 0 or sisa.std() == 0:
            keluar.append(None)
        else:
            keluar.append(float(stats.pearsonr(aitem, sisa).statistic))
    return keluar


def indeks_kesukaran(m: np.ndarray) -> list[float]:
    return [float(nilai) for nilai in m.mean(axis=0)]


def daya_pembeda(m: np.ndarray, proporsi: float) -> list[float]:
    n = m.shape[0]
    total = m.sum(axis=1)
    # Urut menurun, ikatan dipecah menurut nomor urut asli — sama dengan R.
    urutan = sorted(range(n), key=lambda i: (-total[i], i))
    banyak = max(1, round(n * proporsi))
    atas = m[urutan[:banyak]]
    bawah = m[urutan[::-1][:banyak]]
    return [float(nilai) for nilai in (atas.mean(axis=0) - bawah.mean(axis=0))]


def guttman(m: np.ndarray) -> dict:
    proporsi = m.mean(axis=0)
    urut_butir = sorted(range(m.shape[1]), key=lambda j: (-proporsi[j], j))
    tersusun = m[:, urut_butir]
    urut_responden = sorted(range(m.shape[0]), key=lambda i: (-tersusun[i].sum(), i))
    tersusun = tersusun[urut_responden]

    k = tersusun.shape[1]
    error = 0
    for baris in tersusun:
        t = int(baris.sum())
        ideal = np.array([1 if i < t else 0 for i in range(k)])
        error += int(np.abs(baris - ideal).sum())

    sel = m.shape[0] * m.shape[1]
    ya = int(m.sum())
    x = 0.5 * (sel - ya)
    return {
        "error": error,
        "banyakSel": sel,
        "jawabanYa": ya,
        "x": x,
        "koefisienReprodusibilitas": 1 - error / sel,
        "koefisienSkalabilitas": (1 - error / x) if x > 0 else None,
    }


def persentil_spss(x: np.ndarray, p: float) -> float:
    """Metode HAVERAGE SPSS, setara quantile(type = 6) di R."""
    urut = np.sort(x)
    n = len(urut)
    h = (n + 1) * p
    if h <= 1:
        return float(urut[0])
    if h >= n:
        return float(urut[-1])
    bawah = int(np.floor(h))
    return float(urut[bawah - 1] + (h - bawah) * (urut[bawah] - urut[bawah - 1]))


def bartlett(m: np.ndarray) -> dict:
    """Uji kebolaan Bartlett dari matriks korelasi."""
    n, p = m.shape
    R = np.corrcoef(m, rowvar=False)
    penentu = float(np.linalg.det(R))
    khi = float(-(n - 1 - (2 * p + 5) / 6) * np.log(penentu))
    db = p * (p - 1) // 2
    return {
        "penentu": penentu,
        "khiKuadrat": khi,
        "db": db,
        "p": float(stats.chi2.sf(khi, db)),
    }


def kmo(m: np.ndarray) -> dict:
    """Kaiser-Meyer-Olkin keseluruhan dan per butir."""
    R = np.corrcoef(m, rowvar=False)
    kebalikan = np.linalg.inv(R)
    akar = np.sqrt(np.diag(kebalikan))
    parsial = -kebalikan / np.outer(akar, akar)
    np.fill_diagonal(parsial, 0.0)
    Rt = R.copy()
    np.fill_diagonal(Rt, 0.0)

    jumlah_r = float((Rt**2).sum())
    jumlah_p = float((parsial**2).sum())
    per_butir = []
    for j in range(m.shape[1]):
        r = float((Rt[j] ** 2).sum())
        q = float((parsial[j] ** 2).sum())
        per_butir.append(r / (r + q))
    return {"kmo": jumlah_r / (jumlah_r + jumlah_p), "msa": per_butir}


def nilai_eigen(m: np.ndarray) -> list[float]:
    R = np.corrcoef(m, rowvar=False)
    nilai = np.linalg.eigvalsh(R)[::-1]
    return [float(v) for v in nilai]


# --- Perakitan vektor emas -------------------------------------------------


def bangun() -> dict:
    kasus: list[dict] = []

    # 1. Statistik deskriptif dan korelasi atas data kontinu.
    for benih in (1, 7, 99, 2026):
        x = np.array(deret(40, benih))
        y = np.array(deret(40, benih + 1))
        kasus.append(
            {
                "jenis": "deskriptif",
                "nama": f"deskriptif-{benih}",
                "x": x.tolist(),
                "y": y.tolist(),
                "harapan": {
                    "rerata": float(x.mean()),
                    "variansPopulasi": float(x.var(ddof=0)),
                    "variansSampel": float(x.var(ddof=1)),
                    "sbPopulasi": float(x.std(ddof=0)),
                    "sbSampel": float(x.std(ddof=1)),
                    "median": float(np.median(x)),
                    "q1": float(np.percentile(x, 25, method="linear")),
                    "q3": float(np.percentile(x, 75, method="linear")),
                    "pearson": float(stats.pearsonr(x, y).statistic),
                    "spearman": float(stats.spearmanr(x, y).statistic),
                    "persentilSpss25": persentil_spss(x, 0.25),
                    "persentilSpss75": persentil_spss(x, 0.75),
                },
            }
        )

    # 2. Nilai kritis r dari distribusi t scipy, untuk seluruh rentang N lazim.
    kasus.append(
        {
            "jenis": "rKritis",
            "nama": "r-kritis",
            "harapan": {
                "taraf5": {str(n): r_kritis(n, 0.05) for n in range(3, 121)},
                "taraf1": {str(n): r_kritis(n, 0.01) for n in range(3, 121)},
            },
        }
    )

    # 3. Reliabilitas dan analisis aitem atas matriks dikotomi.
    for benih, baris, kolom in ((11, 40, 10), (21, 35, 8), (73, 60, 12)):
        mentah = matriks_dikotomi(baris, kolom, benih)
        m = np.array(mentah, dtype=float)
        kasus.append(
            {
                "jenis": "dikotomi",
                "nama": f"dikotomi-{benih}",
                "matriks": mentah,
                "harapan": {
                    "alphaCronbach": alpha_cronbach(m),
                    "kr20": kr20(m),
                    "kr21": kr21(m),
                    "korelasiAitemTotal": korelasi_aitem_total(m),
                    "indeksKesukaran": indeks_kesukaran(m),
                    "dayaPembeda50": daya_pembeda(m, 0.5),
                    "dayaPembeda27": daya_pembeda(m, 0.27),
                    "guttman": guttman(m.astype(int)),
                },
            }
        )

    # 4. Reliabilitas atas matriks politomi (Likert).
    for benih, baris, kolom in ((13, 40, 10), (31, 30, 6)):
        mentah = matriks_likert(baris, kolom, benih)
        m = np.array(mentah, dtype=float)
        kasus.append(
            {
                "jenis": "likert",
                "nama": f"likert-{benih}",
                "matriks": mentah,
                "harapan": {
                    "alphaCronbach": alpha_cronbach(m),
                    "korelasiAitemTotal": korelasi_aitem_total(m),
                    "rerataButir": [float(v) for v in m.mean(axis=0)],
                },
            }
        )

    # 5. Skor standar.
    skor = [50.0, 55.0, 61.0, 67.0, 70.0, 74.0, 80.0, 88.0, 91.0, 95.0]
    arr = np.array(skor)
    z = (arr - arr.mean()) / arr.std(ddof=0)
    kasus.append(
        {
            "jenis": "skor",
            "nama": "skor-standar",
            "x": skor,
            "harapan": {
                "z": z.tolist(),
                "t": (50 + 10 * z).tolist(),
                "stanine": [int(min(9, max(1, round(2 * nilai + 5)))) for nilai in z],
            },
        }
    )


    # 6. Analisis faktor: kelayakan dan nilai eigen atas data dua dimensi.
    #    factanal() dan sepupunya di Python memakai penaksir yang berbeda dan
    #    tidak bisa diadu langsung, tapi tiga hal yang mendahuluinya bisa —
    #    dan justru tiga hal itulah yang menentukan apakah pemfaktorannya
    #    boleh dikerjakan sama sekali.
    faktor_mentah = matriks_likert(40, 8, 4242)
    fm = np.array(faktor_mentah, dtype=float)
    kasus.append(
        {
            "jenis": "faktor",
            "nama": "faktor-4242",
            "matriks": faktor_mentah,
            "harapan": {
                "bartlett": bartlett(fm),
                "kmo": kmo(fm),
                "eigen": nilai_eigen(fm),
            },
        }
    )

    return {
        "versi": 1,
        "dibangkitkanOleh": {
            "python": ".".join(str(bagian) for bagian in __import__("sys").version_info[:3]),
            "numpy": np.__version__,
            "scipy": __import__("scipy").__version__,
        },
        "kasus": kasus,
    }


def _jelajah(kiri, kanan, jalur=""):
    """Bandingkan dua struktur bersarang, memulangkan selisih numerik terbesar."""
    if isinstance(kiri, dict):
        if not isinstance(kanan, dict) or kiri.keys() != kanan.keys():
            raise SystemExit(f"struktur berbeda di {jalur or '<akar>'}")
        return max(
            (_jelajah(kiri[k], kanan[k], f"{jalur}.{k}") for k in kiri),
            default=(0.0, jalur),
        )
    if isinstance(kiri, list):
        if not isinstance(kanan, list) or len(kiri) != len(kanan):
            raise SystemExit(f"panjang larik berbeda di {jalur or '<akar>'}")
        return max(
            (_jelajah(a, b, f"{jalur}[{i}]") for i, (a, b) in enumerate(zip(kiri, kanan))),
            default=(0.0, jalur),
        )
    if isinstance(kiri, bool) or kiri is None:
        if kiri != kanan:
            raise SystemExit(f"nilai berbeda di {jalur}: {kiri!r} vs {kanan!r}")
        return (0.0, jalur)
    if isinstance(kiri, (int, float)):
        if not isinstance(kanan, (int, float)):
            raise SystemExit(f"tipe berbeda di {jalur}")
        skala = max(1.0, abs(kiri), abs(kanan))
        return (abs(kiri - kanan) / skala, jalur)
    if kiri != kanan:
        raise SystemExit(f"nilai berbeda di {jalur}: {kiri!r} vs {kanan!r}")
    return (0.0, jalur)


# Batas pemeriksaan ulang. Jauh lebih longgar daripada presisi double, dan jauh
# lebih ketat daripada 1e-10 yang dituntut uji konformansi — cukup untuk
# menangkap rumus yang berubah, tanpa mempersoalkan digit terakhir.
TOLERANSI_PERIKSA = 1e-12


def periksa() -> None:
    """Bangkitkan ulang, lalu bandingkan dengan vektor yang tersimpan.

    Ini TIDAK boleh berupa perbandingan byte demi byte. scipy.stats.t.ppf tidak
    menjanjikan hasil yang identik bit demi bit antar sistem operasi dan antar
    build BLAS; menjalankannya di Windows dan di Linux memang memberi selisih
    pada digit ke-16. Perbandingan byte akan menyatakan itu sebagai kegagalan,
    padahal yang berbeda bukan rumusnya melainkan pembulatan terakhirnya.
    """
    tersimpan = json.loads(BERKAS_KELUARAN.read_text(encoding="utf-8"))
    baru = bangun()

    # Metadata versi pustaka memang berbeda antar mesin, jadi tidak dibandingkan.
    tersimpan.pop("dibangkitkanOleh", None)
    baru.pop("dibangkitkanOleh", None)

    selisih, jalur = _jelajah(tersimpan, baru)
    if selisih > TOLERANSI_PERIKSA:
        raise SystemExit(
            f"vektor emas menyimpang: selisih relatif {selisih:.3e} di {jalur} "
            f"(batas {TOLERANSI_PERIKSA:.0e})"
        )
    print(f"vektor emas cocok — selisih relatif terbesar {selisih:.3e} di {jalur}")


def main() -> None:
    import sys

    if "--periksa" in sys.argv:
        periksa()
        return

    data = bangun()
    BERKAS_KELUARAN.write_text(json.dumps(data, indent=1), encoding="utf-8")
    print(f"vektor emas ditulis: {BERKAS_KELUARAN}")
    print(f"  numpy {np.__version__}, scipy {__import__('scipy').__version__}")
    print(f"  {len(data['kasus'])} kasus")


if __name__ == "__main__":
    main()
