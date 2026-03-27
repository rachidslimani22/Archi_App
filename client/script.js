"use strict";

function fact(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("fact attend un entier positif ou nul.");
  }

  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
  }
  return result;
}

function applique(f, tab) {
  return tab.map((value) => f(value));
}

console.log("factorielle de 6 =", fact(6));
console.log("factorielles [1..6] =", applique(fact, [1, 2, 3, 4, 5, 6]));
console.log(
  "fonction non nommee (+1) =",
  applique(function (n) {
    return n + 1;
  }, [1, 2, 3, 4, 5, 6])
);

let msgs = [
  { msg: "Hello World", pseudo: "Ada", date: "2026-03-26 09:00" },
  { msg: "Blah Blah", pseudo: "Linus", date: "2026-03-26 09:03" },
  { msg: "I love cats", pseudo: "Mia", date: "2026-03-26 09:10" },
  { msg: "Le TP avance bien aujourd'hui.", pseudo: "Noe", date: "2026-03-26 09:18" },
  { msg: "On passe ensuite au micro-service NodeJS.", pseudo: "Lia", date: "2026-03-26 09:24" }
];

function update(messages) {
  const messageList = document.getElementById("message-list");
  messageList.textContent = "";

  messages.forEach((item) => {
    const li = document.createElement("li");
    if (typeof item === "string") {
      li.textContent = item;
      messageList.appendChild(li);
      return;
    }

    const safePseudo = item.pseudo || "Anonyme";
    const safeDate = item.date || "date inconnue";
    const safeMsg = item.msg || "";
    li.textContent = `[${safeDate}] ${safePseudo}: ${safeMsg}`;
    messageList.appendChild(li);
  });
}

const refreshButton = document.getElementById("refresh-btn");
const messageForm = document.getElementById("message-form");
const pseudoInput = document.getElementById("pseudo-input");
const messageInput = document.getElementById("message-input");
const themeSelect = document.getElementById("theme-select");

function applyTheme(themeValue) {
  document.body.classList.remove("theme-light", "theme-dark");
  if (themeValue === "dark") {
    document.body.classList.add("theme-dark");
  } else {
    document.body.classList.add("theme-light");
  }
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
  return response.json();
}

async function refreshFromApi() {
  const data = await fetchJson("/msg/getAll");
  if (!Array.isArray(data)) {
    throw new Error("Format inattendu pour /msg/getAll");
  }

  msgs = data;
  update(msgs);
}

refreshButton.addEventListener("click", async () => {
  try {
    await refreshFromApi();
  } catch (error) {
    console.error("Echec mise a jour API, fallback local:", error);
    update(msgs);
  }
});

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const pseudo = pseudoInput.value.trim();
  const message = messageInput.value.trim();
  if (!pseudo || !message) {
    return;
  }

  try {
    const path =
      "/msg/post/" +
      encodeURIComponent(message) +
      "?pseudo=" +
      encodeURIComponent(pseudo);
    await fetchJson(path);
    await refreshFromApi();
    messageInput.value = "";
    messageInput.focus();
  } catch (error) {
    console.error("Echec publication message:", error);
  }
});

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

applyTheme(themeSelect.value);
refreshFromApi().catch((error) => {
  console.error("Chargement initial API impossible:", error);
  update(msgs);
});
