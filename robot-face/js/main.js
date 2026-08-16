/**
 * main.js — wiring.
 *
 * Owns the render loop, the panels, and the settings. Everything interesting
 * lives in the modules this file glues together.
 */

import { MUSCLES, REGIONS, MUSCLE_BY_ID } from "./facs.js";
import { Neuromuscular } from "./dynamics.js";
import { Autonomic } from "./autonomic.js";
import { Renderer2D } from "./render2d.js";
import { FaceMind } from "./agents.js";
import { Telemetry } from "./telemetry.js";
import { applyPrototype, PROTOTYPES, emotionValence, emotionArousal } from "./prototypes.js";

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/* ── Core state ──────────────────────────────────────────────────────── */

const nm = new Neuromuscular();
const autonomic = new Autonomic(nm);
const telemetry = new Telemetry();

const canvas2d = $("#face2d");
const canvas3d = $("#face3d");
const r2d = new Renderer2D(canvas2d);
let r3d = null;
let mode = "2d";

const SETTINGS_KEY = "robot-face-settings";
const settings = Object.assign(
  {
    apiKey: "",
    proxyUrl: "",
    model: "claude-opus-5",
    motorModel: "claude-opus-5",
    effort: "medium",
    critic: true,
    voice: true,
    speech: false,
    showLeaks: true,
    bloomMode: "auto",
    avatarUrl: "",
  },
  JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
);

const mind = new FaceMind({
  nm,
  autonomic,
  onTrace: (e) => pushTrace(e),
  onReply: (text) => {
    addMessage("ada", text);
    if (settings.speech) speak(text);
  },
  config: {
    apiKey: settings.apiKey,
    proxyUrl: settings.proxyUrl,
    model: settings.model,
    motorModel: settings.motorModel,
    effort: settings.effort,
    critic: settings.critic,
    voice: settings.voice,
  },
});

/* ── Render loop ─────────────────────────────────────────────────────── */

let last = performance.now();
let fpsAcc = 0,
  fpsN = 0,
  fps = 0;

/**
 * Adaptive quality. The bloom pass needs a full readback of the canvas, which
 * is nearly free on a GPU-composited canvas and ruinous on a software one.
 * Rather than guess the device, measure it and step the quality down.
 */
const quality = { level: 2, manualBloom: null, slowFrames: 0, fastFrames: 0 };

function adaptQuality(frameMs) {
  if (quality.manualBloom !== null) return;
  if (frameMs > 26) {
    quality.slowFrames++;
    quality.fastFrames = 0;
  } else if (frameMs < 13) {
    quality.fastFrames++;
    quality.slowFrames = 0;
  }

  if (quality.slowFrames > 120 && quality.level === 2) {
    quality.level = 1;
    r2d.bloomEnabled = false;
    quality.slowFrames = 0;
  } else if (quality.slowFrames > 120 && quality.level === 1 && r2d.dpr > 1) {
    quality.level = 0;
    r2d.dpr = 1;
    r2d.resize();
    quality.slowFrames = 0;
  } else if (quality.fastFrames > 240 && quality.level === 1) {
    quality.level = 2;
    r2d.bloomEnabled = true;
    quality.fastFrames = 0;
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t0 = now;

  autonomic.step(dt);
  // Fixed-step the muscle integrator so the spring stays stable regardless of
  // how badly the browser is behaving.
  let remaining = dt;
  while (remaining > 0) {
    const h = Math.min(1 / 120, remaining);
    nm.step(h);
    remaining -= h;
  }

  if (mode === "2d") r2d.render(nm, autonomic);
  else if (r3d?.ready) r3d.render(nm, autonomic);

  adaptQuality(performance.now() - t0);

  fpsAcc += dt;
  fpsN++;
  if (fpsAcc > 0.5) {
    fps = Math.round(fpsN / fpsAcc);
    fpsAcc = 0;
    fpsN = 0;
    const q = ["экономно", "без свечения", ""][quality.level];
    $("#fpsLabel").textContent = `${fps} fps${q ? ` · ${q}` : ""}`;
  }

  paintMeters();
  paintHud();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

const ro = new ResizeObserver(() => {
  r2d.resize();
  r3d?.resize();
});
ro.observe($(".stage"));

/* ── HUD ─────────────────────────────────────────────────────────────── */

let hudAcc = 0;
function paintHud() {
  hudAcc++;
  if (hudAcc % 8) return;
  const active = Object.keys(nm.snapshot(0.05)).length;
  $("#hud").textContent =
    `валентность  ${nm.mood.toFixed(2).padStart(5)}\n` +
    `возбуждение  ${nm.arousal.toFixed(2).padStart(5)}\n` +
    `напряжение   ${nm.tension.toFixed(2).padStart(5)}\n` +
    `зрачок       ${autonomic.out.pupil.toFixed(2).padStart(5)}\n` +
    `дыхание      ${autonomic.out.breath.toFixed(2).padStart(5)}\n` +
    `взгляд       ${autonomic.mode}\n` +
    `мышц активно ${String(active).padStart(5)}`;
}

/* ── Muscle panel ────────────────────────────────────────────────────── */

const meterEls = new Map();

function buildMusclePanel() {
  const wrap = $("#muscles");
  wrap.innerHTML = "";
  for (const region of REGIONS) {
    const list = MUSCLES.filter((m) => m.region === region.id);
    if (!list.length) continue;
    wrap.appendChild(el("div", "mgroup-title", `${region.ru} · ${region.label}`));
    for (const m of list) {
      const row = el("div", "mrow");
      row.appendChild(el("span", "au", m.au));
      const name = el("div", "name");
      name.innerHTML = `<b>${m.ru}</b> — ${m.muscle}`;
      name.title = `${m.id}\n\n${m.doc}`;
      row.appendChild(name);
      const val = el("span", "val", "0.00");
      row.appendChild(val);

      const bar = el("div", "mbar");
      const l = el("i");
      const r = el("i", "r");
      bar.appendChild(l);
      bar.appendChild(r);
      row.appendChild(bar);

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = m.signed ? -100 : 0;
      slider.max = 100;
      slider.value = 0;
      slider.step = 1;
      slider.addEventListener("input", () => {
        nm.innervate(m.id, {
          intensity: Number(slider.value) / 100,
          side: "both",
          onset_ms: 120,
          hold_ms: 0,
          release_ms: 400,
          note: "manual",
        });
      });
      row.appendChild(slider);

      wrap.appendChild(row);
      meterEls.set(m.id, { row, val, l, r, slider });
    }
  }
}
buildMusclePanel();

let meterAcc = 0;
function paintMeters() {
  meterAcc++;
  if (meterAcc % 3) return;
  const onlyActive = $("#onlyActive").checked;
  const visible = $('[data-pane="muscles"]').classList.contains("on");
  if (!visible) return;
  for (const m of MUSCLES) {
    const e = meterEls.get(m.id);
    const lv = nm.getSide(m.id, "left");
    const rv = nm.getSide(m.id, "right");
    const mag = Math.max(Math.abs(lv), Math.abs(rv));
    e.row.classList.toggle("dim", mag < 0.02);
    if (onlyActive) e.row.style.display = mag < 0.02 ? "none" : "";
    else e.row.style.display = "";
    if (mag < 0.005 && e.val.textContent === "0.00") continue;
    e.val.textContent = (m.bilateral ? (lv + rv) / 2 : (lv + rv) / 2).toFixed(2);
    const pos = (v) => {
      if (!m.signed) return { left: "0%", width: `${Math.max(0, v) * 100}%` };
      const c = 50;
      return v >= 0 ? { left: `${c}%`, width: `${v * 50}%` } : { left: `${c + v * 50}%`, width: `${-v * 50}%` };
    };
    Object.assign(e.l.style, pos(lv));
    Object.assign(e.r.style, m.bilateral ? pos(rv) : { left: "0%", width: "0%" });
  }
}

/* ── Presets ─────────────────────────────────────────────────────────── */

const PRESET_LABELS = {
  joy: "радость",
  amusement: "веселье",
  affection: "нежность",
  pride: "гордость",
  surprise: "удивление",
  fear: "страх",
  anger: "гнев",
  disgust: "отвращение",
  contempt: "презрение",
  sadness: "грусть",
  sympathy: "сочувствие",
  skepticism: "скепсис",
  confusion: "непонимание",
  embarrassment: "смущение",
  concentration: "сосредоточенность",
  boredom: "скука",
  neutral: "нейтрально",
};
{
  const wrap = $("#presets");
  for (const [key, label] of Object.entries(PRESET_LABELS)) {
    if (!PROTOTYPES[key]) continue;
    const b = el("button", null, label);
    b.title = `Прототип FACS «${key}» — без участия модели`;
    b.addEventListener("click", () => {
      nm.valence = emotionValence(key);
      nm.arousal = emotionArousal(key);
      applyPrototype(nm, key, 0.62, 2600);
      pushTrace({ agent: "preset", status: "done", data: { emotion: key } });
    });
    wrap.appendChild(b);
  }
}
$("#relaxBtn").addEventListener("click", () => {
  nm.relaxAll(600);
  for (const [, e] of meterEls) e.slider.value = 0;
});

/* ── Chat ────────────────────────────────────────────────────────────── */

function addMessage(kind, text, meta) {
  const chat = $("#chat");
  const n = el("div", `msg ${kind}`);
  n.textContent = text;
  if (meta) n.appendChild(el("span", "meta", meta));
  chat.appendChild(n);
  chat.scrollTop = chat.scrollHeight;
  return n;
}

addMessage(
  "sys",
  mind.online
    ? "Ключ найден. В работе мультиагентный конвейер."
    : "Ключ не задан — работает офлайн-базлайн: словарь ключевых слов и таблица прототипов FACS. Добавьте ключ в «Настройках», чтобы лицом управляла модель."
);

$("#composer").addEventListener("submit", (e) => {
  e.preventDefault();
  send();
});
$("#input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

async function send() {
  const input = $("#input");
  const text = input.value.trim();
  if (!text || mind.busy) return;
  input.value = "";
  addMessage("user", text);
  $("#sendBtn").disabled = true;
  $("#statusDot").className = "dot busy";
  clearTrace();

  try {
    const run = await mind.respond(text);
    telemetry.record(run);
    paintMetrics();
    if (run?.offline) {
      addMessage("sys", `офлайн-прототип: ${run.appraisal.displayed_emotion} · ${run.motor.commands.length} мышц`);
    }
  } catch (err) {
    addMessage("err", `Ошибка: ${err.message}`);
    $("#statusDot").className = "dot error";
  } finally {
    $("#sendBtn").disabled = false;
    if ($("#statusDot").className !== "dot error") {
      $("#statusDot").className = mind.online ? "dot online" : "dot";
    }
    input.focus();
  }
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const ru = /[а-яё]/i.test(text);
  u.lang = ru ? "ru-RU" : "en-US";
  u.rate = 1.02;
  u.pitch = 1.12;
  u.onstart = () => autonomic.setSpeaking(true);
  u.onend = () => autonomic.setSpeaking(false);
  u.onerror = () => autonomic.setSpeaking(false);
  window.speechSynthesis.speak(u);
}

/* ── Trace ───────────────────────────────────────────────────────────── */

const traceNodes = new Map();

function clearTrace() {
  $("#trace").innerHTML = "";
  traceNodes.clear();
}

const AGENT_LABEL = {
  appraisal: "оценка",
  motor: "моторная кора",
  critic: "критик",
  voice: "речь",
  leak: "микровыражение",
  preset: "прототип",
  error: "ошибка",
};

function pushTrace(e) {
  if (e.agent === "leak" && !settings.showLeaks) return;
  const key = `${e.agent}:${e.label ?? ""}`;
  let node = traceNodes.get(key);
  if (!node) {
    node = el("div", "tr");
    node.innerHTML = '<header><span class="who"></span><span class="ms"></span></header><div class="body"></div>';
    $("#trace").appendChild(node);
    traceNodes.set(key, node);
  }
  const who = node.querySelector(".who");
  who.textContent = (AGENT_LABEL[e.agent] || e.agent) + (e.label ? ` · ${e.label}` : "");
  who.className = `who ${e.agent}`;
  node.querySelector(".ms").textContent = e.ms != null ? `${e.ms} ms` : "";
  const body = node.querySelector(".body");

  if (e.status === "running") {
    body.innerHTML = '<span class="running">…</span>';
    return;
  }

  if (e.agent === "appraisal" && e.data) {
    const a = e.data;
    const felt = (a.felt || []).map((f) => `${f.emotion} ${Number(f.intensity).toFixed(2)}`).join(", ");
    body.textContent =
      `${a.situation}\n` +
      `чувствует: ${felt}\n` +
      `показывает: ${a.displayed_emotion} ${Number(a.displayed_intensity).toFixed(2)} (${a.display_rule})\n` +
      `V ${Number(a.valence).toFixed(2)}  A ${Number(a.arousal).toFixed(2)}  D ${Number(a.dominance).toFixed(2)}\n` +
      `${a.reasoning}`;
  } else if (e.agent === "motor" && e.data) {
    body.textContent = e.data.commit?.reads_as
      ? `должно читаться как: ${e.data.commit.reads_as} (уверенность ${Number(e.data.commit.confidence).toFixed(2)})`
      : `${e.data.commands.length} мышечных команд`;
    const cmds = el("div", "cmds");
    for (const c of e.data.commands) {
      const m = MUSCLE_BY_ID[c.muscle];
      const line = el("div");
      line.appendChild(
        el("span", "m", `${c.au} ${m ? m.ru : c.muscle}${c.side && c.side !== "both" ? ` (${c.side === "left" ? "лев" : "прав"})` : ""}`)
      );
      line.appendChild(el("span", "i", Number(c.intensity).toFixed(2)));
      line.appendChild(el("span", null, `+${c.delay_ms ?? 0}/${c.onset_ms}ms`));
      cmds.appendChild(line);
    }
    body.appendChild(cmds);
  } else if (e.agent === "critic" && e.data) {
    const c = e.data;
    body.textContent =
      `читается как: ${c.reads_as}\n` +
      `правдоподобие ${Number(c.believability).toFixed(2)} · совпадение с замыслом ${Number(c.matches_intent).toFixed(2)} · ${
        c.verdict === "revise" ? "на доработку" : "принято"
      }` +
      (c.faults?.length ? "\n" + c.faults.map((f) => `• ${f.muscle}: ${f.problem} → ${f.fix}`).join("\n") : "");
  } else if (e.agent === "leak" && e.data) {
    body.textContent = `${e.data.emotion} · ${Number(e.data.intensity).toFixed(2)} · ${e.data.duration_ms} ms`;
  } else if (e.agent === "voice") {
    body.textContent = e.data || "";
  } else if (e.agent === "preset") {
    body.textContent = `прототип «${e.data.emotion}» применён напрямую`;
  } else if (e.agent === "error") {
    body.textContent = e.data;
  } else {
    body.textContent = typeof e.data === "string" ? e.data : JSON.stringify(e.data ?? {}, null, 1);
  }
}

function paintMetrics() {
  const s = telemetry.stats;
  const fmt = (v, d = 2) => (v == null ? "—" : v.toFixed(d));
  $("#metrics").innerHTML = `
    <div><span>реакций</span> <b>${s.runs}</b></div>
    <div><span>правдоподобие</span> <b>${fmt(s.believability)}</b></div>
    <div><span>совпадение</span> <b>${fmt(s.intentMatch)}</b></div>
    <div><span>доля правок</span> <b>${s.revisionRate == null ? "—" : Math.round(s.revisionRate * 100) + "%"}</b></div>
    <div><span>мышц/выражение</span> <b>${fmt(s.musclesPerExpression, 1)}</b></div>
    <div><span>задержка</span> <b>${s.latency == null ? "—" : Math.round(s.latency) + " ms"}</b></div>
    <div><span>вызовов API</span> <b>${s.tokens.calls}</b></div>
    <div><span>токенов out</span> <b>${s.tokens.output}</b></div>`;
}
paintMetrics();

$("#exportBtn").addEventListener("click", () => telemetry.export());
$("#clearBtn").addEventListener("click", () => {
  telemetry.clear();
  clearTrace();
  paintMetrics();
});
$("#onlyActive").addEventListener("change", paintMeters);

/* ── Tabs ────────────────────────────────────────────────────────────── */

for (const btn of document.querySelectorAll(".tabs button")) {
  btn.addEventListener("click", () => selectTab(btn.dataset.tab));
}
function selectTab(name) {
  for (const b of document.querySelectorAll(".tabs button")) b.classList.toggle("on", b.dataset.tab === name);
  for (const p of document.querySelectorAll(".tabpane")) p.classList.toggle("on", p.dataset.pane === name);
}
$("#tabSettingsBtn").addEventListener("click", () => selectTab("settings"));

/* ── Renderer switch ─────────────────────────────────────────────────── */

for (const btn of document.querySelectorAll(".renderer-switch button")) {
  btn.addEventListener("click", async () => {
    const target = btn.dataset.renderer;
    if (target === "3d" && !r3d) {
      note("Загружаю three.js…");
      try {
        const { Renderer3D } = await import("./render3d.js");
        r3d = new Renderer3D(canvas3d);
        r3d.resize();
        note("Three.js готов. Укажите GLB-аватар с ARKit-блендшейпами.", "ok");
      } catch (err) {
        note(`Не удалось инициализировать WebGL: ${err.message}`, "err");
        return;
      }
    }
    mode = target;
    canvas2d.hidden = target !== "2d";
    canvas3d.hidden = target !== "3d";
    for (const b of document.querySelectorAll(".renderer-switch button")) b.classList.toggle("on", b === btn);
    if (target === "2d") r2d.resize();
    else r3d?.resize();
    if (target === "3d" && !r3d?.ready) selectTab("settings");
  });
}

function note(text, kind = "") {
  const n = $("#avatarNote");
  n.textContent = text;
  n.className = `note ${kind}`;
}

async function loadAvatar(src) {
  if (!r3d) {
    const { Renderer3D } = await import("./render3d.js");
    r3d = new Renderer3D(canvas3d);
    r3d.resize();
  }
  note("Загружаю модель…");
  try {
    const info = await r3d.load(src);
    note(`Готово: ${info.morphs} морф-таргетов (${info.arkit} в стиле ARKit), кости: ${info.bones.join(", ") || "не найдены"}.`, "ok");
    mode = "3d";
    canvas2d.hidden = true;
    canvas3d.hidden = false;
    for (const b of document.querySelectorAll(".renderer-switch button")) b.classList.toggle("on", b.dataset.renderer === "3d");
    r3d.resize();
  } catch (err) {
    note(r3d.error || err.message, "err");
  }
}

$("#loadAvatarBtn").addEventListener("click", () => {
  const url = $("#avatarUrl").value.trim();
  if (!url) {
    note("Вставьте ссылку на .glb", "err");
    return;
  }
  settings.avatarUrl = url;
  saveSettings();
  loadAvatar(url);
});
$("#avatarFile").addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (f) loadAvatar(f);
});

/* ── Settings ────────────────────────────────────────────────────────── */

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  mind.updateConfig({
    apiKey: settings.apiKey,
    proxyUrl: settings.proxyUrl,
    model: settings.model,
    motorModel: settings.motorModel,
    effort: settings.effort,
    critic: settings.critic,
    voice: settings.voice,
  });
  if (settings.bloomMode === "auto") {
    quality.manualBloom = null;
  } else {
    quality.manualBloom = settings.bloomMode === "on";
    r2d.bloomEnabled = quality.manualBloom;
    quality.level = quality.manualBloom ? 2 : 1;
  }
  const online = mind.online;
  $("#modeBadge").textContent = online ? `онлайн · ${settings.motorModel}` : "офлайн-режим";
  $("#modeBadge").classList.toggle("online", online);
  $("#statusDot").className = online ? "dot online" : "dot";
}

const bindings = [
  ["#apiKey", "apiKey", "value"],
  ["#proxyUrl", "proxyUrl", "value"],
  ["#model", "model", "value"],
  ["#motorModel", "motorModel", "value"],
  ["#effort", "effort", "value"],
  ["#bloomMode", "bloomMode", "value"],
  ["#avatarUrl", "avatarUrl", "value"],
  ["#useCritic", "critic", "checked"],
  ["#useVoice", "voice", "checked"],
  ["#useSpeech", "speech", "checked"],
  ["#showLeaks", "showLeaks", "checked"],
];
for (const [sel, key, prop] of bindings) {
  const node = $(sel);
  node[prop] = settings[key];
  node.addEventListener(prop === "checked" ? "change" : "input", () => {
    settings[key] = node[prop];
    saveSettings();
  });
}
saveSettings();

if (settings.avatarUrl) note("Сохранён адрес аватара — нажмите «загрузить по ссылке», чтобы применить.");

/* ── Idle life ───────────────────────────────────────────────────────── */
// Even with nothing happening the face should not be a mannequin: attention
// wanders, posture settles, breathing deepens between exchanges.
setInterval(() => {
  if (mind.busy) return;
  if (Math.random() < 0.25) {
    autonomic.setGazePolicy(Math.random() < 0.7 ? "engaged" : "scanning");
  }
  if (Math.random() < 0.14) {
    const drift = (Math.random() - 0.5) * 0.22;
    nm.innervate("head_yaw", { intensity: drift, onset_ms: 900, hold_ms: 2600, release_ms: 1600, note: "idle" });
  }
  if (Math.random() < 0.1) {
    nm.innervate("orbicularis_oris_pressor", {
      intensity: 0.12 + Math.random() * 0.16,
      onset_ms: 320,
      hold_ms: 700,
      release_ms: 620,
      note: "idle",
    });
  }
}, 3200);
