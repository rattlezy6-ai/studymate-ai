const form = document.getElementById("chatForm");
const input = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");
const welcome = document.getElementById("welcome");
const chatArea = document.getElementById("chatArea");
const messages = document.getElementById("messages");
const modeButtons = [...document.querySelectorAll(".mode-pill")];
let currentMode = "explain";
let history = [];

const modeInstructions = {
  explain: "Jelaskan materi dengan bahasa Indonesia yang sederhana, runtut, dan mudah dipahami. Berikan contoh jika membantu.",
  summary: "Buat rangkuman yang terstruktur, ringkas, dan mencakup gagasan penting. Gunakan poin-poin jika sesuai.",
  quiz: "Buat latihan soal berdasarkan topik yang diberikan. Sertakan kunci jawaban dan pembahasan setelah soal."
};

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach(button => button.classList.toggle("selected", button.dataset.mode === mode));
}
modeButtons.forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));

document.querySelectorAll(".quick-card").forEach(card => {
  card.addEventListener("click", () => {
    setMode(card.dataset.mode);
    input.value = card.dataset.prompt;
    input.focus();
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 130) + "px";
  });
});

document.getElementById("newChatBtn").addEventListener("click", resetChat);
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
  row.scrollIntoView({ behavior: "smooth", block: "nearest" });
  return bubble;
}
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 130) + "px";
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
  const loading = addMessage("ai", "StudyMate sedang menyusun jawaban...");
  loading.classList.add("typing");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        mode: currentMode,
        instruction: modeInstructions[currentMode],
        history: history.slice(-8)
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Terjadi kesalahan saat menghubungi AI.");
    loading.classList.remove("typing");
    loading.textContent = data.answer;
    history.push({ role: "user", text: question }, { role: "model", text: data.answer });
  } catch (error) {
    loading.classList.remove("typing");
    loading.classList.add("error");
    loading.textContent = error.message || "Koneksi bermasalah. Coba lagi beberapa saat.";
  } finally {
    sendBtn.disabled = false;
    sendBtn.querySelector("span").textContent = "Kirim";
    input.focus();
  }
});
