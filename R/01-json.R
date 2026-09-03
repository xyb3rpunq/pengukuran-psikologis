# ---------------------------------------------------------------------------
# Penulis JSON minimal (base R saja)
#
# WebR bisa memulangkan objek R ke JavaScript lewat toJs(), tapi bentuknya
# menyimpan tipe internal R dan menyulitkan penulisan uji. Jembatan di proyek
# ini memakai satu format tunggal: R menghasilkan string JSON, JavaScript
# memanggil JSON.parse(). Konsekuensinya, seluruh hasil mesin bisa diuji sebagai
# string di R maupun sebagai objek di JavaScript, dari sumber yang sama.
#
# Aturan pemetaan:
#   NULL                          -> null
#   NA / NaN / Inf                -> null   (JSON tidak punya padanannya)
#   vektor panjang 1 tanpa nama   -> skalar
#   vektor panjang != 1           -> array
#   list bernama                  -> object
#   list tanpa nama               -> array
#   data.frame                    -> array of object (satu object per baris)
#
# Bagian dari: pengukuran-psikologis (PSI307)
# ---------------------------------------------------------------------------

#' Lolos-kan sebuah string menjadi literal JSON yang sah.
ps_json_teks <- function(s) {
  s <- as.character(s)
  s <- gsub("\\", "\\\\", s, fixed = TRUE)
  s <- gsub("\"", "\\\"", s, fixed = TRUE)
  s <- gsub("\b", "\\b", s, fixed = TRUE)
  s <- gsub("\f", "\\f", s, fixed = TRUE)
  s <- gsub("\n", "\\n", s, fixed = TRUE)
  s <- gsub("\r", "\\r", s, fixed = TRUE)
  s <- gsub("\t", "\\t", s, fixed = TRUE)
  paste0("\"", s, "\"")
}

#' Ubah satu angka menjadi literal JSON.
#'
#' Nilai yang tidak hingga (NA, NaN, Inf) menjadi `null`, karena JSON tidak
#' mengenalnya. Pemanggil bertanggung jawab menafsirkan `null` sesuai konteks.
ps_json_angka <- function(x) {
  # Diformat satu per satu: format() atas sebuah vektor menyamakan lebar
  # seluruh elemen, dan angka hasil pelapisan itu bukan angka yang dihitung.
  vapply(x, function(nilai) {
    if (!is.finite(nilai)) return("null")
    # 17 digit signifikan memulangkan double IEEE-754 secara utuh, sehingga
    # nilai yang sampai di JavaScript identik bit demi bit dengan nilai di R.
    # Notasi ilmiah dibiarkan apa adanya — "1e-05" tetap literal JSON yang sah.
    format(nilai, digits = 17, trim = TRUE)
  }, character(1L), USE.NAMES = FALSE)
}

#' Tandai sebuah vektor agar selalu keluar sebagai array JSON.
#'
#' Aturan "panjang 1 jadi skalar" tepat untuk koefisien tunggal seperti alpha,
#' tapi salah untuk daftar yang kebetulan berisi satu elemen: modus dengan satu
#' nilai, belahan tes dengan satu aitem. Tanpa penanda ini, bentuk JSON yang
#' diterima peramban berubah-ubah mengikuti isi datanya, dan kode di sisi sana
#' harus menebak. Penanda dipasang di tempat perakitan hasil, bukan di dalam
#' fungsi hitungnya, supaya aritmetika di R tidak ikut membawa kelas tambahan.
ps_larik <- function(x) {
  if (is.null(x)) return(list())
  structure(x, class = c("ps_larik", class(x)))
}

#' Serialkan objek R apa pun menjadi string JSON.
ps_json <- function(x) {
  if (is.null(x)) return("null")

  if (inherits(x, "ps_larik")) {
    telanjang <- unclass(x)
    if (length(telanjang) == 0L) return("[]")
    isi <- vapply(seq_along(telanjang), function(i) ps_json(telanjang[[i]]), character(1L))
    return(paste0("[", paste(isi, collapse = ","), "]"))
  }

  # Matriks diserialkan sebagai array baris, bukan array datar. Membiarkannya
  # datar berarti dimensinya hanya ada di kepala pembaca, dan skalogram Guttman
  # yang salah dimensi tetap terbaca seperti angka yang masuk akal.
  if (is.matrix(x)) {
    if (nrow(x) == 0L) return("[]")
    baris <- vapply(seq_len(nrow(x)), function(i) ps_json(ps_larik(as.vector(x[i, ]))),
                    character(1L))
    return(paste0("[", paste(baris, collapse = ","), "]"))
  }

  if (is.data.frame(x)) {
    if (nrow(x) == 0L) return("[]")
    baris <- vapply(seq_len(nrow(x)), function(i) {
      isi <- lapply(names(x), function(kolom) x[[kolom]][i])
      names(isi) <- names(x)
      ps_json(isi)
    }, character(1L))
    return(paste0("[", paste(baris, collapse = ","), "]"))
  }

  if (is.list(x)) {
    if (length(x) == 0L) return(if (is.null(names(x))) "[]" else "{}")
    nilai <- vapply(x, ps_json, character(1L), USE.NAMES = FALSE)
    nama <- names(x)
    if (is.null(nama) || any(nama == "")) {
      return(paste0("[", paste(nilai, collapse = ","), "]"))
    }
    pasangan <- paste0(ps_json_teks(nama), ":", nilai)
    return(paste0("{", paste(pasangan, collapse = ","), "}"))
  }

  if (is.character(x) || is.factor(x)) {
    s <- as.character(x)
    keluar <- ifelse(is.na(s), "null", ps_json_teks(s))
    if (length(keluar) == 1L && is.null(names(x))) return(keluar)
    return(paste0("[", paste(keluar, collapse = ","), "]"))
  }

  if (is.logical(x)) {
    keluar <- ifelse(is.na(x), "null", ifelse(x, "true", "false"))
    if (length(keluar) == 1L && is.null(names(x))) return(keluar)
    return(paste0("[", paste(keluar, collapse = ","), "]"))
  }

  if (is.numeric(x)) {
    keluar <- ps_json_angka(as.numeric(x))
    if (length(keluar) == 1L && is.null(names(x))) return(keluar)
    return(paste0("[", paste(keluar, collapse = ","), "]"))
  }

  ps_ralat("data.bukanAngka", indeks = -1L)
}

#' Bungkus pemanggilan mesin: hasil sukses maupun galat sama-sama jadi JSON.
#'
#' Ini satu-satunya pintu keluar mesin. Peramban tidak pernah melihat pesan
#' galat bawaan R — hanya kode yang bisa diterjemahkan ke ID maupun EN.
ps_jalankan <- function(ekspresi) {
  hasil <- tryCatch(
    list(ok = TRUE, hasil = ekspresi),
    ps_ralat = function(k) list(ok = FALSE, kode = k$kode, konteks = k$konteks),
    error = function(k) list(ok = FALSE, kode = "mesin.gagal", konteks = list())
  )
  ps_json(hasil)
}
