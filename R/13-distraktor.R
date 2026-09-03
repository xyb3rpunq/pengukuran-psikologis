# ---------------------------------------------------------------------------
# Analisis distraktor — pola jawaban soal pilihan ganda
#
# Acuan modul: PSI307 sesi 7, yang mengutip Suharsimi: "perlu menerangkan 3
# masalah yang berhubungan dengan analisis soal yaitu: taraf kesukaran, daya
# pembeda dan pola jawaban soal". Dua yang pertama sudah dikerjakan di
# 06-aitem.R. Berkas ini yang ketiga.
#
# Yang dilihat bukan lagi benar-salahnya, melainkan ke mana peserta yang salah
# itu pergi. Sebuah pengecoh yang tidak dipilih siapa pun tidak mengecoh siapa
# pun: ia hanya memperpendek soal dari lima pilihan menjadi empat tanpa ada
# yang menyadarinya. Sebaliknya, pengecoh yang justru lebih banyak dipilih
# kelompok atas daripada kelompok bawah menandakan ada yang salah pada soalnya
# sendiri — biasanya kunci yang keliru atau pengecoh yang sebenarnya juga benar.
#
# Dua ambang yang dipakai di sini lazim dalam literatur pengukuran pendidikan:
#   - Pengecoh berfungsi bila dipilih sekurang-kurangnya 5% peserta.
#   - Pengecoh sehat bila kelompok bawah memilihnya lebih sering daripada
#     kelompok atas; bila terbalik, ia disebut menyesatkan.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Kategori keberfungsian sebuah pengecoh. Memulangkan kode, bukan kalimat.
#'
#' @param proporsi  bagian peserta yang memilih pengecoh itu
#' @param selisih   proporsi kelompok bawah dikurangi kelompok atas
ps_kategori_distraktor <- function(proporsi, selisih, ambang = 0.05) {
  hasil <- character(length(proporsi))
  for (i in seq_along(proporsi)) {
    p <- proporsi[i]
    d <- selisih[i]
    if (!is.finite(p) || !is.finite(d)) {
      hasil[i] <- NA_character_
    } else if (p < ambang) {
      hasil[i] <- "takBerfungsi"
    } else if (d < 0) {
      hasil[i] <- "menyesatkan"
    } else {
      hasil[i] <- "berfungsi"
    }
  }
  hasil
}

#' Analisis pola jawaban seluruh butir pilihan ganda.
#'
#' @param m         matriks pilihan: baris = peserta, kolom = butir, isinya
#'                  nomor pilihan 1..banyakPilihan
#' @param kunci     vektor nomor pilihan yang benar untuk tiap butir
#' @param banyakPilihan  banyak opsi jawaban tiap butir
#' @param proporsi  bagian yang diambil dari tiap ujung untuk kelompok atas dan
#'                  bawah; NULL memakai aturan modul (50% bila peserta < 100,
#'                  27% bila 100 ke atas)
ps_analisis_distraktor <- function(m, kunci, banyakPilihan = 5L, proporsi = NULL) {
  ps_periksa_matriks(m, minAitem = 1L, minResponden = 2L)
  m <- as.matrix(m)
  k <- ncol(m)

  ps_pastikan(length(kunci) == k, "data.panjangBeda", panjangX = k, panjangY = length(kunci))
  ps_pastikan(all(kunci >= 1 & kunci <= banyakPilihan & kunci == round(kunci)),
              "distraktor.kunciDiLuarRentang", atas = banyakPilihan)
  ps_pastikan(all(m >= 1 & m <= banyakPilihan & m == round(m)),
              "distraktor.pilihanDiLuarRentang", atas = banyakPilihan)

  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(k))

  # Benar-salah diturunkan dari kunci, lalu kelompok atas dan bawah ditentukan
  # dari skor total itu — bukan dari pilihan mentahnya, yang tidak punya urutan.
  benar <- matrix(0, nrow = nrow(m), ncol = k)
  for (j in seq_len(k)) benar[, j] <- as.numeric(m[, j] == kunci[j])
  colnames(benar) <- nama

  kelompok <- ps_kelompok_ekstrem(benar, proporsi)
  atas <- kelompok$atas
  bawah <- kelompok$bawah

  barisan <- list()
  for (j in seq_len(k)) {
    for (o in seq_len(banyakPilihan)) {
      pilih <- m[, j] == o
      pAtas <- mean(m[atas, j] == o)
      pBawah <- mean(m[bawah, j] == o)
      adalahKunci <- o == kunci[j]
      barisan[[length(barisan) + 1L]] <- data.frame(
        butir = nama[j],
        pilihan = o,
        kunci = adalahKunci,
        banyak = sum(pilih),
        proporsi = mean(pilih),
        pAtas = pAtas,
        pBawah = pBawah,
        selisih = pBawah - pAtas,
        # Kunci tidak dinilai sebagai pengecoh; ia dinilai lewat P dan D di
        # 06-aitem.R. Menilainya dengan aturan pengecoh akan selalu menyebutnya
        # "menyesatkan", karena kelompok ataslah yang memang harus memilihnya.
        kategori = if (adalahKunci) NA_character_ else
          ps_kategori_distraktor(mean(pilih), pBawah - pAtas),
        stringsAsFactors = FALSE
      )
    }
  }
  pilihan <- do.call(rbind, barisan)

  ringkasButir <- lapply(seq_len(k), function(j) {
    potong <- pilihan[pilihan$butir == nama[j] & !pilihan$kunci, , drop = FALSE]
    data.frame(
      butir = nama[j],
      kunci = kunci[j],
      p = mean(benar[, j]),
      pengecohBerfungsi = sum(potong$kategori == "berfungsi", na.rm = TRUE),
      pengecohTakBerfungsi = sum(potong$kategori == "takBerfungsi", na.rm = TRUE),
      pengecohMenyesatkan = sum(potong$kategori == "menyesatkan", na.rm = TRUE),
      semuaBerfungsi = all(potong$kategori == "berfungsi", na.rm = TRUE),
      stringsAsFactors = FALSE
    )
  })

  list(
    n = nrow(m),
    banyakButir = k,
    banyakPilihan = banyakPilihan,
    proporsiKelompok = kelompok$proporsi,
    banyakTiapKelompok = kelompok$banyakTiapKelompok,
    rerataSkorTotal = ps_rerata(kelompok$skorTotal),
    pilihan = pilihan,
    butir = do.call(rbind, ringkasButir),
    banyakPengecoh = k * (banyakPilihan - 1L),
    totalTakBerfungsi = sum(pilihan$kategori == "takBerfungsi", na.rm = TRUE),
    totalMenyesatkan = sum(pilihan$kategori == "menyesatkan", na.rm = TRUE)
  )
}
