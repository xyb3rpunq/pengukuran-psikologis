# ---------------------------------------------------------------------------
# Reliabilitas alat ukur
#
# Acuan modul: PSI307 sesi 6 (teknik belah dua, KR-20, alpha Cronbach) dan
# sesi 11 (KR-21 untuk skala Guttman).
#
# Semua varians di berkas ini memakai pembagi N-1 (varians sampel). Itu yang
# dipakai SPSS pada prosedur RELIABILITY dan yang membuat angka di sini bisa
# ditempelkan langsung ke laporan yang mensyaratkan output SPSS.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Formula Spearman-Brown: naikkan koefisien belahan ke koefisien tes utuh.
#'
#' @param rBelah korelasi antara kedua belahan
#' @param k      kelipatan panjang tes. k = 2 mengembalikan tes utuh dari
#'               setengahnya — kasus belah dua. Nilai k lain menjawab
#'               pertanyaan "berapa reliabilitasnya kalau tes diperpanjang
#'               k kali lipat", yang berguna saat memutuskan menambah aitem.
ps_spearman_brown <- function(rBelah, k = 2) {
  ps_pastikan(length(rBelah) == 1L && is.finite(rBelah) && rBelah > -1 && rBelah < 1,
              "nilai.diLuarRentang", nilai = rBelah, bawah = -1, atas = 1)
  ps_pastikan(length(k) == 1L && is.finite(k) && k > 0, "nilai.harusPositif", nilai = k)
  (k * rBelah) / (1 + (k - 1) * rBelah)
}

#' Reliabilitas belah dua.
#'
#' @param m      matriks respons: baris = responden, kolom = aitem
#' @param metode "ganjilGenap" membelah aitem nomor ganjil melawan nomor genap;
#'               "awalAkhir" membelah paruh pertama melawan paruh kedua.
#'               Modul sesi 6 menghitung keduanya dan menunjukkan hasilnya
#'               berbeda — itulah kelemahan teknik belah dua yang membuat
#'               alpha Cronbach lebih disukai.
ps_belah_dua <- function(m, metode = "ganjilGenap") {
  ps_periksa_matriks(m, minAitem = 2L, minResponden = 3L)
  ps_pastikan(metode %in% c("ganjilGenap", "awalAkhir"), "skala.tidakDikenal", nilai = metode)
  m <- as.matrix(m)
  k <- ncol(m)
  indeks <- seq_len(k)
  if (metode == "ganjilGenap") {
    kiri <- indeks[indeks %% 2L == 1L]
    kanan <- indeks[indeks %% 2L == 0L]
  } else {
    potong <- ceiling(k / 2)
    kiri <- indeks[indeks <= potong]
    kanan <- indeks[indeks > potong]
  }
  ps_pastikan(length(kiri) > 0L && length(kanan) > 0L, "matriks.minimalDuaAitem", kolom = k)
  skorKiri <- rowSums(m[, kiri, drop = FALSE])
  skorKanan <- rowSums(m[, kanan, drop = FALSE])
  rBelah <- ps_pearson(skorKiri, skorKanan)
  r11 <- ps_spearman_brown(rBelah, 2)
  list(
    metode = metode,
    aitemKiri = ps_larik(kiri),
    aitemKanan = ps_larik(kanan),
    skorKiri = ps_larik(skorKiri),
    skorKanan = ps_larik(skorKanan),
    rBelah = rBelah,
    r11 = r11,
    kategori = ps_kategori_guilford(r11)
  )
}

#' Alpha Cronbach.
#'
#' alpha = k/(k-1) * (1 - sum(varians tiap aitem) / varians skor total)
#'
#' Berlaku untuk aitem dikotomi maupun politomi (Likert). Untuk aitem dikotomi
#' hasilnya identik dengan KR-20 — sifat itu diuji langsung di uji/.
ps_alpha_cronbach <- function(m) {
  ps_periksa_matriks(m, minAitem = 2L, minResponden = 2L)
  m <- as.matrix(m)
  k <- ncol(m)
  variansAitem <- apply(m, 2L, ps_varians_sampel)
  total <- rowSums(m)
  variansTotal <- ps_varians_sampel(total)
  ps_pastikan(variansTotal > 0, "data.variansiNol")
  (k / (k - 1)) * (1 - sum(variansAitem) / variansTotal)
}

#' Alpha bila satu aitem dibuang — mencari aitem yang justru merusak skala.
#'
#' Bila alpha naik setelah sebuah aitem dibuang, aitem itu mengukur sesuatu
#' yang lain daripada aitem-aitem sisanya.
ps_alpha_jika_dibuang <- function(m) {
  ps_periksa_matriks(m, minAitem = 3L, minResponden = 2L)
  m <- as.matrix(m)
  vapply(seq_len(ncol(m)), function(j) {
    tryCatch(ps_alpha_cronbach(m[, -j, drop = FALSE]), ps_ralat = function(k) NA_real_)
  }, numeric(1L))
}

#' Kuder-Richardson 20, khusus aitem dikotomi (benar/salah, ya/tidak).
#'
#' KR-20 = k/(k-1) * (1 - sum(p*q) / varians total)
#'
#' Perhatikan pembaginya. p*q adalah varians sebuah aitem 0/1 dengan pembagi N,
#' bukan N-1. Supaya rasio sum(p*q) / varians total tetap sebanding, varians
#' totalnya juga harus memakai pembagi N. Mencampur keduanya — p*q di atas,
#' varians sampel di bawah — memberi angka yang tampak wajar tapi memutus
#' identitas KR-20 = alpha Cronbach pada data dikotomi. Rasio alpha sendiri
#' kebal terhadap pilihan pembagi karena N/(N-1) muncul di pembilang maupun
#' penyebutnya, jadi cukup satu sisi ini yang perlu dirapikan.
ps_kr20 <- function(m) {
  ps_periksa_matriks(m, dikotomi = TRUE, minAitem = 2L, minResponden = 2L)
  m <- as.matrix(m)
  k <- ncol(m)
  p <- colMeans(m)
  q <- 1 - p
  variansTotal <- ps_varians_populasi(rowSums(m))
  ps_pastikan(variansTotal > 0, "data.variansiNol")
  (k / (k - 1)) * (1 - sum(p * q) / variansTotal)
}

#' Kuder-Richardson 21 dalam bentuk yang ditulis modul sesi 11.
#'
#' r11 = K/(K-1) * (1 - U*(K-U) / (K*V))
#'
#' dengan U rata-rata skor total dan V varians skor total. KR-21 berasumsi
#' semua aitem sama taraf kesukarannya, jadi hasilnya selalu lebih rendah
#' daripada KR-20 kecuali asumsi itu benar-benar terpenuhi. Modul memakainya
#' untuk skala Guttman karena responsnya dikotomi.
#'
#' V memakai pembagi N, sejalan dengan KR-20, supaya kedua koefisien Kuder-
#' Richardson berdiri di atas varians total yang sama dan pantas dibandingkan.
ps_kr21 <- function(m) {
  ps_periksa_matriks(m, dikotomi = TRUE, minAitem = 2L, minResponden = 2L)
  m <- as.matrix(m)
  k <- ncol(m)
  total <- rowSums(m)
  u <- ps_rerata(total)
  v <- ps_varians_populasi(total)
  ps_pastikan(v > 0, "data.variansiNol")
  (k / (k - 1)) * (1 - (u * (k - u)) / (k * v))
}

#' Galat baku pengukuran (standard error of measurement).
#'
#' SEM = s * sqrt(1 - r)
#'
#' Angka inilah yang menerjemahkan koefisien reliabilitas menjadi sesuatu yang
#' bisa dipakai membuat keputusan: skor amatan seseorang berada kira-kira
#' dalam rentang skor +/- 1,96 SEM dari skor sejatinya pada keyakinan 95%.
ps_sem <- function(simpanganBaku, reliabilitas) {
  ps_pastikan(length(simpanganBaku) == 1L && is.finite(simpanganBaku) && simpanganBaku >= 0,
              "nilai.harusPositif", nilai = simpanganBaku)
  ps_pastikan(length(reliabilitas) == 1L && is.finite(reliabilitas) && reliabilitas <= 1,
              "nilai.diLuarRentang", nilai = reliabilitas, bawah = -1, atas = 1)
  simpanganBaku * sqrt(max(0, 1 - reliabilitas))
}

#' Laporan reliabilitas lengkap untuk satu matriks respons.
#'
#' Menjalankan setiap metode yang berlaku bagi data itu, supaya perbedaan antar
#' metode terlihat berdampingan alih-alih harus dipanggil satu per satu.
ps_analisis_reliabilitas <- function(m) {
  ps_periksa_matriks(m, minAitem = 2L, minResponden = 3L)
  m <- as.matrix(m)
  dikotomi <- all(m %in% c(0, 1))
  total <- rowSums(m)
  alpha <- ps_alpha_cronbach(m)
  sbTotal <- ps_sb_sampel(total)
  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(ncol(m)))

  hasil <- list(
    n = nrow(m),
    banyakAitem = ncol(m),
    dikotomi = dikotomi,
    rerataTotal = ps_rerata(total),
    sbTotal = sbTotal,
    variansTotal = ps_varians_sampel(total),
    alphaCronbach = alpha,
    kategoriAlpha = ps_kategori_guilford(alpha),
    sem = ps_sem(sbTotal, alpha),
    belahGanjilGenap = ps_belah_dua(m, "ganjilGenap"),
    belahAwalAkhir = ps_belah_dua(m, "awalAkhir"),
    kr20 = if (dikotomi) ps_kr20(m) else NA_real_,
    kr21 = if (dikotomi) ps_kr21(m) else NA_real_
  )

  hasil$butir <- data.frame(
    aitem = nama,
    rerata = as.numeric(colMeans(m)),
    varians = as.numeric(apply(m, 2L, ps_varians_sampel)),
    korelasiAitemTotal = ps_korelasi_aitem_total(m, dikoreksi = TRUE),
    alphaJikaDibuang = if (ncol(m) >= 3L) ps_alpha_jika_dibuang(m) else rep(NA_real_, ncol(m)),
    stringsAsFactors = FALSE
  )
  hasil
}
