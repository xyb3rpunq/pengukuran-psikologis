# ---------------------------------------------------------------------------
# Analisis aitem tes prestasi
#
# Acuan modul: PSI307 sesi 4 (penulisan aitem) dan sesi 7 (analisis aitem).
#
# Modul memakai dua parameter: indeks kesukaran P dan indeks daya pembeda D.
#
#   P = B / Js        B = banyak peserta menjawab benar, Js = seluruh peserta
#   D = BA/JA - BB/JB       = proporsi benar kelompok atas - kelompok bawah
#
# Batas kategori di modul ditulis bertumpuk ("P = 0.00-0.30 sukar, P =
# 0.30-0.70 sedang"), sehingga P tepat 0,30 masuk dua kategori sekaligus.
# Di sini dipakai konvensi baku Arikunto yang menutup batas atas:
# 0,00 < P <= 0,30 sukar; 0,30 < P <= 0,70 sedang; 0,70 < P <= 1,00 mudah.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Indeks kesukaran P setiap aitem.
#'
#' @param m matriks dikotomi: baris = peserta, kolom = aitem, 1 = benar
ps_indeks_kesukaran <- function(m) {
  ps_periksa_matriks(m, dikotomi = TRUE, minAitem = 1L, minResponden = 1L)
  as.numeric(colMeans(as.matrix(m)))
}

#' Kategori taraf kesukaran. Memulangkan kode, bukan kalimat.
ps_kategori_kesukaran <- function(p) {
  vapply(p, function(nilai) {
    if (!is.finite(nilai)) return(NA_character_)
    if (nilai <= 0.30) return("sukar")
    if (nilai <= 0.70) return("sedang")
    "mudah"
  }, character(1L))
}

#' Bagi peserta menjadi kelompok atas dan bawah berdasarkan skor total.
#'
#' @param proporsi bagian yang diambil dari tiap ujung. Modul memberi dua
#'                 aturan: kelompok kecil (< 100 peserta) dibelah 50/50, dan
#'                 kelompok besar cukup 27% teratas melawan 27% terbawah.
#'                 Angka 27% bukan angka sembarangan — Kelley (1939) menunjukkan
#'                 proporsi itu memaksimalkan kepekaan D pada sebaran normal.
#'                 Biarkan NULL agar aturan modul dipilih otomatis dari N.
ps_kelompok_ekstrem <- function(m, proporsi = NULL) {
  ps_periksa_matriks(m, minAitem = 1L, minResponden = 2L)
  m <- as.matrix(m)
  n <- nrow(m)
  if (is.null(proporsi)) proporsi <- if (n < 100L) 0.5 else 0.27
  ps_pastikan(length(proporsi) == 1L && is.finite(proporsi) &&
                proporsi > 0 && proporsi <= 0.5,
              "nilai.diLuarRentang", nilai = proporsi, bawah = 0, atas = 0.5)
  total <- rowSums(m)
  # Urutan menurun; peserta berskor sama diurut stabil menurut nomor urutnya
  # supaya hasil analisis dapat diulang persis pada data yang sama.
  urutan <- order(-total, seq_len(n))
  banyak <- max(1L, round(n * proporsi))
  list(
    proporsi = proporsi,
    banyakTiapKelompok = banyak,
    atas = urutan[seq_len(banyak)],
    bawah = rev(urutan)[seq_len(banyak)],
    skorTotal = total
  )
}

#' Indeks daya pembeda D setiap aitem.
ps_daya_pembeda <- function(m, proporsi = NULL) {
  ps_periksa_matriks(m, dikotomi = TRUE, minAitem = 1L, minResponden = 2L)
  m <- as.matrix(m)
  kelompok <- ps_kelompok_ekstrem(m, proporsi)
  pa <- colMeans(m[kelompok$atas, , drop = FALSE])
  pb <- colMeans(m[kelompok$bawah, , drop = FALSE])
  as.numeric(pa - pb)
}

#' Kategori daya pembeda menurut Arikunto.
#'
#' D negatif berarti aitemnya terbalik: peserta lemah justru lebih sering
#' menjawab benar daripada peserta kuat. Aitem seperti itu tidak diperbaiki,
#' melainkan dibuang.
ps_kategori_daya_pembeda <- function(d) {
  vapply(d, function(nilai) {
    if (!is.finite(nilai)) return(NA_character_)
    if (nilai < 0) return("dibuang")
    if (nilai <= 0.20) return("jelek")
    if (nilai <= 0.40) return("cukup")
    if (nilai <= 0.70) return("baik")
    "baikSekali"
  }, character(1L))
}

#' Analisis aitem lengkap: P, D, kategori, dan korelasi aitem-total.
#'
#' Aitem dinyatakan layak pakai bila taraf kesukarannya sedang dan daya
#' pembedanya minimal cukup — dua syarat yang disebut modul berdampingan.
ps_analisis_aitem <- function(m, proporsi = NULL) {
  ps_periksa_matriks(m, dikotomi = TRUE, minAitem = 2L, minResponden = 2L)
  m <- as.matrix(m)
  kelompok <- ps_kelompok_ekstrem(m, proporsi)
  p <- ps_indeks_kesukaran(m)
  pa <- as.numeric(colMeans(m[kelompok$atas, , drop = FALSE]))
  pb <- as.numeric(colMeans(m[kelompok$bawah, , drop = FALSE]))
  d <- pa - pb
  kategoriP <- ps_kategori_kesukaran(p)
  kategoriD <- ps_kategori_daya_pembeda(d)
  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(ncol(m)))

  list(
    n = nrow(m),
    banyakAitem = ncol(m),
    proporsiKelompok = kelompok$proporsi,
    banyakTiapKelompok = kelompok$banyakTiapKelompok,
    rerataSkorTotal = ps_rerata(kelompok$skorTotal),
    butir = data.frame(
      aitem = nama,
      benar = as.numeric(colSums(m)),
      p = p,
      kategoriKesukaran = kategoriP,
      pAtas = pa,
      pBawah = pb,
      d = d,
      kategoriDayaPembeda = kategoriD,
      korelasiAitemTotal = ps_korelasi_aitem_total(m, dikoreksi = TRUE),
      layak = kategoriP == "sedang" & kategoriD %in% c("cukup", "baik", "baikSekali"),
      stringsAsFactors = FALSE
    )
  )
}
