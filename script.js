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
