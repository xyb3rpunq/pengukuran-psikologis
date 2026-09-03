# ---------------------------------------------------------------------------
# Skala Thurstone (metode equal appearing interval)
#
# Acuan modul: PSI307 sesi 9 dan 10.
#
# Alurnya: sejumlah penilai (juri, minimal 30 menurut modul) meletakkan tiap
# pernyataan pada rentang 1..11. Untuk tiap butir dihitung frekuensi F,
# proporsi P, dan proporsi kumulatif Pk, lalu:
#
#   S = Bb + ((0,50 - Pkb) / pm) * i
#
#   S   = nilai skala butir, yakni mediannya
#   Bb  = batas bawah kategori tempat median jatuh
#   Pkb = proporsi kumulatif di bawah kategori itu
#   pm  = proporsi pada kategori itu
#   i   = lebar interval, di sini 1
#
# S menyatakan LOKASI butir: makin besar, makin favorabel. Q menyatakan
# KESEPAKATAN penilai: makin kecil, makin seragam penilaiannya. Butir yang
# dipakai adalah yang Q-nya kecil dan yang S-nya menyebar merata sepanjang
# rentang, supaya skala bisa membedakan sikap di semua tingkat.
#
# -- Dua metode di dalam satu modul ------------------------------------------
#
# Modulnya sendiri tidak konsisten, dan itu bukan salah ketik. Sesi 9 menulis
# rumus interpolasi data terkelompok di atas. Sesi 10 menyuruh hal lain: buka
# SPSS, Analyze > Descriptive > Frequencies, centang Median dan Quartile, lalu
# Q = persentil 75 dikurangi persentil 25 — yakni persentil atas data mentah,
# bukan interpolasi data terkelompok.
#
# Keduanya memberi jawaban berbeda, dan modul memberi satu petunjuk tegas siapa
# yang benar untuk Q. Sesi 10 menyatakan: "Lihat pada butir A5 nilai Q yang
# menunjukkan 0, artinya semua panelis memberikan nilai 3 pada butir tersebut."
# Bila seluruh penilai memberi angka 3, interpolasi terkelompok menghasilkan
# K25 = 2,75 dan K75 = 3,25, jadi Q = 0,5 — bukan 0. Persentil data mentah
# menghasilkan 3 dan 3, jadi Q = 0. Hanya cara kedua yang cocok.
#
# Maka: S memakai rumus terkelompok sesi 9, Q memakai persentil SPSS sesi 10.
# Nilai terkelompok untuk kuartil tetap dipulangkan sebagai sTerkelompok,
# k25Terkelompok, dan k75Terkelompok, supaya selisih kedua metode terlihat
# alih-alih disembunyikan.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Interpolasi persentil pada data terkelompok — rumus median modul sesi 9.
#'
#' @param frekuensi vektor frekuensi per kategori, kategori 1..k berurutan
#' @param p         proporsi yang dicari (0,50 untuk median)
#' @param i         lebar interval kategori
ps_persentil_terkelompok <- function(frekuensi, p, i = 1) {
  ps_periksa_deret(frekuensi, minimal = 1L)
  ps_pastikan(all(frekuensi >= 0), "nilai.harusPositif", nilai = min(frekuensi))
  n <- sum(frekuensi)
  ps_pastikan(n > 0, "data.kosong")
  ps_pastikan(length(p) == 1L && is.finite(p) && p > 0 && p < 1,
              "nilai.diLuarRentang", nilai = p, bawah = 0, atas = 1)

  proporsi <- frekuensi / n
  kumulatif <- cumsum(proporsi)
  # Kategori tempat proporsi p terlampaui untuk pertama kalinya.
  posisi <- which(kumulatif >= p)[1L]
  pkb <- if (posisi == 1L) 0 else kumulatif[posisi - 1L]
  pm <- proporsi[posisi]
  batasBawah <- posisi - 0.5 * i
  # Kategori kosong tidak bisa diinterpolasi; batas bawahnya sudah jawabannya.
  if (pm == 0) return(batasBawah)
  batasBawah + ((p - pkb) / pm) * i
}

#' Persentil bergaya SPSS FREQUENCIES atas data mentah.
#'
#' SPSS memakai metode "weighted average at X[(n+1)p]", yang di R adalah
#' quantile(type = 6). Inilah yang dihasilkan langkah SPSS di modul sesi 10,
#' jadi inilah yang dipakai untuk K25, K75, dan Q.
ps_persentil_spss <- function(x, p) {
  ps_periksa_deret(x, minimal = 1L)
  ps_pastikan(length(p) == 1L && is.finite(p) && p >= 0 && p <= 1,
              "nilai.diLuarRentang", nilai = p, bawah = 0, atas = 1)
  urut <- sort(as.numeric(x))
  n <- length(urut)
  h <- (n + 1) * p
  if (h <= 1) return(urut[1L])
  if (h >= n) return(urut[n])
  bawah <- floor(h)
  urut[bawah] + (h - bawah) * (urut[bawah + 1L] - urut[bawah])
}

#' Tabulasi penilaian juri untuk satu butir: F, P, dan Pk per kategori.
ps_tabulasi_thurstone <- function(penilaian, kategori = 11L) {
  ps_periksa_deret(penilaian, minimal = 1L)
  ps_pastikan(all(penilaian >= 1 & penilaian <= kategori & penilaian == round(penilaian)),
              "thurstone.penilaianDiLuarRentang", atas = kategori)
  f <- as.numeric(tabulate(as.integer(penilaian), nbins = kategori))
  p <- f / sum(f)
  data.frame(kategori = seq_len(kategori), f = f, p = p, pk = cumsum(p))
}

#' Nilai S dan Q setiap butir dari matriks penilaian juri.
#'
#' @param m        baris = juri/penilai, kolom = butir pernyataan
#' @param kategori banyak titik skala penilaian (modul memakai 11)
ps_analisis_thurstone <- function(m, kategori = 11L) {
  ps_periksa_matriks(m, minAitem = 1L, minResponden = 2L)
  m <- as.matrix(m)
  ps_pastikan(all(m >= 1 & m <= kategori & m == round(m)),
              "thurstone.penilaianDiLuarRentang", atas = kategori)
  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(ncol(m)))

  hasil <- lapply(seq_len(ncol(m)), function(j) {
    penilaian <- as.numeric(m[, j])
    f <- as.numeric(tabulate(as.integer(penilaian), nbins = kategori))
    k25 <- ps_persentil_spss(penilaian, 0.25)
    k75 <- ps_persentil_spss(penilaian, 0.75)
    list(
      s = ps_persentil_terkelompok(f, 0.50),
      k25 = k25,
      k75 = k75,
      q = k75 - k25,
      sTerkelompok = ps_persentil_terkelompok(f, 0.50),
      k25Terkelompok = ps_persentil_terkelompok(f, 0.25),
      k75Terkelompok = ps_persentil_terkelompok(f, 0.75)
    )
  })

  butir <- data.frame(
    butir = nama,
    s = vapply(hasil, function(h) h$s, numeric(1L)),
    k25 = vapply(hasil, function(h) h$k25, numeric(1L)),
    k75 = vapply(hasil, function(h) h$k75, numeric(1L)),
    q = vapply(hasil, function(h) h$q, numeric(1L)),
    k25Terkelompok = vapply(hasil, function(h) h$k25Terkelompok, numeric(1L)),
    k75Terkelompok = vapply(hasil, function(h) h$k75Terkelompok, numeric(1L)),
    qTerkelompok = vapply(hasil, function(h) h$k75Terkelompok - h$k25Terkelompok, numeric(1L)),
    stringsAsFactors = FALSE
  )
  butir <- butir[order(butir$s, butir$q), , drop = FALSE]
  rownames(butir) <- NULL

  list(
    banyakPenilai = nrow(m),
    banyakButir = ncol(m),
    kategori = kategori,
    butir = butir
  )
}

#' Pilih butir untuk skala akhir: Q sekecil mungkin, S semenyebar mungkin.
#'
#' Aturan modul: cari butir dengan Q kecil, usahakan ada variasi nilai S, dan
#' bila beberapa butir punya S sama pilih yang Q-nya terendah. Fungsi ini
#' mengelompokkan butir menurut S yang dibulatkan, mengambil butir ber-Q
#' terendah dari tiap kelompok, lalu menahan diri berhenti di situ — butir
#' terbaik pada satu lokasi tidak ada gunanya bila lokasinya kembar.
#'
#' @param hasil    keluaran ps_analisis_thurstone()
#' @param maksimal banyak butir yang diinginkan pada skala akhir
ps_pilih_butir_thurstone <- function(hasil, maksimal = 8L) {
  butir <- hasil$butir
  ps_pastikan(is.data.frame(butir) && nrow(butir) > 0L, "data.kosong")
  ps_pastikan(length(maksimal) == 1L && is.finite(maksimal) && maksimal >= 1,
              "nilai.harusPositif", nilai = maksimal)

  lokasi <- round(butir$s)
  terpilih <- vapply(unique(lokasi), function(l) {
    calon <- which(lokasi == l)
    calon[which.min(butir$q[calon])]
  }, integer(1L))

  # Bila lokasinya lebih banyak daripada butir yang diminta, sisakan yang
  # paling disepakati penilai — Q terkecil menang.
  terpilih <- terpilih[order(butir$q[terpilih])]
  if (length(terpilih) > maksimal) terpilih <- terpilih[seq_len(maksimal)]
  terpilih <- terpilih[order(butir$s[terpilih])]

  dipilih <- butir[terpilih, , drop = FALSE]
  rownames(dipilih) <- NULL
  list(
    diminta = maksimal,
    terpilih = nrow(dipilih),
    lokasiTerwakili = length(unique(round(dipilih$s))),
    butir = dipilih
  )
}

#' Skor sikap seorang responden pada skala Thurstone yang sudah jadi.
#'
#' Responden hanya menandai pernyataan yang ia setujui. Skornya adalah rerata
#' nilai S pernyataan yang ditandai — bukan jumlahnya, karena yang dicari
#' posisi pada kontinum 1..11, bukan banyaknya persetujuan.
#'
#' @param nilaiS nilai S butir-butir pada skala akhir
#' @param setuju vektor logis sepanjang nilaiS, TRUE bila butir itu ditandai
ps_skor_thurstone <- function(nilaiS, setuju) {
  ps_periksa_deret(nilaiS, minimal = 1L)
  ps_pastikan(length(setuju) == length(nilaiS), "data.panjangBeda",
              panjangX = length(nilaiS), panjangY = length(setuju))
  ditandai <- which(as.logical(setuju))
  list(
    banyakDitandai = length(ditandai),
    nilaiDitandai = ps_larik(as.numeric(nilaiS[ditandai])),
    skor = if (length(ditandai) == 0L) NA_real_ else ps_rerata(as.numeric(nilaiS[ditandai]))
  )
}
