# ---------------------------------------------------------------------------
# Analisis faktor eksploratori
#
# Acuan modul: PSI307 sesi 5 (validitas konstruk) dan sesi 2 (langkah ke-10,
# "analisis data uji coba dengan menggunakan teknik analisis faktor").
#
# Modul menyebut analisis faktor sebagai cara membuktikan validitas konstruk,
# tetapi tidak memberi prosedur hitungnya — dianggap urusan SPSS. Berkas ini
# yang mengerjakannya, lengkap dengan dua syarat kelayakan yang di SPSS
# tercetak otomatis di atas hasilnya dan karena itu sering dilewati orang:
#
#   Bartlett's test of sphericity — apakah matriks korelasinya cukup berbeda
#   dari matriks identitas untuk difaktorkan sama sekali. Bila p >= 0,05,
#   butir-butirnya saling bebas dan tidak ada faktor untuk ditemukan.
#
#   Kaiser-Meyer-Olkin — seberapa besar korelasi antar butir yang tersisa
#   setelah pengaruh butir lain dikeluarkan. KMO di bawah 0,50 berarti datanya
#   tidak layak difaktorkan, berapa pun faktor yang dipaksakan keluar.
#
# Menjalankan analisis faktor tanpa memeriksa keduanya selalu memberi hasil —
# hanya saja hasilnya tidak berarti apa-apa. Itu sebabnya keduanya dihitung di
# sini dan ditampilkan lebih dulu, bukan disembunyikan di balik tombol lanjutan.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Uji kebolaan Bartlett.
#'
#' khi-kuadrat = -[n - 1 - (2p + 5)/6] * ln|R|,  db = p(p - 1)/2
#'
#' @param m matriks respons: baris = responden, kolom = butir
ps_bartlett <- function(m) {
  ps_periksa_matriks(m, minAitem = 3L, minResponden = 4L)
  m <- as.matrix(m)
  n <- nrow(m)
  p <- ncol(m)
  korelasi <- suppressWarnings(cor(m))
  ps_pastikan(all(is.finite(korelasi)), "data.variansiNol")

  penentu <- det(korelasi)
  # Penentu nol berarti ada butir yang merupakan kombinasi linier butir lain;
  # logaritmanya tidak terdefinisi dan pemfaktorannya pun tidak bermakna.
  ps_pastikan(penentu > 0, "faktor.matriksSingular")

  khi <- -(n - 1 - (2 * p + 5) / 6) * log(penentu)
  db <- p * (p - 1) / 2
  list(
    n = n,
    banyakButir = p,
    penentu = penentu,
    khiKuadrat = khi,
    db = db,
    p = pchisq(khi, db, lower.tail = FALSE),
    layak = pchisq(khi, db, lower.tail = FALSE) < 0.05
  )
}

#' Kaiser-Meyer-Olkin: kecukupan sampel keseluruhan dan per butir.
#'
#' KMO = jumlah r kuadrat / (jumlah r kuadrat + jumlah korelasi parsial kuadrat)
#'
#' Korelasi parsial diambil dari kebalikan matriks korelasi. Makin besar
#' korelasi parsial dibanding korelasi biasa, makin sedikit yang bisa
#' dijelaskan faktor bersama — dan makin kecil KMO-nya.
ps_kmo <- function(m) {
  ps_periksa_matriks(m, minAitem = 3L, minResponden = 4L)
  m <- as.matrix(m)
  korelasi <- suppressWarnings(cor(m))
  ps_pastikan(all(is.finite(korelasi)), "data.variansiNol")
  ps_pastikan(det(korelasi) > 0, "faktor.matriksSingular")

  kebalikan <- solve(korelasi)
  akar <- sqrt(diag(kebalikan))
  parsial <- -kebalikan / outer(akar, akar)
  diag(parsial) <- 0
  korelasiTanpaDiagonal <- korelasi
  diag(korelasiTanpaDiagonal) <- 0

  jumlahR <- sum(korelasiTanpaDiagonal^2)
  jumlahP <- sum(parsial^2)
  keseluruhan <- jumlahR / (jumlahR + jumlahP)

  perButir <- vapply(seq_len(ncol(m)), function(j) {
    r <- sum(korelasiTanpaDiagonal[j, ]^2)
    q <- sum(parsial[j, ]^2)
    r / (r + q)
  }, numeric(1L))

  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(ncol(m)))

  list(
    kmo = keseluruhan,
    kategori = ps_kategori_kmo(keseluruhan),
    layak = keseluruhan >= 0.50,
    butir = data.frame(
      butir = nama,
      msa = perButir,
      kategori = ps_kategori_kmo(perButir),
      layak = perButir >= 0.50,
      stringsAsFactors = FALSE
    )
  )
}

#' Kategori KMO menurut Kaiser (1974). Memulangkan kode, bukan kalimat.
ps_kategori_kmo <- function(nilai) {
  vapply(nilai, function(satu) {
    if (!is.finite(satu)) return(NA_character_)
    if (satu < 0.50) return("takDiterima")
    if (satu < 0.60) return("buruk")
    if (satu < 0.70) return("cukupan")
    if (satu < 0.80) return("sedang")
    if (satu < 0.90) return("bagus")
    "sangatBagus"
  }, character(1L))
}

#' Nilai eigen matriks korelasi — dasar penentuan banyak faktor.
#'
#' Kriteria Kaiser mempertahankan faktor bernilai eigen di atas 1: sebuah
#' faktor baru layak dipertahankan hanya bila ia menjelaskan lebih banyak
#' daripada satu butir tunggal.
ps_nilai_eigen <- function(m) {
  ps_periksa_matriks(m, minAitem = 2L, minResponden = 3L)
  m <- as.matrix(m)
  korelasi <- suppressWarnings(cor(m))
  ps_pastikan(all(is.finite(korelasi)), "data.variansiNol")
  nilai <- eigen(korelasi, symmetric = TRUE, only.values = TRUE)$values
  proporsi <- nilai / sum(nilai)
  data.frame(
    faktor = seq_along(nilai),
    eigen = nilai,
    proporsi = proporsi,
    kumulatif = cumsum(proporsi),
    diPertahankan = nilai > 1
  )
}

#' Analisis faktor eksploratori lengkap.
#'
#' @param m            matriks respons
#' @param banyakFaktor jumlah faktor; NULL memakai kriteria Kaiser
#' @param rotasi       "varimax" (ortogonal, faktor dianggap tidak berkorelasi)
#'                     atau "promax" (oblik, faktor boleh berkorelasi) atau
#'                     "none". Varimax adalah bawaan yang lazim, tetapi pada
#'                     konstruk psikologis yang dimensinya memang berhubungan
#'                     — dan kebanyakan memang begitu — promax lebih jujur.
#' @param batasMuatan  muatan di bawah nilai ini dianggap tidak berarti saat
#'                     menentukan butir milik faktor mana. 0,40 mengikuti
#'                     ambang yang dipakai Neff (2003) dan lazim di skripsi.
ps_analisis_faktor <- function(m, banyakFaktor = NULL, rotasi = "varimax",
                               batasMuatan = 0.40) {
  ps_periksa_matriks(m, minAitem = 3L, minResponden = 4L)
  ps_pastikan(rotasi %in% c("varimax", "promax", "none"), "skala.tidakDikenal", nilai = rotasi)
  m <- as.matrix(m)
  p <- ncol(m)
  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(p))
  colnames(m) <- nama

  eigenTabel <- ps_nilai_eigen(m)
  if (is.null(banyakFaktor)) banyakFaktor <- max(1L, sum(eigenTabel$diPertahankan))
  banyakFaktor <- as.integer(banyakFaktor)

  # factanal punya batas keras: derajat bebas modelnya harus tidak negatif,
  # jika tidak model itu punya lebih banyak parameter daripada informasi.
  maksimum <- floor((2 * p + 1 - sqrt(8 * p + 1)) / 2)
  ps_pastikan(banyakFaktor >= 1 && banyakFaktor <= max(1, maksimum),
              "faktor.terlaluBanyak", diminta = banyakFaktor, maksimum = maksimum)

  hasil <- tryCatch(
    factanal(m, factors = banyakFaktor, rotation = rotasi, scores = "none"),
    error = function(k) NULL
  )
  ps_pastikan(!is.null(hasil), "faktor.gagalKonvergen")

  muatan <- matrix(as.numeric(hasil$loadings), nrow = p, ncol = banyakFaktor)
  keunikan <- as.numeric(hasil$uniquenesses)
  komunalitas <- 1 - keunikan

  # Ragam yang dijelaskan tiap faktor: jumlah kuadrat muatannya dibagi p.
  jumlahKuadrat <- colSums(muatan^2)
  proporsiRagam <- jumlahKuadrat / p

  muatanTertinggi <- apply(abs(muatan), 1L, max)
  faktorUtama <- apply(abs(muatan), 1L, which.max)
  faktorUtama[muatanTertinggi < batasMuatan] <- NA_integer_

  # Butir yang memuat kuat di lebih dari satu faktor tidak jelas miliknya
  # siapa. Dalam pengembangan skala, butir seperti ini biasanya dibuang.
  bermuatanGanda <- vapply(seq_len(p), function(i) {
    sum(abs(muatan[i, ]) >= batasMuatan) > 1
  }, logical(1L))

  daftarMuatan <- lapply(seq_len(banyakFaktor), function(f) as.numeric(muatan[, f]))
  names(daftarMuatan) <- paste0("f", seq_len(banyakFaktor))

  butir <- data.frame(
    butir = nama,
    komunalitas = komunalitas,
    keunikan = keunikan,
    muatanTertinggi = muatanTertinggi,
    faktor = faktorUtama,
    bermuatanGanda = bermuatanGanda,
    stringsAsFactors = FALSE
  )
  for (f in seq_len(banyakFaktor)) butir[[paste0("f", f)]] <- daftarMuatan[[f]]

  list(
    n = nrow(m),
    banyakButir = p,
    banyakFaktor = banyakFaktor,
    maksimumFaktor = maksimum,
    rotasi = rotasi,
    batasMuatan = batasMuatan,
    # Uji kecocokan model dari factanal: p BESAR justru yang diinginkan, karena
    # hipotesis nolnya adalah "sebanyak ini faktor sudah cukup". Arah ini
    # kebalikan dari kebiasaan membaca nilai p dan sering tertukar.
    khiKuadrat = if (is.null(hasil$STATISTIC)) NA_real_ else as.numeric(hasil$STATISTIC),
    db = if (is.null(hasil$dof)) NA_real_ else as.numeric(hasil$dof),
    pKecocokan = if (is.null(hasil$PVAL)) NA_real_ else as.numeric(hasil$PVAL),
    modelCukup = !is.null(hasil$PVAL) && as.numeric(hasil$PVAL) > 0.05,
    ragamPerFaktor = ps_larik(as.numeric(proporsiRagam)),
    ragamKumulatif = sum(proporsiRagam),
    eigen = eigenTabel,
    butir = butir,
    banyakTakBermuatan = sum(is.na(faktorUtama)),
    banyakBermuatanGanda = sum(bermuatanGanda)
  )
}

#' Uji normalitas Shapiro-Wilk untuk satu deret skor.
#'
#' Banyak prosedur di mata kuliah ini — korelasi Pearson terutama — bersandar
#' pada sebaran yang mendekati normal. Uji ini memeriksanya, dan seperti
#' Bartlett arah bacaannya perlu diperhatikan: hipotesis nolnya adalah
#' "sebarannya normal", jadi p BESAR yang berarti asumsinya aman.
ps_normalitas <- function(x) {
  ps_periksa_deret(x, minimal = 3L)
  x <- as.numeric(x)
  ps_pastikan(length(x) <= 5000, "nilai.diLuarRentang", nilai = length(x), bawah = 3, atas = 5000)
  ps_pastikan(ps_varians_sampel(x) > 0, "data.variansiNol")
  hasil <- shapiro.test(x)
  list(
    n = length(x),
    w = as.numeric(hasil$statistic),
    p = as.numeric(hasil$p.value),
    normal = as.numeric(hasil$p.value) > 0.05
  )
}
