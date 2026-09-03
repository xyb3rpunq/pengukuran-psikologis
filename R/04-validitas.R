# ---------------------------------------------------------------------------
# Validitas alat ukur
#
# Acuan modul: PSI307 sesi 5.
#
# Modul menyuruh membandingkan r hitung dengan "r tabel Pearson" dari lampiran
# buku statistik, lalu memutuskan valid bila r hitung >= r tabel. Tabel itu
# tidak disalin ke sini. Nilainya dihitung ulang dari distribusi t:
#
#   r kritis = t / sqrt(t^2 + df),  df = N - 2,  t = qt(1 - alpha/2, df)
#
# Hasilnya menjawab persis angka yang tercetak di modul: untuk N = 10 dan
# alpha = 0,05 modul memakai 0,632, dan rumus ini memulangkan 0,63190. Menghitung
# ulang, bukan menyalin, berarti tabelnya berlaku untuk N berapa pun — termasuk
# N yang tidak tercetak di lampiran buku.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Nilai kritis r product moment untuk N responden.
#'
#' @param n       banyak pasangan data
#' @param alpha   taraf signifikansi (0,05 atau 0,01)
#' @param duaSisi uji dua sisi (bawaan tabel r Indonesia) atau satu sisi
ps_r_kritis <- function(n, alpha = 0.05, duaSisi = TRUE) {
  ps_pastikan(length(n) == 1L && is.finite(n) && n >= 3, "nilai.harusPositif", nilai = n)
  ps_pastikan(length(alpha) == 1L && is.finite(alpha) && alpha > 0 && alpha < 1,
              "nilai.diLuarRentang", nilai = alpha, bawah = 0, atas = 1)
  df <- n - 2
  t <- qt(1 - (if (duaSisi) alpha / 2 else alpha), df)
  t / sqrt(t^2 + df)
}

#' Bangun tabel r product moment untuk rentang N — pengganti lampiran buku.
ps_tabel_r <- function(nMin = 3L, nMax = 100L, alpha = c(0.05, 0.01)) {
  ps_pastikan(nMin >= 3 && nMax >= nMin, "nilai.diLuarRentang",
              nilai = nMin, bawah = 3, atas = nMax)
  n <- seq.int(nMin, nMax)
  data.frame(
    n = n,
    taraf5 = vapply(n, function(k) ps_r_kritis(k, 0.05), numeric(1L)),
    taraf1 = vapply(n, function(k) ps_r_kritis(k, 0.01), numeric(1L))
  )
}

#' Kategori koefisien menurut Guilford (1956, h. 145).
#'
#' Dipakai modul untuk validitas (sesi 5) maupun reliabilitas (sesi 6 dan 11).
#' Memulangkan kode, bukan kalimat — penerjemahannya urusan lapisan i18n.
ps_kategori_guilford <- function(r) {
  vapply(r, function(nilai) {
    if (!is.finite(nilai)) return(NA_character_)
    if (nilai <= 0.00) return("takValid")
    if (nilai <= 0.20) return("sangatRendah")
    if (nilai <= 0.40) return("rendah")
    if (nilai <= 0.60) return("sedang")
    if (nilai <= 0.80) return("tinggi")
    "sangatTinggi"
  }, character(1L))
}

#' Uji validitas banding: korelasikan skor tes dengan skor kriteria terstandar.
#'
#' Modul sesi 5 menambahkan satu langkah yang sering terlewat: koefisien
#' validitas instrumen bukan korelasinya sendiri, melainkan korelasi itu
#' dikalikan koefisien validitas alat pembanding. Alat pembanding yang tidak
#' sempurna menurunkan batas atas validitas yang bisa dibuktikan.
#'
#' @param skorTes       skor tes yang sedang diuji
#' @param skorKriteria  skor alat ukur terstandar pada orang yang sama
#' @param validitasKriteria koefisien validitas alat pembanding (0..1)
ps_validitas_banding <- function(skorTes, skorKriteria, validitasKriteria = 1, alpha = 0.05) {
  ps_periksa_pasangan(skorTes, skorKriteria, minimal = 3L)
  ps_pastikan(length(validitasKriteria) == 1L && is.finite(validitasKriteria) &&
                validitasKriteria > 0 && validitasKriteria <= 1,
              "nilai.diLuarRentang", nilai = validitasKriteria, bawah = 0, atas = 1)
  n <- length(skorTes)
  korelasi <- ps_pearson(skorTes, skorKriteria)
  koefisien <- korelasi * validitasKriteria
  rTabel <- ps_r_kritis(n, alpha)
  list(
    n = n,
    korelasi = korelasi,
    validitasKriteria = validitasKriteria,
    koefisienValiditas = koefisien,
    rTabel = rTabel,
    alpha = alpha,
    valid = koefisien >= rTabel,
    kategori = ps_kategori_guilford(koefisien)
  )
}

#' Uji validitas butir: korelasi setiap aitem dengan skor totalnya.
#'
#' @param m         matriks respons: baris = responden, kolom = aitem
#' @param dikoreksi pakai korelasi aitem-total terkoreksi (dianjurkan)
#' @param alpha     taraf signifikansi untuk r tabel
ps_validitas_butir <- function(m, dikoreksi = TRUE, alpha = 0.05) {
  ps_periksa_matriks(m, minAitem = 2L, minResponden = 3L)
  m <- as.matrix(m)
  n <- nrow(m)
  r <- ps_korelasi_aitem_total(m, dikoreksi = dikoreksi)
  rTabel <- ps_r_kritis(n, alpha)
  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(ncol(m)))
  butir <- data.frame(
    aitem = nama,
    rHitung = r,
    rTabel = rep(rTabel, length(r)),
    valid = !is.na(r) & r >= rTabel,
    kategori = ps_kategori_guilford(r),
    stringsAsFactors = FALSE
  )
  list(
    n = n,
    banyakAitem = ncol(m),
    alpha = alpha,
    rTabel = rTabel,
    dikoreksi = dikoreksi,
    butir = butir,
    banyakValid = sum(butir$valid),
    banyakGugur = sum(!butir$valid)
  )
}
