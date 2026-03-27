"use strict";

const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
const port = process.env.PORT || 8080;
const clientDir = path.join(__dirname, "..", "client");
const messagesFile = path.join(__dirname, "messages.json");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

let counter = 0;
const defaultMsgs = [
  { msg: "Hello World", pseudo: "Ada", date: "2026-03-26 09:00" },
  { msg: "foobar", pseudo: "Linus", date: "2026-03-26 09:03" },
  { msg: "CentraleSupelec Forever", pseudo: "Mia", date: "2026-03-26 09:10" }
];
let allMsgs = [...defaultMsgs];

function isIntegerString(value) {
  return /^-?\d+$/.test(value);
}

function decodePathComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function nowAsLocalString() {
  return new Date().toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function loadMessagesFromDisk() {
  try {
    if (!fs.existsSync(messagesFile)) {
      return;
    }
    const raw = fs.readFileSync(messagesFile, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      allMsgs = parsed;
    }
  } catch (error) {
    console.error("Impossible de charger messages.json:", error.message);
  }
}

function saveMessagesToDisk() {
  try {
    fs.writeFileSync(messagesFile, JSON.stringify(allMsgs, null, 2), "utf8");
  } catch (error) {
    console.error("Impossible d'ecrire messages.json:", error.message);
  }
}

loadMessagesFromDisk();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/test/*", (req, res) => {
  const suffix = req.params[0] || "";
  res.json({ msg: decodePathComponent(suffix) });
});

app.get("/cpt/query", (req, res) => {
  res.json(counter);
});

app.get("/cpt/inc", (req, res) => {
  const raw = req.query.v;
  if (raw === undefined) {
    counter += 1;
    return res.json({ code: 0 });
  }
  if (!isIntegerString(String(raw))) {
    return res.json({ code: -1 });
  }
  counter += parseInt(raw, 10);
  return res.json({ code: 0 });
});

app.get("/msg/get/*", (req, res) => {
  const rawIndex = req.params[0];
  if (!isIntegerString(rawIndex)) {
    return res.json({ code: 0 });
  }

  const index = parseInt(rawIndex, 10);
  if (index < 0 || index >= allMsgs.length) {
    return res.json({ code: 0 });
  }

  const item = allMsgs[index];
  return res.json({
    code: 1,
    msg: item.msg,
    pseudo: item.pseudo,
    date: item.date
  });
});

app.get("/msg/getAll", (req, res) => {
  res.json(allMsgs);
});

app.get("/msg/nber", (req, res) => {
  res.json(allMsgs.length);
});

app.get("/msg/post/*", (req, res) => {
  const rawMessage = req.params[0] || "";
  const decodedMessage = decodePathComponent(rawMessage);
  const cleanMessage = decodedMessage.toString().trim();
  if (!cleanMessage) {
    return res.json({ code: -1 });
  }

  const pseudo = (req.query.pseudo || "Anonyme").toString().trim() || "Anonyme";
  const date = (req.query.date || nowAsLocalString()).toString();

  allMsgs.push({
    msg: cleanMessage,
    pseudo,
    date
  });
  saveMessagesToDisk();
  res.json(allMsgs.length - 1);
});

app.get("/msg/del/*", (req, res) => {
  const rawIndex = req.params[0];
  if (!isIntegerString(rawIndex)) {
    return res.json({ code: 0 });
  }

  const index = parseInt(rawIndex, 10);
  if (index < 0 || index >= allMsgs.length) {
    return res.json({ code: 0 });
  }

  allMsgs.splice(index, 1);
  saveMessagesToDisk();
  return res.json({ code: 1 });
});

app.use(express.static(clientDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

app.listen(port, () => {
  console.log("App listening on port " + port);
});
