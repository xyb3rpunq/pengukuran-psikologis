# ---------------------------------------------------------------------------
# Skala Likert
#
# Acuan modul: PSI307 sesi 13 (dan sesi 2 untuk langkah penyusunannya).
#
# Dua hal yang paling sering salah dikerjakan, dan keduanya ditangani di sini:
#
# 1. Butir unfavorable harus dibalik sebelum dijumlahkan. Skor terbalik =
#    (banyak kategori + 1) - respons. Tanpa pembalikan, butir yang bunyinya
#    negatif akan menghapus butir yang bunyinya positif dan alpha ikut jatuh.
#
# 2. Respons Likert berskala ordinal. Menjumlahkannya menjadi skor total
#    mengandaikan jarak antar pilihan sama besar — asumsi yang tidak dijamin
#    datanya. Modul sesi 14 menyebut ini terang-terangan, dan sesi 9 memakainya
#    sebagai alasan keberadaan skala Thurstone. Mesin ini tetap menjumlahkan
#    karena begitulah praktik yang diajarkan, tapi juga memulangkan korelasi
#    Spearman aitem-total agar keputusan tidak bergantung pada asumsi itu saja.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Balik skor butir unfavorable.
#'
#' @param m         matriks respons mentah (baris = responden, kolom = butir)
#' @param favorable vektor logis sepanjang jumlah butir
#' @param kategori  banyak pilihan jawaban (4 atau 5 pada umumnya)
ps_balik_unfavorable <- function(m, favorable, kategori = 5L) {
  ps_periksa_matriks(m, minAitem = 1L, minResponden = 1L)
  m <- as.matrix(m)
  ps_pastikan(length(favorable) == ncol(m), "data.panjangBeda",
              panjangX = ncol(m), panjangY = length(favorable))
  ps_pastikan(all(m >= 1 & m <= kategori & m == round(m)),
              "nilai.diLuarRentang", nilai = kategori, bawah = 1, atas = kategori)
  favorable <- as.logical(favorable)
  for (j in seq_len(ncol(m))) {
    if (!favorable[j]) m[, j] <- (kategori + 1L) - m[, j]
  }
  m
}

#' Kategori indeks persentase skor.
#'
#' Pembagian lima jenjang yang lazim dipakai pada laporan skala Likert.
ps_kategori_indeks <- function(persen) {
  vapply(persen, function(nilai) {
    if (!is.finite(nilai)) return(NA_character_)
    if (nilai <= 20) return("sangatRendah")
    if (nilai <= 40) return("rendah")
    if (nilai <= 60) return("sedang")
    if (nilai <= 80) return("tinggi")
    "sangatTinggi"
  }, character(1L))
}

#' Analisis skala Likert lengkap.
#'
#' @param m         matriks respons mentah, nilai 1..kategori
#' @param favorable vektor logis; NULL berarti semua butir favorable
#' @param kategori  banyak pilihan jawaban
ps_analisis_likert <- function(m, favorable = NULL, kategori = 5L) {
  ps_periksa_matriks(m, minAitem = 2L, minResponden = 2L)
  m <- as.matrix(m)
  if (is.null(favorable)) favorable <- rep(TRUE, ncol(m))
  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(ncol(m)))

  terskor <- ps_balik_unfavorable(m, favorable, kategori)
  total <- rowSums(terskor)
  skorMaksimum <- ncol(m) * kategori
  indeksResponden <- total / skorMaksimum * 100

  # Indeks skala keseluruhan: total seluruh sel dibagi total maksimum yang
  # mungkin dicapai seluruh responden pada seluruh butir.
  indeksSkala <- sum(terskor) / (nrow(m) * skorMaksimum) * 100

  alpha <- tryCatch(ps_alpha_cronbach(terskor), ps_ralat = function(k) NA_real_)

  list(
    n = nrow(m),
    banyakButir = ncol(m),
    kategori = kategori,
    skorMaksimumResponden = skorMaksimum,
    rerataTotal = ps_rerata(total),
    sbTotal = ps_sb_sampel(total),
    indeksSkala = indeksSkala,
    kategoriSkala = ps_kategori_indeks(indeksSkala),
    alphaCronbach = alpha,
    kategoriAlpha = ps_kategori_guilford(alpha),
    butir = data.frame(
      butir = nama,
      favorable = as.logical(favorable),
      rerataMentah = as.numeric(colMeans(m)),
      rerataTerskor = as.numeric(colMeans(terskor)),
      sb = as.numeric(apply(terskor, 2L, ps_sb_sampel)),
      indeks = as.numeric(colMeans(terskor)) / kategori * 100,
      korelasiAitemTotal = ps_korelasi_aitem_total(terskor, dikoreksi = TRUE),
      korelasiSpearman = vapply(seq_len(ncol(terskor)), function(j) {
        tryCatch(ps_spearman(terskor[, j], total - terskor[, j]),
                 ps_ralat = function(k) NA_real_)
      }, numeric(1L)),
      alphaJikaDibuang = if (ncol(terskor) >= 3L) {
        ps_alpha_jika_dibuang(terskor)
      } else {
        rep(NA_real_, ncol(terskor))
      },
      stringsAsFactors = FALSE
    ),
    responden = data.frame(
      responden = if (is.null(rownames(m))) paste0("R", seq_len(nrow(m))) else rownames(m),
      total = as.numeric(total),
      indeks = as.numeric(indeksResponden),
      kategori = ps_kategori_indeks(indeksResponden),
      stringsAsFactors = FALSE
    )
  )
}
