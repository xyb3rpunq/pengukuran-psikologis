# ---------------------------------------------------------------------------
# Statistik deskriptif
#
# Acuan modul: PSI307 sesi 7 (skor standar) dan sesi 14 (skala pengukuran).
#
# Catatan pembeda populasi vs sampel. Modul sesi 7 memakai "deviasi standar
# distribusi" untuk konversi z dan T — artinya seluruh peserta tes yang ada
# diperlakukan sebagai populasinya sendiri, jadi pembaginya N. Sementara uji
# validitas dan reliabilitas memperlakukan peserta sebagai sampel, pembaginya
# N-1. Kedua-duanya disediakan dan setiap pemanggil menyebut yang mana.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

ps_rerata <- function(x) {
  ps_periksa_deret(x)
  sum(as.numeric(x)) / length(x)
}

#' Jumlah kuadrat simpangan, sum((X - M)^2).
ps_jumlah_kuadrat_simpangan <- function(x) {
  ps_periksa_deret(x)
  x <- as.numeric(x)
  sum((x - ps_rerata(x))^2)
}

#' Varians populasi, sigma^2 = sum((X - M)^2) / N.
ps_varians_populasi <- function(x) {
  ps_periksa_deret(x)
  ps_jumlah_kuadrat_simpangan(x) / length(x)
}

#' Varians sampel, s^2 = sum((X - M)^2) / (N - 1). Sama dengan var() bawaan R.
ps_varians_sampel <- function(x) {
  ps_periksa_deret(x, minimal = 2L)
  ps_jumlah_kuadrat_simpangan(x) / (length(x) - 1L)
}

#' Simpangan baku populasi, sigma. Dipakai modul sesi 7 untuk skor z dan T.
ps_sb_populasi <- function(x) sqrt(ps_varians_populasi(x))

#' Simpangan baku sampel, s. Sama dengan sd() bawaan R.
ps_sb_sampel <- function(x) sqrt(ps_varians_sampel(x))

ps_median <- function(x) {
  ps_periksa_deret(x)
  urut <- sort(as.numeric(x))
  n <- length(urut)
  if (n %% 2L == 1L) urut[(n + 1L) %/% 2L] else (urut[n / 2L] + urut[n / 2L + 1L]) / 2

}

#' Persentil data mentah dengan interpolasi linier.
#'
#' Setara dengan quantile(type = 7) di R dan numpy.percentile(method="linear"),
#' sehingga hasilnya bisa diadu langsung dengan keduanya di conformance/.
#'
#' @param p proporsi 0..1 (0.25 untuk kuartil bawah)
ps_persentil <- function(x, p) {
  ps_periksa_deret(x)
  ps_pastikan(length(p) == 1L && is.finite(p) && p >= 0 && p <= 1,
              "nilai.diLuarRentang", nilai = p, bawah = 0, atas = 1)
  urut <- sort(as.numeric(x))
  n <- length(urut)
  if (n == 1L) return(urut[1L])
  posisi <- p * (n - 1L)
  bawah <- floor(posisi)
  atas <- ceiling(posisi)
  sisa <- posisi - bawah
  urut[bawah + 1L] * (1 - sisa) + urut[atas + 1L] * sisa
}

ps_kuartil <- function(x) {
  q1 <- ps_persentil(x, 0.25)
  q3 <- ps_persentil(x, 0.75)
  list(q1 = q1, q2 = ps_persentil(x, 0.5), q3 = q3, rentangAntarKuartil = q3 - q1)
}

#' Jenjang persentil (percentile rank) sebuah skor di dalam sebarannya.
#'
#' Memakai definisi titik-tengah yang lazim dalam pengukuran psikologis:
#' PR = (banyak skor di bawah + setengah banyak skor sama) / N * 100.
#' Definisi ini membuat PR skor median tetap 50 walau banyak skor kembar —
#' hal yang sering terjadi pada tes prestasi dengan rentang skor pendek.
ps_jenjang_persentil <- function(x, skor) {
  ps_periksa_deret(x)
  ps_pastikan(length(skor) == 1L && is.finite(skor), "data.bukanAngka", indeks = -1L)
  x <- as.numeric(x)
  ((sum(x < skor) + sum(x == skor) / 2) / length(x)) * 100
}

#' Modus. Memulangkan semua nilai berfrekuensi tertinggi, terurut naik.
ps_modus <- function(x) {
  ps_periksa_deret(x)
  tabel <- table(as.numeric(x))
  as.numeric(names(tabel)[tabel == max(tabel)])
}

#' Peringkat rata-rata untuk nilai kembar — dasar korelasi Spearman.
ps_peringkat <- function(x) {
  ps_periksa_deret(x)
  rank(as.numeric(x), ties.method = "average")
}

#' Seluruh statistik deskriptif sebuah deret skor dalam satu panggilan.
ps_ringkasan_deskriptif <- function(x) {
  ps_periksa_deret(x, minimal = 2L)
  x <- as.numeric(x)
  list(
    n = length(x),
    rerata = ps_rerata(x),
    median = ps_median(x),
    modus = ps_larik(ps_modus(x)),
    sbPopulasi = ps_sb_populasi(x),
    sbSampel = ps_sb_sampel(x),
    variansPopulasi = ps_varians_populasi(x),
    variansSampel = ps_varians_sampel(x),
    minimum = min(x),
    maksimum = max(x),
    rentang = max(x) - min(x),
    kuartil = ps_kuartil(x)
  )
}
