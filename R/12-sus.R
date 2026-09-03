# ---------------------------------------------------------------------------
# System Usability Scale
#
# SUS adalah skala Likert 10 butir yang dirancang Brooke (1996) dan sampai
# sekarang menjadi alat ukur kebergunaan yang paling banyak dipakai. Ia masuk
# ke sini karena merupakan contoh terbaik dari apa yang diajarkan sesi 13:
# separuh butirnya sengaja unfavorable, dan tanpa pembalikan skor angkanya
# tidak berarti apa-apa.
#
# Penskorannya:
#   butir ganjil (favorable)    -> sumbangan = jawaban - 1
#   butir genap  (unfavorable)  -> sumbangan = 5 - jawaban
#   skor SUS = jumlah sumbangan x 2,5,  rentang 0 sampai 100
#
# Perkalian 2,5 itu yang paling sering disalahpahami. Skor SUS BUKAN
# persentase dan bukan nilai ujian: 68 bukan "68 persen puas", melainkan titik
# rata-rata dari ratusan penelitian terdahulu. Skor 70 yang terdengar
# pas-pasan sebenarnya di atas rata-rata.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Skor SUS untuk satu matriks respons 10 butir.
#'
#' @param m matriks: baris = responden, kolom = 10 butir SUS berurutan, 1..5
ps_skor_sus <- function(m) {
  # Jumlah kolom diperiksa lebih dulu daripada pemeriksaan matriks umum.
  # Kalau urutannya dibalik, matriks delapan kolom akan dilaporkan sebagai
  # "perlu sepuluh aitem" oleh pemeriksa umum — benar, tapi jauh kurang
  # menolong daripada menyebut bahwa SUS memang selalu sepuluh butir.
  ps_pastikan(is.matrix(m) || is.data.frame(m), "matriks.kosong")
  ps_pastikan(ncol(as.matrix(m)) == 10L, "sus.bukanSepuluhButir", kolom = ncol(as.matrix(m)))
  ps_periksa_matriks(m, minAitem = 10L, minResponden = 1L)
  m <- as.matrix(m)
  ps_pastikan(all(m >= 1 & m <= 5 & m == round(m)),
              "nilai.diLuarRentang", nilai = 5, bawah = 1, atas = 5)

  ganjil <- seq(1L, 9L, by = 2L)
  genap <- seq(2L, 10L, by = 2L)
  sumbangan <- m
  sumbangan[, ganjil] <- m[, ganjil, drop = FALSE] - 1
  sumbangan[, genap] <- 5 - m[, genap, drop = FALSE]
  as.numeric(rowSums(sumbangan) * 2.5)
}

#' Peringkat huruf menurut kurva Sauro dan Lewis (2016).
#'
#' Kurva ini disusun dari sebaran lebih dari lima ratus penelitian, bukan dari
#' pembagian rata 0-100. Itu sebabnya batas A+ berada di 84 dan batas C di 65:
#' skor 65 benar-benar berada di sekitar tengah sebaran yang pernah terjadi.
ps_peringkat_sus <- function(skor) {
  vapply(skor, function(nilai) {
    if (!is.finite(nilai)) return(NA_character_)
    if (nilai >= 84.1) return("A+")
    if (nilai >= 80.8) return("A")
    if (nilai >= 78.9) return("A-")
    if (nilai >= 77.2) return("B+")
    if (nilai >= 74.1) return("B")
    if (nilai >= 72.6) return("B-")
    if (nilai >= 71.1) return("C+")
    if (nilai >= 65.0) return("C")
    if (nilai >= 62.7) return("C-")
    if (nilai >= 51.7) return("D")
    "F"
  }, character(1L))
}

#' Kata sifat menurut Bangor, Kortum, dan Miller (2009). Memulangkan kode.
ps_adjektiva_sus <- function(skor) {
  vapply(skor, function(nilai) {
    if (!is.finite(nilai)) return(NA_character_)
    if (nilai < 25) return("terburuk")
    if (nilai < 39) return("buruk")
    if (nilai < 52) return("lumayan")
    if (nilai < 73) return("baik")
    if (nilai < 85) return("sangatBaik")
    "terbaik"
  }, character(1L))
}

#' Tingkat keberterimaan menurut Bangor. Memulangkan kode.
ps_keberterimaan_sus <- function(skor) {
  vapply(skor, function(nilai) {
    if (!is.finite(nilai)) return(NA_character_)
    if (nilai < 51.7) return("takDiterima")
    if (nilai < 71.4) return("marginal")
    "diterima"
  }, character(1L))
}

#' Jenjang persentil skor SUS terhadap sebaran penelitian terdahulu.
#'
#' Memakai hampiran normal dengan rerata 68 dan simpangan baku 12,5, angka
#' yang dilaporkan Sauro dari basis datanya. Hampiran, bukan tabel pasti:
#' sebaran SUS yang sebenarnya sedikit menjulur, jadi angka ini dibaca sebagai
#' perkiraan kedudukan, bukan peringkat yang tepat.
ps_persentil_sus <- function(skor) {
  vapply(skor, function(nilai) {
    if (!is.finite(nilai)) return(NA_real_)
    pnorm(nilai, mean = 68, sd = 12.5) * 100
  }, numeric(1L))
}

#' Analisis SUS lengkap untuk satu kelompok responden.
ps_analisis_sus <- function(m) {
  ps_pastikan(is.matrix(m) || is.data.frame(m), "matriks.kosong")
  ps_pastikan(ncol(as.matrix(m)) == 10L, "sus.bukanSepuluhButir", kolom = ncol(as.matrix(m)))
  ps_periksa_matriks(m, minAitem = 10L, minResponden = 2L)
  m <- as.matrix(m)
  skor <- ps_skor_sus(m)
  rerata <- ps_rerata(skor)

  responden <- rownames(m)
  if (is.null(responden)) responden <- paste0("R", seq_len(nrow(m)))

  # Selang kepercayaan 95% bagi rerata, memakai sebaran t karena sampel
  # penelitian kebergunaan hampir selalu kecil.
  n <- length(skor)
  galatBaku <- if (n >= 2) ps_sb_sampel(skor) / sqrt(n) else NA_real_
  tKritis <- if (n >= 2) qt(0.975, n - 1) else NA_real_

  list(
    n = n,
    rerata = rerata,
    median = ps_median(skor),
    sb = if (n >= 2) ps_sb_sampel(skor) else NA_real_,
    minimum = min(skor),
    maksimum = max(skor),
    galatBaku = galatBaku,
    selangBawah = if (n >= 2) rerata - tKritis * galatBaku else NA_real_,
    selangAtas = if (n >= 2) rerata + tKritis * galatBaku else NA_real_,
    peringkat = ps_peringkat_sus(rerata),
    adjektiva = ps_adjektiva_sus(rerata),
    keberterimaan = ps_keberterimaan_sus(rerata),
    persentil = ps_persentil_sus(rerata),
    diAtasPatokan = rerata > 68,
    # Konsistensi internal SUS itu sendiri. Brooke merancangnya sebagai satu
    # skor tunggal, jadi alpha yang rendah menandakan respondennya tidak
    # menjawab konsisten — bukan bahwa alatnya salah.
    alphaCronbach = tryCatch(
      {
        ganjil <- seq(1L, 9L, by = 2L)
        genap <- seq(2L, 10L, by = 2L)
        terskor <- m
        terskor[, ganjil] <- m[, ganjil, drop = FALSE] - 1
        terskor[, genap] <- 5 - m[, genap, drop = FALSE]
        ps_alpha_cronbach(terskor)
      },
      ps_ralat = function(k) NA_real_
    ),
    butir = data.frame(
      butir = seq_len(10L),
      favorable = seq_len(10L) %% 2L == 1L,
      rerataMentah = as.numeric(colMeans(m)),
      rerataSumbangan = as.numeric(
        colMeans(cbind(
          m[, 1, drop = FALSE] - 1, 5 - m[, 2, drop = FALSE],
          m[, 3, drop = FALSE] - 1, 5 - m[, 4, drop = FALSE],
          m[, 5, drop = FALSE] - 1, 5 - m[, 6, drop = FALSE],
          m[, 7, drop = FALSE] - 1, 5 - m[, 8, drop = FALSE],
          m[, 9, drop = FALSE] - 1, 5 - m[, 10, drop = FALSE]
        ))
      ),
      stringsAsFactors = FALSE
    ),
    responden = data.frame(
      responden = responden,
      skor = skor,
      peringkat = ps_peringkat_sus(skor),
      adjektiva = ps_adjektiva_sus(skor),
      keberterimaan = ps_keberterimaan_sus(skor),
      stringsAsFactors = FALSE
    )
  )
}
