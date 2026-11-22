
const form = document.getElementById("chatForm");
const input = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");
const welcome = document.getElementById("welcome");
const chatArea = document.getElementById("chatArea");
const messages = document.getElementById("messages");
const modeButtons = [
  ...document.querySelectorAll(".mode-pill")
];

// MODE BELAJAR
let currentMode = "explain";
let uploadedPDFText = "";
let uploadedPDFName = "";

// MATERI BAWAAN
const knowledge = [
  {
    keywords: ["hukum newton", "newton"],
    title: "Hukum Newton",
    content: `Hukum Newton terdiri dari tiga hukum:

1. Hukum Newton I (Inersia)
Benda akan tetap diam atau bergerak lurus beraturan jika resultan gaya yang bekerja padanya sama dengan nol.

2. Hukum Newton II
Percepatan benda sebanding dengan resultan gaya dan berbanding terbalik dengan massanya.
Rumus: ΣF = m × a

3. Hukum Newton III
Setiap aksi memiliki reaksi yang sama besar tetapi berlawanan arah.

Contoh: Ketika seseorang mendorong dinding, dinding memberikan gaya reaksi yang berlawanan arah.`
  },
  {
    keywords: ["sistem informasi manajemen", "sim"],
    title: "Sistem Informasi Manajemen",
    content: `Sistem Informasi Manajemen (SIM) adalah sistem yang digunakan untuk mengumpulkan, mengolah, menyimpan, dan menyajikan informasi guna membantu proses pengambilan keputusan dalam organisasi.

Fungsi SIM:
1. Mengumpulkan data.
2. Mengolah data menjadi informasi.
3. Menyediakan laporan.
4. Membantu pengambilan keputusan.
5. Meningkatkan efisiensi pekerjaan.

Contoh: Sistem informasi akademik yang digunakan universitas untuk mengelola data mahasiswa dan nilai.`
  },
  {
    keywords: ["algoritma", "pemrograman"],
    title: "Algoritma dan Pemrograman",
    content: `Algoritma adalah urutan langkah-langkah logis dan sistematis untuk menyelesaikan suatu masalah.

Ciri-ciri algoritma:
1. Memiliki input.
2. Menghasilkan output.
3. Langkah-langkahnya jelas.
4. Memiliki urutan yang logis.
5. Berakhir setelah sejumlah langkah tertentu.

Pemrograman adalah proses menerjemahkan algoritma ke dalam bahasa pemrograman agar dapat dijalankan komputer.`
  },
  {
    keywords: ["pancasila"],
    title: "Pancasila",
    content: `Pancasila merupakan dasar negara dan ideologi bangsa Indonesia.

Lima sila Pancasila:
1. Ketuhanan Yang Maha Esa.
2. Kemanusiaan yang Adil dan Beradab.
3. Persatuan Indonesia.
4. Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan.
5. Keadilan Sosial bagi Seluruh Rakyat Indonesia.

Pancasila menjadi pedoman dalam kehidupan bermasyarakat, berbangsa, dan bernegara.`
  },
  {
    keywords: ["integral", "kalkulus"],
    title: "Integral",
    content: `Integral merupakan salah satu konsep dalam kalkulus yang digunakan untuk menentukan antiturunan dan menghitung luas daerah.

Aturan dasar:
∫ xⁿ dx = xⁿ⁺¹/(n+1) + C, untuk n ≠ -1.

Keterangan:
- x adalah variabel.
- n adalah pangkat.
- C adalah konstanta integrasi.

Contoh:
∫ x² dx = x³/3 + C.`
  },
  {
    keywords: ["energi"],
    title: "Energi",
    content: `Energi adalah kemampuan untuk melakukan usaha.

Bentuk energi antara lain:
1. Energi kinetik.
2. Energi potensial.
3. Energi panas.
4. Energi listrik.
5. Energi kimia.

Rumus energi kinetik:
Ek = ½mv²

Rumus energi potensial:
Ep = mgh.`
  }
];

// ELEMEN UPLOAD PDF
const pdfInput = document.getElementById("pdfInput");
const pdfStatus = document.getElementById("pdfStatus");

// PERIKSA PDF.JS
if (pdfInput && pdfStatus) {
  if (typeof pdfjsLib !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    pdfInput.addEventListener("change", async () => {
      const file = pdfInput.files[0];

      if (!file) return;

      if (file.type !== "application/pdf") {
        pdfStatus.textContent = "File harus PDF.";
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        pdfStatus.textContent =
          "Ukuran PDF maksimal 20 MB.";
        return;
      }

      pdfStatus.textContent = "Sedang membaca PDF...";

      try {
        const buffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
          data: buffer
        }).promise;

        let fullText = "";

        for (
          let pageNumber = 1;
          pageNumber <= pdf.numPages;
          pageNumber++
        ) {
          pdfStatus.textContent =
            `Membaca halaman ${pageNumber} dari ${pdf.numPages}...`;

          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();

          const pageText = content.items
            .map(item => item.str)
            .join(" ");

          fullText += pageText + "\n";
        }

        if (!fullText.trim()) {
          throw new Error(
            "PDF tidak memiliki teks yang bisa dibaca. Mungkin PDF berupa hasil scan."
          );
        }

        uploadedPDFText = fullText.trim();
        uploadedPDFName = file.name;

        pdfStatus.textContent =
          `Berhasil membaca ${pdf.numPages} halaman: ${file.name}`;

      } catch (error) {
        uploadedPDFText = "";
        uploadedPDFName = "";

        pdfStatus.textContent =
          "Gagal membaca PDF: " + error.message;
      }
    });
  } else {
    pdfStatus.textContent =
      "PDF.js gagal dimuat. Periksa koneksi internet.";
  }
}

// GANTI MODE
function setMode(mode) {
  currentMode = mode;

  modeButtons.forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.mode === mode
    );
  });
}

modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
  });
});

// KARTU MATERI
document.querySelectorAll(".quick-card").forEach(card => {
  card.addEventListener("click", () => {
    setMode(card.dataset.mode);
    input.value = card.dataset.prompt;
    input.focus();
  });
});

// RESET PERCAKAPAN
function resetChat() {
  messages.innerHTML = "";
  chatArea.classList.add("hidden");
  welcome.classList.remove("hidden");
  input.value = "";
  setMode("explain");
}

document.getElementById("newChatBtn")
  .addEventListener("click", resetChat);

// TAMPILKAN PESAN
function addMessage(role, text) {
  const row = document.createElement("div");
  row.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role}`;
  avatar.textContent = role === "user" ? "K" : "S";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.append(avatar, bubble);
  messages.appendChild(row);

  row.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

// CARI MATERI BAWAAN
function findMaterial(question) {
  const text = question.toLowerCase();

  return knowledge.find(item =>
    item.keywords.some(keyword =>
      text.includes(keyword)
    )
  );
}

// BUAT LATIHAN SOAL
function generateQuiz(material) {
  return `LATIHAN SOAL: ${material.title}

1. Apa pengertian ${material.title}?
A. Konsep yang tidak berhubungan dengan materi
B. Konsep dasar yang dipelajari dalam materi
C. Kegiatan tanpa tujuan
D. Tidak memiliki pengertian

2. Mengapa materi ${material.title} penting dipelajari?
A. Untuk menambah pemahaman
B. Untuk menghindari pembelajaran
C. Untuk menghilangkan informasi
D. Tidak memiliki manfaat

Kunci jawaban:
1. B
2. A`;
}

// CARI BAGIAN PDF YANG RELEVAN
function searchPDF(question) {
  const words = question.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);

  const sentences = uploadedPDFText
    .split(/[.!?]\s+/)
    .filter(sentence => sentence.trim().length > 20);

  return sentences
    .map(sentence => ({
      sentence,
      score: words.filter(word =>
        sentence.toLowerCase().includes(word)
      ).length
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(item => item.sentence);
}

// JAWABAN BERDASARKAN PDF
function generatePDFAnswer(question) {
  if (currentMode === "summary") {
    return `RANGKUMAN DARI PDF: ${uploadedPDFName}

${uploadedPDFText.slice(0, 3500)}

Catatan: Ini merupakan cuplikan teks awal dokumen, bukan rangkuman AI otomatis.`;
  }

  const relevant = searchPDF(question);

  if (relevant.length === 0) {
    return "Belum ditemukan bagian yang cocok dengan pertanyaanmu dalam PDF. Coba gunakan kata kunci lain.";
  }

  if (currentMode === "quiz") {
    return `LATIHAN BERDASARKAN PDF: ${uploadedPDFName}

${relevant.slice(0, 5).map((item, index) =>
  `${index + 1}. Jelaskan konsep berikut:\n${item}`
).join("\n\n")}

Catatan: Soal dibuat berdasarkan potongan teks materi.`;
  }

  return `BERDASARKAN MATERI PDF: ${uploadedPDFName}

${relevant.join("\n\n")}

Catatan: Jawaban diambil dari bagian PDF yang cocok dengan kata kunci pertanyaan.`;
}

// GENERATE JAWABAN
function generateAnswer(question) {
  if (uploadedPDFText) {
    return generatePDFAnswer(question);
  }

  const material = findMaterial(question);

  if (!material) {
    return `Materi tersebut belum tersedia dalam basis pengetahuan StudyMate AI.

Topik yang tersedia:
- Hukum Newton
- Sistem Informasi Manajemen
- Algoritma dan Pemrograman
- Pancasila
- Integral
- Energi

Kamu juga bisa mengunggah materi PDF.

Catatan: StudyMate AI saat ini menggunakan basis pengetahuan lokal, bukan AI generatif.`;
  }

  if (currentMode === "summary") {
    return `RANGKUMAN: ${material.title}

${material.content}

Kesimpulan:
Materi ${material.title} merupakan konsep penting yang perlu dipahami dan dipelajari.`;
  }

  if (currentMode === "quiz") {
    return generateQuiz(material);
  }

  return `PENJELASAN: ${material.title}

${material.content}

Semoga penjelasan ini membantu kamu memahami materi!`;
}

// KIRIM PERTANYAAN
form.addEventListener("submit", event => {
  event.preventDefault();

  const question = input.value.trim();

  if (!question || sendBtn.disabled) return;

  welcome.classList.add("hidden");
  chatArea.classList.remove("hidden");

  addMessage("user", question);

  input.value = "";

  sendBtn.disabled = true;
  sendBtn.querySelector("span").textContent = "Memproses";

  setTimeout(() => {
    try {
      const answer = generateAnswer(question);
      addMessage("ai", answer);
    } catch (error) {
      addMessage(
        "ai",
        "Terjadi kesalahan: " + error.message
      );
    }

    sendBtn.disabled = false;
    sendBtn.querySelector("span").textContent = "Kirim";
  }, 400);
});

// ENTER UNTUK MENGIRIM
input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
