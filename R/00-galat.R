# ---------------------------------------------------------------------------
# Galat terkendali
#
# Mesin ini tidak pernah memuat kalimat berbahasa manusia. Ia melempar sebuah
# *kode* yang diterjemahkan oleh lapisan i18n di sisi peramban, sehingga
# satu-satunya sumber kalimat ada di src/i18n dan uji kebocoran dwibahasa bisa
# memeriksanya secara menyeluruh.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

# Kode galat yang dipakai berkas-berkas berikutnya:
#   data.kosong, data.panjangBeda, data.minimalDua, data.bukanAngka,
#   data.variansiNol, matriks.kosong, matriks.barisTidakSeragam,
#   matriks.bukanDikotomi, matriks.minimalDuaAitem, matriks.minimalDuaResponden,
#   nilai.diLuarRentang, nilai.harusPositif, skala.tidakDikenal,
#   thurstone.penilaianDiLuarRentang, guttman.responBukanBiner,
#   faktor.matriksSingular, faktor.terlaluBanyak, faktor.gagalKonvergen,
#   sus.bukanSepuluhButir, distraktor.kunciDiLuarRentang,
#   distraktor.pilihanDiLuarRentang

#' Lempar galat dengan kode yang bisa diterjemahkan.
#'
#' @param kode  string pendek, mis. "data.kosong"
#' @param ...   pasangan konteks bernama, mis. n = 3
ps_ralat <- function(kode, ...) {
  konteks <- list(...)
  kondisi <- structure(
    class = c("ps_ralat", "error", "condition"),
    list(message = kode, call = NULL, kode = kode, konteks = konteks)
  )
  stop(kondisi)
}

#' Pastikan sebuah syarat terpenuhi, atau lempar galat berkode.
ps_pastikan <- function(syarat, kode, ...) {
  if (!isTRUE(syarat)) ps_ralat(kode, ...)
  invisible(TRUE)
}

#' Periksa satu deret angka: tidak kosong, numerik, dan seluruhnya hingga.
#'
#' @param x        vektor numerik
#' @param minimal  panjang minimum yang diperlukan
ps_periksa_deret <- function(x, minimal = 1L) {
  ps_pastikan(is.numeric(x) || is.logical(x), "data.bukanAngka", indeks = -1L)
  n <- length(x)
  if (n < minimal) {
    ps_ralat(
      if (n == 0L) "data.kosong" else "data.minimalDua",
      panjang = n, minimal = minimal
    )
  }
  buruk <- which(!is.finite(as.numeric(x)))
  if (length(buruk) > 0L) ps_ralat("data.bukanAngka", indeks = buruk[1L])
  invisible(TRUE)
}

#' Periksa dua deret sejajar dengan panjang sama.
ps_periksa_pasangan <- function(x, y, minimal = 2L) {
  ps_periksa_deret(x, minimal)
  ps_periksa_deret(y, minimal)
  ps_pastikan(length(x) == length(y), "data.panjangBeda",
              panjangX = length(x), panjangY = length(y))
  invisible(TRUE)
}

#' Periksa matriks respons: baris = responden, kolom = aitem.
#'
#' @param m            matriks numerik
#' @param dikotomi     jika TRUE, seluruh sel wajib bernilai 0 atau 1
#' @param minAitem     jumlah kolom minimum
#' @param minResponden jumlah baris minimum
ps_periksa_matriks <- function(m, dikotomi = FALSE, minAitem = 1L, minResponden = 1L) {
  ps_pastikan(is.matrix(m) || is.data.frame(m), "matriks.kosong")
  m <- as.matrix(m)
  ps_pastikan(nrow(m) >= minResponden, "matriks.minimalDuaResponden", baris = nrow(m))
  ps_pastikan(ncol(m) >= minAitem, "matriks.minimalDuaAitem", kolom = ncol(m))
  ps_pastikan(all(is.finite(m)), "data.bukanAngka", indeks = -1L)
  if (dikotomi) {
    ps_pastikan(all(m %in% c(0, 1)), "matriks.bukanDikotomi")
  }
  invisible(TRUE)
}
