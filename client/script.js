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
const apiBaseInput = document.getElementById("api-base-input");

function normalizeBaseUrl(url) {
  return url.trim().replace(/\/+$/, "");
}

function getApiBaseUrl() {
  return normalizeBaseUrl(apiBaseInput.value);
}

function buildApiUrl(path) {
  const base = getApiBaseUrl();
  if (!base) {
    return path;
  }
  return base + path;
}

function applyTheme(themeValue) {
  document.body.classList.remove("theme-light", "theme-dark");
  if (themeValue === "dark") {
    document.body.classList.add("theme-dark");
  } else {
    document.body.classList.add("theme-light");
  }
}

async function fetchJson(path) {
  const response = await fetch(buildApiUrl(path));
  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }
  return response.json();
}

async function refreshFromApi() {
  if (window.location.protocol === "file:" && !getApiBaseUrl()) {
    update(msgs);
    return;
  }

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
    if (window.location.protocol === "file:" && !getApiBaseUrl()) {
      msgs.push({
        msg: message,
        pseudo,
        date: new Date().toLocaleString("fr-FR")
      });
      update(msgs);
    } else {
      const path =
        "/msg/post/" +
        encodeURIComponent(message) +
        "?pseudo=" +
        encodeURIComponent(pseudo);
      await fetchJson(path);
      await refreshFromApi();
    }
    messageInput.value = "";
    messageInput.focus();
  } catch (error) {
    console.error("Echec publication message:", error);
  }
});

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

apiBaseInput.addEventListener("change", () => {
  localStorage.setItem("messageBoardApiBase", normalizeBaseUrl(apiBaseInput.value));
});

const savedApiBase = localStorage.getItem("messageBoardApiBase");
if (savedApiBase) {
  apiBaseInput.value = savedApiBase;
}

applyTheme(themeSelect.value);
refreshFromApi().catch((error) => {
  console.error("Chargement initial API impossible, fallback local:", error);
  update(msgs);
});
