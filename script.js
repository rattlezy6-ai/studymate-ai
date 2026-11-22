
const form = document.getElementById("chatForm");
const input = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");
const welcome = document.getElementById("welcome");
const chatArea = document.getElementById("chatArea");
const messages = document.getElementById("messages");
const modeButtons = [...document.querySelectorAll(".mode-pill")];

let currentMode = "explain";
let history = [];
let generatorPromise = null;

const modeInstructions = {
  explain: "Jelaskan materi dengan bahasa Indonesia yang sederhana, runtut, dan mudah dipahami. Berikan contoh jika membantu.",
  summary: "Buat rangkuman yang terstruktur, ringkas, dan mencakup gagasan penting. Gunakan poin-poin jika sesuai.",
  quiz: "Buat latihan soal berdasarkan topik yang diberikan. Sertakan kunci jawaban dan pembahasan setelah soal."
};

// Memuat model AI dari Hugging Face
async function getGenerator() {
  if (!generatorPromise) {
    generatorPromise = (async () => {
      const { pipeline, env } = await import(
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
      );

      env.allowLocalModels = false;

      return await pipeline(
        "text-generation",
        "onnx-community/Qwen2.5-0.5B-Instruct",
        { dtype: "q4" }
      );
    })();
  }

  return generatorPromise;
}

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach(button =>
    button.classList.toggle(
      "selected",
      button.dataset.mode === mode
    )
  );
}

modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
  });
});

document.querySelectorAll(".quick-card").forEach(card => {
  card.addEventListener("click", () => {
    setMode(card.dataset.mode);
    input.value = card.dataset.prompt;
    input.focus();
    input.style.height = "auto";
    input.style.height =
      Math.min(input.scrollHeight, 130) + "px";
  });
});

document.getElementById("newChatBtn")
  .addEventListener("click", resetChat);

function resetChat() {
  history = [];
  messages.innerHTML = "";
  chatArea.classList.add("hidden");
  welcome.classList.remove("hidden");
  input.value = "";
  input.focus();
  setMode("explain");
}

function addMessage(role, text, extraClass = "") {
  const row = document.createElement("div");
  row.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role}`;
  avatar.textContent = role === "user" ? "K" : "S";

  const bubble = document.createElement("div");
  bubble.className = "bubble " + extraClass;
  bubble.textContent = text;

  row.append(avatar, bubble);
  messages.appendChild(row);

  row.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });

  return bubble;
}

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height =
    Math.min(input.scrollHeight, 130) + "px";
});

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  const question = input.value.trim();

  if (!question || sendBtn.disabled) return;

  welcome.classList.add("hidden");
  chatArea.classList.remove("hidden");

  addMessage("user", question);

  input.value = "";
  input.style.height = "auto";

  sendBtn.disabled = true;
  sendBtn.querySelector("span").textContent = "Memproses";

  const loading = addMessage(
    "ai",
    "StudyMate sedang menyiapkan model AI..."
  );

  loading.classList.add("typing");

  try {
    const generator = await getGenerator();

    loading.textContent = "StudyMate sedang menyusun jawaban...";

    const modelMessages = [
      {
        role: "system",
        content: `Kamu adalah StudyMate AI, asisten belajar yang ramah.
Jawab menggunakan bahasa Indonesia.
Mode belajar: ${currentMode}
Instruksi: ${modeInstructions[currentMode]}
Gunakan penjelasan sederhana, runtut, dan berikan contoh jika diperlukan.`
      },

      ...history.slice(-6).map(item => ({
        role: item.role === "user" ? "user" : "assistant",
        content: item.text
      })),

      {
        role: "user",
        content: question
      }
    ];

    const result = await generator(modelMessages, {
      max_new_tokens: 220,
      do_sample: false
    });

    const generated = result[0].generated_text;

    let answer = "";

    if (Array.isArray(generated)) {
      answer = generated[generated.length - 1]?.content || "";
    } else {
      answer = generated || "";
    }

    answer = answer.trim();

    if (!answer) {
      throw new Error("AI belum memberikan jawaban. Coba lagi.");
    }

    loading.classList.remove("typing");
    loading.textContent = answer;

    history.push(
      { role: "user", text: question },
      { role: "model", text: answer }
    );

  } catch (error) {
    console.error("StudyMate error:", error);

    loading.classList.remove("typing");
    loading.classList.add("error");

    loading.textContent =
      "Gagal menjalankan AI. Periksa koneksi internet, ruang penyimpanan, dan kemampuan perangkat. Detail: " +
      (error.message || "Terjadi kesalahan.");
  } finally {
    sendBtn.disabled = false;
    sendBtn.querySelector("span").textContent = "Kirim";
    input.focus();
  }
});
