# ---------------------------------------------------------------------------
# Seleksi butir berulang
#
# Acuan modul: PSI307 sesi 2, langkah ke-11 "revisi instrumen", dan sesi 5-6
# yang memberi kriteria gugurnya tanpa pernah menjabarkan prosedurnya.
#
# Modul menyuruh membuang butir yang tidak valid lalu merevisi instrumennya,
# tetapi berhenti di situ. Yang tidak disebut adalah bahwa membuang butir
# MENGUBAH skor total, dan skor total itulah yang dipakai menilai butir yang
# tersisa. Sekali satu butir dibuang, semua korelasi aitem-total berubah:
# butir yang tadinya gugur bisa lolos, dan butir yang tadinya lolos bisa gugur.
#
# Karena itu butir dibuang SATU per satu, bukan sekaligus. Membuang seluruh
# butir yang gagal dalam satu langkah adalah kesalahan yang paling sering
# terjadi di skripsi: ia membuang butir yang sebenarnya akan selamat begitu
# butir terburuk pergi, dan hasilnya skala menjadi lebih pendek daripada yang
# perlu — sering kali cukup pendek untuk menjatuhkan reliabilitasnya sendiri.
#
# Setiap putaran dicatat, jadi yang keluar bukan cuma daftar butir yang
# selamat melainkan riwayat keputusannya: butir mana yang dibuang, karena
# berapa, dan apa yang terjadi pada alpha sesudahnya.
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Buang butir yang tidak memenuhi kriteria, satu per satu, sampai bersih.
#'
#' @param m         matriks respons: baris = responden, kolom = butir
#' @param metode    "rTabel" membandingkan dengan nilai kritis r pada taraf
#'                  yang dipilih — kriteria sesi 5. "tetap" membandingkan
#'                  dengan satu angka, lazimnya 0,30 mengikuti Azwar.
#' @param ambang    dipakai bila metode "tetap"
#' @param alpha     taraf signifikansi bila metode "rTabel"
#' @param minButir  berhenti bila butir tersisa tinggal sebanyak ini
ps_seleksi_butir <- function(m, metode = "rTabel", ambang = 0.30, alpha = 0.05,
                             minButir = 3L) {
  ps_periksa_matriks(m, minAitem = 3L, minResponden = 3L)
  ps_pastikan(metode %in% c("rTabel", "tetap"), "skala.tidakDikenal", nilai = metode)
  ps_pastikan(minButir >= 2, "nilai.harusPositif", nilai = minButir)
  m <- as.matrix(m)
  n <- nrow(m)

  nama <- colnames(m)
  if (is.null(nama)) nama <- paste0("A", seq_len(ncol(m)))
  colnames(m) <- nama

  batas <- if (metode == "rTabel") ps_r_kritis(n, alpha) else ambang
  tersisa <- seq_len(ncol(m))
  alphaAwal <- tryCatch(ps_alpha_cronbach(m), ps_ralat = function(k) NA_real_)

  putaran <- list()
  nomorPutaran <- 0L

  repeat {
    aktif <- m[, tersisa, drop = FALSE]
    if (ncol(aktif) < 3L) break

    r <- ps_korelasi_aitem_total(aktif, dikoreksi = TRUE)
    # NA diperlakukan sebagai paling buruk: butir tanpa variasi tidak pernah
    # bisa berkorelasi dengan apa pun, dan membiarkannya menghentikan seluruh
    # prosedur akan lebih membingungkan daripada membuangnya.
    nilai <- ifelse(is.finite(r), r, -Inf)
    gagal <- which(nilai < batas)
    if (length(gagal) == 0L) break
    if (ncol(aktif) <= minButir) break

    terburuk <- gagal[which.min(nilai[gagal])]
    alphaSebelum <- tryCatch(ps_alpha_cronbach(aktif), ps_ralat = function(k) NA_real_)
    sisaBaru <- tersisa[-terburuk]
    alphaSesudah <- tryCatch(
      ps_alpha_cronbach(m[, sisaBaru, drop = FALSE]),
      ps_ralat = function(k) NA_real_
    )

    nomorPutaran <- nomorPutaran + 1L
    putaran[[nomorPutaran]] <- data.frame(
      putaran = nomorPutaran,
      dibuang = nama[tersisa[terburuk]],
      rHitung = if (is.finite(r[terburuk])) r[terburuk] else NA_real_,
      batas = batas,
      butirSebelum = length(tersisa),
      butirSesudah = length(sisaBaru),
      alphaSebelum = alphaSebelum,
      alphaSesudah = alphaSesudah,
      selisihAlpha = alphaSesudah - alphaSebelum,
      stringsAsFactors = FALSE
    )
    tersisa <- sisaBaru
  }

  akhir <- m[, tersisa, drop = FALSE]
  rAkhir <- if (ncol(akhir) >= 2L) ps_korelasi_aitem_total(akhir, dikoreksi = TRUE) else NA_real_
  alphaAkhir <- tryCatch(ps_alpha_cronbach(akhir), ps_ralat = function(k) NA_real_)

  kosong <- data.frame(
    putaran = integer(0), dibuang = character(0), rHitung = numeric(0),
    batas = numeric(0), butirSebelum = integer(0), butirSesudah = integer(0),
    alphaSebelum = numeric(0), alphaSesudah = numeric(0), selisihAlpha = numeric(0),
    stringsAsFactors = FALSE
  )

  list(
    n = n,
    metode = metode,
    batas = batas,
    alpha = alpha,
    banyakAwal = ncol(m),
    banyakAkhir = length(tersisa),
    banyakDibuang = ncol(m) - length(tersisa),
    alphaAwal = alphaAwal,
    alphaAkhir = alphaAkhir,
    selisihAlpha = alphaAkhir - alphaAwal,
    # Prosedur berhenti karena salah satu dari dua sebab, dan keduanya berbeda
    # artinya. "bersih" berarti semua butir yang tersisa lolos. "batasBawah"
    # berarti masih ada yang gagal tetapi skalanya sudah terlalu pendek untuk
    # dipotong lagi — dan skala seperti itu perlu ditulis ulang, bukan dipangkas.
    sebabBerhenti = if (length(tersisa) <= minButir &&
                        ncol(akhir) >= 2L &&
                        any(!is.finite(rAkhir) | rAkhir < batas)) "batasBawah" else "bersih",
    butirBertahan = ps_larik(nama[tersisa]),
    butirDibuang = ps_larik(setdiff(nama, nama[tersisa])),
    putaran = if (nomorPutaran == 0L) kosong else do.call(rbind, putaran),
    akhir = data.frame(
      butir = nama[tersisa],
      rHitung = as.numeric(rAkhir),
      batas = rep(batas, length(tersisa)),
      lolos = is.finite(rAkhir) & rAkhir >= batas,
      stringsAsFactors = FALSE
    )
  )
}
