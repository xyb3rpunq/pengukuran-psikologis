# ---------------------------------------------------------------------------
# Skala Guttman (scalogram / analisis skala)
#
# Acuan modul: PSI307 sesi 11 dan 12.
#
# Skala Guttman bersifat kumulatif dan unidimensional: siapa pun yang menjawab
# "ya" pada butir berat semestinya juga menjawab "ya" pada semua butir yang
# lebih ringan. Butir diurutkan dari termudah ke tersulit, responden diurutkan
# dari skor tertinggi ke terendah, lalu setiap penyimpangan dari pola sempurna
# dihitung sebagai satu error.
#
#   Kr = 1 - (e / n)      n = banyak pernyataan x banyak responden
#   Ks = 1 - (e / x)      x = 0,5 * (n - banyak jawaban "ya")
#
# Syarat penerimaan menurut modul: Kr > 0,90 dan Ks > 0,60.
#
# Cara menghitung e mengikuti contoh modul. Responden berskor 17 yang gagal di
# satu butir mudah lalu berhasil di tiga butir sulit dihitung 4 error — jadi
# setiap sel yang berbeda dari pola ideal untuk skor sebesar itu dihitung satu,
# bukan satu error per responden.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Susun scalogram: butir termudah di kiri, responden berskor tertinggi di atas.
ps_skalogram <- function(m) {
  ps_periksa_matriks(m, dikotomi = TRUE, minAitem = 2L, minResponden = 2L)
  m <- as.matrix(m)
  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(ncol(m)))
  responden <- rownames(m)
  if (is.null(responden)) responden <- paste0("R", seq_len(nrow(m)))

  # Butir termudah = paling banyak dijawab "ya". Ikatan dipecah menurut nomor
  # urut aslinya agar susunannya dapat diulang persis.
  proporsi <- colMeans(m)
  urutButir <- order(-proporsi, seq_along(proporsi))
  urutResponden <- order(-rowSums(m), seq_len(nrow(m)))

  tersusun <- m[urutResponden, urutButir, drop = FALSE]
  colnames(tersusun) <- nama[urutButir]
  rownames(tersusun) <- responden[urutResponden]
  list(
    matriks = tersusun,
    urutButir = urutButir,
    urutResponden = urutResponden,
    proporsiYa = as.numeric(proporsi[urutButir]),
    namaButir = nama[urutButir],
    namaResponden = responden[urutResponden]
  )
}

#' Hitung error Goodenough terhadap pola skala sempurna.
#'
#' Untuk responden berskor t, pola idealnya adalah "ya" pada t butir termudah
#' dan "tidak" pada sisanya. Error responden itu adalah banyak sel yang berbeda
#' dari pola tersebut.
ps_error_guttman <- function(matriksTersusun) {
  m <- as.matrix(matriksTersusun)
  k <- ncol(m)
  vapply(seq_len(nrow(m)), function(i) {
    baris <- m[i, ]
    t <- sum(baris)
    ideal <- as.numeric(seq_len(k) <= t)
    sum(abs(baris - ideal))
  }, numeric(1L))
}

#' Analisis skala Guttman lengkap: Kr, Ks, dan reliabilitas KR-21.
ps_analisis_guttman <- function(m) {
  ps_periksa_matriks(m, dikotomi = TRUE, minAitem = 2L, minResponden = 2L)
  m <- as.matrix(m)
  skalogram <- ps_skalogram(m)
  errorPerResponden <- ps_error_guttman(skalogram$matriks)
  e <- sum(errorPerResponden)

  n <- nrow(m) * ncol(m)
  jawabanYa <- sum(m)
  x <- 0.5 * (n - jawabanYa)

  kr <- 1 - e / n
  # x = 0 terjadi bila semua sel berisi "ya"; tidak ada error yang mungkin
  # terjadi secara kebetulan, jadi skalabilitas tidak terdefinisi.
  ks <- if (x > 0) 1 - e / x else NA_real_

  list(
    n = nrow(m),
    banyakButir = ncol(m),
    banyakSel = n,
    jawabanYa = jawabanYa,
    error = e,
    x = x,
    koefisienReprodusibilitas = kr,
    koefisienSkalabilitas = ks,
    reprodusibilitasDiterima = kr > 0.90,
    skalabilitasDiterima = !is.na(ks) && ks > 0.60,
    kr21 = tryCatch(ps_kr21(m), ps_ralat = function(k) NA_real_),
    skalogram = skalogram$matriks,
    namaButir = ps_larik(skalogram$namaButir),
    proporsiYa = ps_larik(skalogram$proporsiYa),
    responden = data.frame(
      responden = skalogram$namaResponden,
      skor = as.numeric(rowSums(skalogram$matriks)),
      error = errorPerResponden,
      stringsAsFactors = FALSE
    )
  )
}
