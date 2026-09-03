# ---------------------------------------------------------------------------
# Skor standar dan interpretasi
#
# Acuan modul: PSI307 sesi 7.
#
#   z = (X - M) / s
#   T = 50 + 10 * z
#
# Modul menyebut "deviasi standar distribusinya", yakni sebaran peserta yang
# ada diperlakukan sebagai populasinya sendiri — pembagi N, bukan N-1. Itulah
# bawaan di sini. Argumen `populasi = FALSE` disediakan untuk kasus sebaliknya,
# saat peserta yang ada hanya sampel dari kelompok norma yang lebih besar.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Skor z untuk satu deret skor mentah.
ps_skor_z <- function(x, populasi = TRUE) {
  ps_periksa_deret(x, minimal = 2L)
  x <- as.numeric(x)
  s <- if (populasi) ps_sb_populasi(x) else ps_sb_sampel(x)
  ps_pastikan(s > 0, "data.variansiNol")
  (x - ps_rerata(x)) / s
}

#' Skor T: skor z digeser ke rerata 50 dengan simpangan baku 10.
#'
#' Gunanya menghilangkan tanda minus dan pecahan, sehingga skor bisa
#' dilaporkan ke orang yang tidak membaca z.
ps_skor_t <- function(x, populasi = TRUE) 50 + 10 * ps_skor_z(x, populasi)

#' Stanine: sembilan jenjang standar, rerata 5 dan simpangan baku 2.
#'
#' stanine = round(2z + 5), dipangkas ke rentang 1..9. Skala kasar ini dipakai
#' saat pelaporan yang terlalu halus justru menyesatkan, karena selisih satu
#' dua angka skor mentah sering masih di dalam galat baku pengukurannya.
ps_stanine <- function(x, populasi = TRUE) {
  z <- ps_skor_z(x, populasi)
  pmin(9, pmax(1, round(2 * z + 5)))
}

#' Tabel konversi lengkap untuk setiap peserta.
#'
#' @param x    skor mentah
#' @param nama label peserta (opsional)
ps_konversi_skor <- function(x, nama = NULL, populasi = TRUE) {
  ps_periksa_deret(x, minimal = 2L)
  x <- as.numeric(x)
  if (is.null(nama)) nama <- paste0("R", seq_along(x))
  ps_pastikan(length(nama) == length(x), "data.panjangBeda",
              panjangX = length(x), panjangY = length(nama))
  z <- ps_skor_z(x, populasi)
  list(
    ringkasan = ps_ringkasan_deskriptif(x),
    populasi = populasi,
    peserta = data.frame(
      nama = as.character(nama),
      skorMentah = x,
      z = z,
      t = 50 + 10 * z,
      stanine = pmin(9, pmax(1, round(2 * z + 5))),
      jenjangPersentil = vapply(x, function(s) ps_jenjang_persentil(x, s), numeric(1L)),
      stringsAsFactors = FALSE
    )
  )
}

#' Rentang skor sejati pada tingkat keyakinan tertentu.
#'
#' Menerjemahkan reliabilitas menjadi keputusan: sebuah skor amatan tidak
#' pernah berupa satu titik, melainkan pita. Dua peserta yang pitanya bertumpang
#' tindih tidak boleh dinyatakan berbeda kemampuannya.
#'
#' @param skor        skor amatan seorang peserta
#' @param sem         galat baku pengukuran, dari ps_sem()
#' @param keyakinan   0,95 atau 0,99
ps_pita_keyakinan <- function(skor, sem, keyakinan = 0.95) {
  ps_pastikan(length(skor) == 1L && is.finite(skor), "data.bukanAngka", indeks = -1L)
  ps_pastikan(length(sem) == 1L && is.finite(sem) && sem >= 0, "nilai.harusPositif", nilai = sem)
  ps_pastikan(length(keyakinan) == 1L && is.finite(keyakinan) &&
                keyakinan > 0 && keyakinan < 1,
              "nilai.diLuarRentang", nilai = keyakinan, bawah = 0, atas = 1)
  z <- qnorm(1 - (1 - keyakinan) / 2)
  list(
    skor = skor,
    sem = sem,
    keyakinan = keyakinan,
    z = z,
    bawah = skor - z * sem,
    atas = skor + z * sem
  )
}
