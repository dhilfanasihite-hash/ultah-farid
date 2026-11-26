"use strict";

// =========================================
// 1. NAMA TAMU DINAMIS DARI PARAMETER URL (?to=)
// =========================================
const parameterUrl = new URLSearchParams(window.location.search);
const namaDariUrl = parameterUrl.get("to");

const elNamaTamuUrl = document.getElementById("nama-tamu-url");
const inputNamaForm = document.getElementById("nama-tamu");

if (namaDariUrl && namaDariUrl.trim() !== "") {
  const namaBersih = namaDariUrl.trim();
  if (elNamaTamuUrl) {
    elNamaTamuUrl.textContent = namaBersih;
  }
  if (inputNamaForm) {
    inputNamaForm.value = namaBersih;
  }
}

// =========================================
// 2. BUKA SAMPUL & KONTROL MUSIK (AUTOPLAY + TOGGLE)
// =========================================
const cover = document.getElementById("cover");
const btnBuka = document.getElementById("btn-buka");
const audioMusik = document.getElementById("musik-latar");
const btnMusik = document.getElementById("btn-musik");
const ikonMusik = document.getElementById("ikon-musik");
const teksMusik = document.getElementById("teks-musik");

let sedangMemutar = false;

const perbaruiTampilanTombolMusik = (aktif) => {
  sedangMemutar = aktif;
  if (!btnMusik || !ikonMusik || !teksMusik) return;

  if (aktif) {
    btnMusik.classList.add("aktif");
    ikonMusik.textContent = "❚❚";
    teksMusik.textContent = "Jeda";
  } else {
    btnMusik.classList.remove("aktif");
    ikonMusik.textContent = "▶";
    teksMusik.textContent = "Musik";
  }
};

const putarMusik = (dariKlikPengguna = false) => {
  if (!audioMusik) {
    if (dariKlikPengguna) {
      tampilkanToast("Tag <audio id='musik-latar'> tidak ditemukan di HTML!");
    }
    return;
  }

  if (!audioMusik.paused) {
    perbaruiTampilanTombolMusik(true);
    return;
  }

  const prosesPutar = audioMusik.play();
  if (prosesPutar !== undefined) {
    prosesPutar
      .then(() => {
        perbaruiTampilanTombolMusik(true);
      })
      .catch((error) => {
        perbaruiTampilanTombolMusik(false);
        if (dariKlikPengguna) {
          tampilkanToast(`Audio gagal: ${error.name}`);
        }
        console.error("Detail error audio:", error);
      });
  }
};

const jedaMusik = () => {
  if (!audioMusik) return;
  audioMusik.pause();
  perbaruiTampilanTombolMusik(false);
};

// Coba putar saat halaman selesai dimuat
window.addEventListener("load", () => putarMusik(false));

// Putar otomatis pada interaksi pertama di layar (hanya dijalankan 1 kali)
document.addEventListener("click", () => putarMusik(false), { once: true });
document.addEventListener("touchstart", () => putarMusik(false), {
  once: true,
});

// Tombol Buka Undangan
if (btnBuka && cover) {
  btnBuka.addEventListener("click", (event) => {
    event.stopPropagation();
    cover.classList.add("terbuka");
    document.body.classList.remove("terkunci");
    putarMusik(true);
  });
}

// Tombol Melayang Play / Pause
if (btnMusik) {
  btnMusik.addEventListener("click", (event) => {
    event.stopPropagation();
    if (sedangMemutar) {
      jedaMusik();
    } else {
      putarMusik(true);
    }
  });
}

// =========================================
// 3. COUNTDOWN TIMER REAL-TIME
// =========================================
const targetTanggal = new Date("2026-11-29T10:00:00+07:00").getTime();

const elHari = document.getElementById("hari");
const elJam = document.getElementById("jam");
const elMenit = document.getElementById("menit");
const elDetik = document.getElementById("detik");
const wadahCountdown = document.getElementById("countdown");

const perbaruiCountdown = () => {
  const sekarang = Date.now();
  const selisih = targetTanggal - sekarang;

  if (selisih <= 0) {
    clearInterval(intervalCountdown);
    if (wadahCountdown) {
      wadahCountdown.innerHTML =
        "<p><strong>Acara sedang berlangsung atau telah selesai.</strong></p>";
    }
    return;
  }

  const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));
  const jam = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
  const detik = Math.floor((selisih % (1000 * 60)) / 1000);

  if (elHari && elJam && elMenit && elDetik) {
    elHari.textContent = String(hari).padStart(2, "0");
    elJam.textContent = String(jam).padStart(2, "0");
    elMenit.textContent = String(menit).padStart(2, "0");
    elDetik.textContent = String(detik).padStart(2, "0");
  }
};

const intervalCountdown = setInterval(perbaruiCountdown, 1000);
perbaruiCountdown();

// =========================================
// 4. COPY TO CLIPBOARD + NOTIFIKASI TOAST
// =========================================
const toast = document.getElementById("toast-notifikasi");
let timerToast = null;

const tampilkanToast = (pesan) => {
  if (!toast) return;
  toast.textContent = pesan;
  toast.classList.add("muncul");

  clearTimeout(timerToast);
  timerToast = setTimeout(() => {
    toast.classList.remove("muncul");
  }, 2800);
};

const tombolSalinList = document.querySelectorAll(".btn-salin");

tombolSalinList.forEach((tombol) => {
  tombol.addEventListener("click", () => {
    const idTarget = tombol.getAttribute("data-target");
    const labelItem = tombol.getAttribute("data-label") || "Teks";
    const elemenTarget = idTarget ? document.getElementById(idTarget) : null;

    if (!elemenTarget) return;
    const teksSalin = elemenTarget.textContent.trim();

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(teksSalin)
        .then(() => tampilkanToast(`${labelItem} berhasil disalin!`))
        .catch(() => tampilkanToast("Gagal menyalin teks."));
    } else {
      const areaSementara = document.createElement("textarea");
      areaSementara.value = teksSalin;
      document.body.appendChild(areaSementara);
      areaSementara.select();
      document.execCommand("copy");
      document.body.removeChild(areaSementara);
      tampilkanToast(`${labelItem} berhasil disalin!`);
    }
  });
});

// =========================================
// 5. SCROLL ANIMATION (INTERSECTION OBSERVER)
// =========================================
const elemenAnimasi = document.querySelectorAll(".animasi-scroll");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("tampil");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  elemenAnimasi.forEach((el) => observer.observe(el));
} else {
  elemenAnimasi.forEach((el) => el.classList.add("tampil"));
}

// =========================================
// 6. FORM RSVP & BUKU TAMU (LOCALSTORAGE)
// =========================================
const KUNCI_STORAGE = "buku_tamu_undangan_v1";
const formRsvp = document.getElementById("form-rsvp");
const daftarUcapan = document.getElementById("daftar-ucapan");
const jumlahUcapan = document.getElementById("jumlah-ucapan");

const dataBawaan = [
  {
    nama: "Rizky Pratama",
    status: "Hadir",
    pesan:
      "Selamat ulang tahun ke-17 Farid Athaillah! Semoga panjang umur, sehat selalu, dan tercapai semua cita-citanya.",
  },
];

const ambilDataUcapan = () => {
  try {
    const tersimpan = localStorage.getItem(KUNCI_STORAGE);
    return tersimpan ? JSON.parse(tersimpan) : dataBawaan;
  } catch {
    return dataBawaan;
  }
};

const simpanDataUcapan = (daftar) => {
  try {
    localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftar));
  } catch {
    // Abaikan jika mode private browsing memblokir storage
  }
};

const renderDaftarUcapan = () => {
  if (!daftarUcapan) return;
  const semuaUcapan = ambilDataUcapan();

  daftarUcapan.innerHTML = "";
  if (jumlahUcapan) {
    jumlahUcapan.textContent = String(semuaUcapan.length);
  }

  semuaUcapan.forEach((item) => {
    const kartu = document.createElement("div");
    kartu.className = "item-ucapan";

    const barisAtas = document.createElement("div");
    barisAtas.className = "ucapan-atas";

    const elNama = document.createElement("span");
    elNama.className = "ucapan-nama";
    elNama.textContent = item.nama;

    const elBadge = document.createElement("span");
    const statusHadir = item.status === "Hadir";
    elBadge.className = `badge-status ${statusHadir ? "badge-hadir" : "badge-tidak"}`;
    elBadge.textContent = item.status;

    const elPesan = document.createElement("p");
    elPesan.className = "ucapan-isi";
    elPesan.textContent = item.pesan;

    barisAtas.appendChild(elNama);
    barisAtas.appendChild(elBadge);
    kartu.appendChild(barisAtas);
    kartu.appendChild(elPesan);
    daftarUcapan.appendChild(kartu);
  });
};

if (formRsvp) {
  formRsvp.addEventListener("submit", (event) => {
    event.preventDefault();

    const nama = document.getElementById("nama-tamu").value.trim();
    const status = document.getElementById("status-hadir").value;
    const pesan = document.getElementById("pesan-doa").value.trim();

    if (!nama || !pesan) return;

    const daftarSaatIni = ambilDataUcapan();
    daftarSaatIni.unshift({ nama, status, pesan });

    simpanDataUcapan(daftarSaatIni);
    renderDaftarUcapan();
    tampilkanToast("Konfirmasi dan ucapan Anda tersimpan!");

    document.getElementById("pesan-doa").value = "";
  });
}

// Render buku tamu pertama kali saat halaman dimuat
renderDaftarUcapan();
