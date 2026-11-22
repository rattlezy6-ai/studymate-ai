
const form = document.getElementById("chatForm");
const input = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");
const welcome = document.getElementById("welcome");
const chatArea = document.getElementById("chatArea");
const messages = document.getElementById("messages");
const modeButtons = [...document.querySelectorAll(".mode-pill")];

let currentMode = "explain";
let history = [];

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
    "StudyMate sedang berpikir..."
  );

  loading.classList.add("typing");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: question,
        mode: currentMode,
        history: history.slice(-10)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Gagal menghubungi AI."
      );
    }

    const answer = data.answer;

    if (!answer) {
      throw new Error("AI tidak memberikan jawaban.");
    }

    loading.classList.remove("typing");
    loading.textContent = answer;

    history.push(
      { role: "user", content: question },
      { role: "assistant", content: answer }
    );

  } catch (error) {
    loading.classList.remove("typing");
    loading.classList.add("error");
    loading.textContent =
      "Terjadi kesalahan: " + error.message;

  } finally {
    sendBtn.disabled = false;
    sendBtn.querySelector("span").textContent = "Kirim";
    input.focus();
  }
});
