# ---------------------------------------------------------------------------
# Korelasi
#
# Acuan modul: PSI307 sesi 5 (validitas) dan sesi 6 (reliabilitas belah dua).
#
# Modul memberi rumus korelasi produk momen Pearson "dengan angka kasar":
#
#   r_xy = (n*sum(XY) - sum(X)*sum(Y)) /
#          sqrt( (n*sum(X^2) - (sum X)^2) * (n*sum(Y^2) - (sum Y)^2) )
#
# Bentuk itulah yang ditulis di sini, bukan cor() bawaan R. Alasannya bukan
# kecurigaan pada cor(): rumus angka kasar itu yang dikerjakan mahasiswa di
# kertas dan di Excel, jadi mesin ini harus bisa dibuka dan dicocokkan baris
# demi baris dengan pekerjaan tangan. Uji di uji/korelasi.uji.ts memastikan
# hasilnya tetap sama dengan cor() sampai 1e-12 untuk data acak.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Korelasi produk momen Pearson lewat rumus angka kasar.
ps_pearson <- function(x, y) {
  ps_periksa_pasangan(x, y, minimal = 2L)
  x <- as.numeric(x)
  y <- as.numeric(y)
  n <- length(x)
  pembilang <- n * sum(x * y) - sum(x) * sum(y)
  sebaranX <- n * sum(x^2) - sum(x)^2
  sebaranY <- n * sum(y^2) - sum(y)^2
  ps_pastikan(sebaranX > 0 && sebaranY > 0, "data.variansiNol")
  pembilang / sqrt(sebaranX * sebaranY)
}

#' Korelasi peringkat Spearman (rho), memakai peringkat rata-rata untuk kembar.
#'
#' Dihitung sebagai Pearson atas peringkat, bukan rumus pintas 1 - 6d^2/n(n^2-1).
#' Rumus pintas itu hanya sahih bila tidak ada nilai kembar, dan data psikologi
#' berskala Likert nyaris selalu punya nilai kembar.
ps_spearman <- function(x, y) {
  ps_periksa_pasangan(x, y, minimal = 2L)
  ps_pearson(ps_peringkat(x), ps_peringkat(y))
}

#' Korelasi point-biserial antara aitem dikotomi dan skor total.
#'
#' Secara matematis identik dengan Pearson bila salah satu peubah hanya berisi
#' 0 dan 1; disediakan terpisah agar niat pemanggil terbaca di kode dan agar
#' pemeriksaan dikotominya dijalankan.
ps_point_biserial <- function(dikotomi, kontinu) {
  ps_periksa_pasangan(dikotomi, kontinu, minimal = 2L)
  ps_pastikan(all(dikotomi %in% c(0, 1)), "matriks.bukanDikotomi")
  ps_pearson(dikotomi, kontinu)
}

#' Skor total tiap responden dari matriks respons.
ps_skor_total <- function(m) {
  ps_periksa_matriks(m, minAitem = 1L, minResponden = 1L)
  as.numeric(rowSums(as.matrix(m)))
}

#' Korelasi aitem-total untuk setiap aitem.
#'
#' @param m         matriks respons: baris = responden, kolom = aitem
#' @param dikoreksi jika TRUE, aitem yang sedang diuji dikeluarkan dulu dari
#'                  skor total (corrected item-total correlation). Tanpa
#'                  koreksi, aitem ikut mengorelasikan dirinya sendiri dan
#'                  koefisiennya selalu terlalu tinggi — makin parah pada tes
#'                  pendek. Modul menyebutnya sebagai koreksi part-whole.
ps_korelasi_aitem_total <- function(m, dikoreksi = TRUE) {
  ps_periksa_matriks(m, minAitem = 2L, minResponden = 2L)
  m <- as.matrix(m)
  total <- rowSums(m)
  vapply(seq_len(ncol(m)), function(j) {
    aitem <- m[, j]
    pembanding <- if (dikoreksi) total - aitem else total
    tryCatch(ps_pearson(aitem, pembanding), ps_ralat = function(k) NA_real_)
  }, numeric(1L))
}
