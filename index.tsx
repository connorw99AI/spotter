import React, { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   SPOTTER — AI training partner
   Design: concrete + competition bumper plate color coding
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

.sp * { box-sizing: border-box; }
.sp {
  --concrete:#0A0A0C; --panel:#18181C; --panel2:#222227; --ink:#F3F3F5; --iron:#9B9CA5;
  --line:#2E2E34; --red:#FF3B5C; --blue:#22C3FF; --yellow:#F5FF3D;
  --green:#39FF6A; --steel:#6E6F78; --accent:#FF1E3C; --accent-ink:#FFFFFF;
  background: var(--concrete);
  color: var(--ink);
  font-family: 'Archivo', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  font-size: 15px;
  line-height: 1.45;
}
.sp.light {
  --concrete:#EDEDEF; --panel:#FFFFFF; --panel2:#F5F5F7; --ink:#111114; --iron:#5B5C64;
  --line:#DADADF; --red:#C8102E; --blue:#0057B8; --yellow:#C99A00;
  --green:#008A3C; --steel:#8A8B93; --accent:#E8112D; --accent-ink:#FFFFFF;
}
.sp.light .sp-rail { background: #111114; }
.sp h1,.sp h2,.sp h3,.sp .disp {
  font-family:'Bebas Neue','Archivo',system-ui,sans-serif;
  text-transform: uppercase; letter-spacing: 0.01em; margin:0; font-weight:400;
}
.sp .mono { font-family:'JetBrains Mono',ui-monospace,monospace; font-variant-numeric: tabular-nums; }
.sp button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
.sp button:focus-visible, .sp input:focus-visible, .sp textarea:focus-visible, .sp select:focus-visible {
  outline: 3px solid var(--accent); outline-offset: 2px;
}
.sp input, .sp textarea, .sp select {
  font-family: inherit; font-size: 15px; background: var(--panel2); color: var(--ink);
  border: 1.5px solid var(--line); border-radius: 2px; padding: 10px 12px; width: 100%;
}

/* shell */
.sp-shell { display:flex; min-height:100vh; }
.sp-rail {
  width: 210px; flex-shrink:0; background: #000000; color:#fff;
  padding: 22px 0; position: sticky; top:0; height:100vh; display:flex; flex-direction:column;
}
.sp-brand { padding: 0 20px 22px; }
.sp-brand .mark { font-size: 25px; line-height:1; }
.sp-brand .sub { font-size:10px; letter-spacing:.18em; color:var(--steel); text-transform:uppercase; margin-top:6px; }
.sp-nav { display:flex; flex-direction:column; gap:1px; }
.sp-nav button {
  text-align:left; padding: 11px 20px; font-size:13px; font-weight:600; letter-spacing:.09em;
  text-transform:uppercase; color:#9AA1A8; display:flex; align-items:center; gap:11px; width:100%;
  border-left: 4px solid transparent; transition: color .12s, background .12s;
}
.sp-nav button:hover { color:#fff; background:#22272C; }
.sp-nav button.on { color:#fff; background:#22272C; }
.sp-nav .dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.sp-rail-foot { margin-top:auto; padding: 16px 20px 0; font-size:11px; color:var(--steel); }
.sp-main { flex:1; min-width:0; padding: 34px 40px 90px; max-width: 1180px; position: relative; }
.sp-quickbar { position: absolute; top: 34px; right: 40px; display: flex; gap: 8px; z-index: 5; }
@media (max-width: 860px) {
  .sp-quickbar { position: static; margin-bottom: 16px; justify-content: flex-end; }
}

/* mobile tabs */
.sp-tabs { display:none; }

/* type helpers */
.sp .eyebrow { font-size:10.5px; letter-spacing:.2em; text-transform:uppercase; color:var(--iron); font-weight:700; }
.sp .muted { color:var(--iron); }
.sp .pagehead { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; flex-wrap:wrap; margin-bottom:24px; }
.sp .pagehead h1 { font-size: clamp(30px,4.4vw,46px); line-height:.95; }

/* panels */
.sp .card { background: var(--panel); border:1.5px solid var(--line); border-radius:3px; }
.sp .card.flush { padding: 20px; }
.sp .stripe { height:6px; width:100%; }
.sp .row { display:flex; gap:16px; }
.sp .grid2 { display:grid; grid-template-columns: 1.5fr 1fr; gap:18px; align-items:start; }
.sp .stack { display:flex; flex-direction:column; gap:14px; }

/* buttons */
.sp .btn {
  background: var(--accent); color:var(--accent-ink); padding: 12px 20px; border-radius:2px;
  font-weight:700; font-size:12.5px; letter-spacing:.11em; text-transform:uppercase;
  display:inline-flex; align-items:center; gap:9px; transition: transform .1s, background .12s, box-shadow .12s;
  box-shadow: 0 0 0 rgba(255,30,60,0);
}
.sp .btn:hover { background:#FF4159; box-shadow: 0 0 18px rgba(255,30,60,.45); }
.sp .btn:active { transform: translateY(1px); }
.sp .btn.ghost { background:transparent; color:var(--ink); border:1.5px solid var(--line); box-shadow:none; }
.sp .btn.ghost:hover { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
.sp .btn.sm { padding: 8px 13px; font-size:11px; }
.sp .btn:disabled { opacity:.4; cursor:not-allowed; box-shadow:none; }

/* exercise rows */
.sp .exrow { border-bottom:1.5px solid var(--line); padding: 15px 20px; }
.sp .exrow:last-child { border-bottom:none; }
.sp .exhead { display:flex; align-items:baseline; gap:14px; }
.sp .exnum { font-size:11px; font-weight:700; color:var(--steel); width:22px; flex-shrink:0; }
.sp .exname { font-size:17px; font-weight:700; flex:1; letter-spacing:-.01em; }
.sp .exspec { font-size:14px; font-weight:700; }
.sp .exmeta { margin-left:36px; margin-top:5px; font-size:12.5px; color:var(--iron); display:flex; gap:14px; flex-wrap:wrap; align-items:center; }
.sp .linkish { font-size:11.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-bottom:2px solid var(--line); padding-bottom:1px; }
.sp .linkish:hover { border-color: var(--ink); }

/* set logger */
.sp .setgrid { display:grid; grid-template-columns: 34px 1fr 1fr 44px; gap:8px; align-items:center; margin-top:4px; }
.sp .setgrid5 { grid-template-columns: 30px 1fr 1fr 40px 32px; }
.sp .setremove {
  width:32px; height:36px; border:1.5px solid var(--line); background:var(--panel2); border-radius:2px;
  display:flex; align-items:center; justify-content:center; font-size:16px; color:var(--red); font-weight:700;
}
.sp .setremove:hover:not(:disabled) { background:var(--red); color:#fff; border-color:var(--red); }
.sp .setremove:disabled { opacity:.25; cursor:not-allowed; }
.sp .setgrid input { padding:7px 9px; text-align:center; font-family:'JetBrains Mono',monospace; font-weight:700; }
.sp .tick {
  width:40px; height:36px; border:1.5px solid var(--line); background:var(--panel2); border-radius:2px;
  display:flex; align-items:center; justify-content:center; font-size:16px; color:var(--iron);
}
.sp .tick.done { background:var(--green); border-color:var(--green); color:#0A0A0C; }

/* plates */
.sp .bar { display:flex; align-items:center; justify-content:center; height:66px; gap:0; }
.sp .barsteel { height:7px; background:linear-gradient(#B9BEC2,#8A8F98); flex:0 0 26px; }
.sp .collar { height:22px; width:7px; background:#6E747A; border-radius:1px; }
.sp .plate { border-radius:2px; margin:0 1px; border:1.5px solid rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; }
.sp .plate span { font-size:9px; font-weight:700; font-family:'JetBrains Mono',monospace; }

/* chat */
.sp .chatwrap { display:flex; flex-direction:column; height: calc(100vh - 190px); min-height:440px; }
.sp .chatlog { flex:1; overflow-y:auto; padding: 20px; display:flex; flex-direction:column; gap:16px; }
.sp .bub { max-width: 76%; padding: 12px 15px; border-radius:3px; font-size:14.5px; white-space:pre-wrap; }
.sp .bub.me { align-self:flex-end; background:var(--accent); color:var(--accent-ink); }
.sp .bub.coach { align-self:flex-start; background:var(--panel2); border:1.5px solid var(--line); color:var(--ink); }
.sp .chatbar { display:flex; gap:10px; padding:14px; border-top:1.5px solid var(--line); background:var(--panel); }

/* misc */
.sp .chip {
  display:inline-flex; align-items:center; gap:7px; padding:8px 13px; border:1.5px solid var(--line);
  background:var(--panel2); border-radius:2px; font-size:13px; font-weight:600; text-align:left; color:var(--ink);
}
.sp .chip.on { background:var(--accent); color:var(--accent-ink); border-color:var(--accent); }
.sp .chipwrap { display:flex; flex-wrap:wrap; gap:8px; }

.sp .dayswitch { display:inline-flex; align-items:center; gap:9px; }
.sp .dayswitch .lbl { font-size:11.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--steel); transition: color .15s; }
.sp .dayswitch .lbl.on { color:var(--ink); }
.sp .switch-track {
  width:46px; height:26px; border-radius:14px; background:var(--line); border:1.5px solid var(--line);
  position:relative; flex-shrink:0; transition: background .15s, border-color .15s;
}
.sp .switch-track.on { background:var(--green); border-color:var(--green); }
.sp .switch-knob {
  position:absolute; top:2px; left:2px; width:19px; height:19px; border-radius:50%; background:#fff;
  box-shadow:0 1px 2px rgba(0,0,0,.3); transition: left .15s;
}
.sp .switch-track.on .switch-knob { left:23px; }
.sp .kpi { padding:16px 18px; }
.sp .kpi .n { font-size:30px; font-weight:700; font-family:'JetBrains Mono',monospace; line-height:1; }
.sp .kpi .l { font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--iron); font-weight:700; margin-top:7px; }
.sp .macrobar { display:flex; height:9px; border-radius:2px; overflow:hidden; border:1.5px solid var(--line); }

.sp .sheet { position:fixed; inset:0; background:rgba(15,18,20,.62); z-index:60; display:flex; justify-content:flex-end; }
.sp .sheetbody { background:var(--panel); width:min(520px,100%); height:100%; overflow-y:auto; padding:26px; }

.sp .spin { display:inline-block; width:15px; height:15px; border:2.5px solid var(--line); border-top-color:var(--ink); border-radius:50%; animation: sp-rot .7s linear infinite; }
@keyframes sp-rot { to { transform: rotate(360deg); } }
.sp .pulse { animation: sp-pulse 1.4s ease-in-out infinite; }
@keyframes sp-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }

@media (prefers-reduced-motion: reduce) {
  .sp *, .sp *::before { animation: none !important; transition: none !important; }
}

@media (max-width: 860px) {
  .sp-rail { display:none; }
  .sp-main { padding: 22px 16px 96px; }
  .sp .grid2 { grid-template-columns: 1fr; }
  .sp-tabs {
    display:flex; position:fixed; bottom:0; left:0; right:0; background:#000000; z-index:50;
    border-top:1px solid var(--line);
  }
  .sp-tabs button {
    flex:1; padding:11px 3px 13px; color:#8A8F98; font-size:9.5px; font-weight:700;
    letter-spacing:.09em; text-transform:uppercase; display:flex; flex-direction:column;
    align-items:center; gap:6px; border-top:3px solid transparent;
  }
  .sp-tabs button.on { color:#fff; }
  .sp .bub { max-width: 90%; }
  .sp .chatwrap { height: calc(100vh - 250px); }
}
`;

/* ---------------- constants ---------------- */

const PLATE_COLORS = {
  kg: [[25,"#C8102E","#fff"],[20,"#0057B8","#fff"],[15,"#F5C518","#16191C"],[10,"#009639","#fff"],[5,"#F2F2F2","#16191C"],[2.5,"#C8102E","#fff"],[1.25,"#8A8F98","#fff"]],
  lb: [[45,"#0057B8","#fff"],[35,"#F5C518","#16191C"],[25,"#009639","#fff"],[10,"#F2F2F2","#16191C"],[5,"#8A8F98","#fff"],[2.5,"#8A8F98","#fff"]],
};
const FOCUS_COLOR = (f="") => {
  const s = f.toLowerCase();
  if (s.includes("rest") || s.includes("off")) return "#8A8F98";
  if (s.includes("push") || s.includes("chest") || s.includes("upper")) return "#C8102E";
  if (s.includes("pull") || s.includes("back")) return "#0057B8";
  if (s.includes("leg") || s.includes("lower") || s.includes("squat")) return "#F5C518";
  if (s.includes("cardio") || s.includes("condition") || s.includes("core")) return "#009639";
  return "#4A5158";
};
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const localDateKey = (d = new Date()) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
function mostRecentMonday(d = new Date()) {
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? 6 : day - 1); // days since Monday
  const monday = new Date(d);
  monday.setHours(0, 1, 0, 0);
  monday.setDate(d.getDate() - diff);
  return monday;
}
function daysSince(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const then = new Date(y, m - 1, d);
  const now = new Date();
  return Math.floor((now - then) / 86400000);
}
const NAV = [
  ["today","Today","#C8102E"],
  ["week","The Week","#FF6B7A"],
  ["coach","PT","#C8102E"],
  ["profile","Profile","#8A8F98"],
];
const AISLES = [
  ["Produce",["lettuce","spinach","kale","tomato","onion","garlic","pepper","broccoli","carrot","potato","avocado","banana","apple","berry","berries","lemon","lime","cucumber","zucchini","mushroom","celery","ginger","herb","cilantro","parsley","basil","greens","salad","fruit","orange","mango","sweet potato","asparagus","cabbage"]],
  ["Meat & Fish",["chicken","beef","steak","turkey","pork","salmon","tuna","shrimp","fish","mince","lamb","bacon","sausage","cod","tilapia"]],
  ["Dairy & Eggs",["milk","yogurt","yoghurt","cheese","butter","egg","cream","cottage","feta","parmesan","mozzarella","kefir"]],
  ["Pantry",["rice","pasta","oat","quinoa","bread","flour","bean","lentil","chickpea","tortilla","noodle","couscous","cereal","granola","honey","sugar","oil","vinegar","sauce","stock","broth","tomato paste","peanut butter","nut","almond","seed","spice","salt","pepper","cumin","paprika","soy","tahini","protein powder","canned","tin"]],
  ["Frozen",["frozen","peas","edamame"]],
];
const aisleOf = (item="") => {
  const s = item.toLowerCase();
  for (const [aisle, keys] of AISLES) if (keys.some(k => s.includes(k))) return aisle;
  return "Other";
};

/* ---------------- storage ---------------- */

const K = { profile:"spotter:profile", plan:"spotter:plan", logs:"spotter:logs", chat:"spotter:chat", diag:"spotter:diagrams" };

async function load(key, fallback) {
  try {
    const r = await window.storage.get(key);
    return r && r.value ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function save(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); } catch (e) { console.error("save failed", key, e); }
}

/* ---------------- Claude API ---------------- */

async function diagnosticPing() {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 50,
        messages: [{ role: "user", content: "Say OK" }],
      }),
    });
    const text = await res.text();
    return `status=${res.status} ${res.statusText}\nok=${res.ok}\nbody=${text.slice(0, 500)}`;
  } catch (e) {
    const parts = [
      "name=" + (e?.name ?? "?"),
      "message=" + (e?.message ?? "?"),
      "cause=" + (e?.cause ? JSON.stringify(e.cause) : "none"),
      "stack=" + (e?.stack ? String(e.stack).slice(0, 400) : "none"),
      "typeof=" + typeof e,
      "raw=" + (() => { try { return JSON.stringify(e); } catch { return "<unserializable>"; } })(),
    ];
    return parts.join("\n");
  }
}

async function askOnce(system, user, wantJson) {
  const userMessages = Array.isArray(user) ? user : [{ role: "user", content: user }];
  // Fold system instructions into the first user turn — this sandbox's fetch
  // proxy rejects requests with a top-level `system` field.
  const messages = userMessages.map((m, i) =>
    i === 0 && m.role === "user"
      ? { ...m, content: `[Instructions]\n${system}\n\n[Message]\n${m.content}` }
      : m
  );

  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages,
      }),
    });
  } catch (e) {
    throw new Error("Fetch threw before a response arrived: " + (e?.message || String(e)));
  }

  let rawText;
  try {
    rawText = await res.text();
  } catch (e) {
    throw new Error(`HTTP ${res.status} ${res.statusText} — couldn't read response body: ` + (e?.message || String(e)));
  }

  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} — ${rawText.slice(0, 400)}`);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`Response wasn't valid JSON (status ${res.status}): ${rawText.slice(0, 400)}`);
  }

  if (data?.type === "error") {
    throw new Error(`API error — ${data.error?.type || "unknown"}: ${data.error?.message || rawText.slice(0, 300)}`);
  }
  if (!Array.isArray(data?.content)) {
    throw new Error("Unexpected response shape: " + rawText.slice(0, 400));
  }

  const text = data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
  if (!wantJson) return text;
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const a = clean.indexOf("{"), b = clean.lastIndexOf("}");
  if (a < 0 || b < 0) throw new Error("No JSON found in reply: " + text.slice(0, 300));
  try {
    return JSON.parse(clean.slice(a, b + 1));
  } catch (e) {
    throw new Error("Malformed JSON from model: " + e.message + " — raw: " + clean.slice(0, 300));
  }
}

async function ask(system, user, wantJson, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await askOnce(system, user, wantJson);
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise(r => setTimeout(r, 600 * (i + 1)));
    }
  }
  throw lastErr;
}

// Run async tasks with limited concurrency so we don't fire a burst of
// parallel requests that trips rate limits.
async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const profileLine = p =>
  `Level: ${p.level}. Goals: ${(p.goals || []).join(", ") || "general fitness"}. Trains ${p.days} days/week, ~${p.session} min per session. ` +
  `Equipment: ${p.equipment.join(", ") || "bodyweight only"}. Bodyweight: ${p.weight}${p.units}. ` +
  `Diet: ${p.diet}. Avoids: ${p.avoid || "nothing"}.` +
  (p.onlyUse ? ` STRICT: only use these foods, nothing else: ${p.onlyUse}.` : "") +
  ` Units: ${p.units}.`;

/* ---------------- plan generation (demo engine — no network) ---------------- */

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wait = (ms) => new Promise(r => setTimeout(r, ms));

/* Exercises organized by muscle group, then combined into training-day
   categories below. This means a Push day mixes chest + shoulders +
   triceps work, a Pull day mixes back + biceps, etc. — real variety
   within a session, not just one exercise per muscle. */

/* Equipment is inferred from the exercise name so we don't have to hand-tag
   hundreds of exercises individually. Imperfect on edge cases, but keeps
   every exercise usable and correctly filtered by what gear the person has. */
function inferEquip(name) {
  const s = name.toLowerCase();
  const has = (...kws) => kws.some(k => s.includes(k));
  const equip = new Set();

  if (has("smith machine")) equip.add("Barbell + plates");
  else if (has("barbell") || has("ez bar") || has("trap bar") || has("axle bar") || has("landmine")) equip.add("Barbell + plates");

  if (has("dumbbell")) equip.add("Dumbbells");
  if (has("kettlebell")) equip.add("Kettlebells");
  if (has("cable") || has("pec deck") || has("pulldown") && !has("band")) equip.add("Cable machine");
  if (has("band") || has("resistance towel")) equip.add("Resistance bands");
  if (has("pull-up") || has("pull up") || has("chin-up") || has("chin up") || has("hanging") || has("toe-to-bar") || has("toe to bar") || has("l-sit pull") || has("typewriter") || has("archer pull") || has("commando pull") || has("dead hang") || has("towel hang") || has("towel pull") || has("towel chin")) equip.add("Pull-up bar");
  if ((has("bench") && !has("bench dip")) || has("preacher") || has("incline dumbbell") || has("decline dumbbell") || has("chest supported")) equip.add("Bench");
  if (has("bench dip")) equip.add("Bench");
  if (has("leg press") || has("leg extension") || has("leg curl") && !has("nordic") && !has("swiss") && !has("sliding") && !has("towel") && !has("band") || has("hack squat machine") || has("pendulum squat") || has("v-squat") || has("belt squat") || has("machine") || has("selectorised") || has("plate loaded") || has("iso-lateral") || has("hammer strength") || has("lever ") || has("converging")) equip.add("Leg machines");
  if (has("treadmill") || has("bike") || has("rower") || has("rowing ergometer") || has("elliptical") || has("stair climber") || has("stepmill") || has("skierg") || has("ski erg") || has("versaclimber") || has("jacobs ladder") || has("assault runner") || has("air bike") || has("spin bike") || has("curved treadmill")) equip.add("Cardio machines");

  return [...equip];
}

const FULL_POOL_NAMES = {
  Chest: ["Flat Barbell Bench Press","Incline Barbell Bench Press","Decline Barbell Bench Press","Close Grip Bench Press","Wide Grip Bench Press","Reverse Grip Bench Press","Guillotine Press","Floor Press","Pin Press","Spoto Press","Flat Dumbbell Bench Press","Incline Dumbbell Bench Press","Decline Dumbbell Bench Press","Neutral Grip Dumbbell Press","Alternating Dumbbell Press","Single-Arm Dumbbell Press","Squeeze Press","Hex Press","Floor Dumbbell Press","Chest Press Machine","Incline Chest Press Machine","Decline Chest Press Machine","Hammer Strength Chest Press","Iso-Lateral Chest Press","Plate Loaded Chest Press","Selectorised Chest Press","Seated Chest Press","Smith Machine Flat Bench Press","Smith Machine Incline Bench Press","Smith Machine Decline Bench Press","Smith Machine Close Grip Bench Press","Standing Cable Chest Press","Single-Arm Cable Press","Split Stance Cable Press","Low Cable Press","High Cable Press","Cable Squeeze Press","Cable Fly","Low-to-High Cable Fly","High-to-Low Cable Fly","Mid Cable Fly","Single-Arm Cable Fly","Behind-the-Back Cable Fly","Flat Dumbbell Fly","Incline Dumbbell Fly","Decline Dumbbell Fly","Floor Fly","Single-Arm Dumbbell Fly","Pec Deck Fly","Reverse Grip Pec Fly","Plate Loaded Fly","Converging Fly Machine","Push-Up","Wide Push-Up","Close Push-Up","Diamond Push-Up","Decline Push-Up","Incline Push-Up","Archer Push-Up","Pseudo Planche Push-Up","Spiderman Push-Up","Explosive Push-Up","Clap Push-Up","Plyometric Push-Up","Ring Push-Up","Suspension Trainer Push-Up","Chest Dip","Straight Bar Dip","Band Chest Press","Band Incline Press","Band Decline Press","Band Fly","Band Low-to-High Fly","Band High-to-Low Fly","Band Push-Up","Band Squeeze Press","Medicine Ball Chest Pass","Explosive Chest Pass","Landmine Chest Press","Single-Arm Landmine Press","Standing Landmine Press","Push Press to Chest Drive","Backpack Floor Press","Backpack Bench Press","Backpack Fly","Water Bottle Fly","Chair Dips","Countertop Push-Up","Wall Push-Up","Bed Incline Push-Up","Feet Elevated Push-Up","Towel Chest Fly","Sliding Push-Up","Isometric Chest Squeeze","Prayer Press","Doorway Chest Press","Resistance Towel Press","Kettlebell Floor Press","Single-Arm Kettlebell Press","Double Kettlebell Floor Press","Plate Press-Out","Svend Press","Around-the-World","Dumbbell Pullover","Barbell Pullover","Cable Pullover"],
  Shoulders: ["Standing Barbell Overhead Press","Seated Barbell Overhead Press","Standing Dumbbell Overhead Press","Seated Dumbbell Press","Arnold Press","Push Press","Bradford Press","Z Press","Viking Press","Behind-the-Neck Press","Single-Arm Dumbbell Press","Alternating Dumbbell Press","Kettlebell Overhead Press","Single-Arm Kettlebell Press","Double Kettlebell Press","Bottoms-Up Kettlebell Press","Axle Bar Overhead Press","Log Press","Circus Dumbbell Press","Neutral Grip Dumbbell Press","Incline Dumbbell Shoulder Press","Hammer Grip Shoulder Press","Standing Military Press","Strict Overhead Press","Seated Barbell Press","Pin Press","Rack Press","Javelin Press","Wide Grip Overhead Press","Close Grip Overhead Press","Smith Machine Shoulder Press","Smith Machine Military Press","Smith Machine Behind-the-Neck Press","Smith Machine Single-Arm Press","Plate Loaded Shoulder Press","Selectorised Shoulder Press","Iso-Lateral Shoulder Press","Hammer Strength Shoulder Press","Converging Shoulder Press","Seated Shoulder Press Machine","Lever Shoulder Press","Standing Cable Shoulder Press","Single-Arm Cable Press","Cable Arnold Press","Low Cable Press","Kneeling Cable Press","Cable Lateral Raise","Behind-the-Back Cable Lateral Raise","Lean-Away Cable Lateral Raise","Cross Body Cable Lateral Raise","Rear Delt Cable Fly","Cross Cable Reverse Fly","Cable Front Raise","Cable Y Raise","Cable W Raise","Face Pull","Dumbbell Lateral Raise","Seated Lateral Raise","Standing Lateral Raise","Leaning Lateral Raise","Incline Lateral Raise","One-and-a-Half Rep Lateral Raise","Partial Lateral Raise","Machine Lateral Raise","Plate Loaded Lateral Raise","Resistance Band Lateral Raise","Plate Lateral Raise","Dumbbell Front Raise","Alternating Front Raise","Hammer Front Raise","Barbell Front Raise","EZ Bar Front Raise","Plate Front Raise","Overhead Plate Raise","Single Arm Cable Front Raise","Behind-the-Back Cable Front Raise","Landmine Front Raise","Kettlebell Front Raise","Bent Over Reverse Fly","Incline Rear Delt Fly","Chest Supported Rear Delt Fly","Seated Bent Over Reverse Fly","One Arm Rear Delt Fly","Reverse Pec Deck","Rear Delt Machine Fly","Resistance Band Reverse Fly","TRX Reverse Fly","Ring Reverse Fly","Cable External Rotation","Band External Rotation","Side Lying External Rotation","90/90 External Rotation","Cable Internal Rotation","Band Internal Rotation","Cuban Press","Cuban Rotation","Dumbbell Shrugs","Barbell Shrugs","Smith Machine Shrugs","Trap Bar Shrugs","Cable Shrugs","Behind-the-Back Shrugs","Overhead Shrugs","Snatch Grip Shrugs","Prone Y Raise","Prone T Raise","Prone W Raise","Trap 3 Raise","Landmine Press","Half Kneeling Landmine Press","Standing Landmine Press","Alternating Landmine Press","Landmine Thruster","Landmine Push Press","Landmine Arc Press","Landmine Rainbow","Landmine Clean to Press","Turkish Get-Up","Waiter's Carry","Overhead Carry","Bottoms-Up Carry","Windmill","Battle Rope Waves","Battle Rope Slams","Pike Push-Up","Elevated Pike Push-Up","Handstand Push-Up","Wall Handstand Push-Up","Hindu Push-Up","Dive Bomber Push-Up","Wall Walk","Handstand Hold","Planche Lean","Scapular Push-Up","Scapular Pull-Up","Band Overhead Press","Band Arnold Press","Band Lateral Raise","Band Front Raise","Band Rear Delt Fly","Band Face Pull","Band Pull Apart","Band High Pull","Band Upright Row","Band Y Raise","Band W Raise","Band Shoulder Dislocations","Push Jerk","Split Jerk","Power Jerk","Clean and Press","Clean and Jerk","Snatch","Hang Snatch","Muscle Snatch","High Pull","Snatch Grip High Pull","Dumbbell Snatch","Kettlebell Snatch","Dumbbell Push Press","Water Bottle Shoulder Press","Backpack Overhead Press","Backpack Front Raise","Backpack Lateral Raise","Backpack Upright Row","Towel Face Pull","Towel External Rotation","Wall Angels","Wall Slides","Arm Circles","Shoulder Taps","Crab Walk","Plank to Downward Dog","Downward Dog Push-Up","Decline Pike Push-Up","Filled Bucket Carry","Suitcase Carry","Overhead Household Object Carry","PVC Pass Throughs","Isometric Wall Press","Doorway Isometric Shoulder Press"],
  Triceps: ["Close Grip Bench Press","Weighted Dip","Bench Dip","JM Press","Floor Press","Rope Pushdown","Straight Bar Pushdown","V-Bar Pushdown","Reverse Grip Pushdown","Single Arm Pushdown","Overhead Rope Extension","Single Arm Overhead Extension","Cross Body Cable Extension","Dual Cable Kickback","Overhead Dumbbell Extension","Lying Triceps Extension","Rolling Extension","Kickback","Tate Press","Dumbbell Skull Crusher","EZ Bar Skull Crusher","Barbell Skull Crusher","French Press","Standing Barbell Extension","Band Pushdown","Band Overhead Extension","Band Kickback","Diamond Push-Up","Close Grip Push-Up","Ring Triceps Extension","TRX Triceps Extension","Backpack Overhead Extension","Water Jug Skull Crusher","Resistance Towel Pushdown","Chair Dip"],
  Biceps: ["Barbell Curl","EZ Bar Curl","Wide Grip Curl","Close Grip Curl","Drag Curl","Cheat Curl","Reverse Grip Curl","Alternating Curl","Standing Dumbbell Curl","Seated Dumbbell Curl","Incline Dumbbell Curl","Concentration Curl","Hammer Curl","Cross-Body Hammer Curl","Zottman Curl","Spider Curl","Preacher Curl","Bayesian Curl","Cable Curl","Straight Bar Cable Curl","EZ Bar Cable Curl","Rope Curl","Single Arm Cable Curl","Bayesian Cable Curl","High Cable Curl","Behind-the-Body Cable Curl","Cable Hammer Curl","Reverse Cable Curl","Preacher Curl Machine","Biceps Curl Machine","Plate Loaded Curl Machine","Selectorised Curl Machine","Reverse Curl","Wrist Curl","Reverse Wrist Curl","Behind-the-Back Wrist Curl","Cable Wrist Curl","Finger Curl","Plate Pinch","Dead Hang","Towel Hang","Fat Grip Curl","Wrist Roller","Rice Bucket Drill","Grip Trainer Crush","Band Curl","Band Hammer Curl","Band Reverse Curl","Band Concentration Curl","Band Wrist Curl","Band Reverse Wrist Curl","Chin-Up","Commando Pull-Up","Towel Chin-Up","Ring Curl","TRX Biceps Curl","Backpack Curl","Backpack Hammer Curl","Water Bottle Curl","Bucket Curl","Towel Curl","Isometric Towel Curl","Sledgehammer Lever Lift"],
  Back: ["Pull-Up","Wide Grip Pull-Up","Close Grip Pull-Up","Neutral Grip Pull-Up","Mixed Grip Pull-Up","Weighted Pull-Up","Assisted Pull-Up","Chin-Up","Close Grip Chin-Up","Commando Pull-Up","L-Sit Pull-Up","Typewriter Pull-Up","Archer Pull-Up","Towel Pull-Up","Ring Pull-Up","Wide Grip Lat Pulldown","Close Grip Lat Pulldown","Neutral Grip Lat Pulldown","Reverse Grip Lat Pulldown","Single Arm Lat Pulldown","Straight Arm Lat Pulldown","Rope Pulldown","MAG Grip Pulldown","Bent Over Barbell Row","Pendlay Row","Yates Row","Underhand Barbell Row","Overhand Barbell Row","Meadows Row","Seal Row","Landmine Row","T-Bar Row","Single Arm Dumbbell Row","Chest Supported Row","Incline Dumbbell Row","Renegade Row","Kroc Row","Batwing Row","Seated Cable Row","Wide Grip Cable Row","Close Grip Cable Row","Single Arm Cable Row","Rope Row","High Cable Row","Low Cable Row","Half Kneeling Cable Row","Hammer Strength Row","Iso-Lateral Row","Chest Supported Machine Row","Plate Loaded Row","Selectorised Row","High Row Machine","Low Row Machine","Rack Pull","Deficit Deadlift","Back Extension","45 Degree Hyperextension","Reverse Hyperextension","Superman","Bird Dog","Face Pull","Barbell Shrug","Dumbbell Shrug","Trap Bar Shrug","Cable Shrug","Prone Y Raise","Prone T Raise","Prone W Raise","Scapular Pull-Up","Sled Pull","Rope Pull","Heavy Sled Drag","Band Row","Band Pulldown","Band Straight Arm Pulldown","Band Face Pull","Band Pull Apart","Band High Row","Band Deadlift","Inverted Row","Australian Row","TRX Row","Ring Row","Reverse Snow Angel","Table Row","Backpack Row","Water Jug Row","Bucket Row","Towel Row","Door Row","Bedsheet Row","Resistance Towel Pulldown","Broomstick Row","Loaded Backpack Shrug","Dumbbell Pullover","Cable Pullover","Barbell Pullover","Machine Pullover","Kettlebell High Pull","Snatch Grip High Pull","Clean Pull","Muscle Snatch"],
  Quads: ["Back Squat","Front Squat","High Bar Squat","Low Bar Squat","Box Squat","Pause Squat","Anderson Squat","Zercher Squat","Goblet Squat","Overhead Squat","Cyclist Squat","Hack Squat (Barbell)","Split Squat","Cossack Squat","Jefferson Squat","Sissy Squat","Hack Squat Machine","Pendulum Squat","V-Squat","Belt Squat","Smith Machine Squat","Smith Machine Front Squat","Leg Press","Single Leg Press","Walking Lunge","Reverse Lunge","Forward Lunge","Lateral Lunge","Curtsy Lunge","Bulgarian Split Squat","Deficit Split Squat","Smith Machine Split Squat","Step-Up","Weighted Step-Up","Skater Squat","Leg Extension","Single Leg Extension","Spanish Squat","Peterson Step-Up","Terminal Knee Extension","Wall Sit","Power Clean","Hang Clean","Box Jump","Broad Jump","Depth Jump","Sled Push","Prowler Push","Walking Squat","Air Squat","Jump Squat","Prisoner Squat","Pistol Squat","Assisted Pistol Squat","Shrimp Squat","Band Squat","Band Front Squat","Backpack Squat","Backpack Bulgarian Split Squat","Water Jug Deadlift","Bucket Squat","Chair Step-Up","Chair Bulgarian Split Squat","Jump Squats","Cable Squat","Landmine Squat","Landmine Reverse Lunge","Landmine Hack Squat","Kettlebell Goblet Squat","Kettlebell Clean"],
  HamsGlutes: ["Romanian Deadlift","Stiff Leg Deadlift","Single Leg Romanian Deadlift","Lying Leg Curl","Seated Leg Curl","Standing Leg Curl","Nordic Hamstring Curl","Glute Ham Raise","Swiss Ball Leg Curl","Sliding Leg Curl","Cable Leg Curl","Barbell Hip Thrust","Smith Machine Hip Thrust","Dumbbell Hip Thrust","Glute Bridge","Single Leg Glute Bridge","Cable Kickback","Machine Glute Kickback","Frog Pump","B-Stance Hip Thrust","Pull Through","Donkey Kick","Fire Hydrant","Hip Adductor Machine","Hip Abductor Machine","Cable Hip Adduction","Cable Hip Abduction","Banded Lateral Walk","Monster Walk","Copenhagen Plank","Conventional Deadlift","Sumo Deadlift","Trap Bar Deadlift","Power Snatch","Hang Snatch","Clean Pull","Sled Drag","Farmer Carry","Sandbag Carry","Bear Crawl","Duck Walk","Kettlebell Swing","Single Leg Balance Reach","Turkish Get-Up","Band Romanian Deadlift","Band Good Morning","Band Leg Curl","Band Hip Thrust","Band Glute Bridge","Band Kickback","Band Lateral Walk","Band Monster Walk","Reverse Nordic Curl","Backpack Romanian Deadlift","Towel Hamstring Curl","Backpack Hip Thrust","Filled Bucket Farmer Carry","Landmine Romanian Deadlift","Suitcase Deadlift"],
  Calves: ["Standing Calf Raise","Seated Calf Raise","Donkey Calf Raise","Leg Press Calf Raise","Smith Machine Calf Raise","Single Leg Calf Raise","Farmer Calf Raise Walk","Jump Rope","Band Calf Raise","Calf Raise","Stair Calf Raise"],
  Core: ["Crunch","Reverse Crunch","Decline Crunch","Weighted Crunch","Cable Crunch","Machine Crunch","Swiss Ball Crunch","Toe Touch Crunch","Bicycle Crunch","Cross Body Crunch","V-Up","Jackknife","Lying Leg Raise","Hanging Leg Raise","Captain's Chair Leg Raise","Roman Chair Leg Raise","Hanging Knee Raise","Straight Leg Raise","Toe-to-Bar","Windshield Wipers","Flutter Kicks","Scissor Kicks","Front Plank","High Plank","Side Plank","Weighted Plank","RKC Plank","Plank Reach","Plank Shoulder Tap","Plank Walk","Plank to Push-Up","Long Lever Plank","Star Plank","Russian Twist","Cable Wood Chop","High-to-Low Wood Chop","Low-to-High Wood Chop","Landmine Rotation","Landmine 180","Medicine Ball Rotational Throw","Seated Twist","Banded Rotation","Pallof Press","Tall Kneeling Pallof Press","Half Kneeling Pallof Press","Dead Bug","Bird Dog","Stir the Pot","Body Saw","Hollow Hold","Hollow Rock","Back Extension","45 Degree Hyperextension","Reverse Hyperextension","Superman","Good Morning","Hip Hinge","Sorensen Hold","Turkish Get-Up","Farmer Carry","Suitcase Carry","Overhead Carry","Waiter's Carry","Sandbag Carry","Standing Cable Crunch","Cable Oblique Crunch","Cable Reverse Crunch","Ab Crunch Machine","Torso Rotation Machine","Standing Cable Lift","Standing Cable Chop","Band Pallof Press","Band Wood Chop","Band Dead Bug","Band Crunch","Band Reverse Crunch","Band Russian Twist","Band Standing Rotation","Band Bicycle Crunch","Sit-Up","Curl-Up","Boat Pose","L-Sit","Dragon Flag","Reverse Plank","Toe Touch","Heel Touch","Towel Body Saw","Chair Knee Raise","Backpack Russian Twist","Water Bottle Side Bend","Wall Plank","Medicine Ball Slam","Overhead Slam","Rotational Slam","Chest Pass to Sit-Up","Medicine Ball V-Up","Medicine Ball Russian Twist","Medicine Ball Toss","Ab Wheel Rollout","Barbell Rollout","TRX Fallout","Ring Fallout","Swiss Ball Rollout","Swiss Ball Pike","Swiss Ball Knee Tuck","Landmine Anti-Rotation Press","Plate Halo"],
  Conditioning: ["Burpees","Half Burpees","Squat Thrusts","Mountain Climbers","High Knees","Butt Kicks","Jump Squats","Jump Lunges","Skater Jumps","Bear Crawl","Crab Walk","Plank Jacks","Seal Jacks","Star Jumps","Battle Rope Waves","Alternating Waves","Power Slams","Outside Circles","Inside Circles","Sled Push","Sled Pull","Prowler Push","Farmer Carry","Sandbag Carry","Kettlebell Swing","Medicine Ball Slams","Wall Balls","Tire Flips","Battling Rope Jump Slams","EMOM","AMRAP","Tabata","Circuit Training","Shuttle Runs","Suicides","Beep Test","Agility Ladder","Cone Drills","5-10-5 Shuttle","T Drill","Carioca","Lateral Shuffle","Acceleration Sprints","Deceleration Drills","Bounding","Band Sprint","Band High Knees","Band Lateral Shuffle","Band Burpee","Band Thruster","Band Squat to Press","Kettlebell Clean","Clean and Press","Snatch","Swing","Goblet Squat","Thruster","Long Cycle","Dumbbell Thruster","Devil Press","Man Maker","Renegade Row","Dumbbell Snatch","Walking Lunge","Push Press","Jog on the Spot","March on the Spot","Skipping Without Rope","Shadow Boxing","Shadow Kickboxing","Stair Climbing","Chair Step-Ups","Dancing","Turkish Get-Up"],
  Cardio: ["Treadmill Walk","Incline Treadmill Walk","Power Walk","Jog","Steady-State Run","Tempo Run","Interval Run","Sprint","Hill Sprint","Trail Run","Stair Run","Backward Walk","Upright Exercise Bike","Recumbent Bike","Spin Bike","Air Bike","Sprint Intervals","Hill Climb Ride","Cadence Ride","Rowing Ergometer","Sprint Rows","500m Intervals","1000m Repeats","Steady-State Row","Pyramid Row","Elliptical Trainer","Reverse Elliptical","SkiErg","Double Pole SkiErg","Alternating Arm SkiErg","Stair Climber","StepMill","Box Step-Ups","Weighted Step-Ups","Bench Step Overs","Basic Jump","Alternate Foot Step","High Knees","Double Unders","Criss Cross","Boxer Skip","Side Swing","Freestyle Swim","Backstroke","Breaststroke","Butterfly","Water Running","Kickboard Intervals","VersaClimber","Jacobs Ladder","Assault Runner","Curved Treadmill Sprint","Zone 2 Walk","Easy Cycle","Easy Row","Mobility Flow Walk","Pool Walking"],
};

const FULL_POOL = Object.fromEntries(
  Object.entries(FULL_POOL_NAMES).map(([key, names]) => [key, names.map(name => ({ name, equip: inferEquip(name) }))])
);

const TOP20 = {
  Chest: [["Push-Up","easy"],["Incline Push-Up","easy"],["Chest Press Machine","easy"],["Cable Fly","easy"],["Pec Deck Fly","easy"],["Svend Press","easy"],["Flat Dumbbell Bench Press","intermediate"],["Incline Dumbbell Bench Press","intermediate"],["Decline Dumbbell Bench Press","intermediate"],["Flat Barbell Bench Press","intermediate"],["Incline Barbell Bench Press","intermediate"],["Low-to-High Cable Fly","intermediate"],["High-to-Low Cable Fly","intermediate"],["Diamond Push-Up","intermediate"],["Landmine Chest Press","intermediate"],["Decline Barbell Bench Press","advanced"],["Close Grip Bench Press","advanced"],["Wide Grip Bench Press","advanced"],["Chest Dip","advanced"],["Guillotine Press","master"]],
  Shoulders: [["Dumbbell Lateral Raise","easy"],["Dumbbell Front Raise","easy"],["Cable Lateral Raise","easy"],["Face Pull","easy"],["Arm Circles","easy"],["Band Pull Apart","easy"],["Barbell Shrug","easy"],["Dumbbell Shrug","easy"],["Cable External Rotation","easy"],["Standing Barbell Overhead Press","intermediate"],["Seated Dumbbell Press","intermediate"],["Arnold Press","intermediate"],["Bent Over Reverse Fly","intermediate"],["Rear Delt Machine Fly","intermediate"],["Landmine Press","intermediate"],["Push Press","advanced"],["Cuban Press","advanced"],["Behind-the-Neck Press","master"],["Bradford Press","master"],["Handstand Push-Up","master"]],
  Triceps: [["Rope Pushdown","easy"],["Overhead Rope Extension","easy"],["Bench Dip","easy"],["Kickback","easy"],["V-Bar Pushdown","easy"],["Chair Dip","easy"],["Dumbbell Skull Crusher","intermediate"],["EZ Bar Skull Crusher","intermediate"],["Reverse Grip Pushdown","intermediate"],["Lying Triceps Extension","intermediate"],["Single Arm Pushdown","intermediate"],["Diamond Push-Up","intermediate"],["Overhead Dumbbell Extension","intermediate"],["Floor Press","intermediate"],["Close Grip Bench Press","advanced"],["Tate Press","advanced"],["Straight Bar Dip","advanced"],["JM Press","master"],["Weighted Dip","master"],["Ring Triceps Extension","master"]],
  Biceps: [["Standing Dumbbell Curl","easy"],["Hammer Curl","easy"],["EZ Bar Curl","easy"],["Cable Curl","easy"],["Concentration Curl","easy"],["Reverse Curl","easy"],["Cross-Body Hammer Curl","easy"],["Cable Hammer Curl","easy"],["Seated Dumbbell Curl","easy"],["Wrist Curl","easy"],["Barbell Curl","intermediate"],["Preacher Curl","intermediate"],["Incline Dumbbell Curl","intermediate"],["Spider Curl","intermediate"],["Zottman Curl","intermediate"],["Wide Grip Curl","intermediate"],["Close Grip Curl","intermediate"],["Drag Curl","advanced"],["Chin-Up","advanced"],["Behind-the-Body Cable Curl","master"]],
  Back: [["Wide Grip Lat Pulldown","easy"],["Seated Cable Row","easy"],["Single Arm Dumbbell Row","easy"],["Wide Grip Cable Row","easy"],["Inverted Row","easy"],["Face Pull","easy"],["Barbell Shrug","easy"],["Back Extension","easy"],["Chest Supported Machine Row","easy"],["Bent Over Barbell Row","intermediate"],["T-Bar Row","intermediate"],["Reverse Hyperextension","intermediate"],["Pull-Up","advanced"],["Chin-Up","advanced"],["Meadows Row","advanced"],["Pendlay Row","advanced"],["Weighted Pull-Up","master"],["Rack Pull","master"],["Kroc Row","master"],["Deficit Deadlift","master"]],
  Quads: [["Goblet Squat","easy"],["Leg Press","easy"],["Walking Lunge","easy"],["Leg Extension","easy"],["Step-Up","easy"],["Split Squat","easy"],["Reverse Lunge","easy"],["Smith Machine Squat","easy"],["Wall Sit","easy"],["Back Squat","intermediate"],["Hack Squat Machine","intermediate"],["Jump Squat","intermediate"],["Front Squat","advanced"],["Bulgarian Split Squat","advanced"],["Box Squat","advanced"],["Cyclist Squat","advanced"],["Zercher Squat","master"],["Pistol Squat","master"],["Sissy Squat","master"],["Overhead Squat","master"]],
  HamsGlutes: [["Glute Bridge","easy"],["Lying Leg Curl","easy"],["Seated Leg Curl","easy"],["Cable Kickback","easy"],["Single Leg Glute Bridge","easy"],["Frog Pump","easy"],["Pull Through","easy"],["Donkey Kick","easy"],["Standing Leg Curl","easy"],["Romanian Deadlift","intermediate"],["Barbell Hip Thrust","intermediate"],["Trap Bar Deadlift","intermediate"],["B-Stance Hip Thrust","intermediate"],["Kettlebell Swing","intermediate"],["Good Morning","advanced"],["Conventional Deadlift","advanced"],["Sumo Deadlift","advanced"],["Single Leg Romanian Deadlift","advanced"],["Nordic Hamstring Curl","master"],["Glute Ham Raise","master"]],
  Calves: [["Standing Calf Raise","easy"],["Seated Calf Raise","easy"],["Leg Press Calf Raise","easy"],["Smith Machine Calf Raise","easy"],["Band Calf Raise","easy"],["Calf Raise","easy"],["Stair Calf Raise","easy"],["Jump Rope","easy"],["Donkey Calf Raise","intermediate"],["Single Leg Calf Raise","intermediate"],["Farmer Calf Raise Walk","advanced"]],
  Core: [["Front Plank","easy"],["Dead Bug","easy"],["Bird Dog","easy"],["Crunch","easy"],["Cable Crunch","easy"],["Russian Twist","easy"],["Side Plank","easy"],["Pallof Press","easy"],["Reverse Crunch","easy"],["Bicycle Crunch","easy"],["Mountain Climbers","easy"],["Hanging Knee Raise","intermediate"],["Cable Wood Chop","intermediate"],["Weighted Plank","intermediate"],["V-Up","intermediate"],["Hanging Leg Raise","advanced"],["Ab Wheel Rollout","advanced"],["Toe-to-Bar","master"],["Dragon Flag","master"],["L-Sit","master"]],
  Conditioning: [["Farmer Carry","easy"],["Battle Rope Waves","easy"],["Medicine Ball Slams","easy"],["Mountain Climbers","easy"],["Bear Crawl","easy"],["Sandbag Carry","easy"],["Kettlebell Swing","intermediate"],["Burpees","intermediate"],["Dumbbell Thruster","intermediate"],["Sled Push","intermediate"],["Wall Balls","intermediate"],["Jump Squats","intermediate"],["Skater Jumps","intermediate"],["Renegade Row","advanced"],["Turkish Get-Up","master"],["Man Maker","master"],["Devil Press","master"],["Tire Flips","master"],["Clean and Press","master"],["Snatch","master"]],
  Cardio: [["Treadmill Walk","easy"],["Incline Treadmill Walk","easy"],["Jog","easy"],["Upright Exercise Bike","easy"],["Elliptical Trainer","easy"],["Basic Jump","easy"],["Zone 2 Walk","easy"],["Easy Cycle","easy"],["Easy Row","easy"],["Steady-State Run","intermediate"],["Air Bike","intermediate"],["Rowing Ergometer","intermediate"],["Stair Climber","intermediate"],["Freestyle Swim","intermediate"],["Interval Run","advanced"],["Sprint","advanced"],["StepMill","advanced"],["Sprint Intervals","advanced"],["Hill Sprint","master"],["Double Unders","master"]],
};

const DIFFICULTY_ORDER = ["easy","intermediate","advanced","master"];
function maxDifficultyFor(level, override) {
  if (override) return DIFFICULTY_ORDER.indexOf(override);
  if (level === "Never trained") return 0;
  if (level === "Some experience") return 1;
  if (level === "Train regularly") return 2;
  return 3; // Advanced
}

const MUSCLE = Object.fromEntries(
  Object.entries(TOP20).map(([key, items]) => [key, items.map(([name, difficulty]) => ({ name, equip: inferEquip(name), difficulty }))])
);

/* ---------------- exercise description generator ----------------
   With ~850 exercises there's no hand-writing individual cues, so form
   content is generated from the movement pattern in the name. Covers
   instructions, grip (where relevant), tips, common mistakes, and what
   it trains. */
/* Real, hand-written exercise instructions matched from the free-exercise-db
   public-domain dataset -- up to 60 per muscle category (fewer where the
   category simply doesn't have that many, e.g. calves), always prioritizing
   the Top 20 first. Anything without a real match falls back to the
   pattern-based generator below. */
const REAL_DB = {"Outside Circles":{"instructions":["Stand up and extend your arms straight out by the sides. The arms should be parallel to the floor and perpendicular (90-degree angle) to your torso.…","Slowly start to make circles of about 1 foot in diameter with each outstretched arm. Breathe normally as you perform the movement.","Continue the circular motion of the outstretched arms for about ten seconds. Then reverse the movement, going the opposite direction."],"tips":[],"grip":null,"targets":"the shoulders, with the traps assisting"},"Reverse Hyperextension":{"instructions":["To begin, lie down on an exercise ball with your torso pressing against the ball and parallel to the floor. The ball of your feet should be pressed…","Slowly raise your torso up by bending at the waist and lower back. Remember to exhale during this movement.","Hold the contraction on your lower back for a second and lower your torso back down to the starting position while inhaling.","Repeat for the recommended amount of repetitions prescribed in your program."],"tips":[],"grip":null,"targets":"the lower back, with the glutes, the hamstrings, the mid-back assisting"},"Band Dead Bug":{"instructions":["Begin lying on your back with your hands extended above you toward the ceiling.","Bring your feet, knees, and hips up to 90 degrees.","Exhale hard to bring your ribcage down and flatten your back onto the floor, rotating your pelvis up and squeezing your glutes. Hold this position…","Initiate the exercise by extending one leg, straightening the knee and hip to bring the leg just above the ground."],"tips":[],"grip":null,"targets":"the abs"},"Close Grip Bench Press":{"instructions":["Lie back on a flat bench. Using a close grip (around shoulder width), lift the bar from the rack and hold it straight over you with your arms locked.…","As you breathe in, come down slowly until you feel the bar on your middle chest.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your triceps muscles. Lock your arms in…","Repeat the movement for the prescribed amount of repetitions."],"tips":["Make sure that - as opposed to a regular bench press - you keep the  elbows close to the torso at all times in order to…"],"grip":"Using a close grip (around shoulder width),  lift the bar from the rack and hold it straight over…","targets":"the triceps, with the chest, the shoulders assisting"},"Cross Body Cable Lateral Raise":{"instructions":["Stand in the middle of two low pulleys that are opposite to each other and place a flat bench right behind you (in perpendicular fashion to you; the…","Now sit at the edge of the flat bench behind you with your feet placed in front of your knees.","Bend forward while keeping your back flat and rest your torso on the thighs.","Have someone give you the single handles attached to the pulleys. Grasp the left pulley with the right hand and the right pulley with the left after…"],"tips":["Maintain upper  arms perpendicular to torso and a fixed elbow position (10 degree to 30 degree  angle) throughout…"],"grip":"The pulleys should run under your knees and your arms will  be extended with palms facing each…","targets":"the shoulders, with the mid-back, the traps assisting"},"Hammer Curl":{"instructions":["Stand up with your torso upright and a dumbbell in each hand being held at arms length. The elbows should be close to the torso.","The palms of the hands should be facing your torso. This will be your starting position.","While holding the upper arm stationary, curl the right weight forward while contracting the biceps as you breathe out. Continue the movement until…","Slowly begin to bring the dumbbells back to starting position as your breathe in."],"tips":["Only the  forearms should move."],"grip":"The palms of the hands should be facing your torso.","targets":"the biceps, with the forearms assisting"},"Single Leg Balance Reach":{"instructions":["This drill helps you learn to drive yourself low enough during the jerk and corrects those who move backward during the movement. Begin with the bar…","Initiate the movement as you would a normal jerk, dipping at the knees while keeping your torso vertical, and driving back up forcefully, using…","Keep the rear foot in place, using it to drive your body forward into a full split as you jerk the weight. Recover by standing up with the weight…"],"tips":[],"grip":null,"targets":"the shoulders, with the glutes, the hamstrings, the quads, the triceps assisting"},"Reverse Cable Curl":{"instructions":["Stand up with your torso upright while holding a bar attachment that is attached to a low pulley using a pronated (palms down) and shoulder width…","While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue…","Slowly begin to bring the bar back to starting position as your breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"Stand up with your torso upright while holding a bar attachment that is  attached to a low pulley…","targets":"the biceps, with the forearms assisting"},"Kickback":{"instructions":["Start with a dumbbell in each hand and your palms facing your torso. Keep your back straight with a slight bend in the knees and bend forward at the…","Now, while keeping your upper arms stationary, exhale and use your triceps to lift the weights until the arm is fully extended. Focus on moving the…","After a brief pause at the top contraction, inhale and slowly lower the dumbbells back down to the starting position.","Repeat the movement for the prescribed amount of repetitions."],"tips":[],"grip":"Start with a dumbbell in each hand and your palms facing your torso.","targets":"the triceps"},"Rope Curl":{"instructions":["Grab the rope with both hands above your head. Pull down on the rope as you take a small jump.","Wrap the rope around one leg, using your feet to pinch the rope. Reach up as high as possible with your arms, gripping the rope tightly.","Release the rope from your feet as you pull yourself up with your arms, bringing your knees towards your chest.","Resecure your feet on the rope, and then stand up to take another high hold on the rope. Continue until you reach the top of the rope."],"tips":[],"grip":"To lower yourself, loosen the grip of your feet on the rope as you slide  down using a hand over…","targets":"the lats, with the biceps, the forearms, the mid-back, the shoulders assisting"},"Band Chest Press":{"instructions":["Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your…","Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the…","After pausing at full extension, return to th starting position, keeping tension on the cables.","You can also execute this movement with your back off the pad, at an incline or decline, or alternate hands."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Low-to-High Wood Chop":{"instructions":["Start off by lying on the floor.","Extend one leg straight and pull the other knee to your chest. Hold under the knee joint to protect the kneecap.","Gently tug that knee toward your nose.","Switch sides. This stretches the buttocks and lower back of the bent leg and the hip flexor of the straight leg."],"tips":[],"grip":null,"targets":"the glutes, with the hamstrings, the lower back assisting"},"Band Calf Raise":{"instructions":["Place a block about 12 inches in front of a flat bench.","Sit on the bench and place the ball of your feet on the block.","Have someone place a barbell over your upper thighs about 3 inches above your knees and hold it there. This will be your starting position.","Raise up on your toes as high as possible as you squeeze the calves and as you breathe out."],"tips":["To get maximum benefit stretch your calves as far as you can."],"grip":null,"targets":"the calves"},"Band Low-to-High Fly":{"instructions":["Get into pushup position on the toes with your hands just outside of shoulder width.","Perform a pushup by allowing the elbows to flex. As you descend, keep your body straight.","Do one pushup and as you come up, shift your weight on the left side of the body, twist to the side while bringing the right arm up towards the…","Lower the arm back to the floor for another pushup and then twist to the other side."],"tips":[],"grip":null,"targets":"the chest, with the abs, the shoulders, the triceps assisting"},"Machine Glute Kickback":{"instructions":["Kneel on the floor or an exercise mat and bend at the waist with your arms extended in front of you (perpendicular to the torso) in order to get into…","As you exhale, lift up your right leg until the hamstrings are in line with the back while maintaining the 90-degree angle bend. Contract the glutes…","Go back to the initial position as you inhale and now repeat with the left leg.","Continue to alternate legs until all of the recommended repetitions have been performed."],"tips":["At the end of the movement the upper leg should be parallel to the floor while  the calf should be perpendicular to it."],"grip":null,"targets":"the glutes, with the hamstrings assisting"},"Backpack Romanian Deadlift":{"instructions":["Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width.","Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.","Keeping your back and arms completely straight at all times, use your hips to lift the bar as you exhale.","Once you are standing completely straight up, lower the bar by pushing the hips back, only slightly bending the knees, unlike when squatting."],"tips":["Depending  on the weight used, you may need wrist wraps to perform the exercise and also a  raised platform in order to…"],"grip":"Put a barbell in front of you on the ground and grab it using a pronated  (palms facing down) grip…","targets":"the hamstrings, with the calves, the glutes, the lower back assisting"},"Landmine Row":{"instructions":["Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.","Raise the bar from the floor, taking it to shoulder height with both hands with your arms extended in front of you. Adopt a wide stance. This will be…","Perform the movement by rotating the trunk and hips as you swing the weight all the way down to one side. Keep your arms extended throughout the…","Reverse the motion to swing the weight all the way to the opposite side."],"tips":[],"grip":null,"targets":"the abs, with the glutes, the lower back, the shoulders assisting"},"Close Grip Lat Pulldown":{"instructions":["Select an appropriate weight and adjust the knee pad to help keep you down. Grasp the handle with a pronated grip. This will be your starting…","Pull the handle down, squeezing your elbow to your side as you flex the elbow.","Pause at the bottom of the motion, and then slowly return the handle to the starting position.","For multiple repetitions, avoid completely returning the weight to keep tension on the muscles being worked."],"tips":[],"grip":"Grasp the handle with a pronated grip.","targets":"the lats, with the biceps, the mid-back assisting"},"Bear Crawl":{"instructions":["Begin in a prone position on the floor. Support your weight on your hands and toes, with your feet together and your body straight. Your arms should…","Initiate the movement by raising one foot off of the ground. Externally rotate the leg and bring the knee toward your elbow, as far forward as…","Return this leg to the starting position and repeat on the opposite side."],"tips":[],"grip":null,"targets":"the abs, with the chest, the shoulders, the triceps assisting"},"Flat Dumbbell Fly":{"instructions":["Lie down on a flat bench with a dumbbell in one hand resting on top of your thigh. The palm of your hand with the dumbbell in it should be at a…","By using your thighs to help you get the dumbbell up, clean the dumbbell so that you can hold it in front of you with your lifting arm being fully…","Your arm with the weight should have a slight bend on your elbow in order to prevent stress at the biceps tendon. Begin by lowering your arm with the…","Return your lifting arm back to the starting position as you squeeze your chest muscles and breathe out."],"tips":["Keep in mind that  throughout the movement, your lifting arm should remain stationary; the movement  should only occur…"],"grip":"The palm of your hand with the dumbbell in it should be at a neutral  grip.","targets":"the chest"},"JM Press":{"instructions":["Start the exercise the same way you would a close grip bench press. You will lie on a flat bench while holding a barbell at arms length (fully…","Now beginning from a fully extended position lower the bar down as if performing a lying triceps extension. Inhale as you perform this movement. When…","As you exhale, press the bar back up by using the triceps to perform a close grip bench press.","Now go back to the starting position and start over."],"tips":["Keep the bend at the elbows constant as you bring the upper arms forward."],"grip":"Start the exercise the same way you would a close grip bench press.","targets":"the triceps, with the chest, the shoulders assisting"},"Towel Chin-Up":{"instructions":["Grab the pull-up bar with the palms facing your torso and a grip closer than the shoulder width.","As you have both arms extended in front of you holding the bar at the chosen grip width, keep your torso as straight as possible while creating a…","As you breathe out, pull your torso up until your head is around the level of the pull-up bar. Concentrate on using the biceps muscles in order to…","After a second of squeezing the biceps in the contracted position, slowly lower your torso back to the starting position; when your arms are fully…"],"tips":["Keeping the torso as straight as possible maximizes biceps  stimulation while minimizing back involvement."],"grip":"Grab the pull-up bar with the palms facing your torso and a grip closer  than the shoulder width.","targets":"the lats, with the biceps, the forearms, the mid-back assisting"},"Cable Oblique Crunch":{"instructions":["Secure your legs at the end of the decline bench and slowly lay down on the bench.","Raise your upper body off the bench until your torso is about 35-45 degrees if measured from the floor.","Put one hand beside your head and the other on your thigh. This will be your starting position.","Raise your upper body slowly from the starting position while turning your torso to the left. Continue crunching up as you exhale until your right…"],"tips":["Focus on keeping your abs tight and keeping the movement slow and controlled."],"grip":null,"targets":"the abs"},"Medicine Ball Slams":{"instructions":["For this exercise you will need a medicine ball and a partner. Stand back to back with your partner, spaced 2-3 feet apart. This will be your…","Hold the ball in front of the trunk. Open the hips and turn the shoulders at the same time as your partner.","For full rotation, you and your partner should twist in the same direction, i.e. counter-clockwise.","Pass the ball to your partner, and both of you can now twist in the opposite direction to repeat the procedure."],"tips":[],"grip":null,"targets":"the abs, with the shoulders assisting"},"Ring Push-Up":{"instructions":["Grip a ring in each hand, and then take a small jump to help you get into the starting position with your arms locked out.","Begin by flexing the elbow, lowering your body until your arms break 90 degrees. Avoid swinging, and maintain good posture throughout the descent.","Reverse the motion by extending the elbow, pushing yourself back up into the starting position.","Repeat for the desired number of repetitions."],"tips":[],"grip":"Grip a ring in each hand, and then take a small jump to help you get into  the starting position…","targets":"the triceps, with the chest, the shoulders assisting"},"Donkey Calf Raise":{"instructions":["For this exercise you will need access to a donkey calf raise machine. Start by positioning your lower back and hips under the padded lever provided.…","Place both of your arms on the side handles and place the balls of your feet on the calf block with the heels extending off. Align the toes forward,…","Raise your heels as you breathe out by extending your ankles as high as possible and flexing your calf. Ensure that the knee is kept stationary at…","Go back slowly to the starting position as you breathe in by lowering your heels as you bend the ankles until calves are stretched."],"tips":[],"grip":null,"targets":"the calves"},"Seated Chest Press":{"instructions":["Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your…","Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the…","After pausing at full extension, return to th starting position, keeping tension on the cables.","You can also execute this movement with your back off the pad, at an incline or decline, or alternate hands."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Seated Calf Raise":{"instructions":["Sit on the machine and place your toes on the lower portion of the platform provided with the heels extending off. Choose the toe positioning of your…","Place your lower thighs under the lever pad, which will need to be adjusted according to the height of your thighs. Now place your hands on top of…","Lift the lever slightly by pushing your heels up and release the safety bar. This will be your starting position.","Slowly lower your heels by bending at the ankles until the calves are fully stretched. Inhale as you perform this movement."],"tips":[],"grip":null,"targets":"the calves"},"Cable Arnold Press":{"instructions":["Sit on an exercise bench with back support and hold two dumbbells in front of you at about upper chest level with your palms facing your body and…","Now to perform the movement, raise the dumbbells as you rotate the palms of your hands until they are facing forward.","Continue lifting the dumbbells until your arms are extended above you in straight arm position. Breathe out as you perform this portion of the…","After a second pause at the top, begin to lower the dumbbells to the original position by rotating the palms of your hands towards you."],"tips":["Your arms should be next to your torso. The starting  position should look like the contracted portion of a dumbbell…"],"grip":"Sit on an exercise bench with back support and hold two dumbbells in  front of you at about upper…","targets":"the shoulders, with the triceps assisting"},"Single-Arm Dumbbell Press":{"instructions":["Lie down on a flat bench with a dumbbell in one hand on top of your thigh.","By using your thigh to help you get the dumbbell up, clean the dumbbell up so that you can hold it in front of you at shoulder width. Use the hand…","Once at shoulder width, rotate your wrist forward so that the palm of your hand is facing away from you. This will be your starting position.","Bring down the weights slowly to your side as you breathe in. Keep full control of the dumbbell at all times. Otherwise, keep it resting to the side."],"tips":["Use the hand that you are not lifting  with to help keep the dumbbell balance as you may struggle a bit at first. Only …"],"grip":"Once at shoulder width, rotate your wrist forward so that the palm of  your hand is facing away…","targets":"the chest, with the shoulders, the triceps assisting"},"Close Grip Overhead Press":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Walking Squat":{"instructions":["Begin standing with your feet shoulder width apart and a barbell across your upper back.","Step forward with one leg, flexing the knees to drop your hips. Descend until your rear knee nearly touches the ground. Your posture should remain…","Drive through the heel of your lead foot and extend both knees to raise yourself back up.","Step forward with your rear foot, repeating the lunge on the opposite leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Flat Dumbbell Bench Press":{"instructions":["Lie down on a flat bench with a dumbbell in one hand resting on top of your thigh. The palm of your hand with the dumbbell in it should be at a…","By using your thighs to help you get the dumbbell up, clean the dumbbell so that you can hold it in front of you with your lifting arm being fully…","Your arm with the weight should have a slight bend on your elbow in order to prevent stress at the biceps tendon. Begin by lowering your arm with the…","Return your lifting arm back to the starting position as you squeeze your chest muscles and breathe out."],"tips":["Keep in mind that  throughout the movement, your lifting arm should remain stationary; the movement  should only occur…"],"grip":"The palm of your hand with the dumbbell in it should be at a neutral  grip.","targets":"the chest"},"Low Cable Press":{"instructions":["Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your…","Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the…","After pausing at full extension, return to th starting position, keeping tension on the cables.","You can also execute this movement with your back off the pad, at an incline or decline, or alternate hands."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Band Reverse Crunch":{"instructions":["Lie down on the floor with your legs fully extended and arms to the side of your torso with the palms on the floor. Your arms should be stationary…","Move your legs up so that your thighs are perpendicular to the floor and feet are together and parallel to the floor. This is the starting position.","While inhaling, move your legs towards the torso as you roll your pelvis backwards and you raise your hips off the floor. At the end of this movement…","Hold the contraction for a second and move your legs back to the starting position while exhaling."],"tips":[],"grip":"Lie down on the floor with your legs fully extended and arms to the side  of your torso with the…","targets":"the abs"},"Rope Row":{"instructions":["Grab the rope with both hands above your head. Pull down on the rope as you take a small jump.","Wrap the rope around one leg, using your feet to pinch the rope. Reach up as high as possible with your arms, gripping the rope tightly.","Release the rope from your feet as you pull yourself up with your arms, bringing your knees towards your chest.","Resecure your feet on the rope, and then stand up to take another high hold on the rope. Continue until you reach the top of the rope."],"tips":[],"grip":"To lower yourself, loosen the grip of your feet on the rope as you slide  down using a hand over…","targets":"the lats, with the biceps, the forearms, the mid-back, the shoulders assisting"},"Mountain Climbers":{"instructions":["Begin in a pushup position, with your weight supported by your hands and toes. Flexing the knee and hip, bring one leg until the knee is…","Explosively reverse the positions of your legs, extending the bent leg until the leg is straight and supported by the toe, and bringing the other…"],"tips":[],"grip":null,"targets":"the quads, with the chest, the hamstrings, the shoulders assisting"},"Seated Barbell Overhead Press":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Plank to Push-Up":{"instructions":["Start off by lying on the floor.","Extend one leg straight and pull the other knee to your chest. Hold under the knee joint to protect the kneecap.","Gently tug that knee toward your nose.","Switch sides. This stretches the buttocks and lower back of the bent leg and the hip flexor of the straight leg."],"tips":[],"grip":null,"targets":"the glutes, with the hamstrings, the lower back assisting"},"Barbell Skull Crusher":{"instructions":["Secure a band to the base of a rack or the bench. Lay on the bench so that the band is lined up with your head.","Take hold of the band, raising your elbows so that the upper arm is perpendicular to the floor. With the elbow flexed, the band should be above your…","Extend through the elbow to straighten your arm, keeping your upper arm in place. Pause at the top of the motion, and return to the starting position."],"tips":[],"grip":null,"targets":"the triceps"},"Pistol Squat":{"instructions":["Pick up a kettlebell with two hands and hold it by the horns. Hold one leg off of the floor and squat down on the other.","Squat down by flexing the knee and sitting back with the hips, holding the kettlebell up in front of you.","Hold the bottom position for a second and then reverse the motion, driving through the heel and keeping your head and chest up.","Lower yourself again and repeat."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the shoulders assisting"},"Hammer Strength Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Single Arm Dumbbell Row":{"instructions":["Choose a flat bench and place a dumbbell on each side of it.","Place the right leg on top of the end of the bench, bend your torso forward from the waist until your upper body is parallel to the floor, and place…","Use the left hand to pick up the dumbbell on the floor and hold the weight while keeping your lower back straight. The palm of the hand should be…","Pull the resistance straight up to the side of your chest, keeping your upper arm close to your side and keeping the torso stationary. Breathe out as…"],"tips":["Concentrate on squeezing the back muscles once you  reach the full contracted position. Also, make sure that the force…"],"grip":"The palm of the hand should be  facing your torso.","targets":"the mid-back, with the biceps, the lats, the shoulders assisting"},"Power Slams":{"instructions":["Stand with your feet slightly wider than shoulder width apart and toes pointing out slightly.","Squat down and grasp bar with a closed, pronated grip. Your hands should be slightly wider than shoulder width apart outside knees with elbows fully…","Place the bar about 1 inch in front of your shins and over the balls of your feet.","Your back should be flat or slightly arched, your chest held up and out and your shoulder blades should be retracted."],"tips":["At this point your thighs should be  against the bar."],"grip":"Squat down and grasp bar with a closed, pronated grip.","targets":"the hamstrings, with the calves, the forearms, the glutes, the lower back, the mid-back, the quads, the shoulders, the traps, the triceps assisting"},"Carioca":{"instructions":["Begin with your feet a few inches apart and your left arm up in a relaxed, athletic position.","With your right foot, quick step behind and pull the knee up.","Fire your arms back up when you pull the right knee, being sure that your knee goes straight up and down. Avoid turning your feet as you move and…"],"tips":[],"grip":null,"targets":"the inner thigh (adductors), with the abs, the outer hip (abductors), the calves, the glutes, the hamstrings, the quads assisting"},"Neutral Grip Lat Pulldown":{"instructions":["Select an appropriate weight and adjust the knee pad to help keep you down. Grasp the handle with a pronated grip. This will be your starting…","Pull the handle down, squeezing your elbow to your side as you flex the elbow.","Pause at the bottom of the motion, and then slowly return the handle to the starting position.","For multiple repetitions, avoid completely returning the weight to keep tension on the muscles being worked."],"tips":[],"grip":"Grasp the handle with a pronated grip.","targets":"the lats, with the biceps, the mid-back assisting"},"Bradford Press":{"instructions":["Place a loaded bar at shoulder level in a rack. With a pronated grip at shoulder width, begin with the bar racked across the front of your shoulders.…","Initiate the lift by extending the elbows to press the bar overhead. Avoid locking out the elbow as you move the weight behind your head.","Lower the bar down to the back of the head until your elbow forms a right angle.","Lift the bar back over your head by extending the elbows"],"tips":[],"grip":"With a pronated grip at  shoulder width, begin with the bar racked across the front of your…","targets":"the shoulders, with the triceps assisting"},"Trap Bar Deadlift":{"instructions":["For this exercise load a trap bar, also known as a hex bar, to an appropriate weight resting on the ground. Stand in the center of the apparatus and…","Lower your hips, look forward with your head and keep your chest up.","Begin the movement by driving through the heels and extend your hips and knees. Avoid rounding your back at all times.","At the completion of the movement, lower the weight back to the ground under control."],"tips":[],"grip":null,"targets":"the quads, with the glutes, the hamstrings assisting"},"Preacher Curl Machine":{"instructions":["Place a preacher bench about 2 feet in front of a pulley machine.","Attach a straight bar to the low pulley.","Sit at the preacher bench with your elbow and upper arms firmly on top of the bench pad and have someone hand you the bar from the low pulley.","Grab the bar and fully extend your arms on top of the preacher bench pad. This will be your starting position."],"tips":[],"grip":null,"targets":"the biceps, with the forearms assisting"},"Cable Internal Rotation":{"instructions":["Sit next to a low pulley sideways (with legs stretched in front of you or crossed) and grasp the single hand cable attachment with the arm nearest to…","Position the elbow against your side with the elbow bent at 90° and the arm pointing towards the pulley. This will be your starting position.","Pull the single hand cable attachment toward your body by internally rotating your shoulder until your forearm is across your abs. You will be…","Slowly go back to the initial position."],"tips":["If you can adjust the pulley's height, you can use a flat bench to  sit on instead."],"grip":null,"targets":"the shoulders"},"Incline Treadmill Walk":{"instructions":["To begin, step onto the treadmill and select the desired option from the menu. Most treadmills have a manual setting, or you can select a program to…","Treadmills offer convenience, cardiovascular benefits, and usually have less impact than jogging outside. A 150 lb person will burn almost 250…"],"tips":[],"grip":null,"targets":"the quads, with the glutes, the hamstrings assisting"},"Smith Machine Squat":{"instructions":["To begin, first set the bar on the height that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar…","Hold on to the bar using both arms at each side (palms facing forward), unlock it and lift it off the rack by first pushing with your legs and at the…","Position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times and also maintain a…","Begin to slowly lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the lower back assisting"},"Straight Arm Lat Pulldown":{"instructions":["Select an appropriate weight and adjust the knee pad to help keep you down. Grasp the handle with a pronated grip. This will be your starting…","Pull the handle down, squeezing your elbow to your side as you flex the elbow.","Pause at the bottom of the motion, and then slowly return the handle to the starting position.","For multiple repetitions, avoid completely returning the weight to keep tension on the muscles being worked."],"tips":[],"grip":"Grasp the handle with a pronated grip.","targets":"the lats, with the biceps, the mid-back assisting"},"Reverse Curl":{"instructions":["Stand up with your torso upright while holding a barbell at shoulder width with the elbows close to the torso. The palm of your hands should be…","While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue…","Slowly begin to bring the bar back to starting position as your breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"The palm of your hands should be  facing down (pronated grip).","targets":"the biceps, with the forearms assisting"},"Plyometric Push-Up":{"instructions":["Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length. Move your feet up to a box or…","Next, lower yourself downward until your chest almost touches the floor as you inhale.","Now breathe out and press your upper body back up to the starting position while squeezing your chest.","After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Jump Lunges":{"instructions":["Stand with your torso upright holding two dumbbells in your hands by your sides. This will be your starting position.","Step forward with your right leg around 2 feet or so from the foot being left stationary behind and lower your upper body down, while keeping the…","Using mainly the heel of your foot, push up and go back to the starting position as you exhale.","Repeat the movement for the recommended amount of repetitions and then perform with the left leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Glute Bridge":{"instructions":["Begin seated on the ground with a loaded barbell over your legs. Using a fat bar or having a pad on the bar can greatly reduce the discomfort caused…","Begin the movement by driving through with your heels, extending your hips vertically through the bar. Your weight should be supported by your upper…","Extend as far as possible, then reverse the motion to return to the starting position."],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"Countertop Push-Up":{"instructions":["Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length. Move your feet up to a box or…","Next, lower yourself downward until your chest almost touches the floor as you inhale.","Now breathe out and press your upper body back up to the starting position while squeezing your chest.","After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Band Reverse Curl":{"instructions":["Stand up with your torso upright while holding a barbell at shoulder width with the elbows close to the torso. The palm of your hands should be…","While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue…","Slowly begin to bring the bar back to starting position as your breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"The palm of your hands should be  facing down (pronated grip).","targets":"the biceps, with the forearms assisting"},"Band Monster Walk":{"instructions":["Place a band around both ankles and another around both knees. There should be enough tension that they are tight when your feet are shoulder width…","To begin, take short steps forward alternating your left and right foot.","After several steps, do just the opposite and walk backward to where you started."],"tips":[],"grip":null,"targets":"the outer hip (abductors)"},"Overhead Dumbbell Extension":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Windshield Wipers":{"instructions":["Assume a push-up position, supporting your weight on your hands and toes while keeping your body straight. Your hands should be just outside of…","Begin by shifting your body weight as far to one side as possible, allowing the elbow on that side to flex as you lower your body.","Reverse the motion by extending the flexed arm, pushing yourself up and then dropping to the other side.","Repeat for the desired number of repetitions."],"tips":[],"grip":null,"targets":"the chest, with the abs, the shoulders, the triceps assisting"},"Swiss Ball Knee Tuck":{"instructions":["To begin, lie down on the floor or an exercise mat with your back pressed against the floor. Your arms should be lying across your sides with the…","Your legs should be crossed by wrapping one ankle around the other. Slowly elevate your legs up in the air until your thighs are perpendicular to the…","Move your arms from the floor and cross them so they are resting on your chest. This is the starting position.","While keeping your lower back pressed against the floor, slowly lift your torso. Remember to exhale while perform this part of the exercise."],"tips":[],"grip":"Your arms should be lying across your sides with the palms  facing down.","targets":"the abs"},"Single Leg Calf Raise":{"instructions":["Place a block about 12 inches in front of a flat bench.","Sit on the bench and place the ball of your feet on the block.","Have someone place a barbell over your upper thighs about 3 inches above your knees and hold it there. This will be your starting position.","Raise up on your toes as high as possible as you squeeze the calves and as you breathe out."],"tips":["To get maximum benefit stretch your calves as far as you can."],"grip":null,"targets":"the calves"},"Band Sprint":{"instructions":["Stand on the ground with one foot resting on a bench or box with your heel close to the edge.","Push off with your foot on top of the bench, extending through the hip and knee.","Land with the opposite foot on top of the box, returning your other foot back to the start position.","Continue alternating from one foot to another to complete the set."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Towel Hang":{"instructions":["Place two kettlebells between your feet. To get in the starting position, push your butt back and look straight ahead.","Clean one kettlebell to your shoulder and hold on to the other kettlebell in a hanging position. Clean the kettlebell to your shoulder by extending…","Lower the cleaned kettlebell to a hanging position and clean the alternate kettlebell. Repeat."],"tips":[],"grip":null,"targets":"the hamstrings, with the biceps, the calves, the forearms, the glutes, the lower back, the traps assisting"},"Backpack Russian Twist":{"instructions":["Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the…","Elevate your upper body so that it creates an imaginary V-shape with your thighs. Your arms should be fully extended in front of you perpendicular to…","Twist your torso to the right side until your arms are parallel with the floor while breathing out.","Hold the contraction for a second and move back to the starting position while breathing out. Now move to the opposite side performing the same…"],"tips":[],"grip":null,"targets":"the abs, with the lower back assisting"},"Bent Over Barbell Row":{"instructions":["Holding a barbell with a pronated grip (palms facing down), bend your knees slightly and bring your torso forward, by bending at the waist, while…","Now, while keeping the torso stationary, breathe out and lift the barbell to you. Keep the elbows close to the body and only use the forearms to hold…","Then inhale and slowly lower the barbell back to the starting position.","Repeat for the recommended amount of repetitions."],"tips":["Make  sure that you keep the head up. The barbell should hang directly in front of you  as your arms hang perpendicular…"],"grip":null,"targets":"the mid-back, with the biceps, the lats, the shoulders assisting"},"Sled Pull":{"instructions":["Load your pushing sled with the desired weight.","Take an athletic posture, leaning into the sled with your arms fully extended, grasping the handles. Push the sled as fast as possible, focusing on…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the chest, the glutes, the hamstrings, the triceps assisting"},"Rack Press":{"instructions":["This drill teaches the delivery of the barbell to the rack position on the shoulders. Begin holding a bar in the scarecrow position, with the upper…","Begin by rotating the elbows around the bar, delivering the bar to the shoulders. As your elbows come forward, relax your grip. The shoulders should…","It is important that the bar stay close to the body at all times, as with a heavier load any distance will result in an unwanted collision. As the…"],"tips":[],"grip":"Use a hook grip, with  your fingers wrapped over your thumbs.","targets":"the shoulders, with the forearms, the traps assisting"},"Prowler Push":{"instructions":["Place your sled on an appropriate surface, loaded to a suitable weight. The sled should provide enough resistance to require effort, but not so heavy…","You may use the upright or the low handles for this exercise. Place your hands on the handles with your arms extended, leaning into the implement.","With good posture, drive through the ground with alternating, short steps. Move as fast as you can for a short distance."],"tips":[],"grip":null,"targets":"the hamstrings, with the calves, the chest, the glutes, the quads, the shoulders assisting"},"Front Squat":{"instructions":["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once…","Lift the bar off the rack by first pushing with your legs and at the same time straightening your torso.","Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all…","Begin to slowly lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Single Arm Overhead Extension":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Kettlebell Clean":{"instructions":["Place kettlebell between your feet. To get in the starting position, push your butt back and look straight ahead.","Clean the kettlebell to your shoulder. Clean the kettlebell to your shoulders by extending through the legs and hips as you raise the kettlebell…","Lower the kettlebell, keeping the hamstrings loaded by keeping your back straight and your butt out."],"tips":[],"grip":null,"targets":"the hamstrings, with the calves, the glutes, the lower back, the quads, the traps assisting"},"Half Kneeling Pallof Press":{"instructions":["Connect a standard handle to a tower, and—if possible—position the cable to shoulder height. If not, a low pulley will suffice.","With your side to the cable, grab the handle with both hands and step away from the tower. You should be approximately arm's length away from the…","With your feet positioned hip-width apart and knees slightly bent, hold the cable to the middle of your chest. This will be your starting position.","Press the cable away from your chest, fully extending both arms. You core should be tight and engaged."],"tips":[],"grip":null,"targets":"the abs, with the chest, the shoulders, the triceps assisting"},"Selectorised Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Star Plank":{"instructions":["Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.","Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."],"tips":[],"grip":null,"targets":"the abs"},"High-to-Low Wood Chop":{"instructions":["Start off by lying on the floor.","Extend one leg straight and pull the other knee to your chest. Hold under the knee joint to protect the kneecap.","Gently tug that knee toward your nose.","Switch sides. This stretches the buttocks and lower back of the bent leg and the hip flexor of the straight leg."],"tips":[],"grip":null,"targets":"the glutes, with the hamstrings, the lower back assisting"},"Landmine Press":{"instructions":["Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.","Raise the bar from the floor, taking it to shoulder height with both hands with your arms extended in front of you. Adopt a wide stance. This will be…","Perform the movement by rotating the trunk and hips as you swing the weight all the way down to one side. Keep your arms extended throughout the…","Reverse the motion to swing the weight all the way to the opposite side."],"tips":[],"grip":null,"targets":"the abs, with the glutes, the lower back, the shoulders assisting"},"Cuban Press":{"instructions":["Take a dumbbell in each hand with a pronated grip in a standing position. Raise your upper arms so that they are parallel to the floor, allowing your…","To initiate the movement, externally rotate the shoulders to move the upper arm 180 degrees. Keep the upper arms in place, rotating the upper arms…","Now press the dumbbells by extending at the elbows, straightening your arms overhead.","Return to the starting position as you breathe in by reversing the steps."],"tips":[],"grip":"Take a dumbbell in each hand with a pronated grip in a standing position.","targets":"the shoulders, with the traps assisting"},"Overhead Slam":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"T-Bar Row":{"instructions":["Load up the T-bar Row Machine with the desired weight and adjust the leg height so that your upper chest is at the top of the pad.","Lay face down on the pad and grab the handles. You can either use a palms down, palms up, or palms in position depending on what part of your back…","Lift the bar off the rack and extend your arms in front of you. This will be your starting position.","As you exhale slowly pull the weight up and squeeze your back at the top of the movement."],"tips":["In some machines  all you can do is stand on the appropriate step that allows you to be at a  height that has the upper…"],"grip":"You can either use a palms  down, palms up, or palms in position depending on what part of your…","targets":"the mid-back, with the biceps, the lats assisting"},"Cable Squeeze Press":{"instructions":["Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your…","Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the…","After pausing at full extension, return to th starting position, keeping tension on the cables.","You can also execute this movement with your back off the pad, at an incline or decline, or alternate hands."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Cable Hip Abduction":{"instructions":["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can…","Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.","Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder…"],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"Cross Body Crunch":{"instructions":["Lie flat on your back and bend your knees about 60 degrees.","Keep your feet flat on the floor and place your hands loosely behind your head. This will be your starting position.","Now curl up and bring your right elbow and shoulder across your body while bring your left knee in toward your left shoulder at the same time. Reach…","Now go back down to the starting position as you inhale and repeat with the left elbow and the right knee."],"tips":["Try to bring your shoulder up towards your knee rather than just your elbow  and remember that the key is to contract…"],"grip":null,"targets":"the abs"},"Band Good Morning":{"instructions":["Using a 41 inch band, stand on one end, spreading your feet a small amount. Bend at the hips to loop the end of the band behind your neck. This will…","Keeping your legs straight, extend through the hips to come to a near vertical position.","Ensure that you do not round your back as you go down back to the starting position."],"tips":[],"grip":null,"targets":"the hamstrings, with the glutes, the lower back assisting"},"Jefferson Squat":{"instructions":["Place a barbell on the floor.","Stand in the middle of the bar length wise.","Bend down by bending at the knees and keeping your back straight and grasp the front of the bar with your right hand. Your palm should be in (neutral…","Grasp the rear of the bar with your left hand. The palm of your hand should be in neutral grip alignment (palms facing the right side)."],"tips":["Your feet should be shoulder  width apart and your toes slightly pointed out."],"grip":"Your palm should be in (neutral  grip) facing the left side.","targets":"the quads, with the calves, the glutes, the hamstrings, the lower back, the traps assisting"},"Standing Cable Chop":{"instructions":["Connect a standard handle to a tower, and move the cable to the highest pulley position.","With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the…","With your feet positioned shoulder width apart, reach upward with your other hand and grab the handle with both hands. Your arms should still be…","In one motion, pull the handle down and across your body to your front knee while rotating your torso."],"tips":[],"grip":null,"targets":"the abs, with the shoulders assisting"},"Barbell Rollout":{"instructions":["For this exercise you will need to get into a pushup position, but instead of having your hands of the floor, you will be grabbing on to an Olympic…","While keeping a slight arch on your back, lift your hips and roll the barbell towards your feet as you exhale. If you don't, you will work out your…","After a second contraction at the top, start to roll the barbell back forward to the starting position slowly as you inhale.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":null,"targets":"the abs, with the lower back, the shoulders assisting"},"Lever Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Medicine Ball V-Up":{"instructions":["For this exercise you will need a medicine ball and a partner. Stand back to back with your partner, spaced 2-3 feet apart. This will be your…","Hold the ball in front of the trunk. Open the hips and turn the shoulders at the same time as your partner.","For full rotation, you and your partner should twist in the same direction, i.e. counter-clockwise.","Pass the ball to your partner, and both of you can now twist in the opposite direction to repeat the procedure."],"tips":[],"grip":null,"targets":"the abs, with the shoulders assisting"},"Landmine Romanian Deadlift":{"instructions":["Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width.","Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.","Keeping your back and arms completely straight at all times, use your hips to lift the bar as you exhale.","Once you are standing completely straight up, lower the bar by pushing the hips back, only slightly bending the knees, unlike when squatting."],"tips":["Depending  on the weight used, you may need wrist wraps to perform the exercise and also a  raised platform in order to…"],"grip":"Put a barbell in front of you on the ground and grab it using a pronated  (palms facing down) grip…","targets":"the hamstrings, with the calves, the glutes, the lower back assisting"},"Low-to-High Cable Fly":{"instructions":["Get into pushup position on the toes with your hands just outside of shoulder width.","Perform a pushup by allowing the elbows to flex. As you descend, keep your body straight.","Do one pushup and as you come up, shift your weight on the left side of the body, twist to the side while bringing the right arm up towards the…","Lower the arm back to the floor for another pushup and then twist to the other side."],"tips":[],"grip":null,"targets":"the chest, with the abs, the shoulders, the triceps assisting"},"Power Snatch":{"instructions":["Begin with a loaded barbell on the floor. The bar should be close to or touching the shins, and a wide grip should be taken on the bar. The feet…","Begin the first pull by driving through the front of the heels, raising the bar from the ground. The back angle should stay the same until the bar…","Transition into the second pull by extending through the hips knees and ankles, driving the bar up as quickly as possible. The bar should be close to…","As you move your feet into the receiving position, a slightly wider position, pull yourself below the bar as you elevate the bar overhead. The bar…"],"tips":[],"grip":"The bar should be close to or  touching the shins, and a wide grip should be taken on the bar.","targets":"the hamstrings, with the calves, the glutes, the lower back, the quads, the shoulders, the traps, the triceps assisting"},"Smith Machine Flat Bench Press":{"instructions":["Lie down on a flat bench with a dumbbell in one hand resting on top of your thigh. The palm of your hand with the dumbbell in it should be at a…","By using your thighs to help you get the dumbbell up, clean the dumbbell so that you can hold it in front of you with your lifting arm being fully…","Your arm with the weight should have a slight bend on your elbow in order to prevent stress at the biceps tendon. Begin by lowering your arm with the…","Return your lifting arm back to the starting position as you squeeze your chest muscles and breathe out."],"tips":["Keep in mind that  throughout the movement, your lifting arm should remain stationary; the movement  should only occur…"],"grip":"The palm of your hand with the dumbbell in it should be at a neutral  grip.","targets":"the chest"},"Swiss Ball Leg Curl":{"instructions":["Begin on the floor laying on your back with your feet on top of the ball.","Position the ball so that when your legs are extended your ankles are on top of the ball. This will be your starting position.","Raise your hips off of the ground, keeping your weight on the shoulder blades and your feet.","Flex the knees, pulling the ball as close to you as you can, contracting the hamstrings."],"tips":[],"grip":null,"targets":"the hamstrings, with the calves, the glutes assisting"},"High Plank":{"instructions":["Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.","Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."],"tips":[],"grip":null,"targets":"the abs"},"Pull Through":{"instructions":["Begin standing a few feet in front of a low pulley with a rope or handle attached. Face away from the machine, straddling the cable, with your feet…","Begin the movement by reaching through your legs as far as possible, bending at the hips. Keep your knees slightly bent. Keeping your arms straight,…"],"tips":[],"grip":null,"targets":"the glutes, with the hamstrings, the lower back assisting"},"Muscle Snatch":{"instructions":["Begin with a loaded barbell held at the mid thigh position with a wide grip. The feet should be directly below the hips, with the feet turned out as…","Begin the pull by driving through the front of the heels, raising the bar. Transition into the second pull by extending through the hips knees and…","Continue raising the bar to the overhead position, without rebending the knees."],"tips":[],"grip":"Begin with a loaded barbell held at the mid thigh position with a wide  grip.","targets":"the hamstrings, with the glutes, the lower back, the quads, the shoulders, the triceps assisting"},"Standing Leg Curl":{"instructions":["Adjust the machine lever to fit your height and lie with your torso bent at the waist facing forward around 30-45 degrees (since an angled position…","Keeping the torso bent forward, ensure your leg is fully stretched and grab the side handles of the machine. Position your toes straight. This will…","As you exhale, curl your right leg up as far as possible without lifting the upper leg from the pad. Once you hit the fully contracted position, hold…","As you inhale, bring the legs back to the initial position. Repeat for the recommended amount of repetitions."],"tips":[],"grip":null,"targets":"the hamstrings"},"Cable Crunch":{"instructions":["Kneel below a high pulley that contains a rope attachment.","Grasp cable rope attachment and lower the rope until your hands are placed next to your face.","Flex your hips slightly and allow the weight to hyperextend the lower back. This will be your starting position.","With the hips stationary, flex the waist as you contract the abs so that the elbows travel towards the middle of the thighs. Exhale as you perform…"],"tips":["Make sure that  you keep constant tension on the abs throughout the movement. Also, do not  choose a weight so heavy…"],"grip":null,"targets":"the abs"},"Cable Kickback":{"instructions":["Kneel on the floor or an exercise mat and bend at the waist with your arms extended in front of you (perpendicular to the torso) in order to get into…","As you exhale, lift up your right leg until the hamstrings are in line with the back while maintaining the 90-degree angle bend. Contract the glutes…","Go back to the initial position as you inhale and now repeat with the left leg.","Continue to alternate legs until all of the recommended repetitions have been performed."],"tips":["At the end of the movement the upper leg should be parallel to the floor while  the calf should be perpendicular to it."],"grip":null,"targets":"the glutes, with the hamstrings assisting"},"Split Squat":{"instructions":["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck). Your feet should be placed wide apart with…","Lower your body towards the side of your angled foot by bending the knee and hip of your lead leg and while keeping the opposite leg only slightly…","Return to the starting position by extending the hip and knee of the lead leg. Breathe out as you perform this movement.","After performing the recommended amount of reps, repeat the movement with the opposite leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the hamstrings, the lower back assisting"},"Weighted Plank":{"instructions":["Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.","Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."],"tips":[],"grip":null,"targets":"the abs"},"Sprint":{"instructions":["Stand on the ground with one foot resting on a bench or box with your heel close to the edge.","Push off with your foot on top of the bench, extending through the hip and knee.","Land with the opposite foot on top of the box, returning your other foot back to the start position.","Continue alternating from one foot to another to complete the set."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Wall Plank":{"instructions":["Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.","Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."],"tips":[],"grip":null,"targets":"the abs"},"Hang Clean":{"instructions":["Begin with a shoulder width, double overhand or hook grip, with the bar hanging at the mid thigh position. Your back should be straight and inclined…","Begin by aggressively extending through the hips, knees and ankles, driving the weight upward. As you do so, shrug your shoulders towards your ears.","Immediately recover by driving through the heels, keeping the torso upright and elbows up. Continue until you have risen to a standing position."],"tips":[],"grip":"Begin with a shoulder width, double overhand or hook grip, with the bar  hanging at the mid thigh…","targets":"the quads, with the calves, the forearms, the glutes, the hamstrings, the lower back, the shoulders, the traps assisting"},"Sissy Squat":{"instructions":["Standing upright, with feet at shoulder width and toes raised, use one hand to hold onto the beams of a squat rack and the opposite arm to hold a…","As you use one arm to hold yourself, bend at the knees and slowly lower your torso toward the ground by bringing your pelvis and knees forward.…","After your one second hold, use your thigh muscles to bring your torso back up to the starting position. Exhale as you move up.","Repeat for the recommended amount of times."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Water Jug Skull Crusher":{"instructions":["Secure a band to the base of a rack or the bench. Lay on the bench so that the band is lined up with your head.","Take hold of the band, raising your elbows so that the upper arm is perpendicular to the floor. With the elbow flexed, the band should be above your…","Extend through the elbow to straighten your arm, keeping your upper arm in place. Pause at the top of the motion, and return to the starting position."],"tips":[],"grip":null,"targets":"the triceps"},"Low Cable Row":{"instructions":["Grasp a straight bar cable attachment that is attached to a low pulley with a pronated (palms facing your thighs) grip that is slightly less than…","Use your side shoulders to lift the cable bar as you exhale. The bar should be close to the body as you move it up. Continue to lift it until it…","Lower the bar back down slowly to the starting position. Inhale as you perform this portion of the movement.","Repeat for the recommended amount of repetitions."],"tips":["Your elbows should drive the motion. As you lift  the bar, your elbows should always be higher than your forearms."],"grip":"Grasp a straight bar cable attachment that is attached to a low pulley  with a pronated (palms…","targets":"the traps, with the shoulders assisting"},"Arnold Press":{"instructions":["Sit on an exercise bench with back support and hold two dumbbells in front of you at about upper chest level with your palms facing your body and…","Now to perform the movement, raise the dumbbells as you rotate the palms of your hands until they are facing forward.","Continue lifting the dumbbells until your arms are extended above you in straight arm position. Breathe out as you perform this portion of the…","After a second pause at the top, begin to lower the dumbbells to the original position by rotating the palms of your hands towards you."],"tips":["Your arms should be next to your torso. The starting  position should look like the contracted portion of a dumbbell…"],"grip":"Sit on an exercise bench with back support and hold two dumbbells in  front of you at about upper…","targets":"the shoulders, with the triceps assisting"},"Wall Push-Up":{"instructions":["Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length. Move your feet up to a box or…","Next, lower yourself downward until your chest almost touches the floor as you inhale.","Now breathe out and press your upper body back up to the starting position while squeezing your chest.","After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Wide Grip Overhead Press":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Calf Raise":{"instructions":["Place a block about 12 inches in front of a flat bench.","Sit on the bench and place the ball of your feet on the block.","Have someone place a barbell over your upper thighs about 3 inches above your knees and hold it there. This will be your starting position.","Raise up on your toes as high as possible as you squeeze the calves and as you breathe out."],"tips":["To get maximum benefit stretch your calves as far as you can."],"grip":null,"targets":"the calves"},"Standing Landmine Press":{"instructions":["Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.","Raise the bar from the floor, taking it to shoulder height with both hands with your arms extended in front of you. Adopt a wide stance. This will be…","Perform the movement by rotating the trunk and hips as you swing the weight all the way down to one side. Keep your arms extended throughout the…","Reverse the motion to swing the weight all the way to the opposite side."],"tips":[],"grip":null,"targets":"the abs, with the glutes, the lower back, the shoulders assisting"},"Alternate Foot Step":{"instructions":["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck) and stand upright behind an elevated…","Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift…","Step down with the left leg by flexing the hip and knee of the right leg as you inhale. Return to the original standing position by placing the right…","Repeat with the right leg for the recommended amount of repetitions and then perform with the left leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the quads assisting"},"Incline Barbell Bench Press":{"instructions":["Lie back on an incline bench. Using a medium-width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and…","As you breathe in, come down slowly until you feel the bar on you upper chest.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms in the…","Repeat the movement for the prescribed amount of repetitions."],"tips":["it should take at least twice as long to go down than to  come up."],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Seated Cable Row":{"instructions":["Grasp a straight bar cable attachment that is attached to a low pulley with a pronated (palms facing your thighs) grip that is slightly less than…","Use your side shoulders to lift the cable bar as you exhale. The bar should be close to the body as you move it up. Continue to lift it until it…","Lower the bar back down slowly to the starting position. Inhale as you perform this portion of the movement.","Repeat for the recommended amount of repetitions."],"tips":["Your elbows should drive the motion. As you lift  the bar, your elbows should always be higher than your forearms."],"grip":"Grasp a straight bar cable attachment that is attached to a low pulley  with a pronated (palms…","targets":"the traps, with the shoulders assisting"},"High Cable Press":{"instructions":["Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your…","Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the…","After pausing at full extension, return to th starting position, keeping tension on the cables.","You can also execute this movement with your back off the pad, at an incline or decline, or alternate hands."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Leg Press":{"instructions":["Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a medium (shoulder width) foot…","Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of…","As you inhale, slowly lower the platform until your upper and lower legs make a 90-degree angle.","Pushing mainly with the heels of your feet and using the quadriceps go back to the starting position as you exhale."],"tips":["Make sure that you do not lock your knees. Your torso and the legs should  make a perfect 90-degree angle."],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Recumbent Bike":{"instructions":["To begin, seat yourself on the bike and adjust the seat to your height.","Select the desired option from the menu. You may have to start pedaling to turn it on. You can use the manual setting, or you can select a program to…","Recumbent bikes offer convenience, cardiovascular benefits, and have less impact than other activities. A 150 lb person will burn about 230 calories…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Smith Machine Close Grip Bench Press":{"instructions":["Place a flat bench underneath the smith machine. Place the barbell at a height that you can reach when lying down and your arms are almost fully…","As you breathe in, come down slowly until you feel the bar on your middle chest.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your triceps muscles. Lock your arms in…","Repeat the movement for the prescribed amount of repetitions."],"tips":["Make sure that as opposed to a regular bench press, you keep the  elbows close to the torso at all times in order to…"],"grip":"Using a close and pronated grip (palms facing forward) that is around shoulder  width, unlock the…","targets":"the triceps, with the chest, the shoulders assisting"},"Wide Grip Lat Pulldown":{"instructions":["Sit down on a pull-down machine with a wide bar attached to the top pulley. Make sure that you adjust the knee pad of the machine to fit your height.…","Grab the bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance…","As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating…","As you breathe out, bring the bar down until it touches your upper chest by drawing the shoulders and the upper arms down and back. The forearms…"],"tips":["Concentrate on  squeezing the back muscles once you reach the full contracted position. The  upper torso should remain…"],"grip":"Grab the bar with the palms facing forward using the prescribed grip.","targets":"the lats, with the biceps, the mid-back, the shoulders assisting"},"Glute Ham Raise":{"instructions":["Begin by adjusting the equipment to fit your body. Place your feet against the footplate in between the rollers as you lie facedown. Your knees…","Start from the bottom of the movement. Keep your back arched as you begin the movement by flexing the knees. Drive your toes into the foot plate as…","Return to the starting position, keeping your descent under control."],"tips":[],"grip":null,"targets":"the hamstrings, with the calves, the glutes assisting"},"Walking Lunge":{"instructions":["Begin standing with your feet shoulder width apart and a barbell across your upper back.","Step forward with one leg, flexing the knees to drop your hips. Descend until your rear knee nearly touches the ground. Your posture should remain…","Drive through the heel of your lead foot and extend both knees to raise yourself back up.","Step forward with your rear foot, repeating the lunge on the opposite leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Stiff Leg Deadlift":{"instructions":["Begin with a barbell loaded on the floor. Adopt a wide stance, and then bend at the hips to grab the bar. Your hips should be as far back as…","Begin the movement be engaging the hips, driving them forward as you allow the arms to hang straight. Continue until you are standing straight up,…"],"tips":[],"grip":null,"targets":"the hamstrings, with the inner thigh (adductors), the glutes, the lower back assisting"},"Ab Crunch Machine":{"instructions":["Select a light resistance and sit down on the ab machine placing your feet under the pads provided and grabbing the top handles. Your arms should be…","At the same time, begin to lift the legs up as you crunch your upper torso. Breathe out as you perform this movement.","After a second pause, slowly return to the starting position as you breathe in.","Repeat the movement for the prescribed amount of repetitions."],"tips":["Be sure to use a slow and  controlled motion. Concentrate on using your abs to move the weight while  relaxing your…"],"grip":null,"targets":"the abs"},"Reverse Wrist Curl":{"instructions":["Start out by placing a flat bench in front of a low pulley cable that has a straight bar attachment.","Use your arms to grab the cable bar with a narrow to shoulder width supinated grip (palms up) and bring them up so that your forearms are resting…","Start out by curling your wrist upwards and exhaling. Keep the contraction for a second.","Slowly lower your wrists back down to the starting position while inhaling."],"tips":[],"grip":"Use your arms to grab the cable bar with a narrow to shoulder width  supinated grip (palms up) and…","targets":"the forearms"},"L-Sit":{"instructions":["To begin, lie down on a bench with a barbell resting on your chest. Position your legs so they are secure on the extension of the abdominal bench.…","While inhaling, tighten your abdominals and glutes. Simultaneously curl your torso as you do when performing a sit-up and press the barbell to an…","Lower your upper body back down to the starting position while bringing the barbell back down to your torso. Remember to breathe in while lowering…","Repeat for the recommended amount of repetitions."],"tips":["Use your arms to push the barbell out as  you perform this exercise while still focusing on the abdominal muscles."],"grip":null,"targets":"the abs, with the chest, the shoulders, the triceps assisting"},"Explosive Chest Pass":{"instructions":["You will need a partner for this exercise. Lacking one, this movement can be performed against a wall.","Begin facing your partner holding the medicine ball at your torso with both hands.","Pull the ball to your chest, and reverse the motion by extending through the elbows. For sports applications, you can take a step as you throw.","Your partner should catch the ball, and throw it back to you."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Snatch":{"instructions":["Place your feet at a shoulder width stance with the barbell resting right above the connection between the toes and the rest of the foot.","With a palms facing down grip, bend at the knees and keeping the back flat grab the bar using a wider than shoulder width grip. Bring the hips down…","Start pushing the floor as if it were a moving platform with your feet and simultaneously start lifting the barbell keeping it close to your legs.","As the bar reaches the middle of your thighs, push the floor with your legs and lift your body to a complete extension in an explosive motion."],"tips":[],"grip":"With a palms facing down grip, bend at the knees and keeping the back  flat grab the bar using a…","targets":"the quads, with the biceps, the glutes, the hamstrings, the lower back, the shoulders, the traps, the triceps assisting"},"Cable Reverse Crunch":{"instructions":["Connect an ankle strap attachment to a low pulley cable and position a mat on the floor in front of it.","Sit down with your feet toward the pulley and attach the cable to your ankles.","Lie down, elevate your legs and bend your knees at a 90-degree angle. Your legs and the cable should be aligned. If not, adjust the pulley up or down…","With your hands behind your head, bring your knees inward to your torso and elevate your hips off the floor."],"tips":[],"grip":null,"targets":"the abs"},"Backpack Bench Press":{"instructions":["Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other.","Then, using your thighs to help raise the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.","Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. The dumbbells should be just to the…","Then, as you breathe out, use your chest to push the dumbbells up. Lock your arms at the top of the lift and squeeze your chest, hold for a second…"],"tips":["Ideally, lowering the weight should take  about twice as long as raising it."],"grip":"The palms of your hands will be facing each other.","targets":"the chest, with the shoulders, the triceps assisting"},"Dumbbell Front Raise":{"instructions":["Select the weight on a low pulley machine and grasp the single hand cable attachment that is attached to the low pulley with your left hand.","Face away from the pulley and put your arm straight down with the hand cable attachment in front of your thighs at arms' length with the palms of the…","While maintaining the torso stationary (no swinging), lift the left arm to the front with a slight bend on the elbow and the palms of the hand always…","Now as you inhale lower the arm back down slowly to the starting position."],"tips":[],"grip":"Face away from the pulley and put your arm straight down with the hand  cable attachment in front…","targets":"the shoulders"},"High Cable Curl":{"instructions":["Stand up with your torso upright while holding a bar attachment that is attached to a low pulley using a pronated (palms down) and shoulder width…","While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue…","Slowly begin to bring the bar back to starting position as your breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"Stand up with your torso upright while holding a bar attachment that is  attached to a low pulley…","targets":"the biceps, with the forearms assisting"},"Wide Grip Bench Press":{"instructions":["Lie back on a flat bench with feet firm on the floor. Using a wide, pronated (palms forward) grip that is around 3 inches away from shoulder width…","As you breathe in, come down slowly until you feel the bar on your middle chest.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and…","Repeat the movement for the prescribed amount of repetitions."],"tips":["It should take at least twice as long to go down  than to come up."],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Chair Step-Up":{"instructions":["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck) and stand upright behind an elevated…","Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift…","Step down with the left leg by flexing the hip and knee of the right leg as you inhale. Return to the original standing position by placing the right…","Repeat with the right leg for the recommended amount of repetitions and then perform with the left leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the quads assisting"},"Medicine Ball Rotational Throw":{"instructions":["For this exercise you will need a medicine ball and a partner. Stand back to back with your partner, spaced 2-3 feet apart. This will be your…","Hold the ball in front of the trunk. Open the hips and turn the shoulders at the same time as your partner.","For full rotation, you and your partner should twist in the same direction, i.e. counter-clockwise.","Pass the ball to your partner, and both of you can now twist in the opposite direction to repeat the procedure."],"tips":[],"grip":null,"targets":"the abs, with the shoulders assisting"},"Split Jerk":{"instructions":["Standing with the weight racked on the front of the shoulders, begin with the dip. With your feet directly under your hips, flex the knees without…","Go down only slightly, and reverse direction as powerfully as possible. Drive through the heels create as much speed and force as possible, and be…","In the brief moment the feet are not actively driving against the platform, the athlete's effort to push the bar up will drive them down. The feet…","Return to a standing position, bringing the feet together."],"tips":[],"grip":null,"targets":"the quads, with the glutes, the hamstrings, the shoulders, the triceps assisting"},"EZ Bar Curl":{"instructions":["Stand up straight while holding an EZ curl bar at the wide outer handle. The palms of your hands should be facing forward and slightly tilted inward…","Now, while keeping your upper arms stationary, exhale and curl the weights forward while contracting the biceps. Focus on only moving your forearms.","Continue to raise the weight until your biceps are fully contracted and the bar is at shoulder level. Hold the top contracted position for a moment…","Then inhale and slowly lower the bar back to the starting position."],"tips":[],"grip":"The palms of your hands should be facing forward and slightly tilted inward due  to the shape of…","targets":"the biceps"},"Preacher Curl":{"instructions":["To perform this movement you will need a preacher bench and an E-Z bar. Grab the E-Z curl bar at the close inner handle (either have someone hand you…","With the upper arms positioned against the preacher bench pad and the chest against it, hold the E-Z Curl Bar at shoulder length. This will be your…","As you breathe in, slowly lower the bar until your upper arm is extended and the biceps is fully stretched.","As you exhale, use the biceps to curl the weight up until your biceps is fully contracted and the bar is at shoulder height. Squeeze the biceps hard…"],"tips":[],"grip":"The palm of your hands should be facing forward and they  should be slightly tilted inwards due to…","targets":"the biceps"},"Concentration Curl":{"instructions":["Sit down on a flat bench with a barbell or E-Z Bar in front of you in between your legs. Your legs should be spread with the knees bent and the feet…","Use your arms to pick the barbell up and place the back of your upper arms on top of your inner thighs (around three and a half inches away from the…","While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Only the forearms should move.…","Slowly begin to bring the barbell back to starting position as your breathe in."],"tips":["Your arm should be extended at arms length and the  barbell should be above the floor. This will be your starting…"],"grip":"A supinated grip closer than shoulder width is needed to  perform this exercise.","targets":"the biceps"},"Overhead Rope Extension":{"instructions":["Attach a rope to the bottom pulley of the pulley machine.","Grasping the rope with both hands, extend your arms with your hands directly above your head using a neutral grip (palms facing each other). Your…","Slowly lower the rope behind your head as you hold the upper arms stationary. Inhale as you perform this movement and pause when your triceps are…","Return to the starting position by flexing your triceps as you breathe out."],"tips":[],"grip":"Grasping the rope with both hands, extend your arms with your hands  directly above your head using…","targets":"the triceps"},"Floor Press":{"instructions":["Adjust the j-hooks so they are at the appropriate height to rack the bar. Begin lying on the floor with your head near the end of a power rack.…","Lower the bar towards the bottom of your chest or upper stomach, squeezing the bar and attempting to pull it apart as you do so. Ensure that you tuck…","Press the bar back up as fast as you can, keeping the bar, your wrists, and elbows in line as you do so."],"tips":[],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Reverse Plank":{"instructions":["Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.","Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."],"tips":[],"grip":null,"targets":"the abs"},"Assisted Pistol Squat":{"instructions":["Pick up a kettlebell with two hands and hold it by the horns. Hold one leg off of the floor and squat down on the other.","Squat down by flexing the knee and sitting back with the hips, holding the kettlebell up in front of you.","Hold the bottom position for a second and then reverse the motion, driving through the heel and keeping your head and chest up.","Lower yourself again and repeat."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the shoulders assisting"},"Renegade Row":{"instructions":["Place two kettlebells on the floor about shoulder width apart. Position yourself on your toes and your hands as though you were doing a pushup, with…","Push one kettlebell into the floor and row the other kettlebell, retracting the shoulder blade of the working side as you flex the elbow, pulling it…","Then lower the kettlebell to the floor and begin the kettlebell in the opposite hand. Repeat for several reps."],"tips":[],"grip":null,"targets":"the mid-back, with the abs, the biceps, the chest, the lats, the triceps assisting"},"Band Pull Apart":{"instructions":["Begin with your arms extended straight out in front of you, holding the band with both hands.","Initiate the movement by performing a reverse fly motion, moving your hands out laterally to your sides.","Keep your elbows extended as you perform the movement, bringing the band to your chest. Ensure that you keep your shoulders back during the exercise.","Pause as you complete the movement, returning to the starting position under control."],"tips":[],"grip":null,"targets":"the shoulders, with the mid-back, the traps assisting"},"Rowing Ergometer":{"instructions":["To begin, seat yourself on the rower. Make sure that your heels are resting comfortably against the base of the foot pedals and that the straps are…","There are three phases of movement when using a rower. The first phase is when you come forward on the rower. Your knees are bent and against your…","The recovery phase simply involves straightening your arms, bending the knees, and bringing your body forward again as you transition back into the…"],"tips":[],"grip":null,"targets":"the quads, with the biceps, the calves, the glutes, the hamstrings, the lower back, the mid-back assisting"},"Goblet Squat":{"instructions":["Stand holding a light kettlebell by the horns close to your chest. This will be your starting position.","Squat down between your legs until your hamstrings are on your calves. Keep your chest and head up and your back straight.","At the bottom position, pause and use your elbows to push your knees out. Return to the starting position, and repeat for 10-20 repetitions."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the shoulders assisting"},"Russian Twist":{"instructions":["Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the…","Elevate your upper body so that it creates an imaginary V-shape with your thighs. Your arms should be fully extended in front of you perpendicular to…","Twist your torso to the right side until your arms are parallel with the floor while breathing out.","Hold the contraction for a second and move back to the starting position while breathing out. Now move to the opposite side performing the same…"],"tips":[],"grip":null,"targets":"the abs, with the lower back assisting"},"Smith Machine Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Lateral Shuffle":{"instructions":["Stand to one side of the box with your left foot resting on the middle of it.","To begin, jump up and over to the other side of the box, landing with your right foot on top of the box and your left foot on the floor. Swing your…","Continue shuffling back and forth across the box."],"tips":[],"grip":null,"targets":"the quads, with the outer hip (abductors), the inner thigh (adductors), the calves, the hamstrings assisting"},"Dead Bug":{"instructions":["Begin lying on your back with your hands extended above you toward the ceiling.","Bring your feet, knees, and hips up to 90 degrees.","Exhale hard to bring your ribcage down and flatten your back onto the floor, rotating your pelvis up and squeezing your glutes. Hold this position…","Initiate the exercise by extending one leg, straightening the knee and hip to bring the leg just above the ground."],"tips":[],"grip":null,"targets":"the abs"},"Decline Chest Press Machine":{"instructions":["Position a decline bench in the rack so that the bar will be above your chest. Load an appropriate weight and take your place on the bench.","Rotate the bar to unhook it from the rack and fully extend your arms. Your back should be slightly arched and your shoulder blades retracted. This…","Begin the movement by flexing your arms, lowering the bar to your chest.","Pause briefly, and then extend your arms to push the weight back to the starting position."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Sumo Deadlift":{"instructions":["Begin with a bar loaded on the ground. Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the…","Take a breath, and then lower your hips, looking forward with your head with your chest up. Drive through the floor, spreading your feet apart, with…","As the bar passes through the knees, lean back and drive the hips into the bar, pulling your shoulder blades together.","Return the weight to the ground by bending at the hips and controlling the weight on the way down."],"tips":[],"grip":"Bend at the hips to grip the bar.","targets":"the hamstrings, with the inner thigh (adductors), the forearms, the glutes, the lower back, the mid-back, the quads, the traps assisting"},"Cable Shrugs":{"instructions":["Grasp a cable bar attachment that is attached to a low pulley with a shoulder width or slightly wider overhand (palms facing down) grip.","Stand erect close to the pulley with your arms extended in front of you holding the bar. This will be your starting position.","Lift the bar by elevating the shoulders as high as possible as you exhale. Hold the contraction at the top for a second. Only the shoulders should be…","Lower the bar back to the original position."],"tips":["The arms should  remain extended at all times. Refrain from using the biceps to help lift the  bar."],"grip":"Grasp a cable bar attachment that is attached to a low pulley with a  shoulder width or slightly…","targets":"the traps"},"Curved Treadmill Sprint":{"instructions":["Stand on the ground with one foot resting on a bench or box with your heel close to the edge.","Push off with your foot on top of the bench, extending through the hip and knee.","Land with the opposite foot on top of the box, returning your other foot back to the start position.","Continue alternating from one foot to another to complete the set."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Backpack Hip Thrust":{"instructions":["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can…","Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.","Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder…"],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"Cable Shrug":{"instructions":["Stand up straight with your feet at shoulder width as you hold a barbell with both hands in front of you using a pronated grip (palms facing the…","Raise your shoulders up as far as you can go as you breathe out and hold the contraction for a second.","Slowly return to the starting position as you breathe in.","Repeat for the recommended amount of repetitions."],"tips":["Your hands should be a little wider than shoulder width apart. You can use  wrist wraps for this exercise for a better…"],"grip":"Stand up straight with your feet at shoulder width as you hold a barbell  with both hands in front…","targets":"the traps"},"Behind-the-Back Wrist Curl":{"instructions":["Start out by placing a flat bench in front of a low pulley cable that has a straight bar attachment.","Use your arms to grab the cable bar with a narrow to shoulder width supinated grip (palms up) and bring them up so that your forearms are resting…","Start out by curling your wrist upwards and exhaling. Keep the contraction for a second.","Slowly lower your wrists back down to the starting position while inhaling."],"tips":[],"grip":"Use your arms to grab the cable bar with a narrow to shoulder width  supinated grip (palms up) and…","targets":"the forearms"},"Overhand Barbell Row":{"instructions":["Grasp a barbell with an overhand grip that is slightly less than shoulder width. The bar should be resting on the top of your thighs with your arms…","Now exhale and use the sides of your shoulders to lift the bar, raising your elbows up and to the side. Keep the bar close to your body as you raise…","Lower the bar back down slowly to the starting position. Inhale as you perform this portion of the movement.","Repeat for the recommended amount of repetitions."],"tips":["Your elbows  should drive the motion, and should always be higher than your forearms.  Remember to keep your torso…"],"grip":"Grasp a barbell with an overhand grip that is slightly less than shoulder  width.","targets":"the shoulders, with the traps assisting"},"Pallof Press":{"instructions":["Connect a standard handle to a tower, and—if possible—position the cable to shoulder height. If not, a low pulley will suffice.","With your side to the cable, grab the handle with both hands and step away from the tower. You should be approximately arm's length away from the…","With your feet positioned hip-width apart and knees slightly bent, hold the cable to the middle of your chest. This will be your starting position.","Press the cable away from your chest, fully extending both arms. You core should be tight and engaged."],"tips":[],"grip":null,"targets":"the abs, with the chest, the shoulders, the triceps assisting"},"Decline Push-Up":{"instructions":["Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length. Move your feet up to a box or…","Next, lower yourself downward until your chest almost touches the floor as you inhale.","Now breathe out and press your upper body back up to the starting position while squeezing your chest.","After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Body Saw":{"instructions":["Grab a dumbbell with each hand and stand up erect.","Clean (lift) the dumbbells to the chest/shoulder level and then rotate your wrists so that your palms are facing towards you as if you were getting…","Now start extending your left arm overhead as you rotate the wrist so that the palm of your hand faces forward as you go up. Your elbows should come…","Once you reach the top position breathe in. Then, with the weight fully extended overhead and you bent over to your right hand side, begin the…"],"tips":[],"grip":"Now start extending your left arm overhead as you rotate the wrist so  that the palm of your hand…","targets":"the shoulders, with the abs, the triceps assisting"},"Drag Curl":{"instructions":["Grab a barbell with a supinated grip (palms facing forward) and get your elbows close to your torso and back. This will be your starting position.","As you exhale, curl the bar up while keeping the elbows to the back as you \"Drag\" the bar up by keeping it in contact with your torso.","Slowly go back to the starting position as you keep the bar in contact with the torso at all times.","Repeat for the recommended amount of repetitions."],"tips":["As you  can see, you will not be keeping the elbows pinned to your sides, but instead  you will be bringing them back.…"],"grip":"Grab a barbell with a supinated grip (palms facing forward) and get your  elbows close to your…","targets":"the biceps, with the forearms assisting"},"Single Arm Cable Curl":{"instructions":["Start out by grabbing single handle next to the low pulley machine. Make sure you are far enough from the machine so that your arm is supporting the…","Make sure that your upper arm is stationary, perpendicular to the floor with elbows in and palms facing forward. Your non lifting arm should be…","Slowly begin to curl the single handle upwards while keeping the upper arm stationary until your forearm touches your bicep while exhaling.","Hold the contraction position as you squeeze the bicep and then lower the single handle back down to the starting position as you inhale."],"tips":["Only  the forearm should move."],"grip":"Make sure that your upper arm is stationary, perpendicular to the floor  with elbows in and palms…","targets":"the biceps"},"Single Arm Lat Pulldown":{"instructions":["Select an appropriate weight and adjust the knee pad to help keep you down. Grasp the handle with a pronated grip. This will be your starting…","Pull the handle down, squeezing your elbow to your side as you flex the elbow.","Pause at the bottom of the motion, and then slowly return the handle to the starting position.","For multiple repetitions, avoid completely returning the weight to keep tension on the muscles being worked."],"tips":[],"grip":"Grasp the handle with a pronated grip.","targets":"the lats, with the biceps, the mid-back assisting"},"Landmine Hack Squat":{"instructions":["Stand up straight while holding a barbell behind you at arms length and your feet at shoulder width. This will be your starting position.","While keeping your head and eyes up and back straight, squat until your upper thighs are parallel to the floor. Breathe in as you slowly go down.","Pressing mainly with the heel of the foot and squeezing the thighs, go back up as you breathe out.","Repeat for the recommended amount of repetitions."],"tips":["A shoulder width grip is best with the palms  of your hands facing back. You can use wrist wraps for this exercise for…"],"grip":"Tip: A shoulder width grip is best with the palms  of your hands facing back.","targets":"the quads, with the calves, the forearms, the hamstrings assisting"},"Water Bottle Side Bend":{"instructions":["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck). Your feet should be shoulder width apart.…","While keeping your back straight and your head up, bend only at the waist to the right as far as possible. Breathe in as you bend to the side. Then…","Now repeat the movement but bending to the left instead. Hold for a second and come back to the starting position.","Repeat for the recommended amount of repetitions."],"tips":["Keep  the rest of the body stationary."],"grip":null,"targets":"the abs, with the lower back assisting"},"Assisted Pull-Up":{"instructions":["Choke the band around the center of the pullup bar. You can use different bands to provide varying levels of assistance.","Pull the end of the band down, and place one bent knee into the loop, ensuring it won't slip out. Take a medium to wide grip on the bar. This will be…","Pull yourself upward by contracting the lats as you flex the elbow. The elbow should be driven to your side. Pull to the front, attempting to get…","After a brief pause, return to the starting position."],"tips":[],"grip":"Take a medium to wide grip on the bar.","targets":"the lats, with the abs, the forearms, the mid-back assisting"},"Standing Cable Chest Press":{"instructions":["Position dual pulleys to chest height and select an appropriate weight. Stand a foot or two in front of the cables, holding one in each hand. You can…","Position the upper arm at a 90 degree angle with the shoulder blades together. This will be your starting position.","Keeping the rest of the body stationary, extend through the elbows to press the handles forward, drawing them together in front of you.","Pause at the top of the motion, and return to the starting position."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Dumbbell Shrug":{"instructions":["Stand erect with a dumbbell on each hand (palms facing your torso), arms extended on the sides.","Lift the dumbbells by elevating the shoulders as high as possible while you exhale. Hold the contraction at the top for a second. Only the shoulders…","Lower the dumbbells back to the original position.","Repeat for the recommended amount of repetitions."],"tips":["The arms should  remain extended at all times. Refrain from using the biceps to help lift the  dumbbells."],"grip":"Stand erect with a dumbbell on each hand (palms facing your torso), arms  extended on the sides.","targets":"the traps"},"Smith Machine Front Squat":{"instructions":["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once…","Lift the bar off the rack by first pushing with your legs and at the same time straightening your torso.","Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all…","Begin to slowly lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Cable Lateral Raise":{"instructions":["Stand in the middle of two low pulleys that are opposite to each other and place a flat bench right behind you (in perpendicular fashion to you; the…","Now sit at the edge of the flat bench behind you with your feet placed in front of your knees.","Bend forward while keeping your back flat and rest your torso on the thighs.","Have someone give you the single handles attached to the pulleys. Grasp the left pulley with the right hand and the right pulley with the left after…"],"tips":["Maintain upper  arms perpendicular to torso and a fixed elbow position (10 degree to 30 degree  angle) throughout…"],"grip":"The pulleys should run under your knees and your arms will  be extended with palms facing each…","targets":"the shoulders, with the mid-back, the traps assisting"},"Towel Hamstring Curl":{"instructions":["Secure a band close to the ground and place a bench a couple feet away from it.","Seat yourself on the bench and secure the band behind your ankles, beginning with your legs straight. This will be your starting position.","Flex the knees, bringing your feet towards the bench. You may need to lean back slightly to keep your feet from striking the floor.","Pause at the completion of the movement, and then slowly return to the starting position."],"tips":[],"grip":null,"targets":"the hamstrings"},"Hip Abductor Machine":{"instructions":["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can…","Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.","Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder…"],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"Nordic Hamstring Curl":{"instructions":["Secure a band close to the ground and place a bench a couple feet away from it.","Seat yourself on the bench and secure the band behind your ankles, beginning with your legs straight. This will be your starting position.","Flex the knees, bringing your feet towards the bench. You may need to lean back slightly to keep your feet from striking the floor.","Pause at the completion of the movement, and then slowly return to the starting position."],"tips":[],"grip":null,"targets":"the hamstrings"},"Tate Press":{"instructions":["Lie down on a flat bench with a dumbbell in each hand on top of your thighs. The palms of your hand will be facing each other.","By using your thighs to help you get the dumbbells up, clean the dumbbells one arm at a time so that you can hold them in front of you at shoulder…","Keeping the upper arms stationary, slowly move the dumbbells in and down in a semi circular motion until they touch the upper chest while inhaling.…","As you breathe out, move the dumbbells up using your triceps and the same semi-circular motion but in reverse. Attempt to keep the dumbbells together…"],"tips":["It should take at least twice as  long to go down than to come up."],"grip":"The palms of your hand will be facing each other.","targets":"the triceps, with the chest, the shoulders assisting"},"Inverted Row":{"instructions":["Position a bar in a rack to about waist height. You can also use a smith machine.","Take a wider than shoulder width grip on the bar and position yourself hanging underneath the bar. Your body should be straight with your heels on…","Begin by flexing the elbow, pulling your chest towards the bar. Retract your shoulder blades as you perform the movement.","Pause at the top of the motion, and return yourself to the start position."],"tips":[],"grip":"Take a wider than shoulder width grip on the bar and position yourself  hanging underneath the bar.","targets":"the mid-back, with the lats assisting"},"Incline Dumbbell Bench Press":{"instructions":["Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other.","Then, using your thighs to help raise the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.","Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. The dumbbells should be just to the…","Then, as you breathe out, use your chest to push the dumbbells up. Lock your arms at the top of the lift and squeeze your chest, hold for a second…"],"tips":["Ideally, lowering the weight should take  about twice as long as raising it."],"grip":"The palms of your hands will be facing each other.","targets":"the chest, with the shoulders, the triceps assisting"},"Smith Machine Military Press":{"instructions":["Sit on a Military Press Bench with a bar behind your head and either have a spotter give you the bar (better on the rotator cuff this way) or pick it…","Once you pick up the barbell with the correct grip length, lift the bar up over your head by locking your arms. Hold at about shoulder level and…","Lower the bar down to the collarbone slowly as you inhale.","Lift the bar back up to the starting position as you exhale."],"tips":["Your grip  should be wider than shoulder width and it should create a 90-degree angle  between the forearm and the…"],"grip":"Once you pick up the barbell with the correct grip length, lift the bar  up over your head by…","targets":"the shoulders, with the triceps assisting"},"Handstand Push-Up":{"instructions":["With your back to the wall bend at the waist and place both hands on the floor at shoulder width.","Kick yourself up against the wall with your arms straight. Your body should be upside down with the arms and legs fully extended. Keep your whole…","Slowly lower yourself to the ground as you inhale until your head almost touches the floor.","Push yourself back up slowly as you exhale until your elbows are nearly locked."],"tips":["If doing this for the first time, have a  spotter help you. Also, make sure that you keep facing the wall with your…"],"grip":null,"targets":"the shoulders, with the triceps assisting"},"Straight Bar Pushdown":{"instructions":["Place a dumbbell standing up on a flat bench.","Ensuring that the dumbbell stays securely placed at the top of the bench, lie perpendicular to the bench (torso across it as in forming a cross) with…","Grasp the dumbbell with both hands and hold it straight over your chest at arms length. Both palms should be pressing against the underside one of…","While keeping your arms straight, lower the weight slowly in an arc behind your head while breathing in until you feel a stretch on the chest."],"tips":[],"grip":"Both palms should be pressing against the underside one of the  sides of the dumbbell.","targets":"the chest, with the lats, the shoulders, the triceps assisting"},"Seated Shoulder Press Machine":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Resistance Towel Pushdown":{"instructions":["Start by setting a bar attachment (straight or e-z) on a high pulley machine.","Facing the bar attachment, grab it with the palms facing up (supinated grip) at shoulder width. Lower the bar by using your lats until your arms are…","Slowly elevate the bar attachment up as you inhale so it is aligned with your chest. Only the forearms should move and the elbows/upper arms should…","Then begin to lower the cable bar back down to the original staring position while exhaling and contracting the triceps hard."],"tips":["Elbows should be in by your sides and your  feet should be shoulder width apart from each other. This is the starting …"],"grip":"Facing the bar attachment, grab it with the palms facing up (supinated  grip) at shoulder width.","targets":"the triceps"},"Forward Lunge":{"instructions":["Attach a dual handled chain or rope attachment to the sled. You should be facing away from the sled, holding a handle in each hand.","Begin the movement by moving forward for one step. Leaning forward, extend through the legs and hips to move, pausing with each step to extend…"],"tips":[],"grip":null,"targets":"the chest, with the calves, the glutes, the hamstrings, the quads, the shoulders, the triceps assisting"},"Hack Squat (Barbell)":{"instructions":["Stand up straight while holding a barbell behind you at arms length and your feet at shoulder width. This will be your starting position.","While keeping your head and eyes up and back straight, squat until your upper thighs are parallel to the floor. Breathe in as you slowly go down.","Pressing mainly with the heel of the foot and squeezing the thighs, go back up as you breathe out.","Repeat for the recommended amount of repetitions."],"tips":["A shoulder width grip is best with the palms  of your hands facing back. You can use wrist wraps for this exercise for…"],"grip":"Tip: A shoulder width grip is best with the palms  of your hands facing back.","targets":"the quads, with the calves, the forearms, the hamstrings assisting"},"Inside Circles":{"instructions":["Stand up and extend your arms straight out by the sides. The arms should be parallel to the floor and perpendicular (90-degree angle) to your torso.…","Slowly start to make circles of about 1 foot in diameter with each outstretched arm. Breathe normally as you perform the movement.","Continue the circular motion of the outstretched arms for about ten seconds. Then reverse the movement, going the opposite direction."],"tips":[],"grip":null,"targets":"the shoulders, with the traps assisting"},"Band Front Squat":{"instructions":["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once…","Lift the bar off the rack by first pushing with your legs and at the same time straightening your torso.","Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all…","Begin to slowly lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Band Lateral Shuffle":{"instructions":["Stand to one side of the box with your left foot resting on the middle of it.","To begin, jump up and over to the other side of the box, landing with your right foot on top of the box and your left foot on the floor. Swing your…","Continue shuffling back and forth across the box."],"tips":[],"grip":null,"targets":"the quads, with the outer hip (abductors), the inner thigh (adductors), the calves, the hamstrings assisting"},"Band Romanian Deadlift":{"instructions":["Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width.","Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.","Keeping your back and arms completely straight at all times, use your hips to lift the bar as you exhale.","Once you are standing completely straight up, lower the bar by pushing the hips back, only slightly bending the knees, unlike when squatting."],"tips":["Depending  on the weight used, you may need wrist wraps to perform the exercise and also a  raised platform in order to…"],"grip":"Put a barbell in front of you on the ground and grab it using a pronated  (palms facing down) grip…","targets":"the hamstrings, with the calves, the glutes, the lower back assisting"},"Tall Kneeling Pallof Press":{"instructions":["Connect a standard handle to a tower, and—if possible—position the cable to shoulder height. If not, a low pulley will suffice.","With your side to the cable, grab the handle with both hands and step away from the tower. You should be approximately arm's length away from the…","With your feet positioned hip-width apart and knees slightly bent, hold the cable to the middle of your chest. This will be your starting position.","Press the cable away from your chest, fully extending both arms. You core should be tight and engaged."],"tips":[],"grip":null,"targets":"the abs, with the chest, the shoulders, the triceps assisting"},"Plate Loaded Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Lean-Away Cable Lateral Raise":{"instructions":["Stand in the middle of two low pulleys that are opposite to each other and place a flat bench right behind you (in perpendicular fashion to you; the…","Now sit at the edge of the flat bench behind you with your feet placed in front of your knees.","Bend forward while keeping your back flat and rest your torso on the thighs.","Have someone give you the single handles attached to the pulleys. Grasp the left pulley with the right hand and the right pulley with the left after…"],"tips":["Maintain upper  arms perpendicular to torso and a fixed elbow position (10 degree to 30 degree  angle) throughout…"],"grip":"The pulleys should run under your knees and your arms will  be extended with palms facing each…","targets":"the shoulders, with the mid-back, the traps assisting"},"Standing Cable Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Wrist Roller":{"instructions":["To begin, stand straight up grabbing a wrist roller using a pronated grip (palms facing down). Your feet should be shoulder width apart.","Slowly lift both arms until they are fully extended and parallel to the floor in front of you. Note: Make sure the rope is not wrapped around the…","Rotate one wrist at a time in an upward motion to bring the weight up to the bar by rolling the rope around the roller.","Once the weight has reached the bar, slowly begin to lower the weight back down by rotating the wrist in a downward motion until the weight reaches…"],"tips":[],"grip":"To begin, stand straight up grabbing a wrist roller using a pronated grip  (palms facing down).","targets":"the forearms, with the shoulders assisting"},"Bench Dip":{"instructions":["Sit securely in a dip machine, select the weight and firmly grasp the handles.","Now keep your elbows in at your sides in order to place emphasis on the triceps. The elbows should be bent at a 90 degree angle.","As you contract the triceps, extend your arms downwards as you exhale.","Now slowly let your arms come back up to the starting position as you inhale."],"tips":["At the bottom of the movement, focus on keeping a little bend in your arms  to keep tension on the triceps muscle."],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Chest Dip":{"instructions":["Sit securely in a dip machine, select the weight and firmly grasp the handles.","Now keep your elbows in at your sides in order to place emphasis on the triceps. The elbows should be bent at a 90 degree angle.","As you contract the triceps, extend your arms downwards as you exhale.","Now slowly let your arms come back up to the starting position as you inhale."],"tips":["At the bottom of the movement, focus on keeping a little bend in your arms  to keep tension on the triceps muscle."],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Trap Bar Shrug":{"instructions":["Stand up straight with your feet at shoulder width as you hold a barbell with both hands in front of you using a pronated grip (palms facing the…","Raise your shoulders up as far as you can go as you breathe out and hold the contraction for a second.","Slowly return to the starting position as you breathe in.","Repeat for the recommended amount of repetitions."],"tips":["Your hands should be a little wider than shoulder width apart. You can use  wrist wraps for this exercise for a better…"],"grip":"Stand up straight with your feet at shoulder width as you hold a barbell  with both hands in front…","targets":"the traps"},"Superman":{"instructions":["To begin, lie straight and face down on the floor or exercise mat. Your arms should be fully extended in front of you. This is the starting position.","Simultaneously raise your arms, legs, and chest off of the floor and hold this contraction for 2 seconds. Note: When holding the contracted position,…","Slowly begin to lower your arms, legs and chest back down to the starting position while inhaling.","Repeat for the recommended amount of repetitions prescribed in your program."],"tips":["Squeeze your lower back to get the best  results from this exercise. Remember to exhale during this movement."],"grip":null,"targets":"the lower back, with the glutes, the hamstrings assisting"},"Sit-Up":{"instructions":["Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the…","Place your hands behind your head and lock them together by clasping your fingers. This is the starting position.","Elevate your upper body so that it creates an imaginary V-shape with your thighs. Breathe out when performing this part of the exercise.","Once you feel the contraction for a second, lower your upper body back down to the starting position while inhaling."],"tips":[],"grip":null,"targets":"the abs"},"Towel Body Saw":{"instructions":["Grab a dumbbell with each hand and stand up erect.","Clean (lift) the dumbbells to the chest/shoulder level and then rotate your wrists so that your palms are facing towards you as if you were getting…","Now start extending your left arm overhead as you rotate the wrist so that the palm of your hand faces forward as you go up. Your elbows should come…","Once you reach the top position breathe in. Then, with the weight fully extended overhead and you bent over to your right hand side, begin the…"],"tips":[],"grip":"Now start extending your left arm overhead as you rotate the wrist so  that the palm of your hand…","targets":"the shoulders, with the abs, the triceps assisting"},"Reverse Grip Bench Press":{"instructions":["Position a bench inside a power rack, with the bar set to the correct height. Begin by anchoring bands either to band pegs or to the top of the rack.…","Lie on the bench, tuck your feet underneath you and arch your back. Using the bar to help support your weight, lift your shoulder off the bench and…","Pull the bar out of the rack without protracting your shoulders. Focus on squeezing the bar and trying to pull it apart. Lower the bar to your lower…","Pause when the barbell touches your torso, and then drive the bar up with as much force as possible. The elbows should be tucked in until lockout."],"tips":[],"grip":"However wide your grip, it should cover the ring on the bar.","targets":"the triceps, with the chest, the forearms, the lats, the mid-back, the shoulders assisting"},"Band Hammer Curl":{"instructions":["Stand up with your torso upright and a dumbbell in each hand being held at arms length. The elbows should be close to the torso.","The palms of the hands should be facing your torso. This will be your starting position.","While holding the upper arm stationary, curl the right weight forward while contracting the biceps as you breathe out. Continue the movement until…","Slowly begin to bring the dumbbells back to starting position as your breathe in."],"tips":["Only the  forearms should move."],"grip":"The palms of the hands should be facing your torso.","targets":"the biceps, with the forearms assisting"},"Box Jump":{"instructions":["Assume a comfortable standing position, with a short box positioned next to you. This will be your starting position.","Quickly dip into a quarter squat to initiate the stretch reflex, and immediately reverse direction to jump up and to the side.","Bring your knees high enough to ensure your feet have good clearance over the box.","Land on the center of the box, using your legs to absorb the impact."],"tips":[],"grip":null,"targets":"the inner thigh (adductors), with the outer hip (abductors), the calves, the glutes, the hamstrings, the quads assisting"},"Stair Calf Raise":{"instructions":["Place a block about 12 inches in front of a flat bench.","Sit on the bench and place the ball of your feet on the block.","Have someone place a barbell over your upper thighs about 3 inches above your knees and hold it there. This will be your starting position.","Raise up on your toes as high as possible as you squeeze the calves and as you breathe out."],"tips":["To get maximum benefit stretch your calves as far as you can."],"grip":null,"targets":"the calves"},"Arm Circles":{"instructions":["Stand up and extend your arms straight out by the sides. The arms should be parallel to the floor and perpendicular (90-degree angle) to your torso.…","Slowly start to make circles of about 1 foot in diameter with each outstretched arm. Breathe normally as you perform the movement.","Continue the circular motion of the outstretched arms for about ten seconds. Then reverse the movement, going the opposite direction."],"tips":[],"grip":null,"targets":"the shoulders, with the traps assisting"},"Chair Dips":{"instructions":["For this exercise you will need to place a bench behind your back. With the bench perpendicular to your body, and while looking away from it, hold on…","Slowly lower your body as you inhale by bending at the elbows until you lower yourself far enough to where there is an angle slightly smaller than 90…","Using your triceps to bring your torso up again, lift yourself back to the starting position.","Repeat for the recommended amount of repetitions."],"tips":["Keep the elbows as close as  possible throughout the movement. Forearms should always be pointing down."],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Hammer Grip Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Standing Cable Crunch":{"instructions":["Kneel below a high pulley that contains a rope attachment.","Grasp cable rope attachment and lower the rope until your hands are placed next to your face.","Flex your hips slightly and allow the weight to hyperextend the lower back. This will be your starting position.","With the hips stationary, flex the waist as you contract the abs so that the elbows travel towards the middle of the thighs. Exhale as you perform…"],"tips":["Make sure that  you keep constant tension on the abs throughout the movement. Also, do not  choose a weight so heavy…"],"grip":null,"targets":"the abs"},"Wrist Curl":{"instructions":["Start out by placing a flat bench in front of a low pulley cable that has a straight bar attachment.","Use your arms to grab the cable bar with a narrow to shoulder width supinated grip (palms up) and bring them up so that your forearms are resting…","Start out by curling your wrist upwards and exhaling. Keep the contraction for a second.","Slowly lower your wrists back down to the starting position while inhaling."],"tips":[],"grip":"Use your arms to grab the cable bar with a narrow to shoulder width  supinated grip (palms up) and…","targets":"the forearms"},"Air Bike":{"instructions":["To begin, seat yourself on the bike and adjust the seat to your height.","Select the desired option from the menu. You may have to start pedaling to turn it on. You can use the manual setting, or you can select a program to…","Recumbent bikes offer convenience, cardiovascular benefits, and have less impact than other activities. A 150 lb person will burn about 230 calories…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Band Push-Up":{"instructions":["Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length. Move your feet up to a box or…","Next, lower yourself downward until your chest almost touches the floor as you inhale.","Now breathe out and press your upper body back up to the starting position while squeezing your chest.","After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Push Press to Chest Drive":{"instructions":["Get into pushup position on the toes with your hands just outside of shoulder width.","Perform a pushup by allowing the elbows to flex. As you descend, keep your body straight.","Do one pushup and as you come up, shift your weight on the left side of the body, twist to the side while bringing the right arm up towards the…","Lower the arm back to the floor for another pushup and then twist to the other side."],"tips":[],"grip":null,"targets":"the chest, with the abs, the shoulders, the triceps assisting"},"Landmine Squat":{"instructions":["Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.","Raise the bar from the floor, taking it to shoulder height with both hands with your arms extended in front of you. Adopt a wide stance. This will be…","Perform the movement by rotating the trunk and hips as you swing the weight all the way down to one side. Keep your arms extended throughout the…","Reverse the motion to swing the weight all the way to the opposite side."],"tips":[],"grip":null,"targets":"the abs, with the glutes, the lower back, the shoulders assisting"},"Sandbag Carry":{"instructions":["To load sandbags or other objects, begin with the implements placed a distance from the loading platform, typically 50 feet.","Begin by lifting the sandbag. Sandbags are extremely awkward, and the manner of lifting them can vary depending on the particular sandbag used. Reach…","Move as quickly as possible to the platform, and load it, extending through your hips, knees, and ankles to get it as high as possible. Place it onto…","Return to the starting position to retrieve the next sandbag, and repeat until the event is completed."],"tips":[],"grip":null,"targets":"the quads, with the abs, the biceps, the calves, the forearms, the glutes, the hamstrings, the lower back, the mid-back, the shoulders, the traps assisting"},"Band Straight Arm Pulldown":{"instructions":["Place a dumbbell standing up on a flat bench.","Ensuring that the dumbbell stays securely placed at the top of the bench, lie perpendicular to the bench (torso across it as in forming a cross) with…","Grasp the dumbbell with both hands and hold it straight over your chest at arms length. Both palms should be pressing against the underside one of…","While keeping your arms straight, lower the weight slowly in an arc behind your head while breathing in until you feel a stretch on the chest."],"tips":[],"grip":"Both palms should be pressing against the underside one of the  sides of the dumbbell.","targets":"the chest, with the lats, the shoulders, the triceps assisting"},"Kettlebell Goblet Squat":{"instructions":["Stand holding a light kettlebell by the horns close to your chest. This will be your starting position.","Squat down between your legs until your hamstrings are on your calves. Keep your chest and head up and your back straight.","At the bottom position, pause and use your elbows to push your knees out. Return to the starting position, and repeat for 10-20 repetitions."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the shoulders assisting"},"Seated Dumbbell Press":{"instructions":["Grab a couple of dumbbells and sit on a military press bench or a utility bench that has a back support on it as you place the dumbbells upright on…","Clean the dumbbells up one at a time by using your thighs to bring the dumbbells up to shoulder height at each side.","Rotate the wrists so that the palms of your hands are facing forward. This is your starting position.","As you exhale, push the dumbbells up until they touch at the top."],"tips":[],"grip":"Rotate the wrists so that the palms of your hands are facing forward.","targets":"the shoulders, with the triceps assisting"},"Sprint Rows":{"instructions":["Stand on the ground with one foot resting on a bench or box with your heel close to the edge.","Push off with your foot on top of the bench, extending through the hip and knee.","Land with the opposite foot on top of the box, returning your other foot back to the start position.","Continue alternating from one foot to another to complete the set."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Torso Rotation Machine":{"instructions":["Stand upright holding an exercise ball with both hands. Extend your arms so the ball is straight out in front of you. This will be your starting…","Rotate your torso to one side, keeping your eyes on the ball as you move. Now, rotate back to the opposite direction. Repeat for 10-20 repetitions."],"tips":[],"grip":null,"targets":"the abs"},"Clean and Jerk":{"instructions":["With a barbell on the floor close to the shins, take an overhand or hook grip just outside the legs. Lower your hips with the weight focused on the…","Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight.…","Next comes the second pull, the main source of acceleration for the clean. As the bar approaches the mid-thigh position, begin extending through the…","As full extension is achieved, transition into the third pull by aggressively shrugging and flexing the arms with the elbows up and out. At peak…"],"tips":[],"grip":"With a barbell on the floor close to the shins, take an overhand or hook  grip just outside the…","targets":"the shoulders, with the abs, the glutes, the hamstrings, the lower back, the quads, the traps, the triceps assisting"},"Band Glute Bridge":{"instructions":["Begin seated on the ground with a loaded barbell over your legs. Using a fat bar or having a pad on the bar can greatly reduce the discomfort caused…","Begin the movement by driving through with your heels, extending your hips vertically through the bar. Your weight should be supported by your upper…","Extend as far as possible, then reverse the motion to return to the starting position."],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"EZ Bar Skull Crusher":{"instructions":["Secure a band to the base of a rack or the bench. Lay on the bench so that the band is lined up with your head.","Take hold of the band, raising your elbows so that the upper arm is perpendicular to the floor. With the elbow flexed, the band should be above your…","Extend through the elbow to straighten your arm, keeping your upper arm in place. Pause at the top of the motion, and return to the starting position."],"tips":[],"grip":null,"targets":"the triceps"},"Rope Pulldown":{"instructions":["Grab the rope with both hands above your head. Pull down on the rope as you take a small jump.","Wrap the rope around one leg, using your feet to pinch the rope. Reach up as high as possible with your arms, gripping the rope tightly.","Release the rope from your feet as you pull yourself up with your arms, bringing your knees towards your chest.","Resecure your feet on the rope, and then stand up to take another high hold on the rope. Continue until you reach the top of the rope."],"tips":[],"grip":"To lower yourself, loosen the grip of your feet on the rope as you slide  down using a hand over…","targets":"the lats, with the biceps, the forearms, the mid-back, the shoulders assisting"},"Single Leg Extension":{"instructions":["Seat yourself in the machine and adjust it so that you are positioned properly. The pad should be against the lower part of the shin but not in…","Maintaining good posture, fully extend one leg, pausing at the top of the motion.","Return to the starting position without letting the weight stop, keeping tension on the muscle.","Repeat for the desired number of repetitions."],"tips":[],"grip":null,"targets":"the quads"},"Dumbbell Skull Crusher":{"instructions":["Secure a band to the base of a rack or the bench. Lay on the bench so that the band is lined up with your head.","Take hold of the band, raising your elbows so that the upper arm is perpendicular to the floor. With the elbow flexed, the band should be above your…","Extend through the elbow to straighten your arm, keeping your upper arm in place. Pause at the top of the motion, and return to the starting position."],"tips":[],"grip":null,"targets":"the triceps"},"Battling Rope Jump Slams":{"instructions":["Kneel 1-2 feet in front of a cable system with a rope attached.","After selecting an appropriate weight, grasp the rope with both hands reaching overhead. Your torso should be upright in the starting position.","To begin, flex at the spine, attempting to bring your rib cage to your legs as you pull the cable down.","Pause at the bottom of the motion, and then slowly return to the starting position."],"tips":[],"grip":null,"targets":"the abs"},"High-to-Low Cable Fly":{"instructions":["Get into pushup position on the toes with your hands just outside of shoulder width.","Perform a pushup by allowing the elbows to flex. As you descend, keep your body straight.","Do one pushup and as you come up, shift your weight on the left side of the body, twist to the side while bringing the right arm up towards the…","Lower the arm back to the floor for another pushup and then twist to the other side."],"tips":[],"grip":null,"targets":"the chest, with the abs, the shoulders, the triceps assisting"},"Reverse Grip Lat Pulldown":{"instructions":["Select an appropriate weight and adjust the knee pad to help keep you down. Grasp the handle with a pronated grip. This will be your starting…","Pull the handle down, squeezing your elbow to your side as you flex the elbow.","Pause at the bottom of the motion, and then slowly return the handle to the starting position.","For multiple repetitions, avoid completely returning the weight to keep tension on the muscles being worked."],"tips":[],"grip":"Grasp the handle with a pronated grip.","targets":"the lats, with the biceps, the mid-back assisting"},"Band Reverse Wrist Curl":{"instructions":["Start out by placing a flat bench in front of a low pulley cable that has a straight bar attachment.","Use your arms to grab the cable bar with a narrow to shoulder width supinated grip (palms up) and bring them up so that your forearms are resting…","Start out by curling your wrist upwards and exhaling. Keep the contraction for a second.","Slowly lower your wrists back down to the starting position while inhaling."],"tips":[],"grip":"Use your arms to grab the cable bar with a narrow to shoulder width  supinated grip (palms up) and…","targets":"the forearms"},"Push Press":{"instructions":["Clean two kettlebells to your shoulders.","Squat down a few inches and reverse the motion rapidly. Use the momentum from the legs to drive the kettlebells overhead.","Once the kettlebells are locked out, lower the kettlebells to your shoulders and repeat."],"tips":[],"grip":null,"targets":"the shoulders, with the calves, the quads, the triceps assisting"},"Sprint Intervals":{"instructions":["Stand on the ground with one foot resting on a bench or box with your heel close to the edge.","Push off with your foot on top of the bench, extending through the hip and knee.","Land with the opposite foot on top of the box, returning your other foot back to the start position.","Continue alternating from one foot to another to complete the set."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Smith Machine Hip Thrust":{"instructions":["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can…","Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.","Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder…"],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"Underhand Barbell Row":{"instructions":["Grasp a barbell with an overhand grip that is slightly less than shoulder width. The bar should be resting on the top of your thighs with your arms…","Now exhale and use the sides of your shoulders to lift the bar, raising your elbows up and to the side. Keep the bar close to your body as you raise…","Lower the bar back down slowly to the starting position. Inhale as you perform this portion of the movement.","Repeat for the recommended amount of repetitions."],"tips":["Your elbows  should drive the motion, and should always be higher than your forearms.  Remember to keep your torso…"],"grip":"Grasp a barbell with an overhand grip that is slightly less than shoulder  width.","targets":"the shoulders, with the traps assisting"},"Zottman Curl":{"instructions":["Stand up with your torso upright and a dumbbell in each hand being held at arms length. The elbows should be close to the torso.","Make sure the palms of the hands are facing each other. This will be your starting position.","While holding the upper arm stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Your wrist…","Hold the contracted position for a second as you squeeze the biceps."],"tips":[],"grip":"Make sure the palms of the hands are facing each other.","targets":"the biceps, with the forearms assisting"},"Jump Squats":{"instructions":["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once…","Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your…","Step away from the rack and position your legs using a less-than- shoulder-width narrow stance with the toes slightly pointed out. Feet should be…","Begin to slowly lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the lower back assisting"},"Incline Push-Up":{"instructions":["Stand facing bench or sturdy elevated platform. Place hands on edge of bench or platform, slightly wider than shoulder width.","Position forefoot back from bench or platform with arms and body straight. Arms should be perpendicular to body. Keeping body straight, lower chest…","Push body up until arms are extended. Repeat."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Chair Step-Ups":{"instructions":["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck) and stand upright behind an elevated…","Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift…","Step down with the left leg by flexing the hip and knee of the right leg as you inhale. Return to the original standing position by placing the right…","Repeat with the right leg for the recommended amount of repetitions and then perform with the left leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the quads assisting"},"Single-Arm Landmine Press":{"instructions":["Position a bar into landmine or, lacking one, securely anchor it in a corner. Load the bar to an appropriate weight and position the handle…","Raise the bar from the floor, taking the handles to your shoulders. This will be your starting position.","In an athletic stance, squat by flexing your hips and setting your hips back, keeping your arms flexed.","Reverse the motion by powerfully extending through the hips, knees, and ankles, while also extending the elbows to straighten the arms. This movement…"],"tips":[],"grip":null,"targets":"the shoulders, with the abs, the calves, the chest, the hamstrings, the quads, the triceps assisting"},"Alternating Dumbbell Press":{"instructions":["Stand with a dumbbell in each hand. Raise the dumbbells to your shoulders with your palms facing forward and your elbows pointed out. This will be…","Extend one arm to press the dumbbell straight up, keeping your off hand in place. Do not lean or jerk the weight during the movement.","After a brief pause, return the weight to the starting position.","Repeat for the opposite side, continuing to alternate between arms."],"tips":[],"grip":"Raise the dumbbells to your shoulders  with your palms facing forward and your elbows pointed out.","targets":"the shoulders, with the triceps assisting"},"Cable Hammer Curl":{"instructions":["Stand up with your torso upright and a dumbbell in each hand being held at arms length. The elbows should be close to the torso.","The palms of the hands should be facing your torso. This will be your starting position.","While holding the upper arm stationary, curl the right weight forward while contracting the biceps as you breathe out. Continue the movement until…","Slowly begin to bring the dumbbells back to starting position as your breathe in."],"tips":["Only the  forearms should move."],"grip":"The palms of the hands should be facing your torso.","targets":"the biceps, with the forearms assisting"},"Rope Pull":{"instructions":["Grab the rope with both hands above your head. Pull down on the rope as you take a small jump.","Wrap the rope around one leg, using your feet to pinch the rope. Reach up as high as possible with your arms, gripping the rope tightly.","Release the rope from your feet as you pull yourself up with your arms, bringing your knees towards your chest.","Resecure your feet on the rope, and then stand up to take another high hold on the rope. Continue until you reach the top of the rope."],"tips":[],"grip":"To lower yourself, loosen the grip of your feet on the rope as you slide  down using a hand over…","targets":"the lats, with the biceps, the forearms, the mid-back, the shoulders assisting"},"Strict Overhead Press":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Band Kickback":{"instructions":["Kneel on the floor or an exercise mat and bend at the waist with your arms extended in front of you (perpendicular to the torso) in order to get into…","As you exhale, lift up your right leg until the hamstrings are in line with the back while maintaining the 90-degree angle bend. Contract the glutes…","Go back to the initial position as you inhale and now repeat with the left leg.","Continue to alternate legs until all of the recommended repetitions have been performed."],"tips":["At the end of the movement the upper leg should be parallel to the floor while  the calf should be perpendicular to it."],"grip":null,"targets":"the glutes, with the hamstrings assisting"},"Band Squat to Press":{"instructions":["Start off by lying on the floor.","Extend one leg straight and pull the other knee to your chest. Hold under the knee joint to protect the kneecap.","Gently tug that knee toward your nose.","Switch sides. This stretches the buttocks and lower back of the bent leg and the hip flexor of the straight leg."],"tips":[],"grip":null,"targets":"the glutes, with the hamstrings, the lower back assisting"},"Band Deadlift":{"instructions":["Set the bar up in a power rack. Attach bands to the top of the rack, using either bands pegs or the frame itself. Attach the other end of the bands…","Approach the bar so that it is centered over your feet. You feet should be about hip width apart. Bend at the hip to grip the bar at shoulder width,…","With your feet, and your grip set, take a big breath and then lower your hips and bend the knees until your shins contact the bar. Look forward with…","After the bar passes the knees, aggressively pull the bar back, pulling your shoulder blades together as you drive your hips forward into the bar."],"tips":[],"grip":"Bend at the hip to grip the bar at shoulder width,  allowing your shoulder blades to protract.","targets":"the lower back, with the outer hip (abductors), the inner thigh (adductors), the calves, the glutes, the hamstrings, the quads assisting"},"Smith Machine Behind-the-Neck Press":{"instructions":["Lie back on a flat bench. Using a medium-width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the…","As you breathe in, come down slowly until you feel the bar on your neck.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and…","Repeat the movement for the prescribed amount of repetitions."],"tips":["It should take at least twice as long to go down  than to come up)."],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Incline Chest Press Machine":{"instructions":["Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your…","Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the…","After pausing at full extension, return to the starting position, keeping tension on the cables."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Loaded Backpack Shrug":{"instructions":["Stand up straight with your feet at shoulder width as you hold a barbell with both hands in front of you using a pronated grip (palms facing the…","Raise your shoulders up as far as you can go as you breathe out and hold the contraction for a second.","Slowly return to the starting position as you breathe in.","Repeat for the recommended amount of repetitions."],"tips":["Your hands should be a little wider than shoulder width apart. You can use  wrist wraps for this exercise for a better…"],"grip":"Stand up straight with your feet at shoulder width as you hold a barbell  with both hands in front…","targets":"the traps"},"Band Incline Press":{"instructions":["Lie back on an incline bench with a dumbbell in each hand atop your thighs. The palms of your hands will be facing each other.","Then, using your thighs to help push the dumbbells up, lift the dumbbells one at a time so that you can hold them at shoulder width.","Once you have the dumbbells raised to shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. This will…","Be sure to keep full control of the dumbbells at all times. Then breathe out and push the dumbbells up with your chest."],"tips":[],"grip":"The palms of your hands will be facing each other.","targets":"the chest, with the shoulders, the triceps assisting"},"Neutral Grip Dumbbell Press":{"instructions":["Place a dumbbell standing up on a flat bench.","Ensuring that the dumbbell stays securely placed at the top of the bench, lie perpendicular to the bench with only your shoulders lying on the…","Grasp the dumbbell with both hands and hold it straight over your chest at arm's length. Both palms should be pressing against the underside of the…","Initiate the movement by lowering the dumbbell to your chest."],"tips":[],"grip":"Both palms should be pressing against the underside of the  sides of the dumbbell.","targets":"the triceps, with the chest, the shoulders assisting"},"Pool Walking":{"instructions":["Begin standing with your feet shoulder width apart and a barbell across your upper back.","Step forward with one leg, flexing the knees to drop your hips. Descend until your rear knee nearly touches the ground. Your posture should remain…","Drive through the heel of your lead foot and extend both knees to raise yourself back up.","Step forward with your rear foot, repeating the lunge on the opposite leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Svend Press":{"instructions":["Begin in a standing position.","Press two lightweight plates together with your hands. Hold the plates together close to your chest to create an isometric contraction in your chest…","Squeeze the plates between your palms and extend your arms directly out in front of you in a controlled motion.","Pause at the top of the motion, and then slowly return to the starting position."],"tips":[],"grip":"Squeeze the plates between your palms and extend your arms directly out  in front of you in a…","targets":"the chest, with the forearms, the shoulders, the triceps assisting"},"Close Push-Up":{"instructions":["Stand facing a Smith machine bar or sturdy elevated platform at an appropriate height.","Place your hands next to one another on the bar.","Position your feet back from the bar with arms and body straight. This will be your starting position.","Keeping your body straight, lower your chest to the bar by bending the arms."],"tips":[],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Zercher Squat":{"instructions":["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. The…","Lift the bar up so that it is resting on top of your forearms. If you are holding the bar properly, it should look as if you have your arms crossed…","Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all…","Begin to lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the upper leg…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Jackknife":{"instructions":["Lie flat on the floor (or exercise mat) on your back with your arms extended straight back behind your head and your legs extended also. This will be…","As you exhale, bend at the waist while simultaneously raising your legs and arms to meet in a jackknife position.","While inhaling, lower your arms and legs back to the starting position.","Repeat for the recommended amount of repetitions."],"tips":["The legs should be extended and  lifted at approximately a 35-45 degree angle from the floor and the arms should  be…"],"grip":null,"targets":"the abs"},"TRX Triceps Extension":{"instructions":["Lie on incline an bench facing away from a high pulley machine that has a straight bar attachment on it.","Grasp the straight bar attachment overhead with a pronated (overhand; palms down) narrow grip (less than shoulder width) and keep your elbows tucked…","Keeping the upper arms stationary, extend the arms as you flex the triceps. Breathe out during this portion of the movement and hold the contraction…","Slowly go back to the starting position."],"tips":[],"grip":"Grasp the straight bar attachment overhead with a pronated (overhand;  palms down) narrow grip…","targets":"the triceps"},"V-Bar Pushdown":{"instructions":["Attach a V-Bar to a high pulley and grab with an overhand grip (palms facing down) at shoulder width.","Standing upright with the torso straight and a very small inclination forward, bring the upper arms close to your body and perpendicular to the…","Using the triceps, bring the bar down until it touches the front of your thighs and the arms are fully extended perpendicular to the floor. The upper…","After a second hold at the contracted position, bring the V-Bar slowly up to the starting point. Breathe in as you perform this step."],"tips":[],"grip":"Attach a V-Bar to a high pulley and grab with an overhand grip (palms  facing down) at shoulder…","targets":"the triceps"},"TRX Biceps Curl":{"instructions":["Sit on the floor with your knees bent and your partner standing behind you. Extend your arms straight behind you with your palms facing each other.…","Attempt to flex your elbows, while your partner prevents any actual movement.","After 10-20 seconds, relax your arms while your partner gently pulls your wrists up to stretch your biceps. Be sure to let your partner know when the…"],"tips":[],"grip":"Extend your arms straight behind you with your palms facing each other.","targets":"the biceps, with the chest, the shoulders assisting"},"Chair Dip":{"instructions":["Sit securely in a dip machine, select the weight and firmly grasp the handles.","Now keep your elbows in at your sides in order to place emphasis on the triceps. The elbows should be bent at a 90 degree angle.","As you contract the triceps, extend your arms downwards as you exhale.","Now slowly let your arms come back up to the starting position as you inhale."],"tips":["At the bottom of the movement, focus on keeping a little bend in your arms  to keep tension on the triceps muscle."],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Hanging Leg Raise":{"instructions":["Hang from a chin-up bar with both arms extended at arms length in top of you using either a wide grip or a medium grip. The legs should be straight…","Raise your legs until the torso makes a 90-degree angle with the legs. Exhale as you perform this movement and hold the contraction for a second or…","Go back slowly to the starting position as you breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"Hang from a chin-up bar with both arms extended at arms length in top of  you using either a wide…","targets":"the abs"},"Band Leg Curl":{"instructions":["Adjust the machine lever to fit your height and sit on the machine with your back against the back support pad.","Place the back of lower leg on top of padded lever (just a few inches under the calves) and secure the lap pad against your thighs, just above the…","As you exhale, pull the machine lever as far as possible to the back of your thighs by flexing at the knees. Keep your torso stationary at all times.…","Slowly return to the starting position as you breathe in."],"tips":[],"grip":null,"targets":"the hamstrings"},"Finger Curl":{"instructions":["Hold a barbell with both hands and your palms facing up; hands spaced about shoulder width.","Place your feet flat on the floor, at a distance that is slightly wider than shoulder width apart. This will be your starting position.","Lower the bar as far as possible by extending the fingers. Allowing the bar to roll down the hands, catch the bar with the final joint in the fingers.","Now curl bar up as high as possible by closing your hands while exhaling. Hold the contraction at the top."],"tips":[],"grip":"Hold a barbell with both hands and your palms facing up; hands spaced  about shoulder width.","targets":"the forearms"},"Skipping Without Rope":{"instructions":["Kneel 1-2 feet in front of a cable system with a rope attached.","After selecting an appropriate weight, grasp the rope with both hands reaching overhead. Your torso should be upright in the starting position.","To begin, flex at the spine, attempting to bring your rib cage to your legs as you pull the cable down.","Pause at the bottom of the motion, and then slowly return to the starting position."],"tips":[],"grip":null,"targets":"the abs"},"Backpack Hammer Curl":{"instructions":["Stand up with your torso upright and a dumbbell in each hand being held at arms length. The elbows should be close to the torso.","The palms of the hands should be facing your torso. This will be your starting position.","While holding the upper arm stationary, curl the right weight forward while contracting the biceps as you breathe out. Continue the movement until…","Slowly begin to bring the dumbbells back to starting position as your breathe in."],"tips":["Only the  forearms should move."],"grip":"The palms of the hands should be facing your torso.","targets":"the biceps, with the forearms assisting"},"Wide Push-Up":{"instructions":["With your hands wide apart, support your body on your toes and hands in a plank position. Your elbows should be extended and your body straight. Do…","To begin, allow the elbows to flex, lowering your chest to the floor as you inhale.","Using your pectoral muscles, press your upper body back up to the starting position by extending the elbows. Exhale as you perform this step.","After pausing at the contracted position, repeat the movement for the prescribed amount of repetitions."],"tips":[],"grip":null,"targets":"the chest, with the abs, the shoulders, the triceps assisting"},"Dumbbell Hip Thrust":{"instructions":["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can…","Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.","Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder…"],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"EZ Bar Cable Curl":{"instructions":["Stand up straight while holding an EZ curl bar at the wide outer handle. The palms of your hands should be facing forward and slightly tilted inward…","Now, while keeping your upper arms stationary, exhale and curl the weights forward while contracting the biceps. Focus on only moving your forearms.","Continue to raise the weight until your biceps are fully contracted and the bar is at shoulder level. Hold the top contracted position for a moment…","Then inhale and slowly lower the bar back to the starting position."],"tips":[],"grip":"The palms of your hands should be facing forward and slightly tilted inward due  to the shape of…","targets":"the biceps"},"Floor Dumbbell Press":{"instructions":["Lay on the floor holding dumbbells in your hands. Your knees can be bent. Begin with the weights fully extended above you.","Lower the weights until your upper arm comes in contact with the floor. You can tuck your elbows to emphasize triceps size and strength, or to focus…","Pause at the bottom, and then bring the weight together at the top by extending through the elbows."],"tips":[],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Cross-Body Hammer Curl":{"instructions":["Stand up straight with a dumbbell in each hand. Your hands should be down at your side with your palms facing in.","While keeping your palms facing in and without twisting your arm, curl the dumbbell of the right arm up towards your left shoulder as you exhale.…","Slowly lower the dumbbell along the same path as you inhale and then repeat the same movement for the left arm.","Continue alternating in this fashion until the recommended amount of repetitions is performed for each arm."],"tips":[],"grip":"Your hands should be down  at your side with your palms facing in.","targets":"the biceps, with the forearms assisting"},"Crunch":{"instructions":["Kneel below a high pulley that contains a rope attachment.","Grasp cable rope attachment and lower the rope until your hands are placed next to your face.","Flex your hips slightly and allow the weight to hyperextend the lower back. This will be your starting position.","With the hips stationary, flex the waist as you contract the abs so that the elbows travel towards the middle of the thighs. Exhale as you perform…"],"tips":["Make sure that  you keep constant tension on the abs throughout the movement. Also, do not  choose a weight so heavy…"],"grip":null,"targets":"the abs"},"Bent Over Reverse Fly":{"instructions":["Holding a barbell with a pronated grip (palms facing down), bend your knees slightly and bring your torso forward, by bending at the waist, while…","Now, while keeping the torso stationary, breathe out and lift the barbell to you. Keep the elbows close to the body and only use the forearms to hold…","Then inhale and slowly lower the barbell back to the starting position.","Repeat for the recommended amount of repetitions."],"tips":["Make  sure that you keep the head up. The barbell should hang directly in front of you  as your arms hang perpendicular…"],"grip":null,"targets":"the mid-back, with the biceps, the lats, the shoulders assisting"},"Barbell Hip Thrust":{"instructions":["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can…","Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.","Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder…"],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"Turkish Get-Up":{"instructions":["Lie on your back on the floor and press a kettlebell to the top position by extending the elbow. Bend the knee on the same side as the kettlebell.","Keeping the kettlebell locked out at all times, pivot to the opposite side and use your non- working arm to assist you in driving forward to the…","While looking up at the kettlebell, slowly stand up. Reverse the motion back to the starting position and repeat."],"tips":[],"grip":null,"targets":"the shoulders, with the abs, the hamstrings, the quads, the triceps assisting"},"Backpack Floor Press":{"instructions":["Adjust the j-hooks so they are at the appropriate height to rack the bar. Begin lying on the floor with your head near the end of a power rack.…","Lower the bar towards the bottom of your chest or upper stomach, squeezing the bar and attempting to pull it apart as you do so. Ensure that you tuck…","Press the bar back up as fast as you can, keeping the bar, your wrists, and elbows in line as you do so."],"tips":[],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Flat Barbell Bench Press":{"instructions":["Lie down on a flat bench with a dumbbell in one hand resting on top of your thigh. The palm of your hand with the dumbbell in it should be at a…","By using your thighs to help you get the dumbbell up, clean the dumbbell so that you can hold it in front of you with your lifting arm being fully…","Your arm with the weight should have a slight bend on your elbow in order to prevent stress at the biceps tendon. Begin by lowering your arm with the…","Return your lifting arm back to the starting position as you squeeze your chest muscles and breathe out."],"tips":["Keep in mind that  throughout the movement, your lifting arm should remain stationary; the movement  should only occur…"],"grip":"The palm of your hand with the dumbbell in it should be at a neutral  grip.","targets":"the chest"},"Ring Triceps Extension":{"instructions":["Lie on incline an bench facing away from a high pulley machine that has a straight bar attachment on it.","Grasp the straight bar attachment overhead with a pronated (overhand; palms down) narrow grip (less than shoulder width) and keep your elbows tucked…","Keeping the upper arms stationary, extend the arms as you flex the triceps. Breathe out during this portion of the movement and hold the contraction…","Slowly go back to the starting position."],"tips":[],"grip":"Grasp the straight bar attachment overhead with a pronated (overhand;  palms down) narrow grip…","targets":"the triceps"},"Incline Dumbbell Curl":{"instructions":["Sit back on an incline bench with a dumbbell in each hand held at arms length. Keep your elbows close to your torso and rotate the palms of your…","While holding the upper arm stationary, curl the weights forward while contracting the biceps as you breathe out. Only the forearms should move.…","Slowly begin to bring the dumbbells back to starting position as your breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"Keep your elbows close to your torso and rotate the palms of your hands  until they are facing…","targets":"the biceps"},"Standing Cable Lift":{"instructions":["Connect a standard handle on a tower, and move the cable to the lowest pulley position.","With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the…","With your feet positioned shoulder width apart, squat down and grab the handle with both hands. Your arms should still be fully extended.","In one motion, pull the handle up and across your body until your arms are in a fully-extended position above your head."],"tips":[],"grip":null,"targets":"the abs, with the shoulders assisting"},"Spin Bike":{"instructions":["To begin, seat yourself on the bike and adjust the seat to your height.","Select the desired option from the menu. You may have to start pedaling to turn it on. You can use the manual setting, or you can select a program to…","Recumbent bikes offer convenience, cardiovascular benefits, and have less impact than other activities. A 150 lb person will burn about 230 calories…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Toe-to-Bar":{"instructions":["Start off by lying on the floor.","Extend one leg straight and pull the other knee to your chest. Hold under the knee joint to protect the kneecap.","Gently tug that knee toward your nose.","Switch sides. This stretches the buttocks and lower back of the bent leg and the hip flexor of the straight leg."],"tips":[],"grip":null,"targets":"the glutes, with the hamstrings, the lower back assisting"},"Band Wrist Curl":{"instructions":["Start out by placing a flat bench in front of a low pulley cable that has a straight bar attachment.","Use your arms to grab the cable bar with a narrow to shoulder width supinated grip (palms up) and bring them up so that your forearms are resting…","Start out by curling your wrist upwards and exhaling. Keep the contraction for a second.","Slowly lower your wrists back down to the starting position while inhaling."],"tips":[],"grip":"Use your arms to grab the cable bar with a narrow to shoulder width  supinated grip (palms up) and…","targets":"the forearms"},"Standing Barbell Overhead Press":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Cable Hip Adduction":{"instructions":["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can…","Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.","Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder…"],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"Standing Military Press":{"instructions":["Start by placing a barbell that is about chest high on a squat rack. Once you have selected the weights, grab the barbell using a pronated (palms…","Slightly bend the knees and place the barbell on your collar bone. Lift the barbell up keeping it lying on your chest. Take a step back and position…","Once you pick up the barbell with the correct grip length, lift the bar up over your head by locking your arms. Hold at about shoulder level and…","Lower the bar down to the collarbone slowly as you inhale."],"tips":[],"grip":"Once  you have selected the weights, grab the barbell using a pronated (palms facing  forward) grip.","targets":"the shoulders, with the triceps assisting"},"Band Pushdown":{"instructions":["Start by setting a bar attachment (straight or e-z) on a high pulley machine.","Facing the bar attachment, grab it with the palms facing up (supinated grip) at shoulder width. Lower the bar by using your lats until your arms are…","Slowly elevate the bar attachment up as you inhale so it is aligned with your chest. Only the forearms should move and the elbows/upper arms should…","Then begin to lower the cable bar back down to the original staring position while exhaling and contracting the triceps hard."],"tips":["Elbows should be in by your sides and your  feet should be shoulder width apart from each other. This is the starting …"],"grip":"Facing the bar attachment, grab it with the palms facing up (supinated  grip) at shoulder width.","targets":"the triceps"},"Ab Wheel Rollout":{"instructions":["For this exercise you will need to get into a pushup position, but instead of having your hands of the floor, you will be grabbing on to an Olympic…","While keeping a slight arch on your back, lift your hips and roll the barbell towards your feet as you exhale. If you don't, you will work out your…","After a second contraction at the top, start to roll the barbell back forward to the starting position slowly as you inhale.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":null,"targets":"the abs, with the lower back, the shoulders assisting"},"High Cable Row":{"instructions":["Grasp a straight bar cable attachment that is attached to a low pulley with a pronated (palms facing your thighs) grip that is slightly less than…","Use your side shoulders to lift the cable bar as you exhale. The bar should be close to the body as you move it up. Continue to lift it until it…","Lower the bar back down slowly to the starting position. Inhale as you perform this portion of the movement.","Repeat for the recommended amount of repetitions."],"tips":["Your elbows should drive the motion. As you lift  the bar, your elbows should always be higher than your forearms."],"grip":"Grasp a straight bar cable attachment that is attached to a low pulley  with a pronated (palms…","targets":"the traps, with the shoulders assisting"},"Kettlebell High Pull":{"instructions":["Place a kettlebell on the ground between your feet. Position your feet in a wide stance, and grasp the kettlebell with two hands. Set your hips back…","Begin by extending the hips and knees, simultaneously pulling the kettlebell to your shoulders, raising your elbows as you do so. Reverse the motion…"],"tips":[],"grip":null,"targets":"the traps, with the inner thigh (adductors), the glutes, the hamstrings, the quads, the shoulders assisting"},"Band Overhead Extension":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Plank Walk":{"instructions":["Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.","Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."],"tips":[],"grip":null,"targets":"the abs"},"Rack Pull":{"instructions":["This drill teaches the delivery of the barbell to the rack position on the shoulders. Begin holding a bar in the scarecrow position, with the upper…","Begin by rotating the elbows around the bar, delivering the bar to the shoulders. As your elbows come forward, relax your grip. The shoulders should…","It is important that the bar stay close to the body at all times, as with a heavier load any distance will result in an unwanted collision. As the…"],"tips":[],"grip":"Use a hook grip, with  your fingers wrapped over your thumbs.","targets":"the shoulders, with the forearms, the traps assisting"},"Barbell Curl":{"instructions":["Stand up with your torso upright while holding a barbell at a shoulder- width grip. The palm of your hands should be facing forward and the elbows…","While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out.","Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second and squeeze…","Slowly begin to bring the bar back to starting position as your breathe in."],"tips":["Only the forearms should move."],"grip":"Stand up with your torso upright while holding a barbell at a shoulder-  width grip.","targets":"the biceps, with the forearms assisting"},"Close Grip Curl":{"instructions":["Stand up with your torso upright while holding an E-Z Curl Bar at the closer inner handle. The palm of your hands should be facing forward and they…","While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out.","Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second and squeeze…","Slowly begin to bring the bar back to starting position as your breathe in."],"tips":["Only the forearms should move."],"grip":"The palm of your hands should be facing forward and they  should be slightly tilted inwards due to…","targets":"the biceps, with the forearms assisting"},"Single Leg Press":{"instructions":["Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a medium (shoulder width) foot…","Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of…","As you inhale, slowly lower the platform until your upper and lower legs make a 90-degree angle.","Pushing mainly with the heels of your feet and using the quadriceps go back to the starting position as you exhale."],"tips":["Make sure that you do not lock your knees. Your torso and the legs should  make a perfect 90-degree angle."],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Leg Extension":{"instructions":["Seat yourself in the machine and adjust it so that you are positioned properly. The pad should be against the lower part of the shin but not in…","Maintaining good posture, fully extend one leg, pausing at the top of the motion.","Return to the starting position without letting the weight stop, keeping tension on the muscle.","Repeat for the desired number of repetitions."],"tips":[],"grip":null,"targets":"the quads"},"Smith Machine Calf Raise":{"instructions":["Place a block or weight plate below the bar on the Smith machine. Set the bar to a position that best matches your height. Once the correct height is…","Take the bar with both hands facing forward. Rotate the bar to unrack it. This will be your starting position.","Raise your heels as high as possible by pushing off of the balls of your feet, flexing your calf at the top of the contraction. Your knees should…","Return slowly to the starting position as you breathe in while lowering your heels."],"tips":[],"grip":null,"targets":"the calves"},"Axle Bar Overhead Press":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Single Arm Pushdown":{"instructions":["Start by setting a bar attachment (straight or e-z) on a high pulley machine.","Facing the bar attachment, grab it with the palms facing up (supinated grip) at shoulder width. Lower the bar by using your lats until your arms are…","Slowly elevate the bar attachment up as you inhale so it is aligned with your chest. Only the forearms should move and the elbows/upper arms should…","Then begin to lower the cable bar back down to the original staring position while exhaling and contracting the triceps hard."],"tips":["Elbows should be in by your sides and your  feet should be shoulder width apart from each other. This is the starting …"],"grip":"Facing the bar attachment, grab it with the palms facing up (supinated  grip) at shoulder width.","targets":"the triceps"},"Push-Up":{"instructions":["Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length. Move your feet up to a box or…","Next, lower yourself downward until your chest almost touches the floor as you inhale.","Now breathe out and press your upper body back up to the starting position while squeezing your chest.","After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Biceps Curl Machine":{"instructions":["Sit on the floor with your knees bent and your partner standing behind you. Extend your arms straight behind you with your palms facing each other.…","Attempt to flex your elbows, while your partner prevents any actual movement.","After 10-20 seconds, relax your arms while your partner gently pulls your wrists up to stretch your biceps. Be sure to let your partner know when the…"],"tips":[],"grip":"Extend your arms straight behind you with your palms facing each other.","targets":"the biceps, with the chest, the shoulders assisting"},"Box Squat":{"instructions":["The box squat allows you to squat to desired depth and develop explosive strength in the squat movement. Begin in a power rack with a box at the…","Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows…","With your back, shoulders, and core tight, push your knees and butt out and you begin your descent. Sit back with your hips until you are seated on…","Keeping the weight on your heels and pushing your feet and knees out, drive upward off of the box as you lead the movement with your head. Continue…"],"tips":[],"grip":null,"targets":"the quads, with the inner thigh (adductors), the calves, the glutes, the hamstrings, the lower back assisting"},"Incline Dumbbell Row":{"instructions":["Using a neutral grip, lean into an incline bench.","Take a dumbbell in each hand with a neutral grip, beginning with the arms straight. This will be your starting position.","Retract the shoulder blades and flex the elbows to row the dumbbells to your side.","Pause at the top of the motion, and then return to the starting position."],"tips":[],"grip":"Using a neutral grip, lean into an incline bench.","targets":"the mid-back, with the biceps, the forearms, the lats, the shoulders assisting"},"Backward Walk":{"instructions":["Load a sled with the desired weight, attaching a rope or straps to the sled that you can hold onto.","Begin the exercise by moving backwards for a given distance. Leaning back, extend through the legs for short steps to move as quickly as possible."],"tips":[],"grip":null,"targets":"the quads, with the calves, the forearms, the glutes, the hamstrings, the lower back assisting"},"Seated Dumbbell Curl":{"instructions":["Sit on a flat bench with a dumbbell on each hand being held at arms length. The elbows should be close to the torso.","Rotate the palms of the hands so that they are facing your torso. This will be your starting position.","While holding the upper arm stationary, curl the weights and start twisting the wrists once the dumbbells pass your thighs so that the palms of your…","Slowly begin to bring the dumbbells back to the starting position as your breathe in and as you rotate the wrists back to a neutral grip."],"tips":[],"grip":"Rotate the palms of the hands so that they are facing your torso.","targets":"the biceps"},"Weighted Step-Up":{"instructions":["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck) and stand upright behind an elevated…","Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift…","Step down with the left leg by flexing the hip and knee of the right leg as you inhale. Return to the original standing position by placing the right…","Repeat with the right leg for the recommended amount of repetitions and then perform with the left leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the quads assisting"},"Landmine Reverse Lunge":{"instructions":["Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.","Raise the bar from the floor, taking it to shoulder height with both hands with your arms extended in front of you. Adopt a wide stance. This will be…","Perform the movement by rotating the trunk and hips as you swing the weight all the way down to one side. Keep your arms extended throughout the…","Reverse the motion to swing the weight all the way to the opposite side."],"tips":[],"grip":null,"targets":"the abs, with the glutes, the lower back, the shoulders assisting"},"Medicine Ball Toss":{"instructions":["For this exercise you will need a medicine ball and a partner. Stand back to back with your partner, spaced 2-3 feet apart. This will be your…","Hold the ball in front of the trunk. Open the hips and turn the shoulders at the same time as your partner.","For full rotation, you and your partner should twist in the same direction, i.e. counter-clockwise.","Pass the ball to your partner, and both of you can now twist in the opposite direction to repeat the procedure."],"tips":[],"grip":null,"targets":"the abs, with the shoulders assisting"},"Power Clean":{"instructions":["Stand with your feet slightly wider than shoulder width apart and toes pointing out slightly.","Squat down and grasp bar with a closed, pronated grip. Your hands should be slightly wider than shoulder width apart outside knees with elbows fully…","Place the bar about 1 inch in front of your shins and over the balls of your feet.","Your back should be flat or slightly arched, your chest held up and out and your shoulder blades should be retracted."],"tips":["At this point your thighs should be  against the bar."],"grip":"Squat down and grasp bar with a closed, pronated grip.","targets":"the hamstrings, with the calves, the forearms, the glutes, the lower back, the mid-back, the quads, the shoulders, the traps, the triceps assisting"},"Monster Walk":{"instructions":["Place a band around both ankles and another around both knees. There should be enough tension that they are tight when your feet are shoulder width…","To begin, take short steps forward alternating your left and right foot.","After several steps, do just the opposite and walk backward to where you started."],"tips":[],"grip":null,"targets":"the outer hip (abductors)"},"Reverse Crunch":{"instructions":["Lie down on the floor with your legs fully extended and arms to the side of your torso with the palms on the floor. Your arms should be stationary…","Move your legs up so that your thighs are perpendicular to the floor and feet are together and parallel to the floor. This is the starting position.","While inhaling, move your legs towards the torso as you roll your pelvis backwards and you raise your hips off the floor. At the end of this movement…","Hold the contraction for a second and move your legs back to the starting position while exhaling."],"tips":[],"grip":"Lie down on the floor with your legs fully extended and arms to the side  of your torso with the…","targets":"the abs"},"Battle Rope Waves":{"instructions":["Kneel 1-2 feet in front of a cable system with a rope attached.","After selecting an appropriate weight, grasp the rope with both hands reaching overhead. Your torso should be upright in the starting position.","To begin, flex at the spine, attempting to bring your rib cage to your legs as you pull the cable down.","Pause at the bottom of the motion, and then slowly return to the starting position."],"tips":[],"grip":null,"targets":"the abs"},"Landmine Chest Press":{"instructions":["Position a bar into landmine or, lacking one, securely anchor it in a corner. Load the bar to an appropriate weight and position the handle…","Raise the bar from the floor, taking the handles to your shoulders. This will be your starting position.","In an athletic stance, squat by flexing your hips and setting your hips back, keeping your arms flexed.","Reverse the motion by powerfully extending through the hips, knees, and ankles, while also extending the elbows to straighten the arms. This movement…"],"tips":[],"grip":null,"targets":"the shoulders, with the abs, the calves, the chest, the hamstrings, the quads, the triceps assisting"},"Guillotine Press":{"instructions":["Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar…","As you breathe in, bring the bar down slowly until it is about 1 inch from your neck.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and…","Repeat the movement for the prescribed amount of repetitions."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Incline Dumbbell Fly":{"instructions":["Lie back on an incline bench with a dumbbell in each hand atop your thighs. The palms of your hands will be facing each other.","Then, using your thighs to help push the dumbbells up, lift the dumbbells one at a time so that you can hold them at shoulder width.","Once you have the dumbbells raised to shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. This will…","Be sure to keep full control of the dumbbells at all times. Then breathe out and push the dumbbells up with your chest."],"tips":[],"grip":"The palms of your hands will be facing each other.","targets":"the chest, with the shoulders, the triceps assisting"},"Clean Pull":{"instructions":["With a barbell on the floor close to the shins, take an overhand or hook grip just outside the legs. Lower your hips with the weight focused on the…","Begin the first pull by driving through the heels, extending your knees. Your back angle should stay the same, and your arms should remain straight…","Next comes the second pull, the main source of acceleration for the clean. As the bar approaches the mid-thigh position, begin extending through the…"],"tips":[],"grip":"With a barbell on the floor close to the shins, take an overhand or hook  grip just outside the…","targets":"the quads, with the forearms, the glutes, the hamstrings, the lower back, the traps assisting"},"Weighted Step-Ups":{"instructions":["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck) and stand upright behind an elevated…","Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift…","Step down with the left leg by flexing the hip and knee of the right leg as you inhale. Return to the original standing position by placing the right…","Repeat with the right leg for the recommended amount of repetitions and then perform with the left leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the quads assisting"},"Jump Squat":{"instructions":["Begin kneeling on the floor with a barbell racked across the back of your shoulders, or you can use your body weight for this exercise. This can be…","Sit back with your hips until your glutes touch your feet, keeping your head and chest up.","Explode up with your hips, generating enough power to land with your feet flat on the floor.","Continue with the squat by driving through your heels and extending the knees to come to a standing position."],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings, the quads assisting"},"Dead Hang":{"instructions":["Place two kettlebells between your feet. To get in the starting position, push your butt back and look straight ahead.","Clean one kettlebell to your shoulder and hold on to the other kettlebell in a hanging position. Clean the kettlebell to your shoulder by extending…","Lower the cleaned kettlebell to a hanging position and clean the alternate kettlebell. Repeat."],"tips":[],"grip":null,"targets":"the hamstrings, with the biceps, the calves, the forearms, the glutes, the lower back, the traps assisting"},"Deficit Deadlift":{"instructions":["Begin by having a platform or weight plates that you can stand on, usually 1-3 inches in height. Approach the bar so that it is centered over your…","With your feet, and your grip set, take a big breath and then lower your hips and bend the knees until your shins contact the bar. Look forward with…","Lower the bar by bending at the hips and guiding it to the floor."],"tips":[],"grip":"Bend at the hip to grip the bar  at shoulder width, allowing your shoulder blades to protract.","targets":"the lower back, with the forearms, the glutes, the hamstrings, the mid-back, the quads, the traps assisting"},"Wide Grip Curl":{"instructions":["Stand up with your torso upright while holding a barbell at the wide outer handle. The palm of your hands should be facing forward. The elbows should…","While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out.","Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second and squeeze…","Slowly begin to bring the bar back to starting position as your breathe in."],"tips":["Only the forearms should move."],"grip":"The palm of your hands should be facing forward.","targets":"the biceps"},"Explosive Push-Up":{"instructions":["Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length. Move your feet up to a box or…","Next, lower yourself downward until your chest almost touches the floor as you inhale.","Now breathe out and press your upper body back up to the starting position while squeezing your chest.","After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Single Leg Romanian Deadlift":{"instructions":["Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width.","Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.","Keeping your back and arms completely straight at all times, use your hips to lift the bar as you exhale.","Once you are standing completely straight up, lower the bar by pushing the hips back, only slightly bending the knees, unlike when squatting."],"tips":["Depending  on the weight used, you may need wrist wraps to perform the exercise and also a  raised platform in order to…"],"grip":"Put a barbell in front of you on the ground and grab it using a pronated  (palms facing down) grip…","targets":"the hamstrings, with the calves, the glutes, the lower back assisting"},"Cable External Rotation":{"instructions":["Lie sideways on a flat bench with one arm holding a dumbbell and the other hand on top of the bench folded so that you can rest your head on it.","Bend the elbows of the arm holding the dumbbell so that it creates a 90- degree angle between the upper arm and the forearm.","Now bend the elbow while keeping the upper arm stationary. In this manner, the forearm will be parallel to the floor and perpendicular to your torso…","As you breathe out, externally rotate your forearm so that the dumbbell is lifted up in a semicircle motion as you maintain the 90 degree angle bend…"],"tips":["Keep the arm parallel  to your torso."],"grip":null,"targets":"the shoulders"},"Plate Pinch":{"instructions":["Grab two wide-rimmed plates and put them together with the smooth sides facing outward","Use your fingers to grip the outside part of the plate and your thumb for the other side thus holding both plates together. This is the starting…","Squeeze the plate with your fingers and thumb. Hold this position for as long as you can.","Repeat for the recommended amount of sets prescribed in your program."],"tips":[],"grip":"Use your fingers to grip the outside part of the plate and your thumb for  the other side thus…","targets":"the forearms"},"Thruster":{"instructions":["Clean two kettlebells to your shoulders. Clean the kettlebells to your shoulders by extending through the legs and hips as you pull the kettlebells…","Begin to squat by flexing your hips and knees, lowering your hips between your legs. Maintain an upright, straight back as you descend as low as you…","At the bottom, reverse direction and squat by extending your knees and hips, driving through your heels. As you do so, press both kettlebells…","As you begin the next repetition, return the weights to the shoulders."],"tips":[],"grip":null,"targets":"the shoulders, with the quads, the triceps assisting"},"Smith Machine Incline Bench Press":{"instructions":["Place an incline bench underneath the smith machine. Place the barbell at a height that you can reach when lying down and your arms are almost fully…","As you breathe in, come down slowly until you feel the bar on your upper chest.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms in the…","Repeat the movement for the prescribed amount of repetitions."],"tips":["It should take at least twice as long to go down than to come up."],"grip":"Using a pronated  grip (palms facing forward) that is wider than shoulder width, unlock the bar …","targets":"the chest, with the shoulders, the triceps assisting"},"Backpack Overhead Extension":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Seated Twist":{"instructions":["Start out by sitting at the end of a flat bench with a barbell placed on top of your thighs. Your feet should be shoulder width apart from each other.","Grip the bar with your palms facing down and make sure your hands are wider than shoulder width apart from each other. Begin to lift the barbell up…","Now lower the barbell behind your head until it is resting along the base of your neck. This is the starting position.","While keeping your feet and head stationary, move your waist from side to side so that your oblique muscles feel the contraction. Only move from side…"],"tips":["Use a slow and controlled motion."],"grip":"Grip the bar with your palms facing down and make sure your hands are  wider than shoulder width…","targets":"the abs"},"Chest Press Machine":{"instructions":["Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your…","Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the…","After pausing at full extension, return to th starting position, keeping tension on the cables.","You can also execute this movement with your back off the pad, at an incline or decline, or alternate hands."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Hip Adductor Machine":{"instructions":["Lie face down with one leg on a foam roll.","Rotate the leg so that the foam roll contacts against your inner thigh. Shift as much weight onto the foam roll as can be tolerated.","While trying to relax the muscles if the inner thigh, roll over the foam between your hip and knee, holding points of tension for 10-30 seconds.…"],"tips":[],"grip":null,"targets":"the inner thigh (adductors)"},"Weighted Dip":{"instructions":["Sit securely in a dip machine, select the weight and firmly grasp the handles.","Now keep your elbows in at your sides in order to place emphasis on the triceps. The elbows should be bent at a 90 degree angle.","As you contract the triceps, extend your arms downwards as you exhale.","Now slowly let your arms come back up to the starting position as you inhale."],"tips":["At the bottom of the movement, focus on keeping a little bend in your arms  to keep tension on the triceps muscle."],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Lying Triceps Extension":{"instructions":["Lie on a flat bench and grasp the straight bar attachment of a low pulley with a narrow overhand grip.","With your arms extended, position the bar over your torso. Your arms and your torso should create a 90-degree angle. This will be your starting…","Lower the bar by bending at the elbow while keeping the upper arms stationary and elbows in. Go down until the bar lightly touches your forehead.…","Flex the triceps as you lift the bar back to its starting position. Exhale as you perform this portion of the movement."],"tips":["The easiest way to do this is to have someone  hand you the bar as you lay down."],"grip":"Lie on a flat bench and grasp the straight bar attachment of a low pulley  with a narrow overhand…","targets":"the triceps"},"Upright Exercise Bike":{"instructions":["To begin, seat yourself on the bike and adjust the seat to your height.","Select the desired option from the menu. You may have to start pedaling to turn it on. You can use the manual setting, or you can select a program to…","Recumbent bikes offer convenience, cardiovascular benefits, and have less impact than other activities. A 150 lb person will burn about 230 calories…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Straight Bar Dip":{"instructions":["Sit securely in a dip machine, select the weight and firmly grasp the handles.","Now keep your elbows in at your sides in order to place emphasis on the triceps. The elbows should be bent at a 90 degree angle.","As you contract the triceps, extend your arms downwards as you exhale.","Now slowly let your arms come back up to the starting position as you inhale."],"tips":["At the bottom of the movement, focus on keeping a little bend in your arms  to keep tension on the triceps muscle."],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Reverse Grip Curl":{"instructions":["Stand up with your torso upright while holding a barbell at shoulder width with the elbows close to the torso. The palm of your hands should be…","While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue…","Slowly begin to bring the bar back to starting position as your breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"The palm of your hands should be  facing down (pronated grip).","targets":"the biceps, with the forearms assisting"},"Dumbbell Lateral Raise":{"instructions":["Grab a dumbbell in each arm and stand up straight with your arms extended by your sides with a slight bend at the elbows and your back straight. This…","Use your side shoulders to lift the dumbbells as you exhale. The dumbbells should be to the side of the body as you move them up. Continue to lift it…","Lower the dumbbells back down slowly to the starting position. Inhale as you perform this portion of the movement.","Repeat for the recommended amount of repetitions."],"tips":["The dumbbell should be next to your thighs with  the palm of your hands facing back."],"grip":"Tip: The dumbbell should be next to your thighs with  the palm of your hands facing back.","targets":"the shoulders, with the biceps assisting"},"Sled Push":{"instructions":["Load your pushing sled with the desired weight.","Take an athletic posture, leaning into the sled with your arms fully extended, grasping the handles. Push the sled as fast as possible, focusing on…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the chest, the glutes, the hamstrings, the triceps assisting"},"Circus Dumbbell Press":{"instructions":["Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other.","Then, using your thighs to help raise the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.","Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. The dumbbells should be just to the…","Then, as you breathe out, use your chest to push the dumbbells up. Lock your arms at the top of the lift and squeeze your chest, hold for a second…"],"tips":["Ideally, lowering the weight should take  about twice as long as raising it."],"grip":"The palms of your hands will be facing each other.","targets":"the chest, with the shoulders, the triceps assisting"},"Depth Jump":{"instructions":["For this drill you will need two boxes or benches, one 12 to 16 inches high and the other 22 to 26 inches high.","Stand on one of the two boxes with arms at the sides; feet should be together and slightly off the edge as in the depth jump. Place the other box…","Begin by dropping off the initial box, landing and simultaneously taking off with both feet.","Rebound by driving upward and outward as intensely as possible, using the arms and full extension of the body to jump onto the higher box. Again,…"],"tips":[],"grip":null,"targets":"the quads, with the outer hip (abductors), the inner thigh (adductors), the calves, the glutes, the hamstrings assisting"},"Landmine Rotation":{"instructions":["Position a bar into a landmine or securely anchor it in a corner. Load the bar to an appropriate weight.","Raise the bar from the floor, taking it to shoulder height with both hands with your arms extended in front of you. Adopt a wide stance. This will be…","Perform the movement by rotating the trunk and hips as you swing the weight all the way down to one side. Keep your arms extended throughout the…","Reverse the motion to swing the weight all the way to the opposite side."],"tips":[],"grip":null,"targets":"the abs, with the glutes, the lower back, the shoulders assisting"},"Treadmill Walk":{"instructions":["To begin, step onto the treadmill and select the desired option from the menu. Most treadmills have a manual setting, or you can select a program to…","Treadmills offer convenience, cardiovascular benefits, and usually have less impact than jogging outside. A 150 lb person will burn almost 250…"],"tips":[],"grip":null,"targets":"the quads, with the glutes, the hamstrings assisting"},"Face Pull":{"instructions":["Facing a high pulley with a rope or dual handles attached, pull the weight directly towards your face, separating your hands as you do so. Keep your…"],"tips":[],"grip":null,"targets":"the shoulders, with the mid-back assisting"},"Barbell Shrug":{"instructions":["Stand up straight with your feet at shoulder width as you hold a barbell with both hands in front of you using a pronated grip (palms facing the…","Raise your shoulders up as far as you can go as you breathe out and hold the contraction for a second.","Slowly return to the starting position as you breathe in.","Repeat for the recommended amount of repetitions."],"tips":["Your hands should be a little wider than shoulder width apart. You can use  wrist wraps for this exercise for a better…"],"grip":"Stand up straight with your feet at shoulder width as you hold a barbell  with both hands in front…","targets":"the traps"},"Smith Machine Split Squat":{"instructions":["To begin, first set the bar on the height that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar…","Hold on to the bar using both arms at each side (palms facing forward), unlock it and lift it off the rack by first pushing with your legs and at the…","Position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times and also maintain a…","Begin to slowly lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the lower back assisting"},"Medicine Ball Chest Pass":{"instructions":["You will need a partner for this exercise. Lacking one, this movement can be performed against a wall.","Begin facing your partner holding the medicine ball at your torso with both hands.","Pull the ball to your chest, and reverse the motion by extending through the elbows. For sports applications, you can take a step as you throw.","Your partner should catch the ball, and throw it back to you."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Hanging Knee Raise":{"instructions":["Hang from a chin-up bar with both arms extended at arms length in top of you using either a wide grip or a medium grip. The legs should be straight…","Raise your legs until the torso makes a 90-degree angle with the legs. Exhale as you perform this movement and hold the contraction for a second or…","Go back slowly to the starting position as you breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"Hang from a chin-up bar with both arms extended at arms length in top of  you using either a wide…","targets":"the abs"},"Sled Drag":{"instructions":["To begin, load the sled with the desired weight and attach the pulling strap. You can pull with handles, use a harness, or attach the pulling strap…","Whether pulling forwards or backwards, lean in the direction of travel and progress by extending through the hips and knees."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Hang Snatch":{"instructions":["Begin with a wide grip on the bar, with an overhand or hook grip. The feet should be directly below the hips with the feet turned out. Your knees…","Aggressively extend through the legs and hips. At peak extension, shrug the shoulders and allow the elbows to flex to the side.","As you move your feet into the receiving position, forcefully pull yourself below the bar as you elevate the bar overhead. Receive the bar with your…","Return to a standing position with the weight overhead. Follow by returning the weight to the ground under control."],"tips":[],"grip":"Begin with a wide grip on the bar, with an overhand or hook grip.","targets":"the hamstrings, with the abs, the calves, the forearms, the glutes, the lower back, the quads, the shoulders, the traps assisting"},"Cable Wrist Curl":{"instructions":["Start out by placing a flat bench in front of a low pulley cable that has a straight bar attachment.","Use your arms to grab the cable bar with a narrow to shoulder width supinated grip (palms up) and bring them up so that your forearms are resting…","Start out by curling your wrist upwards and exhaling. Keep the contraction for a second.","Slowly lower your wrists back down to the starting position while inhaling."],"tips":[],"grip":"Use your arms to grab the cable bar with a narrow to shoulder width  supinated grip (palms up) and…","targets":"the forearms"},"Clean and Press":{"instructions":["Assume a shoulder-width stance, with knees inside the arms. Now while keeping the back flat, bend at the knees and hips so that you can grab the bar…","Begin to pull the bar by extending the knees. Move your hips forward and raise the shoulders at the same rate while keeping the angle of the back…","As the bar passes the knee, extend at the ankles, knees, and hips forcefully, similar to a jumping motion. As you do so, continue to guide the bar…","At maximum elevation, your feet should clear the floor and you should start to pull yourself under the bar. The mechanics of this could change…"],"tips":[],"grip":null,"targets":"the shoulders, with the abs, the calves, the glutes, the hamstrings, the lower back, the mid-back, the quads, the shoulders, the traps, the triceps assisting"},"B-Stance Hip Thrust":{"instructions":["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can…","Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.","Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder…"],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"Lying Leg Curl":{"instructions":["Adjust the leg machine to a height that will allow you to get inside it with your knees bent and the thighs slightly below parallel.","Once you select the weight, position yourself inside the machine face up with the knees bent and thighs slightly below parallel to the platform. Make…","Place your hands by the handles and position your feet slightly pointing out at a shoulder width position. This will be your starting position.","While pressing with the balls of the feet as you breathe out, make your whole body erect as you squeeze the quads. Hold the contracted position for a…"],"tips":["Since you are starting below parallel, you can opt to use your  hands to help you up by pressing on your thighs only on…"],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Pull-Up":{"instructions":["Choke the band around the center of the pullup bar. You can use different bands to provide varying levels of assistance.","Pull the end of the band down, and place one bent knee into the loop, ensuring it won't slip out. Take a medium to wide grip on the bar. This will be…","Pull yourself upward by contracting the lats as you flex the elbow. The elbow should be driven to your side. Pull to the front, attempting to get…","After a brief pause, return to the starting position."],"tips":[],"grip":"Take a medium to wide grip on the bar.","targets":"the lats, with the abs, the forearms, the mid-back assisting"},"Standing Dumbbell Curl":{"instructions":["To begin, stand straight with a dumbbell in each hand using a pronated grip (palms facing down). Your arms should be fully extended while your feet…","While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue…","Slowly begin to bring the dumbbells back to starting position as your breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"To begin, stand straight with a dumbbell in each hand using a pronated  grip (palms facing down).","targets":"the biceps, with the forearms assisting"},"Cable Wood Chop":{"instructions":["Connect a standard handle to a tower, and move the cable to the highest pulley position.","With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the…","With your feet positioned shoulder width apart, reach upward with your other hand and grab the handle with both hands. Your arms should still be…","In one motion, pull the handle down and across your body to your front knee while rotating your torso."],"tips":[],"grip":null,"targets":"the abs, with the shoulders assisting"},"Close Grip Chin-Up":{"instructions":["Grab the pull-up bar with the palms facing your torso and a grip closer than the shoulder width.","As you have both arms extended in front of you holding the bar at the chosen grip width, keep your torso as straight as possible while creating a…","As you breathe out, pull your torso up until your head is around the level of the pull-up bar. Concentrate on using the biceps muscles in order to…","After a second of squeezing the biceps in the contracted position, slowly lower your torso back to the starting position; when your arms are fully…"],"tips":["Keeping the torso as straight as possible maximizes biceps  stimulation while minimizing back involvement."],"grip":"Grab the pull-up bar with the palms facing your torso and a grip closer  than the shoulder width.","targets":"the lats, with the biceps, the forearms, the mid-back assisting"},"Elliptical Trainer":{"instructions":["To begin, step onto the elliptical and select the desired option from the menu. Most ellipticals have a manual setting, or you can select a program…","The handles can be used to monitor your heart rate to help you stay at an appropriate intensity."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Overhead Squat":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Band Russian Twist":{"instructions":["Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the…","Elevate your upper body so that it creates an imaginary V-shape with your thighs. Your arms should be fully extended in front of you perpendicular to…","Twist your torso to the right side until your arms are parallel with the floor while breathing out.","Hold the contraction for a second and move back to the starting position while breathing out. Now move to the opposite side performing the same…"],"tips":[],"grip":null,"targets":"the abs, with the lower back assisting"},"Hip Hinge":{"instructions":["Position a bench in the rack and load the bar to an appropriate weight. Lie down on the bench, placing the bottom of your feet against the bar.…","Initiate the movement by rotating your pelvis, flexing your spine to raise your hips off of the bench. Maintain a slight bend in the knees throughout…","After a brief pause, return the hips to the bench.","Repeat for the desired number of repetitions."],"tips":[],"grip":null,"targets":"the abs"},"Double Kettlebell Press":{"instructions":["Clean two kettlebells to your shoulders.","Squat down a few inches and reverse the motion rapidly. Use the momentum from the legs to drive the kettlebells overhead.","Once the kettlebells are locked out, lower the kettlebells to your shoulders and repeat."],"tips":[],"grip":null,"targets":"the shoulders, with the calves, the quads, the triceps assisting"},"Power Walk":{"instructions":["Stand with your feet slightly wider than shoulder width apart and toes pointing out slightly.","Squat down and grasp bar with a closed, pronated grip. Your hands should be slightly wider than shoulder width apart outside knees with elbows fully…","Place the bar about 1 inch in front of your shins and over the balls of your feet.","Your back should be flat or slightly arched, your chest held up and out and your shoulder blades should be retracted."],"tips":["At this point your thighs should be  against the bar."],"grip":"Squat down and grasp bar with a closed, pronated grip.","targets":"the hamstrings, with the calves, the forearms, the glutes, the lower back, the mid-back, the quads, the shoulders, the traps, the triceps assisting"},"Leg Press Calf Raise":{"instructions":["Place a block about 12 inches in front of a flat bench.","Sit on the bench and place the ball of your feet on the block.","Have someone place a barbell over your upper thighs about 3 inches above your knees and hold it there. This will be your starting position.","Raise up on your toes as high as possible as you squeeze the calves and as you breathe out."],"tips":["To get maximum benefit stretch your calves as far as you can."],"grip":null,"targets":"the calves"},"Medicine Ball Slam":{"instructions":["Start in a standing position with a staggered, athletic stance. Hold a medicine ball in one hand, on the same side as your back leg. This will be…","Begin by winding the arm, raising the medicine ball above your head. As you do so, extend through the hips, knees, and ankles to load up for the slam.","At peak extension, flex the shoulders, spine, and hips to throw the ball hard into the ground directly in front of you.","Catch the ball on the bounce and continue for the desired number of repetitions."],"tips":[],"grip":null,"targets":"the abs, with the lats, the shoulders assisting"},"Smith Machine Decline Bench Press":{"instructions":["Place a flat bench underneath the smith machine. Now place the barbell at a height that you can reach when lying down and your arms are almost fully…","As you breathe in, come down slowly until you feel the bar on your middle chest.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms in the…","Repeat the movement for the prescribed amount of repetitions."],"tips":["It should take at least twice as long to go down than to come up."],"grip":"Using a pronated grip that is wider than shoulder width, unlock the bar from the  rack and hold it…","targets":"the chest, with the shoulders, the triceps assisting"},"Band High-to-Low Fly":{"instructions":["Get into pushup position on the toes with your hands just outside of shoulder width.","Perform a pushup by allowing the elbows to flex. As you descend, keep your body straight.","Do one pushup and as you come up, shift your weight on the left side of the body, twist to the side while bringing the right arm up towards the…","Lower the arm back to the floor for another pushup and then twist to the other side."],"tips":[],"grip":null,"targets":"the chest, with the abs, the shoulders, the triceps assisting"},"Band Concentration Curl":{"instructions":["Sit down on a flat bench with a barbell or E-Z Bar in front of you in between your legs. Your legs should be spread with the knees bent and the feet…","Use your arms to pick the barbell up and place the back of your upper arms on top of your inner thighs (around three and a half inches away from the…","While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Only the forearms should move.…","Slowly begin to bring the barbell back to starting position as your breathe in."],"tips":["Your arm should be extended at arms length and the  barbell should be above the floor. This will be your starting…"],"grip":"A supinated grip closer than shoulder width is needed to  perform this exercise.","targets":"the biceps"},"Hill Sprint":{"instructions":["Stand on the ground with one foot resting on a bench or box with your heel close to the edge.","Push off with your foot on top of the bench, extending through the hip and knee.","Land with the opposite foot on top of the box, returning your other foot back to the start position.","Continue alternating from one foot to another to complete the set."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Farmer Calf Raise Walk":{"instructions":["Place a block about 12 inches in front of a flat bench.","Sit on the bench and place the ball of your feet on the block.","Have someone place a barbell over your upper thighs about 3 inches above your knees and hold it there. This will be your starting position.","Raise up on your toes as high as possible as you squeeze the calves and as you breathe out."],"tips":["To get maximum benefit stretch your calves as far as you can."],"grip":null,"targets":"the calves"},"Good Morning":{"instructions":["Begin with a bar on a rack at shoulder height. Rack the bar across the rear of your shoulders as you would a power squat, not on top of your…","Begin by bending at the hips, moving them back as you bend over to near parallel. Keep your back arched and your cervical spine in proper alignment.","Reverse the motion by extending through the hips with your glutes and hamstrings. Continue until you have returned to the starting position."],"tips":[],"grip":null,"targets":"the hamstrings, with the abs, the glutes, the lower back assisting"},"Water Running":{"instructions":["To begin, step onto the treadmill and select the desired option from the menu. Most treadmills have a manual setting, or you can select a program to…","Treadmills offer convenience, cardiovascular benefits, and usually have less impact than running outside. A 150 lb person will burn over 450 calories…"],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings assisting"},"Incline Dumbbell Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Cable Curl":{"instructions":["Stand up with your torso upright while holding a bar attachment that is attached to a low pulley using a pronated (palms down) and shoulder width…","While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue…","Slowly begin to bring the bar back to starting position as your breathe in.","Repeat for the recommended amount of repetitions."],"tips":[],"grip":"Stand up with your torso upright while holding a bar attachment that is  attached to a low pulley…","targets":"the biceps, with the forearms assisting"},"Cable Leg Curl":{"instructions":["Adjust the machine lever to fit your height and sit on the machine with your back against the back support pad.","Place the back of lower leg on top of padded lever (just a few inches under the calves) and secure the lap pad against your thighs, just above the…","As you exhale, pull the machine lever as far as possible to the back of your thighs by flexing at the knees. Keep your torso stationary at all times.…","Slowly return to the starting position as you breathe in."],"tips":[],"grip":null,"targets":"the hamstrings"},"Standing Calf Raise":{"instructions":["Place a block about 12 inches in front of a flat bench.","Sit on the bench and place the ball of your feet on the block.","Have someone place a barbell over your upper thighs about 3 inches above your knees and hold it there. This will be your starting position.","Raise up on your toes as high as possible as you squeeze the calves and as you breathe out."],"tips":["To get maximum benefit stretch your calves as far as you can."],"grip":null,"targets":"the calves"},"Band Pallof Press":{"instructions":["Connect a standard handle to a tower, and—if possible—position the cable to shoulder height. If not, a low pulley will suffice.","With your side to the cable, grab the handle with both hands and step away from the tower. You should be approximately arm's length away from the…","With your feet positioned hip-width apart and knees slightly bent, hold the cable to the middle of your chest. This will be your starting position.","Press the cable away from your chest, fully extending both arms. You core should be tight and engaged."],"tips":[],"grip":null,"targets":"the abs, with the chest, the shoulders, the triceps assisting"},"Power Jerk":{"instructions":["Standing with the weight racked on the front of the shoulders, begin with the dip. With your feet directly under your hips, flex the knees without…","Drive through the heels create as much speed and force as possible, and be sure to move your head out of the way as the bar leaves the shoulders.","At this moment as the feet leave the floor, the feet must be placed into the receiving position as quickly as possible. In the brief moment the feet…","Receive the bar with the arms locked out overhead."],"tips":[],"grip":null,"targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the shoulders, the triceps assisting"},"Hack Squat Machine":{"instructions":["Stand up straight while holding a barbell behind you at arms length and your feet at shoulder width. This will be your starting position.","While keeping your head and eyes up and back straight, squat until your upper thighs are parallel to the floor. Breathe in as you slowly go down.","Pressing mainly with the heel of the foot and squeezing the thighs, go back up as you breathe out.","Repeat for the recommended amount of repetitions."],"tips":["A shoulder width grip is best with the palms  of your hands facing back. You can use wrist wraps for this exercise for…"],"grip":"Tip: A shoulder width grip is best with the palms  of your hands facing back.","targets":"the quads, with the calves, the forearms, the hamstrings assisting"},"Scapular Pull-Up":{"instructions":["Take a pronated grip on a pull-up bar.","From a hanging position, raise yourself a few inches without using your arms. Do this by depressing your shoulder girdle in a reverse shrugging…","Pause at the completion of the movement, and then slowly return to the starting position before performing more repetitions."],"tips":[],"grip":"Take a pronated grip on a pull-up bar.","targets":"the traps, with the lats, the mid-back assisting"},"Band Squat":{"instructions":["Begin in a power rack with a box at the appropriate height behind you. Set up the bands either on band pegs or attached to the top of the rack,…","Begin by stepping under the bar and placing it across the back of the shoulders. Squeeze your shoulder blades together and rotate your elbows…","With your back, shoulders, and core tight, push your knees and butt out and you begin your descent. Sit back with your hips until you are seated on…","Keeping the weight on your heels and pushing your feet and knees out, drive upward off of the box as you lead the movement with your head. Continue…"],"tips":[],"grip":null,"targets":"the quads, with the outer hip (abductors), the inner thigh (adductors), the calves, the forearms, the glutes, the hamstrings, the lower back assisting"},"Close Grip Push-Up":{"instructions":["Stand facing a Smith machine bar or sturdy elevated platform at an appropriate height.","Place your hands next to one another on the bar.","Position your feet back from the bar with arms and body straight. This will be your starting position.","Keeping your body straight, lower your chest to the bar by bending the arms."],"tips":[],"grip":null,"targets":"the triceps, with the chest, the shoulders assisting"},"Romanian Deadlift":{"instructions":["Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width.","Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.","Keeping your back and arms completely straight at all times, use your hips to lift the bar as you exhale.","Once you are standing completely straight up, lower the bar by pushing the hips back, only slightly bending the knees, unlike when squatting."],"tips":["Depending  on the weight used, you may need wrist wraps to perform the exercise and also a  raised platform in order to…"],"grip":"Put a barbell in front of you on the ground and grab it using a pronated  (palms facing down) grip…","targets":"the hamstrings, with the calves, the glutes, the lower back assisting"},"Behind-the-Neck Press":{"instructions":["Lie back on a flat bench. Using a medium-width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the…","As you breathe in, come down slowly until you feel the bar on your neck.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and…","Repeat the movement for the prescribed amount of repetitions."],"tips":["It should take at least twice as long to go down  than to come up)."],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Smith Machine Single-Arm Press":{"instructions":["Place a flat bench underneath the smith machine. Now place the barbell at a height that you can reach when lying down and your arms are almost fully…","As you breathe in, come down slowly until you feel the bar on your middle chest.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms in the…","Repeat the movement for the prescribed amount of repetitions."],"tips":["It should take at least twice as long to go down than to come up."],"grip":"Using a pronated grip that is wider than shoulder width, unlock the bar from the  rack and hold it…","targets":"the chest, with the shoulders, the triceps assisting"},"Band Hip Thrust":{"instructions":["Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can…","Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.","Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder…"],"tips":[],"grip":null,"targets":"the glutes, with the calves, the hamstrings assisting"},"Decline Barbell Bench Press":{"instructions":["Secure your legs at the end of the decline bench and slowly lay down on the bench.","Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar…","As you breathe in, come down slowly until you feel the bar on your lower chest.","After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and…"],"tips":["In order to protect your rotator cuff, it is best if you have a spotter help you  lift the barbell off the rack."],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Rear Delt Machine Fly":{"instructions":["Stand up straight while holding a barbell using a wide (higher than shoulder width) and overhand (palms facing your body) grip.","Bend knees slightly and bend over as you keep the natural arch of your back. Let the arms hang in front of you as they hold the bar. Once your torso…","While keeping the upper arms perpendicular to the torso, pull the barbell up towards your upper chest as you squeeze the rear delts and you breathe…","Slowly go back to the initial position as you breathe in."],"tips":["Your  torso and your arms should resemble the letter \"T\". Now you are ready to begin  the exercise."],"grip":"Stand up straight while holding a barbell using a wide (higher than  shoulder width) and overhand…","targets":"the shoulders, with the biceps, the lats, the mid-back assisting"},"Medicine Ball Russian Twist":{"instructions":["For this exercise you will need a medicine ball and a partner. Stand back to back with your partner, spaced 2-3 feet apart. This will be your…","Hold the ball in front of the trunk. Open the hips and turn the shoulders at the same time as your partner.","For full rotation, you and your partner should twist in the same direction, i.e. counter-clockwise.","Pass the ball to your partner, and both of you can now twist in the opposite direction to repeat the procedure."],"tips":[],"grip":null,"targets":"the abs, with the shoulders assisting"},"Seated Barbell Press":{"instructions":["Sit on the floor and spread your legs out comfortably.","Clean one kettlebell to your shoulder.","Press the kettlebell up and out until it is locked out overhead. Return to the starting position."],"tips":[],"grip":null,"targets":"the shoulders, with the triceps assisting"},"Step-Up":{"instructions":["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck) and stand upright behind an elevated…","Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift…","Step down with the left leg by flexing the hip and knee of the right leg as you inhale. Return to the original standing position by placing the right…","Repeat with the right leg for the recommended amount of repetitions and then perform with the left leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the quads assisting"},"Kneeling Cable Press":{"instructions":["Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your…","Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the…","After pausing at full extension, return to th starting position, keeping tension on the cables.","You can also execute this movement with your back off the pad, at an incline or decline, or alternate hands."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Seated Leg Curl":{"instructions":["Adjust the machine lever to fit your height and sit on the machine with your back against the back support pad.","Place the back of lower leg on top of padded lever (just a few inches under the calves) and secure the lap pad against your thighs, just above the…","As you exhale, pull the machine lever as far as possible to the back of your thighs by flexing at the knees. Keep your torso stationary at all times.…","Slowly return to the starting position as you breathe in."],"tips":[],"grip":null,"targets":"the hamstrings"},"Chest Pass to Sit-Up":{"instructions":["Start off by lying on the floor.","Extend one leg straight and pull the other knee to your chest. Hold under the knee joint to protect the kneecap.","Gently tug that knee toward your nose.","Switch sides. This stretches the buttocks and lower back of the bent leg and the hip flexor of the straight leg."],"tips":[],"grip":null,"targets":"the glutes, with the hamstrings, the lower back assisting"},"Single Leg Glute Bridge":{"instructions":["Lay on the floor with your feet flat and knees bent.","Raise one leg off of the ground, pulling the knee to your chest. This will be your starting position.","Execute the movement by driving through the heel, extending your hip upward and raising your glutes off of the ground.","Extend as far as possible, pause and then return to the starting position."],"tips":[],"grip":null,"targets":"the glutes, with the hamstrings assisting"},"Reverse Grip Pushdown":{"instructions":["Start by setting a bar attachment (straight or e-z) on a high pulley machine.","Facing the bar attachment, grab it with the palms facing up (supinated grip) at shoulder width. Lower the bar by using your lats until your arms are…","Slowly elevate the bar attachment up as you inhale so it is aligned with your chest. Only the forearms should move and the elbows/upper arms should…","Then begin to lower the cable bar back down to the original staring position while exhaling and contracting the triceps hard."],"tips":["Elbows should be in by your sides and your  feet should be shoulder width apart from each other. This is the starting …"],"grip":"Facing the bar attachment, grab it with the palms facing up (supinated  grip) at shoulder width.","targets":"the triceps"},"Standing Dumbbell Overhead Press":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Box Step-Ups":{"instructions":["Stand up straight while holding a barbell placed on the back of your shoulders (slightly below the neck) and stand upright behind an elevated…","Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift…","Step down with the left leg by flexing the hip and knee of the right leg as you inhale. Return to the original standing position by placing the right…","Repeat with the right leg for the recommended amount of repetitions and then perform with the left leg."],"tips":[],"grip":null,"targets":"the quads, with the calves, the glutes, the hamstrings, the quads assisting"},"Decline Crunch":{"instructions":["Secure your legs at the end of the decline bench and lie down.","Now place your hands lightly on either side of your head keeping your elbows in.","While pushing the small of your back down in the bench to better isolate your abdominal muscles, begin to roll your shoulders off it.","Continue to push down as hard as you can with your lower back as you contract your abdominals and exhale. Your shoulders should come up off the bench…"],"tips":["Don't lock your fingers behind your head."],"grip":null,"targets":"the abs"},"Selectorised Chest Press":{"instructions":["Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your…","Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the…","After pausing at full extension, return to th starting position, keeping tension on the cables.","You can also execute this movement with your back off the pad, at an incline or decline, or alternate hands."],"tips":[],"grip":null,"targets":"the chest, with the shoulders, the triceps assisting"},"Spider Curl":{"instructions":["Start out by setting the bar on the part of the preacher bench that you would normally sit on. Make sure to align the barbell properly so that it is…","Move to the front side of the preacher bench (the part where the arms usually lay) and position yourself to lay at a 45 degree slant with your torso…","Make sure that your feet (especially the toes) are well positioned on the floor and place your upper arms on top of the pad located on the inside…","Use your arms to grab the barbell with a supinated grip (palms facing up) at about shoulder width apart or slightly closer from each other."],"tips":[],"grip":"Use your arms to grab the barbell with a supinated grip (palms facing up)  at about shoulder width…","targets":"the biceps"},"Chin-Up":{"instructions":["Grab the pull-up bar with the palms facing your torso and a grip closer than the shoulder width.","As you have both arms extended in front of you holding the bar at the chosen grip width, keep your torso as straight as possible while creating a…","As you breathe out, pull your torso up until your head is around the level of the pull-up bar. Concentrate on using the biceps muscles in order to…","After a second of squeezing the biceps in the contracted position, slowly lower your torso back to the starting position; when your arms are fully…"],"tips":["Keeping the torso as straight as possible maximizes biceps  stimulation while minimizing back involvement."],"grip":"Grab the pull-up bar with the palms facing your torso and a grip closer  than the shoulder width.","targets":"the lats, with the biceps, the forearms, the mid-back assisting"},"T Drill":{"instructions":["This drill helps increase arm efficiency during the run. Begin kneeling, left foot in front, right knee down. Apply pressure through the front heel…","Begin by blocking the arms in long, pendulum like swings. Close the arm angle, blocking with the arms as you would when jogging, progressing to a run…","As soon as your hands pass the hip, accelerate them forward during the sprinting motion to move them as quickly as possible.","Switch knees and repeat."],"tips":[],"grip":null,"targets":"the shoulders, with the abs assisting"},"Decline Dumbbell Bench Press":{"instructions":["Secure your legs at the end of the decline bench and lie down with a dumbbell on each hand on top of your thighs. The palms of your hand will be…","Once you are laying down, move the dumbbells in front of you at shoulder width.","Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. This will be your starting position.","Bring down the weights slowly to your side as you breathe out. Keep full control of the dumbbells at all times."],"tips":["Throughout the motion, the forearms  should always be perpendicular to the floor."],"grip":"The palms of your hand will be  facing each other.","targets":"the chest, with the shoulders, the triceps assisting"},"Band Decline Press":{"instructions":["Place a decline bench underneath the Smith machine. Now place the barbell at a height that you can reach when lying down and your arms are almost…","As you inhale, lower the bar under control by allowing the elbows to flex, lightly contacting the torso.","After a brief pause, bring the bar back to the starting position by extending the elbows, exhaling as you do so.","Repeat the movement for the prescribed amount of repetitions."],"tips":[],"grip":"Using a pronated grip that is wider than shoulder width, unlock the  bar from the rack and hold it…","targets":"the chest, with the shoulders, the triceps assisting"},"Converging Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"},"Kettlebell Overhead Press":{"instructions":["Start out by having a barbell in front of you on the floor. Your feet should be wider than shoulder width apart from each other.","Bend the knees and use a pronated grip (palms facing you) to grab the barbell. Your hands should be at a wider than shoulder width apart from each…","Move the barbell over and slightly behind your head and make sure your arms are fully extended. Keep your head up at all times and also maintain a…","Slowly lower the weight by bending your knees until your thighs are parallel to the ground while inhaling."],"tips":["Keep your back straight while  performing this exercise to avoid any injuries and your arms should remain  extended and…"],"grip":"Bend the knees and use a pronated grip (palms facing you) to grab the  barbell.","targets":"the quads, with the abs, the calves, the glutes, the hamstrings, the lower back, the shoulders, the triceps assisting"},"Side Plank":{"instructions":["Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.","Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."],"tips":[],"grip":null,"targets":"the abs"},"Iso-Lateral Shoulder Press":{"instructions":["Move the cables to the bottom of the tower and select an appropriate weight.","Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.","Keeping your head and chest up, extend through the elbow to press one side directly over head.","After pausing at the top, return to the starting position and repeat on the opposite side."],"tips":[],"grip":"Grasp the cables and hold them at shoulder height, palms facing forward.","targets":"the shoulders, with the triceps assisting"}};
const MOVE_PATTERNS = [
  { test: /squat|lunge|step-?up|split squat|pistol|sissy|wall sit/i,
    instructions: ["Set your stance and brace your core before you move.", "Lower under control, keeping your chest up and knees tracking over your toes.", "Reach full depth for the variation without your lower back rounding.", "Drive back up through your whole foot to standing."],
    grip: null,
    tips: ["Keep the weight spread across your whole foot, not just your toes.", "Control the descent — don't just drop into the bottom."],
    mistakes: ["Letting the knees cave inward.", "Rounding the lower back at the bottom.", "Rising onto the toes instead of driving through the heel."],
    targets: "quads, glutes and hamstrings, with core bracing throughout" },
  { test: /deadlift|good morning|hip hinge|rdl|romanian/i,
    instructions: ["Set your feet under the bar or weight, grip just outside your legs.", "Brace your core and flatten your back before you pull.", "Push the floor away, keeping the weight close to your body.", "Finish by driving your hips through, not by leaning back."],
    grip: "Double overhand to start; a mixed or hook grip helps once the weight gets heavy.",
    tips: ["Think 'push the floor away' rather than 'pull the weight up'.", "Keep the bar or weight brushing your legs on the way up."],
    mistakes: ["Rounding the lower back.", "Letting the weight drift away from your body.", "Hyperextending at the top instead of stopping at full hip extension."],
    targets: "hamstrings, glutes and the entire posterior chain" },
  { test: /bench press|floor press|chest press|push-?up|dip|fly|pullover|svend|press-out/i,
    instructions: ["Set your grip and brace your shoulder blades together.", "Lower under control to a full stretch at your chest.", "Keep your elbows at a controlled angle, not flared straight out.", "Press back to the start without losing shoulder position."],
    grip: "Slightly wider than shoulder width for a flatter angle; narrower shifts more load onto the triceps.",
    tips: ["Keep your feet planted and drive through the floor for stability.", "Control the eccentric — don't let the weight drop."],
    mistakes: ["Flaring the elbows straight out to the sides.", "Bouncing the weight off your chest.", "Losing shoulder blade position mid-set."],
    targets: "chest, with front shoulders and triceps assisting" },
  { test: /overhead press|shoulder press|push press|push jerk|split jerk|arnold|z press|viking|bradford|military press/i,
    instructions: ["Start with the weight at shoulder height, core braced.", "Press straight up, moving your head back slightly to let it pass.", "Lock out fully overhead with the weight stacked over your shoulders.", "Lower under control back to the start position."],
    grip: "Just outside shoulder width, wrists stacked directly over your elbows.",
    tips: ["Squeeze your glutes to keep your lower back from arching.", "Finish each rep with the weight directly over your ears, not out in front."],
    mistakes: ["Arching the lower back to help the weight up.", "Pressing the weight forward instead of straight overhead.", "Flaring elbows too wide at the start."],
    targets: "shoulders, with triceps and upper chest assisting" },
  { test: /lateral raise|front raise|y raise|w raise|t raise|arm circle/i,
    instructions: ["Start with a slight bend in your elbows.", "Raise with control, leading with your elbows rather than your hands.", "Stop around shoulder height — don't shrug it higher.", "Lower slowly; this is where most of the work happens."],
    grip: null,
    tips: ["Use a lighter weight than you think — strict form matters far more than load here.", "Keep a very slight forward lean on lateral raises to hit the mid-delt better."],
    mistakes: ["Swinging the weight up with momentum.", "Shrugging the shoulders to assist the lift.", "Going heavier than strict form allows."],
    targets: "the shoulders, isolating a specific head of the deltoid" },
  { test: /rear delt|reverse fly|face pull|pull-?apart|prone y|prone t|prone w/i,
    instructions: ["Hinge forward slightly or lie chest-supported.", "Pull your arms back and out, squeezing your shoulder blades together.", "Keep a slight bend in the elbows throughout.", "Return slowly, resisting the weight the whole way."],
    grip: "An overhand or neutral grip both work — neutral tends to feel more comfortable on the wrists.",
    tips: ["Focus on squeezing your shoulder blades, not just moving your arms.", "Keep the reps slow — this movement is easy to cheat with momentum."],
    mistakes: ["Using the lower back to heave the weight up.", "Moving too fast and relying on momentum.", "Not actually squeezing the shoulder blades together."],
    targets: "rear deltoids and upper back, key for shoulder health and posture" },
  { test: /curl/i,
    instructions: ["Start with your arms extended, elbows pinned to your sides.", "Curl up without swinging your torso for momentum.", "Squeeze hard at the top of the movement.", "Lower slowly under full control to a complete stretch."],
    grip: "Underhand (supinated) for standard curls; a neutral/hammer grip shifts emphasis onto the brachialis and forearm.",
    tips: ["Keep your elbows still — they shouldn't drift forward as you curl.", "Slow the lowering phase down; that's where a lot of the growth stimulus comes from."],
    mistakes: ["Swinging the torso to sling the weight up.", "Letting the elbows travel forward.", "Only doing the top half of the range of motion."],
    targets: "the biceps, with forearms and grip assisting" },
  { test: /pushdown|skull ?crusher|triceps extension|kickback|tate press|jm press|french press/i,
    instructions: ["Pin your upper arms/elbows in place before you start.", "Extend through the elbow until your arm is straight.", "Squeeze the triceps hard at full extension.", "Return under control to a full stretch."],
    grip: "A pronated (overhand) grip is standard; a rope or neutral grip is easier on the wrists and elbows.",
    tips: ["Keep your elbows fixed — they shouldn't flare out or drift as you extend.", "Full range of motion beats going heavier with a partial range."],
    mistakes: ["Letting the elbows flare outward.", "Using body English to move more weight.", "Cutting the range of motion short at the top."],
    targets: "the triceps" },
  { test: /row|pulldown|pull-?up|chin-?up|shrug/i,
    instructions: ["Set your grip and brace before initiating the pull.", "Pull with your elbows, driving them back and down (or up for shrugs).", "Squeeze your shoulder blades together at the end of the movement.", "Return under control to a full stretch."],
    grip: "Overhand (pronated) targets the upper back more; underhand (supinated) brings the biceps in more.",
    tips: ["Lead with your elbows, not your hands, for most rows and pulldowns.", "Avoid using momentum from your lower back to move the weight."],
    mistakes: ["Using body swing/momentum instead of control.", "Shrugging up instead of pulling with the lats/back.", "Cutting the range short at the stretched position."],
    targets: "the back — lats, rhomboids and traps depending on the exact variation" },
  { test: /shoulder press machine|leg press|leg extension|leg curl|hip thrust|glute bridge|adduct|abduct|calf raise/i,
    instructions: ["Set the machine or your body position correctly before loading up.", "Move through a full, controlled range of motion.", "Pause briefly at the point of peak contraction.", "Return under control — don't let the weight drop."],
    grip: null,
    tips: ["A brief pause at the hardest point of the rep improves the training effect.", "Full range of motion matters more than the amount of weight."],
    mistakes: ["Using a partial range of motion to move more weight.", "Letting the weight stack slam down between reps.", "Rushing through reps without control."],
    targets: "the targeted muscle group directly, with minimal assistance from other muscles" },
  { test: /plank|hollow|dead bug|bird dog|pallof|body saw|l-sit|stir the pot/i,
    instructions: ["Set your position with a neutral spine.", "Brace your core hard, like you're about to be punched.", "Hold or move slowly without letting your form break down.", "Breathe steadily throughout — don't hold your breath."],
    grip: null,
    tips: ["Quality over duration — a strict 20 seconds beats a sloppy 60.", "Squeeze your glutes to help keep your hips from sagging."],
    mistakes: ["Letting the hips sag or pike up.", "Holding your breath instead of breathing steadily.", "Losing the neutral spine position as fatigue sets in."],
    targets: "deep core stability and anti-movement bracing strength" },
  { test: /crunch|sit-?up|v-up|leg raise|toe touch|flutter|scissor|windshield/i,
    instructions: ["Start from a controlled position, not a swing.", "Curl or raise using your abs, not momentum.", "Squeeze at the top of the movement.", "Lower under control back to the start."],
    grip: null,
    tips: ["Exhale as you crunch or raise to engage the abs more fully.", "Keep the movement slow and controlled rather than fast and jerky."],
    mistakes: ["Yanking on your neck with your hands.", "Using momentum/swinging instead of controlled reps.", "Not controlling the lowering phase."],
    targets: "the rectus abdominis (the 'six-pack' muscles)" },
  { test: /twist|wood ?chop|rotation|halo/i,
    instructions: ["Set a stable base with your feet planted.", "Rotate through your torso, not just your arms.", "Control the movement in both directions.", "Keep your hips relatively stable as your torso rotates."],
    grip: null,
    tips: ["Move slowly enough that momentum isn't doing the work for you.", "Keep your core braced throughout, not just at the start."],
    mistakes: ["Using momentum to whip through the rotation.", "Rotating from the hips instead of the torso.", "Rushing the tempo."],
    targets: "the obliques and rotational core strength" },
  { test: /carry|farmer|suitcase|waiter/i,
    instructions: ["Pick up the load with a flat back and braced core.", "Stand tall — shoulders back, not leaning to one side.", "Walk with short, controlled steps.", "Set the weight down with the same control you picked it up with."],
    grip: "A firm, full grip — this movement doubles as serious grip training.",
    tips: ["Keep your shoulders pulled back, don't let the weight round you forward.", "Breathe steadily — don't hold your breath through the whole carry."],
    mistakes: ["Leaning to one side to compensate for the load.", "Taking long strides, which reduces core tension.", "Letting the shoulders round forward."],
    targets: "grip, core stability and total-body tension under load" },
  { test: /swing|clean|snatch|jerk|thruster|turkish get-?up|man maker|devil press/i,
    instructions: ["Set up with a strong, stable base.", "Generate power from your hips and legs, not your arms.", "Move explosively through the power phase of the lift.", "Control the finish position before resetting for the next rep."],
    grip: null,
    tips: ["This is a technical, full-body movement — start light and prioritize the pattern before adding load.", "Power comes from the hips snapping through, not from pulling with your arms."],
    mistakes: ["Trying to muscle the weight up with the arms.", "Rushing the technique before it's grooved.", "Losing the braced, stable base mid-rep."],
    targets: "full-body power, coordination and conditioning" },
  { test: /burpee|mountain climber|jump|jack|skater|bear crawl|crab walk|thrust|shuttle|sprint|carioca|bound/i,
    instructions: ["Set a stable starting position.", "Move explosively and with intent through each rep.", "Land or reset softly to protect your joints.", "Keep a consistent, sustainable pace across the set."],
    grip: null,
    tips: ["Land softly on jumps — absorb through your knees and hips, not your lower back.", "Pace yourself — an unsustainable start means a much weaker finish."],
    mistakes: ["Landing stiff-legged on jumping movements.", "Going all-out immediately and fading badly.", "Letting form break down as fatigue sets in."],
    targets: "full-body conditioning, power and cardiovascular capacity" },
  { test: /treadmill|run|jog|walk|bike|cycle|row|rowing|elliptical|stair|ski erg|skierg|swim|freestyle|backstroke|breaststroke|butterfly|versaclimber|jacobs ladder|assault runner/i,
    instructions: ["Warm up for 3-5 minutes at an easy pace.", "Settle into the target pace or effort level for the session.", "Maintain steady, controlled breathing throughout.", "Cool down gradually rather than stopping abruptly."],
    grip: null,
    tips: ["You should be able to hold a conversation during easy/steady efforts.", "Keep your posture tall — don't hunch over the equipment."],
    mistakes: ["Starting too fast and fading badly.", "Poor posture that strains the lower back or neck.", "Skipping the warm-up and cool-down."],
    targets: "cardiovascular fitness and aerobic conditioning" },
  { test: /agility ladder|cone drill|t drill|lateral shuffle|acceleration|deceleration/i,
    instructions: ["Set up the drill pattern before you start.", "Stay light on your feet with quick, small ground contacts.", "Keep your hips low and your center of gravity stable.", "Focus on precision first, then add speed."],
    grip: null,
    tips: ["Master the footwork pattern slowly before trying to go fast.", "Keep your eyes up, not looking down at your feet."],
    mistakes: ["Rushing the pattern before the footwork is clean.", "Standing too upright, which slows your direction changes.", "Looking down at your feet instead of ahead."],
    targets: "agility, footwork and change-of-direction speed" },
];

const GENERIC_DESC = {
  instructions: ["Set up in a stable, controlled starting position.", "Perform the movement through a full range of motion.", "Keep your core braced throughout.", "Return to the start position under control, not by dropping the weight."],
  grip: null,
  tips: ["Prioritize strict form over the amount of weight moved.", "Control the lowering phase — don't let momentum do the work."],
  mistakes: ["Using momentum instead of muscle control.", "Cutting the range of motion short.", "Rushing the tempo."],
  targets: "the working muscle for this movement",
};

/* Modifiers layer variation-specific detail on top of the base movement
   pattern, so "Incline Dumbbell Bench Press" and "Decline Barbell Bench
   Press" read differently even though both are presses — each modifier
   adds its own tip, mistake, grip note, or target refinement rather than
   every variation sharing one generic block. */
const MODIFIERS = [
  { test: /incline/i, tip: "The steeper the incline, the more the emphasis shifts toward the upper/front portion of the muscle — don't set it so steep it turns into a shoulder press.", mistake: "Setting the incline too steep, which shifts the work off the intended muscle.", targetSuffix: " (upper/front emphasis from the incline angle)" },
  { test: /decline/i, tip: "Keep the range of motion full even though it's shorter at this angle — don't just bounce off the bottom.", mistake: "Using a decline so steep it becomes a triceps-dominant movement instead.", targetSuffix: " (lower emphasis from the decline angle)" },
  { test: /close.?grip|narrow/i, tip: "A closer grip shifts more of the load onto your triceps — expect to use less weight than a standard grip.", mistake: "Gripping so narrow it strains your wrists.", targetSuffix: ", with extra triceps involvement from the narrow grip" },
  { test: /wide.?grip/i, tip: "A wider grip shortens the range of motion but increases stress on the shoulders — warm up thoroughly.", mistake: "Going too wide and turning it into a partial-range shoulder strain.", targetSuffix: ", emphasizing width/outer fibers from the wide grip" },
  { test: /single.?arm|single.?leg|one.?arm|unilateral|b-stance|bulgarian/i, tip: "Move slower than you would on the two-limb version — balance is part of the challenge here.", mistake: "Rotating or twisting your torso to compensate for the unbalanced load.", targetSuffix: ", with a strong unilateral stability and core-bracing component" },
  { test: /alternating/i, tip: "Keep the resting arm/leg completely still while the other one works — don't let it swing for momentum.", mistake: "Using the resting limb to help swing the working one.", targetSuffix: "" },
  { test: /seated/i, tip: "Keep your feet flat and back supported — the seat removes leg drive, so isolate the target muscle honestly.", mistake: "Arching off the seat to use momentum from your lower body.", targetSuffix: "" },
  { test: /standing/i, tip: "Brace your core hard — standing removes back support, so your trunk has to stabilize the whole rep.", mistake: "Leaning back excessively to help move the weight.", targetSuffix: ", with extra core stabilization since you're standing" },
  { test: /smith machine/i, tip: "The fixed bar path means you don't need to stabilize side-to-side — use that to focus purely on the target muscle.", mistake: "Forgetting the bar path is fixed and fighting against it.", targetSuffix: "" },
  { test: /machine|plate loaded|selectorised|iso-lateral|hammer strength|lever /i, tip: "Adjust the seat and pads to your body before loading weight — a bad setup ruins the exercise.", mistake: "Using a seat/pad setting that doesn't match your body, throwing off the whole movement path.", targetSuffix: "" },
  { test: /cable/i, tip: "Cables keep tension on the muscle through the entire range, including the stretch — don't rush through that part.", mistake: "Letting the weight stack slam down between reps, losing tension.", targetSuffix: "" },
  { test: /band(?!.*wrist)/i, tip: "Resistance bands get harder as you stretch them — the top of the rep is where they challenge you most.", mistake: "Choosing a band that's too light, so the hardest part of the rep is still too easy.", targetSuffix: "" },
  { test: /kettlebell/i, tip: "The offset handle changes how the weight moves compared to a dumbbell — go lighter than you'd expect at first.", mistake: "Using dumbbell technique on a kettlebell movement where it doesn't translate.", targetSuffix: "" },
  { test: /weighted|loaded/i, tip: "Add weight only once you can do the unweighted version with strict, full-range form.", mistake: "Adding load before the bodyweight version is under control.", targetSuffix: "" },
  { test: /assisted/i, tip: "Use only as much assistance as you need — the goal is to reduce it over time, not rely on it.", mistake: "Using more assistance than necessary, which slows progress toward the unassisted version.", targetSuffix: "" },
  { test: /explosive|plyometric|jump|clap/i, tip: "Land soft and controlled — the explosive part is on the way up, not the landing.", mistake: "Landing stiff-legged, which loads the joints instead of the muscles.", targetSuffix: ", with a power/explosiveness component" },
  { test: /pause|isometric|hold/i, tip: "Don't relax during the pause — keep the target muscle under tension the whole time.", mistake: "Treating the pause as a rest instead of held tension.", targetSuffix: ", with extra time-under-tension from the pause/hold" },
  { test: /deficit/i, tip: "The deficit increases the range of motion — go lighter than the standard version until you adapt.", mistake: "Using standard-version weight on a deficit variation, which cuts the range short.", targetSuffix: ", with an extended range of motion from the deficit" },
  { test: /sumo/i, tip: "The wider stance shifts emphasis toward the inner thighs and glutes compared to a conventional stance.", mistake: "Not turning the toes out enough to match the wide stance, straining the knees.", targetSuffix: ", with more inner-thigh and glute involvement from the wide stance" },
  { test: /reverse grip|underhand/i, tip: "An underhand grip typically brings the biceps in more — expect a different feel than an overhand grip.", mistake: "Not adjusting expected load — underhand grip movements often feel different in strength.", targetSuffix: "" },
  { test: /neutral grip|hammer/i, tip: "A neutral (palms-facing) grip is usually easier on the wrists and shoulders than a straight bar.", mistake: "Ignoring wrist discomfort that a neutral grip could fix.", targetSuffix: "" },
];

function describeExercise(name) {
  const real = REAL_DB[name];
  const patternMatch = MOVE_PATTERNS.find(p => p.test.test(name)) || GENERIC_DESC;
  const base = real
    ? { instructions: real.instructions, grip: real.grip || patternMatch.grip, tips: real.tips.length ? real.tips : patternMatch.tips, mistakes: patternMatch.mistakes, targets: real.targets }
    : patternMatch;

  const mods = MODIFIERS.filter(m => m.test.test(name));
  if (mods.length === 0) return base;

  const tips = [...base.tips];
  const mistakes = [...base.mistakes];
  let targets = base.targets;
  let grip = base.grip;

  mods.slice(0, 2).forEach(m => {
    if (m.tip && !tips.includes(m.tip)) tips.push(m.tip);
    if (m.mistake && !mistakes.includes(m.mistake)) mistakes.push(m.mistake);
    if (!real && m.targetSuffix) targets += m.targetSuffix;
  });

  return { instructions: base.instructions, grip, tips, mistakes, targets };
}

/* Muscle metadata: key, display label, and accent color used for day
   stripes and pose-category mapping. */
const MUSCLE_META = [
  { key: "chest", label: "Chest", pool: MUSCLE.Chest, fullPool: FULL_POOL.Chest, color: "#FF1E3C", pose: "Push" },
  { key: "shoulders", label: "Shoulders", pool: MUSCLE.Shoulders, fullPool: FULL_POOL.Shoulders, color: "#FF6B7A", pose: "Push" },
  { key: "triceps", label: "Triceps", pool: MUSCLE.Triceps, fullPool: FULL_POOL.Triceps, color: "#8A8F98", pose: "Push" },
  { key: "back", label: "Back", pool: MUSCLE.Back, fullPool: FULL_POOL.Back, color: "#C8102E", pose: "Pull" },
  { key: "biceps", label: "Biceps", pool: MUSCLE.Biceps, fullPool: FULL_POOL.Biceps, color: "#FF4159", pose: "Pull" },
  { key: "quads", label: "Quads", pool: MUSCLE.Quads, fullPool: FULL_POOL.Quads, color: "#FF8A99", pose: "Legs" },
  { key: "hamsGlutes", label: "Hamstrings & Glutes", pool: MUSCLE.HamsGlutes, fullPool: FULL_POOL.HamsGlutes, color: "#B0102A", pose: "Legs" },
  { key: "calves", label: "Calves", pool: MUSCLE.Calves, fullPool: FULL_POOL.Calves, color: "#6E6F78", pose: "Legs" },
  { key: "core", label: "Core", pool: MUSCLE.Core, fullPool: FULL_POOL.Core, color: "#FF2E4D", pose: "Core" },
  { key: "conditioning", label: "Conditioning", pool: MUSCLE.Conditioning, fullPool: FULL_POOL.Conditioning, color: "#4A5158", pose: "Full Body" },
  { key: "cardio", label: "Cardio", pool: MUSCLE.Cardio, fullPool: FULL_POOL.Cardio, color: "#E8112D", pose: "Cardio" },
];
const MUSCLE_BY_KEY = Object.fromEntries(MUSCLE_META.map(m => [m.key, m]));
const MUSCLE_KEYS = MUSCLE_META.map(m => m.key);

const BODYWEIGHT_FILLERS = ["Push-Up", "Plank", "Walking Lunge", "Dead Bug", "Burpee", "Bird Dog", "Side Plank", "Bear Crawl"];

/* Default 7-day split configs, used until the person edits their own in
   the Split tab. Each day is either {rest:true} or {rest:false, muscles:
   [{key, weight}]} where weights sum to 100. */
function defaultSplitConfig(days) {
  const push = [{ key: "chest", weight: 45 }, { key: "shoulders", weight: 35 }, { key: "triceps", weight: 20 }];
  const pull = [{ key: "back", weight: 70 }, { key: "biceps", weight: 30 }];
  const legs = [{ key: "quads", weight: 50 }, { key: "hamsGlutes", weight: 40 }, { key: "calves", weight: 10 }];
  const fullBody = [{ key: "chest", weight: 25 }, { key: "back", weight: 25 }, { key: "quads", weight: 25 }, { key: "hamsGlutes", weight: 15 }, { key: "core", weight: 10 }];
  const rest = { rest: true, muscles: [] };
  const day = muscles => ({ rest: false, muscles });

  const core = [{ key: "core", weight: 100 }];
  const patterns = {
    2: [day(fullBody), rest, rest, day(fullBody), rest, rest, rest],
    3: [day(push), rest, day(pull), rest, day(legs), rest, rest],
    4: [day(push), day(pull), rest, day(legs), day(fullBody), rest, rest],
    5: [day(push), day(pull), day(legs), rest, day(push), day(pull), rest],
    6: [day(push), day(pull), day(legs), day(push), day(pull), day(legs), rest],
    7: [day(push), day(pull), day(legs), day(push), day(pull), day(legs), day(core)],
  };
  return patterns[days] || patterns[4];
}

function dayLabel(day) {
  if (day.rest) return "Rest & Recovery";
  return day.muscles
    .slice().sort((a, b) => b.weight - a.weight)
    .map(m => `${MUSCLE_BY_KEY[m.key]?.label || m.key} ${m.weight}%`)
    .join(" · ");
}
/* Fixed palette so every day of the week reads as visually distinct,
   regardless of what muscles it trains — Mon through Sun. */
const DAY_COLORS = ["#FF8A1E", "#22C3FF", "#F5FF3D", "#39FF6A", "#C77DFF", "#FF4FD8", "#00F5D4"];
function dayColor(dayIndex) {
  return DAY_COLORS[((dayIndex % 7) + 7) % 7];
}
function dayPoseCategory(day) {
  if (day.rest) return "Rest";
  const top = day.muscles.slice().sort((a, b) => b.weight - a.weight)[0];
  return top ? MUSCLE_BY_KEY[top.key]?.pose || "Full Body" : "Full Body";
}

const WARMUPS = {
  Push: ["5 min light cardio", "Arm circles + band pull-aparts", "2 light warm-up sets of your first exercise"],
  Pull: ["5 min row or bike, easy pace", "Band pull-aparts + shoulder rolls", "1-2 light warm-up sets before your first pull"],
  Legs: ["5 min bike or walk", "Bodyweight squats + leg swings", "1-2 light warm-up sets before your first lift"],
  "Full Body": ["5 min easy cardio", "Dynamic stretches — lunges, arm swings", "One light run-through of the first movement"],
  Core: ["2 min easy cardio", "Cat-cow + hip circles", "Slow, controlled breathing to brace properly"],
  Cardio: ["3-5 min easy pace to raise heart rate", "A few strides to open your stride length"],
};

function loadGuidance(level, trend = "maintain") {
  const suffix = trend === "cut"
    ? " With a fat-loss goal, prioritize consistent reps over chasing heavier weight right now."
    : trend === "bulk"
      ? " With a weight-gain goal, push to add weight whenever a set feels solid."
      : "";
  if (level === "Never trained") return "Use a light, controllable weight — focus on owning the form, not the load." + suffix;
  if (level === "Some experience") return "Pick a weight that leaves 2-3 reps in the tank on your last set." + suffix;
  if (level === "Train regularly") return "Load close to a real working weight — last set should be genuinely hard." + suffix;
  return "Load near your working max for the rep range, with a controlled tempo." + suffix;
}
function setsRepsFor(level, isCompound) {
  if (level === "Never trained") return { sets: 3, reps: isCompound ? "10-12" : "12-15", rest: "60 sec" };
  if (level === "Some experience") return { sets: 3, reps: isCompound ? "8-10" : "10-12", rest: "75 sec" };
  if (level === "Train regularly") return { sets: 4, reps: isCompound ? "6-8" : "10-12", rest: "90 sec" };
  return { sets: 5, reps: isCompound ? "5-8" : "8-10", rest: "2 min" };
}

function weightedPick(day, have, target, exclude = [], maxDifficulty = 3, useTop20 = true, disabled = []) {
  const active = day.muscles.filter(m => m.weight > 0);
  if (active.length === 0) return [];
  const totalW = active.reduce((s, m) => s + m.weight, 0) || 1;

  // largest-remainder rounding so counts sum exactly to target
  let counts = active.map(m => {
    const raw = (m.weight / totalW) * target;
    return { key: m.key, count: Math.floor(raw), rem: raw - Math.floor(raw), weight: m.weight };
  });
  let assigned = counts.reduce((s, c) => s + c.count, 0);
  const byRem = [...counts].sort((a, b) => b.rem - a.rem);
  for (let i = 0; i < target - assigned; i++) byRem[i % byRem.length].count++;
  // every included muscle gets at least 1 exercise
  counts.forEach(c => { if (c.count === 0) c.count = 1; });
  let sum = counts.reduce((s, c) => s + c.count, 0);
  while (sum > target) {
    counts.sort((a, b) => b.count - a.count);
    if (counts[0].count > 1) { counts[0].count--; sum--; } else break;
  }

  const disabledSet = new Set(disabled);
  counts.sort((a, b) => b.weight - a.weight); // heaviest muscle's exercises first
  const picked = [];
  counts.forEach(c => {
    const meta = MUSCLE_BY_KEY[c.key];
    if (!meta) return;
    const basePool = useTop20 ? meta.pool : (meta.fullPool?.length ? meta.fullPool : meta.pool);
    const notDisabled = basePool.filter(e => !disabledSet.has(e.name));
    const afterDisabled = notDisabled.length ? notDisabled : basePool; // if someone disables every exercise for a muscle, fall back rather than skip it
    // full-pool exercises aren't difficulty-tagged, so the filter is a no-op for them (indexOf(undefined) = -1, always within range)
    const byDifficulty = afterDisabled.filter(e => DIFFICULTY_ORDER.indexOf(e.difficulty) <= maxDifficulty);
    let pool = byDifficulty.length ? byDifficulty : afterDisabled; // if the level filter empties it out (e.g. beginner + tiny bucket), fall back rather than skip the muscle
    pool = pool.filter(e => equipOk(e.equip, have)).length ? pool.filter(e => equipOk(e.equip, have)) : pool.filter(e => e.equip.length === 0);
    if (pool.length === 0) pool = byDifficulty.length ? byDifficulty : afterDisabled;
    // prefer exercises not already used this cycle; only fall back to repeats if the pool can't cover the count otherwise
    const fresh = pool.filter(e => !exclude.includes(e.name));
    const usable = fresh.length >= c.count ? fresh : pool;
    shuffle(usable).slice(0, c.count).forEach(ex => picked.push({ ...ex, muscleKey: c.key }));
  });
  return picked;
}

function equipOk(exEquip, have) {
  if (exEquip.length === 0) return true;
  if (have.includes("Bodyweight only") && have.length === 1) return false;
  return exEquip.every(e => have.includes(e));
}

async function buildBlueprint(p) {
  await wait(500);
  const weightKg = p.units === "kg" ? +p.weight : +p.weight * 0.4536;
  const goals = p.goals || [];
  let factor = 1;
  if (goals.includes("Lose fat")) factor -= 0.12;
  if (goals.includes("Build muscle")) factor += 0.08;
  if (goals.includes("Get stronger")) factor += 0.03;
  if (goals.includes("Endurance")) factor -= 0.02;
  factor = Math.max(0.75, Math.min(1.2, factor));

  let mult = 26 + p.days * 1.4;
  let kcal = Math.round(weightKg * mult * factor);
  if (p.calorieGoal && +p.calorieGoal > 0) kcal = Math.round(+p.calorieGoal); // user-specified intake overrides the estimate

  let proteinPerKg = 1.8;
  if (goals.includes("Build muscle")) proteinPerKg += 0.3;
  if (goals.includes("Get stronger")) proteinPerKg += 0.2;
  if (goals.includes("Lose fat")) proteinPerKg += 0.1;
  proteinPerKg = Math.min(2.4, proteinPerKg);
  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round((kcal * 0.27) / 9);
  const carbs = Math.max(50, Math.round((kcal - protein * 4 - fat * 9) / 4));

  const config = p.splitConfig || defaultSplitConfig(p.days);
  const split = DAYS.map((day, i) => {
    const spec = config[i] || { rest: true, muscles: [] };
    return { day, focus: dayLabel(spec), muscles: spec.muscles, rest: spec.rest };
  });

  const goalText = goals.length ? goals.map(g => g.toLowerCase()).join(" + ") : "general fitness";
  const trainingDays = split.filter(d => !d.rest).map(d => d.focus).join(" · ");
  const rationale = `Your ${p.days}-day split: ${trainingDays || "custom"}. Built for someone at the "${p.level.toLowerCase()}" stage training toward "${goalText}". `
    + `Targets are set around ${kcal} kcal${p.calorieGoal ? " (your own target)" : ""} with ${protein}g protein `
    + `${goals.includes("Lose fat") && goals.includes("Build muscle") ? "for a body recomposition — losing fat while holding onto and building muscle" : goals.includes("Lose fat") ? "to support the deficit while preserving muscle" : "to fuel training and recovery"}.`;

  return { split, kcal, protein, carbs, fat, rationale };
}

function weightTrend(p) {
  const goalW = +p.goalWeight;
  const curW = +p.weight;
  if (!goalW || !curW) return "maintain";
  const diff = goalW - curW;
  if (diff <= -1) return "cut";
  if (diff >= 1) return "bulk";
  return "maintain";
}
function shiftReps(reps, delta) {
  const m = /^(\d+)-(\d+)$/.exec(reps);
  if (!m || delta === 0) return reps;
  const a = Math.max(1, +m[1] + delta);
  const b = Math.max(a + 1, +m[2] + delta);
  return `${a}-${b}`;
}

async function buildWorkout(p, bp, day, exclude = []) {
  await wait(350);
  if (day.rest) return { rest: true, focus: day.focus, exercises: [], warmup: [], finisher: "" };

  const have = p.equipment;
  const target = p.session <= 30 ? 5 : p.session <= 45 ? 6 : p.session <= 60 ? 7 : 8;
  const picked = weightedPick(day, have, target, exclude, maxDifficultyFor(p.level, p.difficultyOverride), p.top20Only !== false, p.disabledExercises || []);
  const trend = weightTrend(p);
  const repDelta = trend === "cut" ? 2 : trend === "bulk" ? -1 : 0;

  const exercises = picked.map((ex, i) => {
    const base = setsRepsFor(p.level, i < 2);
    const reps = shiftReps(base.reps, repDelta);
    const desc = describeExercise(ex.name);
    return {
      name: ex.name, sets: base.sets, reps, rest: base.rest,
      load: loadGuidance(p.level, trend), cues: desc.instructions, why: desc.targets,
      category: MUSCLE_BY_KEY[ex.muscleKey]?.pose || "Full Body", equip: ex.equip,
    };
  });

  const goals = p.goals || [];
  const finisher = goals.includes("Lose fat") || trend === "cut"
    ? "Finish with 10 minutes on a bike or incline walk to add extra calorie burn."
    : "Finish with 5 minutes of easy cardio and a light stretch of what you trained.";

  const poseCat = dayPoseCategory(day);
  return { rest: false, focus: day.focus, warmup: WARMUPS[poseCat] || WARMUPS["Full Body"], exercises, finisher };
}

const MEAL_POOL = {
  Breakfast: [
    { name: "Greek Yogurt Parfait", tags: ["Vegetarian", "Pescatarian", "Gluten-free", "Halal", "Kosher"], time: "5 min", base: { kcal: 380, protein: 30, carbs: 45, fat: 9 }, ingredients: [{ item: "Greek yogurt", qty: "250 g" }, { item: "granola", qty: "40 g" }, { item: "mixed berries", qty: "100 g" }, { item: "honey", qty: "1 tbsp" }] },
    { name: "Veggie Egg Scramble", tags: ["Vegetarian", "Pescatarian", "Gluten-free", "Halal", "Kosher"], time: "12 min", base: { kcal: 420, protein: 28, carbs: 24, fat: 22 }, ingredients: [{ item: "eggs", qty: "3 large" }, { item: "spinach", qty: "1 cup" }, { item: "bell pepper", qty: "1/2" }, { item: "feta cheese", qty: "30 g" }, { item: "olive oil", qty: "1 tsp" }] },
    { name: "Tofu Breakfast Scramble", tags: ["Vegan", "Vegetarian", "Gluten-free", "Dairy-free", "Halal", "Kosher"], time: "12 min", base: { kcal: 390, protein: 24, carbs: 30, fat: 18 }, ingredients: [{ item: "firm tofu", qty: "200 g" }, { item: "turmeric", qty: "1/2 tsp" }, { item: "spinach", qty: "1 cup" }, { item: "onion", qty: "1/2" }, { item: "olive oil", qty: "1 tsp" }] },
    { name: "Overnight Oats", tags: ["Vegan", "Vegetarian", "Pescatarian", "Dairy-free", "Halal", "Kosher"], time: "5 min (+ overnight)", base: { kcal: 410, protein: 18, carbs: 62, fat: 11 }, ingredients: [{ item: "rolled oats", qty: "70 g" }, { item: "almond milk", qty: "200 ml" }, { item: "chia seeds", qty: "1 tbsp" }, { item: "banana", qty: "1" }, { item: "peanut butter", qty: "1 tbsp" }] },
    { name: "Smoked Salmon Bagel", tags: ["Pescatarian", "Kosher"], time: "8 min", base: { kcal: 440, protein: 27, carbs: 48, fat: 15 }, ingredients: [{ item: "smoked salmon", qty: "80 g" }, { item: "whole-wheat bagel", qty: "1" }, { item: "cream cheese", qty: "2 tbsp" }, { item: "cucumber", qty: "1/4" }] },
  ],
  Lunch: [
    { name: "Grilled Chicken & Quinoa Bowl", tags: ["Gluten-free", "Halal", "Kosher"], time: "20 min", base: { kcal: 560, protein: 42, carbs: 55, fat: 15 }, ingredients: [{ item: "chicken breast", qty: "180 g" }, { item: "quinoa", qty: "80 g dry" }, { item: "broccoli", qty: "1 cup" }, { item: "cherry tomatoes", qty: "1/2 cup" }, { item: "olive oil", qty: "1 tbsp" }] },
    { name: "Chickpea & Feta Salad", tags: ["Vegetarian", "Pescatarian", "Gluten-free", "Halal", "Kosher"], time: "12 min", base: { kcal: 480, protein: 20, carbs: 50, fat: 20 }, ingredients: [{ item: "chickpeas", qty: "1 can" }, { item: "feta cheese", qty: "60 g" }, { item: "cucumber", qty: "1" }, { item: "cherry tomatoes", qty: "1 cup" }, { item: "olive oil", qty: "1 tbsp" }, { item: "lemon", qty: "1/2" }] },
    { name: "Seared Tuna Rice Bowl", tags: ["Pescatarian", "Gluten-free"], time: "18 min", base: { kcal: 540, protein: 40, carbs: 55, fat: 14 }, ingredients: [{ item: "tuna steak", qty: "180 g" }, { item: "jasmine rice", qty: "80 g dry" }, { item: "edamame", qty: "1/2 cup" }, { item: "avocado", qty: "1/2" }, { item: "soy sauce", qty: "1 tbsp" }] },
    { name: "Lentil & Vegetable Curry", tags: ["Vegan", "Vegetarian", "Pescatarian", "Gluten-free", "Dairy-free", "Halal", "Kosher"], time: "25 min", base: { kcal: 500, protein: 24, carbs: 65, fat: 13 }, ingredients: [{ item: "red lentils", qty: "100 g dry" }, { item: "coconut milk", qty: "150 ml" }, { item: "spinach", qty: "1 cup" }, { item: "onion", qty: "1" }, { item: "garlic", qty: "2 cloves" }, { item: "curry powder", qty: "1 tbsp" }] },
    { name: "Turkey Wrap", tags: ["Halal"], time: "10 min", base: { kcal: 460, protein: 35, carbs: 42, fat: 16 }, ingredients: [{ item: "turkey breast", qty: "150 g" }, { item: "whole-wheat tortilla", qty: "1" }, { item: "lettuce", qty: "1 cup" }, { item: "tomato", qty: "1" }, { item: "hummus", qty: "2 tbsp" }] },
  ],
  Dinner: [
    { name: "Baked Salmon & Sweet Potato", tags: ["Pescatarian", "Gluten-free", "Kosher"], time: "30 min", base: { kcal: 580, protein: 40, carbs: 45, fat: 24 }, ingredients: [{ item: "salmon fillet", qty: "180 g" }, { item: "sweet potato", qty: "1 medium" }, { item: "asparagus", qty: "1 cup" }, { item: "olive oil", qty: "1 tbsp" }, { item: "lemon", qty: "1/2" }] },
    { name: "Lean Beef Stir-Fry", tags: ["Halal", "Gluten-free", "Dairy-free"], time: "20 min", base: { kcal: 560, protein: 42, carbs: 50, fat: 18 }, ingredients: [{ item: "lean beef strips", qty: "180 g" }, { item: "jasmine rice", qty: "80 g dry" }, { item: "broccoli", qty: "1 cup" }, { item: "carrot", qty: "1" }, { item: "soy sauce", qty: "2 tbsp" }, { item: "ginger", qty: "1 tsp" }] },
    { name: "Tofu & Vegetable Stir-Fry", tags: ["Vegan", "Vegetarian", "Pescatarian", "Dairy-free", "Halal", "Kosher"], time: "18 min", base: { kcal: 480, protein: 26, carbs: 55, fat: 14 }, ingredients: [{ item: "firm tofu", qty: "200 g" }, { item: "brown rice", qty: "80 g dry" }, { item: "broccoli", qty: "1 cup" }, { item: "bell pepper", qty: "1" }, { item: "soy sauce", qty: "2 tbsp" }] },
    { name: "Grilled Chicken & Roasted Vegetables", tags: ["Gluten-free", "Dairy-free", "Halal", "Kosher"], time: "35 min", base: { kcal: 520, protein: 44, carbs: 32, fat: 18 }, ingredients: [{ item: "chicken thigh", qty: "200 g" }, { item: "zucchini", qty: "1" }, { item: "red onion", qty: "1" }, { item: "carrot", qty: "1" }, { item: "olive oil", qty: "1 tbsp" }] },
    { name: "Baked Cod with Couscous", tags: ["Pescatarian", "Kosher"], time: "25 min", base: { kcal: 500, protein: 38, carbs: 48, fat: 12 }, ingredients: [{ item: "cod fillet", qty: "200 g" }, { item: "couscous", qty: "80 g dry" }, { item: "cherry tomatoes", qty: "1 cup" }, { item: "parsley", qty: "1 tbsp" }, { item: "olive oil", qty: "1 tbsp" }] },
  ],
  Snack: [
    { name: "Cottage Cheese & Pineapple", tags: ["Vegetarian", "Pescatarian", "Gluten-free", "Halal", "Kosher"], time: "2 min", base: { kcal: 200, protein: 20, carbs: 20, fat: 4 }, ingredients: [{ item: "cottage cheese", qty: "200 g" }, { item: "pineapple", qty: "1/2 cup" }] },
    { name: "Protein Shake & Banana", tags: ["Vegetarian", "Gluten-free"], time: "3 min", base: { kcal: 260, protein: 30, carbs: 28, fat: 4 }, ingredients: [{ item: "protein powder", qty: "1 scoop" }, { item: "milk", qty: "250 ml" }, { item: "banana", qty: "1" }] },
    { name: "Hummus & Veggie Sticks", tags: ["Vegan", "Vegetarian", "Pescatarian", "Gluten-free", "Dairy-free", "Halal", "Kosher"], time: "3 min", base: { kcal: 220, protein: 8, carbs: 24, fat: 11 }, ingredients: [{ item: "hummus", qty: "1/3 cup" }, { item: "carrot", qty: "1" }, { item: "celery", qty: "2 stalks" }] },
    { name: "Almonds & Apple", tags: ["Vegan", "Vegetarian", "Pescatarian", "Gluten-free", "Dairy-free", "Halal", "Kosher"], time: "1 min", base: { kcal: 240, protein: 6, carbs: 26, fat: 14 }, ingredients: [{ item: "almonds", qty: "30 g" }, { item: "apple", qty: "1" }] },
  ],
};

function dietOk(meal, diet) {
  return diet === "No restrictions" || meal.tags.includes(diet);
}
function avoidOk(meal, avoidStr) {
  if (!avoidStr) return true;
  const bad = avoidStr.toLowerCase().split(/[,;]/).map(s => s.trim()).filter(Boolean);
  const text = meal.ingredients.map(i => i.item.toLowerCase()).join(" ") + " " + meal.name.toLowerCase();
  return !bad.some(b => b && text.includes(b));
}

function scaleMeal(meal, factor) {
  return {
    slot: meal.slot,
    name: meal.name,
    time: meal.time,
    kcal: Math.round(meal.base.kcal * factor),
    protein: Math.round(meal.base.protein * factor),
    carbs: Math.round(meal.base.carbs * factor),
    fat: Math.round(meal.base.fat * factor),
    ingredients: meal.ingredients,
  };
}

function buildOnlyUseMeals(p, bp) {
  const items = p.onlyUse.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  const list = items.length ? items : ["chicken breast", "rice", "broccoli", "olive oil"];
  const slots = [
    { slot: "Breakfast", share: 0.22 }, { slot: "Lunch", share: 0.32 },
    { slot: "Dinner", share: 0.32 }, { slot: "Snack", share: 0.14 },
  ];
  return slots.map((s, i) => {
    const pick = [];
    for (let k = 0; k < Math.min(4, list.length); k++) pick.push(list[(i * 2 + k) % list.length]);
    const uniquePick = [...new Set(pick)];
    return {
      slot: s.slot,
      name: uniquePick.slice(0, 3).map(x => x[0].toUpperCase() + x.slice(1)).join(" + "),
      time: "15 min",
      kcal: Math.round(bp.kcal * s.share),
      protein: Math.round(bp.protein * s.share),
      carbs: Math.round(bp.carbs * s.share),
      fat: Math.round(bp.fat * s.share),
      ingredients: uniquePick.map(item => ({ item, qty: "to taste / to fit macros" })),
    };
  });
}

async function buildMeals(p, bp, day) {
  await wait(350);
  if (p.onlyUse && p.onlyUse.trim()) {
    return { meals: buildOnlyUseMeals(p, bp) };
  }
  const slots = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const shares = { Breakfast: 0.24, Lunch: 0.32, Dinner: 0.32, Snack: 0.12 };
  const meals = slots.map(slot => {
    const options = MEAL_POOL[slot].filter(m => dietOk(m, p.diet) && avoidOk(m, p.avoid));
    const pool = options.length ? options : MEAL_POOL[slot];
    const chosen = rand(pool);
    const dayTargetKcal = bp.kcal * shares[slot];
    const factor = Math.max(0.6, Math.min(1.6, dayTargetKcal / chosen.base.kcal));
    return { ...scaleMeal({ ...chosen, slot }, factor) };
  });
  return { meals };
}

/* ---------------- demo coach (rule-based, no network) ---------------- */

async function generateCoachReply(text, p, plan, today, dayIdx) {
  await wait(500 + Math.random() * 400);
  const s = text.toLowerCase();
  const bp = plan?.blueprint;
  const exNames = (today?.workout?.exercises || []).map(e => e.name);

  if (/hurt|pain|injur|ache|sore joint|sharp/.test(s)) {
    return `That's worth taking seriously — sharp or joint pain isn't something to push through. Tap "Give me another" on today's session card to get a different set of movements, and if it doesn't ease up, get it looked at by a physio or doctor before loading it again.`;
  }
  if (/protein/.test(s)) {
    return `You're set at ${bp?.protein ?? "your target"}g of protein a day. For "${(p.goals || []).map(g => g.toLowerCase()).join(" + ") || "general fitness"}" at your level that's enough to support recovery and ${(p.goals || []).includes("Lose fat") ? "hang onto muscle in a deficit" : "actually build new tissue"}. Spread it across your meals and you're covered — no need to overthink single-meal timing.`;
  }
  if (/(short on time|only have|\d+ min|less time|quick workout)/.test(s)) {
    return `Easiest fix: keep the first 2-3 compound moves and drop the rest, or superset pairs (do two exercises back-to-back before resting). Today's session is ${today?.focus || "your plan"} — ${exNames.slice(0, 2).join(" and ") || "the first exercises"} alone will cover most of the work.`;
  }
  if (/tired|sore|recover|fatigue|exhaust/.test(s)) {
    return `Some soreness is normal, especially early on — but if you're wiped out, it's fine to swap today for lighter work or an extra rest day. Recovery is where the adaptation actually happens. Sleep and today's protein target matter more here than pushing through.`;
  }
  if (/meal|food|eat|hungry|snack/.test(s)) {
    return `That's the Chef's job — switch to Chef mode above and tell it what's in your fridge, it'll build something from just that.`;
  }
  if (/change|swap|different|don't like|hate this|another/.test(s)) {
    return `Two ways to change things: "Give me another" on the session card swaps just today's workout, or head to Profile → Split to change what each day trains, then rebuild the week.`;
  }
  if (/why|split|program|plan/.test(s) && bp?.rationale) {
    return bp.rationale;
  }
  const name = p.name ? p.name + ", " : "";
  return `${name}${today?.rest ? "it's a rest day — good day to just move, stretch, and eat well." : `today's ${today?.focus || "session"} is queued up — ${exNames.slice(0, 3).join(", ") || "check the Today tab"}.`} What do you want help with — the workout, or swapping something out?`;
}

/* ---------------- plate math ---------------- */

function plateLoad(total, units) {
  const barW = units === "kg" ? 20 : 45;
  if (!total || total <= barW) return { bar: barW, plates: [], leftover: 0, valid: total > 0 };
  let side = (total - barW) / 2;
  const out = [];
  for (const [w, color, fg] of PLATE_COLORS[units]) {
    while (side >= w - 1e-6) { out.push({ w, color, fg }); side = +(side - w).toFixed(3); }
  }
  return { bar: barW, plates: out, leftover: +side.toFixed(2), valid: true };
}

function PlateBar({ total, units }) {
  const { bar, plates, leftover, valid } = plateLoad(total, units);
  if (!valid) return null;
  const size = w => {
    const max = units === "kg" ? 25 : 45;
    return 30 + (w / max) * 34;
  };
  return (
    <div>
      <div className="bar" aria-hidden="true">
        <div className="barsteel" />
        {[...plates].reverse().map((p, i) => (
          <div key={"l" + i} className="plate" style={{ background: p.color, height: size(p.w), width: Math.max(7, size(p.w) * 0.17) }}>
            <span style={{ color: p.fg, transform: "rotate(-90deg)" }}>{p.w}</span>
          </div>
        ))}
        <div className="collar" />
        <div className="barsteel" style={{ flex: "0 0 42px" }} />
        <div className="collar" />
        {plates.map((p, i) => (
          <div key={"r" + i} className="plate" style={{ background: p.color, height: size(p.w), width: Math.max(7, size(p.w) * 0.17) }}>
            <span style={{ color: p.fg, transform: "rotate(-90deg)" }}>{p.w}</span>
          </div>
        ))}
        <div className="barsteel" />
      </div>
      <p className="mono" style={{ fontSize: 11.5, textAlign: "center", color: "var(--iron)", marginTop: -4 }}>
        {bar}{units} bar + {plates.length ? [...new Set(plates.map(p => p.w))].map(w => `${plates.filter(p => p.w === w).length}×${w}`).join(" + ") + " per side" : "no plates"}
        {leftover > 0 && ` · ${leftover}${units}/side unmatched`}
      </p>
    </div>
  );
}

/* ---------------- small pieces ---------------- */

const Stripe = ({ color }) => <div className="stripe" style={{ background: color }} />;

function Spinner({ label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span className="spin" />
      <span className="eyebrow">{label}</span>
    </span>
  );
}

function Kpi({ n, l, color }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <Stripe color={color} />
      <div className="kpi">
        <div className="n">{n}</div>
        <div className="l">{l}</div>
      </div>
    </div>
  );
}

/* ---------------- onboarding ---------------- */

const GOALS = ["Build muscle", "Lose fat", "Get stronger", "General fitness", "Endurance"];
const LEVELS = ["Never trained", "Some experience", "Train regularly", "Advanced"];
const GEAR = ["Barbell + plates", "Dumbbells", "Kettlebells", "Pull-up bar", "Bench", "Cable machine", "Leg machines", "Resistance bands", "Cardio machines", "Bodyweight only"];
const DIETS = ["No restrictions", "Vegetarian", "Vegan", "Pescatarian", "Halal", "Kosher", "Gluten-free", "Dairy-free"];

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState({
    name: "", goals: [], level: "", equipment: [], days: 4, session: 60,
    splitChoice: "Bro split",
    weight: "", units: "kg", diet: "No restrictions", avoid: "", onlyUse: "",
    goalWeight: "", calorieGoal: "",
  });
  const set = (k, v) => setP(s => ({ ...s, [k]: v }));
  const toggle = (k, v) => setP(s => ({ ...s, [k]: s[k].includes(v) ? s[k].filter(x => x !== v) : [...s[k], v] }));

  const steps = [
    { key: "name", title: "What should we call you?", ok: !!p.name.trim() },
    { key: "goal", title: "What are you training for?", ok: p.goals.length > 0 },
    { key: "level", title: "Where are you starting from?", ok: !!p.level },
    { key: "gear", title: "What can you actually train with?", ok: p.equipment.length > 0 },
    { key: "split", title: "How do you want to train?", ok: !!p.splitChoice },
    { key: "targets", title: "Your weight & targets", ok: +p.weight > 0 },
  ];
  const cur = steps[step];

  const finish = () => {
    let splitConfig, days;
    if (p.splitChoice === "Custom") {
      days = p.days;
      splitConfig = defaultSplitConfig(days);
    } else {
      const preset = PRESETS.find(pr => pr.name === p.splitChoice);
      splitConfig = preset ? preset.build(p.days) : defaultSplitConfig(p.days);
      days = splitConfig.filter(d => !d.rest).length;
    }
    onDone({ ...p, days, splitConfig });
  };

  return (
    <div className="sp" style={{ display: "flex", justifyContent: "center", padding: "6vh 18px 60px" }}>
      <style>{CSS}</style>
      <div style={{ width: "min(620px,100%)" }}>
        <div style={{ marginBottom: 30 }}>
          <div className="disp" style={{ fontSize: 34, lineHeight: 1 }}>Spotter</div>
          <div className="eyebrow" style={{ marginTop: 8 }}>Your training partner · setup {step + 1} of {steps.length}</div>
          <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
            {steps.map((s, i) => (
              <div key={s.key} style={{ flex: 1, height: 5, background: i <= step ? "var(--accent)" : "var(--line)" }} />
            ))}
          </div>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <Stripe color="var(--accent)" />
          <div style={{ padding: 26 }}>
            <h2 style={{ fontSize: 23, marginBottom: 18, lineHeight: 1.1 }}>{cur.title}</h2>

            {cur.key === "name" && (
              <div>
                <input value={p.name} onChange={e => set("name", e.target.value)} placeholder="Your first name"
                  onKeyDown={e => { if (e.key === "Enter" && p.name.trim()) setStep(1); }} autoFocus />
                <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Your PT will use this to address you.</p>
              </div>
            )}

            {cur.key === "goal" && (
              <div>
                <div className="chipwrap">
                  {GOALS.map(g => {
                    const on = p.goals.includes(g);
                    const disabled = !on && p.goals.length >= 3;
                    return (
                      <button key={g} className={"chip" + (on ? " on" : "")} disabled={disabled}
                        style={disabled ? { opacity: 0.4 } : {}}
                        onClick={() => toggle("goals", g)}>{g}</button>
                    );
                  })}
                </div>
                <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Pick up to 3 — e.g. lose fat while getting stronger.</p>
              </div>
            )}

            {cur.key === "level" && (
              <div className="chipwrap">
                {LEVELS.map(l => (
                  <button key={l} className={"chip" + (p.level === l ? " on" : "")} onClick={() => set("level", l)}>{l}</button>
                ))}
              </div>
            )}

            {cur.key === "gear" && (
              <>
                <p className="muted" style={{ fontSize: 13.5, marginTop: -8, marginBottom: 14 }}>
                  Pick everything you have access to. Your plan will only use these.
                </p>
                <div className="chipwrap">
                  {GEAR.map(g => (
                    <button key={g} className={"chip" + (p.equipment.includes(g) ? " on" : "")} onClick={() => toggle("equipment", g)}>{g}</button>
                  ))}
                </div>
              </>
            )}

            {cur.key === "split" && (
              <div className="stack">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 9 }}>Minutes per session</div>
                  <div className="chipwrap">
                    {[30, 45, 60, 75, 90].map(m => (
                      <button key={m} className={"chip mono" + (p.session === m ? " on" : "")} onClick={() => set("session", m)} style={{ minWidth: 52, justifyContent: "center" }}>{m}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="eyebrow" style={{ marginBottom: 9 }}>Training days per week</div>
                  <div className="chipwrap">
                    {[2, 3, 4, 5, 6, 7].map(d => (
                      <button key={d} className={"chip mono" + (p.days === d ? " on" : "")} onClick={() => set("days", d)} style={{ minWidth: 46, justifyContent: "center" }}>{d}</button>
                    ))}
                  </div>
                  <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                    Presets below adapt to this. Bro split and Upper/Lower keep their own fixed structure regardless — pick Custom if you want full control over day count.
                  </p>
                </div>

                <div>
                  <div className="eyebrow" style={{ marginBottom: 9 }}>Choose your split</div>
                  <div className="stack" style={{ gap: 8 }}>
                    {PRESETS.map(preset => {
                      const selected = p.splitChoice === preset.name;
                      return (
                        <button key={preset.name} onClick={() => set("splitChoice", preset.name)}
                          className="card flush" style={{ textAlign: "left", border: selected ? "2px solid var(--ink)" : "1.5px solid var(--line)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{preset.name}</div>
                            {selected && <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--green)", letterSpacing: ".06em" }}>SELECTED</span>}
                          </div>
                          <p className="muted" style={{ fontSize: 12, marginTop: 6, marginBottom: 0, lineHeight: 1.4 }}>{preset.desc}</p>
                        </button>
                      );
                    })}
                    <button onClick={() => set("splitChoice", "Custom")}
                      className="card flush" style={{ textAlign: "left", border: p.splitChoice === "Custom" ? "2px solid var(--ink)" : "1.5px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5 }}>Custom</div>
                        {p.splitChoice === "Custom" && <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--green)", letterSpacing: ".06em" }}>SELECTED</span>}
                      </div>
                      <p className="muted" style={{ fontSize: 12, marginTop: 6, marginBottom: 0, lineHeight: 1.4 }}>
                        Start blank and build your own day-by-day split in Settings → Split after setup.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cur.key === "targets" && (
              <div className="stack">
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <div className="eyebrow" style={{ marginBottom: 9 }}>Current bodyweight</div>
                    <input className="mono" type="number" min="0" value={p.weight}
                      onChange={e => set("weight", e.target.value)} placeholder="Enter your weight" autoFocus />
                  </div>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 9 }}>Units</div>
                    <div className="chipwrap">
                      {["kg", "lb"].map(u => (
                        <button key={u} className={"chip" + (p.units === u ? " on" : "")} onClick={() => set("units", u)}>{u}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 9 }}>Goal weight <span className="muted" style={{ textTransform: "none", letterSpacing: "normal", fontWeight: 500 }}>(optional)</span></div>
                  <input className="mono" type="number" min="0" value={p.goalWeight} onChange={e => set("goalWeight", e.target.value)}
                    placeholder={`Target weight in ${p.units}`} />
                  <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
                    Above your current weight nudges toward heavier, lower-rep work. Below it nudges toward higher reps. Leave blank to keep things balanced.
                  </p>
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 9 }}>Daily calorie target <span className="muted" style={{ textTransform: "none", letterSpacing: "normal", fontWeight: 500 }}>(optional)</span></div>
                  <input className="mono" type="number" min="0" value={p.calorieGoal} onChange={e => set("calorieGoal", e.target.value)}
                    placeholder="e.g. 2400 — leave blank to auto-calculate" />
                  <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
                    Already know your number from a coach or calculator? Enter it here and we'll use it instead of estimating.
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
              {step > 0 && <button className="btn ghost" onClick={() => setStep(s => s - 1)}>Back</button>}
              <button
                className="btn"
                disabled={!cur.ok}
                style={{ marginLeft: "auto" }}
                onClick={() => (step === steps.length - 1 ? finish() : setStep(s => s + 1))}
              >
                {step === steps.length - 1 ? "Build my plan" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- form sheet ---------------- */

const VIDEO_LINKS = {
  "Barbell Bench Press": "https://www.youtube.com/watch?v=Pp8rHcFVIYg",
  "Dumbbell Shoulder Press": "https://www.youtube.com/watch?v=6eDlfTDb7Po",
  "Push-Up": "https://www.youtube.com/watch?v=WDIpL0pjun0",
  "Cable Chest Fly": "https://www.youtube.com/watch?v=ovFc-5YdcXw",
  "Triceps Pushdown": "https://www.youtube.com/watch?v=w_viR9hVi4A",
  "Dumbbell Incline Press": "https://www.youtube.com/watch?v=sK4Rvug6ufo",
  "Pull-Up": "https://www.youtube.com/watch?v=1rRmIzEsl_4",
  "Barbell Bent-Over Row": "https://www.youtube.com/watch?v=rqTOAM8WoeM",
  "Dumbbell Row": "https://www.youtube.com/watch?v=gfUg6qWohTk",
  "Lat Pulldown": "https://www.youtube.com/watch?v=Z_3xHwuO8Tk",
  "Band Pull-Apart": "https://www.youtube.com/watch?v=WqdNDTTe-9g",
  "Kettlebell Row": "https://www.youtube.com/watch?v=k5BC9d6pR3A",
  "Barbell Back Squat": "https://www.youtube.com/watch?v=8PMjqgR8Wa8",
  "Goblet Squat": "https://www.youtube.com/watch?v=xIU3-8WqasQ",
  "Romanian Deadlift": "https://www.youtube.com/watch?v=KN5vN3JskqI",
  "Walking Lunge": "https://www.youtube.com/watch?v=BenhAbJiTsw",
  "Leg Press": "https://www.youtube.com/watch?v=K5n2vg3oZa4",
  "Kettlebell Swing": "https://www.youtube.com/watch?v=alFXWtV3VcE",
  "Dumbbell Thruster": "https://www.youtube.com/watch?v=tJP-fwf5ASA",
  "Burpee": "https://www.youtube.com/watch?v=fZx6nxKMq4E",
  "Barbell Deadlift": "https://www.youtube.com/watch?v=4i6RTcFhrKc",
  "Plank": "https://www.youtube.com/watch?v=mwlp75MS6Rg",
  "Hanging Knee Raise": "https://www.youtube.com/watch?v=0BmrlKCfTPU",
  "Cable Woodchop": "https://www.youtube.com/watch?v=Gwcf4TOj1hc",
  "Dead Bug": "https://www.youtube.com/watch?v=bxn9FBrt4-A",
  "Interval Sprints": "https://www.youtube.com/watch?v=GxkWIKuH21U",
  "Steady Incline Walk": "https://www.youtube.com/watch?v=NAsObfFJXvE",
};

function videoFor(ex) {
  return VIDEO_LINKS[ex.name] || ("https://www.youtube.com/results?search_query=" + encodeURIComponent(ex.name + " proper form technique"));
}

function FormSheet({ ex, onClose }) {
  const yt = videoFor(ex);
  const desc = describeExercise(ex.name);

  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheetbody" onClick={e => e.stopPropagation()} role="dialog" aria-label={"How to " + ex.name}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <div className="eyebrow">How to do it</div>
            <h2 style={{ fontSize: 25, marginTop: 6, lineHeight: 1.05 }}>{ex.name}</h2>
          </div>
          <button className="btn ghost sm" onClick={onClose}>Close</button>
        </div>

        <a className="btn" href={yt} target="_blank" rel="noopener noreferrer" style={{ marginTop: 18, textDecoration: "none" }}>
          Watch a tutorial ↗
        </a>
        <p className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
          {VIDEO_LINKS[ex.name] ? "Direct link to a verified form video." : "Opens a YouTube search so you can pick a coach you trust."}
        </p>

        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Instructions</div>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
            {desc.instructions.map((c, i) => (
              <li key={i} style={{ display: "flex", gap: 13, padding: "11px 0", borderBottom: "1.5px solid var(--line)" }}>
                <span className="mono" style={{ fontWeight: 700, color: "var(--red)", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 14.5 }}>{c}</span>
              </li>
            ))}
          </ol>
        </div>

        {desc.grip && (
          <div style={{ marginTop: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Grip</div>
            <p style={{ fontSize: 14, margin: 0 }}>{desc.grip}</p>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Form tips</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {desc.tips.map((t, i) => <li key={i} style={{ fontSize: 14, marginBottom: 6 }}>{t}</li>)}
          </ul>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Common mistakes</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {desc.mistakes.map((m, i) => <li key={i} style={{ fontSize: 14, marginBottom: 6, color: "var(--iron)" }}>{m}</li>)}
          </ul>
        </div>

        <p className="muted" style={{ fontSize: 13.5, marginTop: 18 }}><strong>What it trains:</strong> {desc.targets}</p>
        {ex.load && (
          <p className="muted" style={{ fontSize: 13.5, marginTop: 8 }}><strong>Loading:</strong> {ex.load}</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- workout view ---------------- */

function ExerciseRow({ ex, idx, dayKey, logs, setLogs, units, onForm }) {
  const [open, setOpen] = useState(false);
  const logKey = dayKey + "|" + ex.name;
  const sets = (logs.sets && logs.sets[logKey]) || Array.from({ length: ex.sets || 3 }, () => ({ w: "", r: "", done: false }));

  const commit = next => setLogs(L => ({ ...L, sets: { ...(L.sets || {}), [logKey]: next } }));
  const update = (i, patch) => commit(sets.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const addSet = () => {
    const last = sets[sets.length - 1];
    commit([...sets, { w: last?.w || "", r: last?.r || "", done: false }]);
  };
  const removeSet = i => {
    if (sets.length <= 1) return;
    commit(sets.filter((_, j) => j !== i));
  };

  const doneCount = sets.filter(s => s.done).length;
  const lastWeight = [...sets].reverse().find(s => s.w)?.w;

  return (
    <div className="exrow">
      <div className="exhead">
        <span className="exnum mono">{String(idx + 1).padStart(2, "0")}</span>
        <span className="exname">{ex.name}</span>
        <span className="exspec mono">{sets.length}×{ex.reps}</span>
      </div>
      <div className="exmeta">
        <span className="mono">rest {ex.rest}</span>
        {doneCount > 0 && <span className="mono" style={{ color: "var(--green)", fontWeight: 700 }}>{doneCount}/{sets.length} logged</span>}
        <button className="linkish" onClick={() => onForm(ex)}>Show form</button>
        <button className="linkish" onClick={() => setOpen(o => !o)}>{open ? "Hide log" : "Log sets"}</button>
      </div>

      {open && (
        <div style={{ marginTop: 14, paddingLeft: 36 }}>
          <div className="setgrid setgrid5">
            <div className="eyebrow">Set</div>
            <div className="eyebrow">Weight ({units})</div>
            <div className="eyebrow">Reps</div>
            <div className="eyebrow">Done</div>
            <div />
          </div>
          {sets.map((s, i) => (
            <div className="setgrid setgrid5" key={i}>
              <span className="mono" style={{ fontWeight: 700, color: "var(--steel)" }}>{i + 1}</span>
              <input className="mono" inputMode="decimal" value={s.w} onChange={e => update(i, { w: e.target.value })} placeholder="–" aria-label={`Set ${i + 1} weight`} />
              <input className="mono" inputMode="numeric" value={s.r} onChange={e => update(i, { r: e.target.value })} placeholder={String(ex.reps || "")} aria-label={`Set ${i + 1} reps`} />
              <button className={"tick" + (s.done ? " done" : "")} onClick={() => update(i, { done: !s.done })} aria-label={`Mark set ${i + 1} complete`} aria-pressed={s.done}>✓</button>
              <button className="setremove" onClick={() => removeSet(i)} disabled={sets.length <= 1} aria-label={`Remove set ${i + 1}`}>×</button>
            </div>
          ))}
          <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={addSet}>+ Add set</button>
          {lastWeight && +lastWeight > 0 && (
            <div style={{ marginTop: 16, background: "var(--panel2)", border: "1.5px solid var(--line)", borderRadius: 2, padding: "8px 12px 4px" }}>
              <div className="eyebrow" style={{ marginBottom: 2 }}>Load the bar — {lastWeight}{units}</div>
              <PlateBar total={+lastWeight} units={units} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutCard({ day, dayIndex, workout, dayKey, logs, setLogs, units, onForm, onSwap, swapping, onComplete, completedToday }) {
  const color = dayColor(dayIndex);
  const [completing, setCompleting] = useState(false);
  const [duration, setDuration] = useState("");
  if (!workout) return <div className="card flush"><Spinner label="Writing this session" /></div>;

  if (workout.rest) {
    return (
      <div className="card" style={{ overflow: "hidden" }}>
        <Stripe color="#8A8F98" />
        <div className="flush" style={{ padding: 26 }}>
          <div className="eyebrow">Rest day</div>
          <h2 style={{ fontSize: 26, marginTop: 8 }}>Recover</h2>
          <p className="muted" style={{ fontSize: 14, marginTop: 10, maxWidth: 460 }}>
            Muscle is built between sessions, not during them. Walk, stretch, sleep, eat your protein. Nothing else required today.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <Stripe color={color} />
      <div style={{ padding: "20px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">Session</div>
          <h2 style={{ fontSize: 26, marginTop: 6, lineHeight: 1 }}>{workout.focus}</h2>
        </div>
        <button className="btn ghost sm" onClick={onSwap} disabled={swapping}>
          {swapping ? "Rebuilding…" : "Give me another"}
        </button>
      </div>

      {workout.warmup?.length > 0 && (
        <div style={{ padding: "14px 20px", borderBottom: "1.5px solid var(--line)" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Warm-up</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {workout.warmup.map((w, i) => {
              const key = dayKey + "|warmup|" + i;
              const done = !!(logs.prep && logs.prep[key]);
              return (
                <button key={i} onClick={() => setLogs(L => ({ ...L, prep: { ...(L.prep || {}), [key]: !done } }))}
                  style={{
                    fontSize: 12.5, padding: "6px 11px", borderRadius: 2, display: "flex", alignItems: "center", gap: 6,
                    background: done ? "var(--green)" : "var(--panel2)", color: done ? "#0A0A0C" : "var(--ink)",
                    border: "1.5px solid " + (done ? "var(--green)" : "var(--line)"),
                  }}>
                  <span aria-hidden="true">{done ? "✓" : "○"}</span>{w}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ borderTop: "1.5px solid var(--line)" }}>
        {(workout.exercises || []).map((ex, i) => (
          <ExerciseRow key={ex.name + i} ex={ex} idx={i} dayKey={dayKey} logs={logs} setLogs={setLogs} units={units} onForm={onForm} />
        ))}
      </div>

      {workout.finisher && (() => {
        const key = dayKey + "|cooldown";
        const done = !!(logs.prep && logs.prep[key]);
        return (
          <div style={{ padding: "14px 20px", borderTop: "1.5px solid var(--line)", background: "var(--panel2)" }}>
            <button onClick={() => setLogs(L => ({ ...L, prep: { ...(L.prep || {}), [key]: !done } }))}
              style={{ display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left", width: "100%" }}>
              <span className={"tick" + (done ? " done" : "")} style={{ width: 24, height: 24, fontSize: 13, flexShrink: 0 }} aria-hidden="true">✓</span>
              <span>
                <span className="eyebrow">Cooldown</span>{" "}
                <span style={{ fontSize: 14 }}>{workout.finisher}</span>
              </span>
            </button>
          </div>
        );
      })()}

      <div style={{ padding: 20, borderTop: "1.5px solid var(--line)" }}>
        {completedToday && !completing && (
          <p className="mono" style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 700, marginBottom: 12 }}>✓ Logged for today — {completedToday.durationMin} min</p>
        )}
        {!completing && (
          <button className="btn" onClick={() => setCompleting(true)}>
            {completedToday ? "Log again" : "Complete workout"}
          </button>
        )}
        {completing && (
          <div>
            <div className="eyebrow" style={{ marginBottom: 9 }}>How long did that take?</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input className="mono" inputMode="numeric" autoFocus value={duration}
                onChange={e => setDuration(e.target.value)} placeholder="Minutes" style={{ maxWidth: 140 }} />
              <button className="btn" disabled={!duration}
                onClick={() => { onComplete(+duration); setCompleting(false); setDuration(""); }}>
                Save & finish
              </button>
              <button className="btn ghost" onClick={() => setCompleting(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- meals ---------------- */

function MealCard({ meal, dayKey, logs, setLogs, onRecipe }) {
  const key = dayKey + "|" + meal.slot;
  const eaten = !!(logs.meals && logs.meals[key]);
  return (
    <div className="card" style={{ overflow: "hidden", opacity: eaten ? 0.72 : 1 }}>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <span className="eyebrow">{meal.slot}</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--iron)" }}>{meal.time}</span>
        </div>
        <div style={{ fontSize: 16.5, fontWeight: 700, marginTop: 6, lineHeight: 1.2 }}>{meal.name}</div>
        <div className="mono" style={{ fontSize: 12, marginTop: 8, color: "var(--iron)" }}>
          {meal.kcal} kcal · P{meal.protein} C{meal.carbs} F{meal.fat}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 13 }}>
          <button className="btn ghost sm" onClick={() => onRecipe(meal)}>Recipe</button>
          <button
            className="btn sm"
            style={eaten ? { background: "var(--green)" } : {}}
            onClick={() => setLogs(L => ({ ...L, meals: { ...(L.meals || {}), [key]: !eaten } }))}
          >
            {eaten ? "✓ Eaten" : "Mark eaten"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data, color, label, unit }) {
  if (!data || data.length < 2) {
    return (
      <div className="card flush" style={{ minHeight: 150 }}>
        <div className="eyebrow">{label}</div>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 12 }}>Log at least two entries and the trend shows up here.</p>
      </div>
    );
  }
  const vals = data.map(d => d.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const W = 300, H = 90;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * W, H - ((d.v - min) / span) * (H - 14) - 7]);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const delta = +(vals[vals.length - 1] - vals[0]).toFixed(1);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <Stripe color={color} />
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="eyebrow">{label}</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: delta >= 0 ? "var(--green)" : "var(--red)" }}>
            {delta >= 0 ? "+" : ""}{delta}{unit}
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 90, marginTop: 10, overflow: "visible" }} role="img" aria-label={`${label} trend`}>
          <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={color} />)}
        </svg>
        <div className="mono" style={{ fontSize: 11, color: "var(--iron)", display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span>{vals[0]}{unit}</span><span>{vals[vals.length - 1]}{unit}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- split editor ---------------- */

const PRESETS = [
  {
    name: "Push/Pull/Legs",
    desc: "Classic 3-way split — all pressing muscles (chest/shoulders/triceps) together, all pulling muscles (back/biceps) together, then legs. Great default for most people.",
    build: days => defaultSplitConfig(days),
  },
  {
    name: "Bro split",
    desc: "One muscle group fully dedicated per day — chest, back, shoulders, legs, arms. Maximum focus per muscle, needs more training days to cover everything.",
    build: () => [
      { rest: false, muscles: [{ key: "chest", weight: 100 }] },
      { rest: false, muscles: [{ key: "back", weight: 100 }] },
      { rest: false, muscles: [{ key: "shoulders", weight: 100 }] },
      { rest: false, muscles: [{ key: "quads", weight: 55 }, { key: "hamsGlutes", weight: 35 }, { key: "calves", weight: 10 }] },
      { rest: false, muscles: [{ key: "biceps", weight: 50 }, { key: "triceps", weight: 50 }] },
      { rest: true, muscles: [] },
      { rest: true, muscles: [] },
    ],
  },
  {
    name: "Upper / Lower",
    desc: "Alternates whole upper body (chest, back, shoulders, arms) with whole lower body (quads, hamstrings, glutes, calves). Hits everything twice a week with fewer, bigger sessions.",
    build: () => [
      { rest: false, muscles: [{ key: "chest", weight: 30 }, { key: "back", weight: 30 }, { key: "shoulders", weight: 20 }, { key: "biceps", weight: 10 }, { key: "triceps", weight: 10 }] },
      { rest: false, muscles: [{ key: "quads", weight: 50 }, { key: "hamsGlutes", weight: 40 }, { key: "calves", weight: 10 }] },
      { rest: true, muscles: [] },
      { rest: false, muscles: [{ key: "chest", weight: 30 }, { key: "back", weight: 30 }, { key: "shoulders", weight: 20 }, { key: "biceps", weight: 10 }, { key: "triceps", weight: 10 }] },
      { rest: false, muscles: [{ key: "quads", weight: 50 }, { key: "hamsGlutes", weight: 40 }, { key: "calves", weight: 10 }] },
      { rest: true, muscles: [] },
      { rest: true, muscles: [] },
    ],
  },
];

function describeDay(day) {
  if (day.rest || !day.muscles?.length) return "A full recovery day — no training, just rest.";
  const sorted = [...day.muscles].sort((a, b) => b.weight - a.weight);
  const primary = sorted[0];
  const primaryLabel = MUSCLE_BY_KEY[primary.key]?.label || primary.key;
  if (sorted.length === 1) {
    return `A dedicated ${primaryLabel} day — every exercise trains this muscle.`;
  }
  const rest = sorted.slice(1).map(m => `${MUSCLE_BY_KEY[m.key]?.label || m.key} (${m.weight}%)`).join(", ");
  return `Primarily ${primaryLabel} (${primary.weight}%), with ${rest} for secondary volume.`;
}

function DayEditor({ day, index, onChange }) {
  const active = day.muscles || [];
  const activeKeys = active.map(m => m.key);

  const toggleMuscle = key => {
    if (activeKeys.includes(key)) {
      const next = active.filter(m => m.key !== key);
      onChange({ ...day, muscles: rebalance(next) });
    } else {
      const next = [...active, { key, weight: 0 }];
      onChange({ ...day, muscles: rebalance(next) });
    }
  };
  const rebalance = list => {
    if (list.length === 0) return [];
    const even = Math.floor(100 / list.length);
    const out = list.map(m => ({ ...m, weight: even }));
    out[0].weight += 100 - even * list.length;
    return out;
  };
  const setWeight = (key, w) => {
    onChange({ ...day, muscles: active.map(m => m.key === key ? { ...m, weight: Math.max(0, Math.min(100, +w || 0)) } : m) });
  };
  const total = active.reduce((s, m) => s + m.weight, 0);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <Stripe color={dayColor(index)} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="eyebrow">{day.day}</div>
          <button
            className="dayswitch"
            onClick={() => onChange({ ...day, rest: !day.rest })}
            aria-pressed={!day.rest}
            aria-label={day.rest ? "Rest day, tap to make it a training day" : "Training day, tap to make it a rest day"}
          >
            <span className={"lbl" + (day.rest ? " on" : "")}>Rest day</span>
            <span className={"switch-track" + (!day.rest ? " on" : "")}><span className="switch-knob" /></span>
            <span className={"lbl" + (!day.rest ? " on" : "")}>Training day</span>
          </button>
        </div>

        {!day.rest && (
          <>
            <div className="chipwrap" style={{ marginBottom: 12 }}>
              {MUSCLE_META.filter(m => m.key !== "cardio" && m.key !== "conditioning").map(m => (
                <button key={m.key} className={"chip" + (activeKeys.includes(m.key) ? " on" : "")} onClick={() => toggleMuscle(m.key)}>
                  {m.label}
                </button>
              ))}
              {["conditioning", "cardio"].map(k => {
                const m = MUSCLE_BY_KEY[k];
                return (
                  <button key={k} className={"chip" + (activeKeys.includes(k) ? " on" : "")} onClick={() => toggleMuscle(k)}>
                    {m.label}
                  </button>
                );
              })}
            </div>

            {active.length > 0 && (
              <div className="stack" style={{ gap: 8 }}>
                {active.map(m => (
                  <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, width: 130, flexShrink: 0 }}>{MUSCLE_BY_KEY[m.key]?.label}</span>
                    <input className="mono" type="number" min="0" max="100" value={m.weight}
                      onChange={e => setWeight(m.key, e.target.value)} style={{ width: 70, textAlign: "center" }} />
                    <span className="mono muted" style={{ fontSize: 12 }}>%</span>
                  </div>
                ))}
                <div className="mono" style={{ fontSize: 11.5, color: total === 100 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                  Total: {total}% {total !== 100 && "— must equal 100%"}
                </div>
              </div>
            )}
            {active.length === 0 && <p className="muted" style={{ fontSize: 13 }}>Pick at least one muscle group for this day.</p>}
          </>
        )}

        <p className="muted" style={{ fontSize: 12.5, marginTop: 12, paddingTop: 12, borderTop: "1.5px solid var(--line)" }}>
          {describeDay(day)}
        </p>
      </div>
    </div>
  );
}


/* ---------------- progress (moved under Profile) ---------------- */

/* ---------------- history calendar ---------------- */

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function HistoryDetail({ entry, units, onClose }) {
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheetbody" onClick={e => e.stopPropagation()} role="dialog" aria-label={entry.date}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <div className="eyebrow">{entry.dayName} · {entry.date}</div>
            <h2 style={{ fontSize: 23, marginTop: 6, lineHeight: 1.1 }}>{entry.focus}</h2>
          </div>
          <button className="btn ghost sm" onClick={onClose}>Close</button>
        </div>

        <div className="mono" style={{ fontSize: 13, marginTop: 14, color: "var(--iron)" }}>
          Time taken: {entry.durationMin} min
        </div>

        <div style={{ marginTop: 20 }}>
          {entry.exercises.map((ex, i) => (
            <div key={i} style={{ padding: "13px 0", borderBottom: "1.5px solid var(--line)" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
              <div className="mono" style={{ fontSize: 12, color: "var(--iron)", marginTop: 3 }}>
                target {ex.targetSets}×{ex.targetReps}
              </div>
              {ex.sets?.length > 0 ? (
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ex.sets.map((s, j) => (
                    <span key={j} className="mono" style={{
                      fontSize: 12, padding: "4px 9px", borderRadius: 2,
                      background: s.done ? "var(--green)" : "var(--panel2)", color: s.done ? "#0A0A0C" : "var(--iron)",
                      border: "1.5px solid " + (s.done ? "var(--green)" : "var(--line)"),
                    }}>
                      {s.w || "–"}{units} × {s.r || "–"}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>No sets logged for this exercise.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryView({ logs, units }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState(null);
  const history = logs.history || {};

  const first = new Date(cursor.y, cursor.m, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...Array(daysInMonth)].map((_, i) =>
    i < startOffset ? null : i - startOffset + 1
  );

  const keyFor = day => `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const todayKey = localDateKey();

  const entries = Object.values(history).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="card" style={{ overflow: "hidden", maxWidth: 480 }}>
        <Stripe color="var(--accent)" />
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <button className="btn ghost sm" onClick={() => setCursor(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })}>←</button>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{MONTH_NAMES[cursor.m]} {cursor.y}</div>
            <button className="btn ghost sm" onClick={() => setCursor(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })}>→</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} className="mono" style={{ fontSize: 10, textAlign: "center", color: "var(--steel)", fontWeight: 700 }}>{d[0]}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const k = keyFor(day);
              const has = !!history[k];
              const isToday = k === todayKey;
              return (
                <button key={i} onClick={() => has && setSelected(history[k])}
                  disabled={!has}
                  style={{
                    aspectRatio: "1", borderRadius: 2, fontSize: 12, fontFamily: "'JetBrains Mono',monospace",
                    background: has ? "var(--green)" : "var(--panel2)", color: has ? "#0A0A0C" : "var(--iron)",
                    border: "1.5px solid " + (isToday ? "var(--ink)" : has ? "var(--green)" : "var(--line)"),
                    cursor: has ? "pointer" : "default", fontWeight: isToday ? 700 : 500,
                  }}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <>
          <h2 style={{ fontSize: 20, margin: "26px 0 14px" }}>Recent sessions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {entries.slice(0, 12).map(entry => (
              <button key={entry.date} className="card" style={{ textAlign: "left", padding: 15 }} onClick={() => setSelected(entry)}>
                <div className="eyebrow">{entry.dayName} · {entry.date}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 5 }}>{entry.focus}</div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--iron)", marginTop: 7 }}>{entry.durationMin} min · {entry.exercises.length} exercises</div>
              </button>
            ))}
          </div>
        </>
      )}
      {entries.length === 0 && (
        <p className="muted" style={{ fontSize: 14, marginTop: 20 }}>No completed workouts yet — hit "Complete workout" on Today once you finish a session.</p>
      )}

      {selected && <HistoryDetail entry={selected} units={units} onClose={() => setSelected(null)} />}
    </>
  );
}

function ProgressView({ profile, setProfile, logs, setLogs, units, totalVolume, setsDone, onResetAll }) {
  const [bodyInput, setBodyInput] = useState("");
  const [goalInput, setGoalInput] = useState("");

  const bodyData = (logs.body || []).map(b => ({ v: b.v }));
  const volByDay = {};
  Object.entries(logs.sets || {}).forEach(([k, sets]) => {
    const day = k.split("|")[0];
    volByDay[day] = (volByDay[day] || 0) + sets.reduce((s, x) => s + (x.done ? (+x.w || 0) * (+x.r || 0) : 0), 0);
  });
  const volData = DAYS.filter(d => volByDay[d]).map(d => ({ v: Math.round(volByDay[d]) }));
  const daysTrained = new Set(Object.entries(logs.sets || {}).filter(([, sets]) => sets.some(s => s.done)).map(([k]) => k.split("|")[0])).size;

  const currentWeight = logs.body?.length ? logs.body[logs.body.length - 1].v : +profile.weight;
  const goal = profile.goalWeight;
  const delta = goal ? +(goal - currentWeight).toFixed(1) : null;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 22 }}>
        <Kpi n={setsDone} l="Sets logged" color="#FF1E3C" />
        <Kpi n={Math.round(totalVolume).toLocaleString()} l={`Volume (${units})`} color="#FF6B7A" />
        <Kpi n={daysTrained} l="Days trained" color="#C8102E" />
        <Kpi n={(logs.body || []).length} l="Weigh-ins" color="#FF8A99" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <Sparkline data={bodyData} color="#FF6B7A" label={`Bodyweight (${units})`} unit={units} />
        <Sparkline data={volData} color="#C8102E" label="Session volume" unit="" />
      </div>

      <div className="card" style={{ overflow: "hidden", marginTop: 20, maxWidth: 460 }}>
        <Stripe color="var(--accent)" />
        <div style={{ padding: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Goal weight</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="mono" inputMode="decimal" value={goalInput} onChange={e => setGoalInput(e.target.value)}
              placeholder={goal ? `${goal} ${units}` : `Target weight in ${units}`} />
            <button className="btn" disabled={!goalInput}
              onClick={() => { setProfile(p => ({ ...p, goalWeight: +goalInput })); setGoalInput(""); }}>
              {goal ? "Update" : "Set goal"}
            </button>
          </div>
          {goal && (
            <p className="mono" style={{ fontSize: 13, marginTop: 12, color: "var(--iron)" }}>
              Currently {currentWeight}{units} → goal {goal}{units} ({" "}
              {delta === 0 ? "you're there" : `${Math.abs(delta)}${units} to ${delta > 0 ? "gain" : "lose"}`}
              {" "})
            </p>
          )}
        </div>
      </div>

      <div className="card flush" style={{ marginTop: 20, maxWidth: 460 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Log a weigh-in</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="mono" inputMode="decimal" value={bodyInput} onChange={e => setBodyInput(e.target.value)} placeholder={`Weight in ${units}`} />
          <button className="btn" disabled={!bodyInput}
            onClick={() => {
              setLogs(L => ({ ...L, body: [...(L.body || []), { v: +bodyInput, t: Date.now() }] }));
              setBodyInput("");
            }}>Save</button>
        </div>
      </div>

      <div className="card flush" style={{ marginTop: 20, maxWidth: 460 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Start over</div>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 0, marginBottom: 14 }}>
          Clears your profile, plan and every log. There's no undo.
        </p>
        <button className="btn ghost sm" onClick={onResetAll}>Reset everything</button>
      </div>
    </>
  );
}

/* ---------------- settings (edit profile fields) ---------------- */

/* ---------------- user guide ---------------- */

function GuideSection({ title, color, children }) {
  return (
    <div className="card" style={{ overflow: "hidden", marginBottom: 14 }}>
      <Stripe color={color} />
      <div style={{ padding: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--iron)" }}>{children}</div>
      </div>
    </div>
  );
}

/* ---------------- exercise guide (toggle exercises on/off) ---------------- */

const DIFF_COLOR = { easy: "#6E6F78", intermediate: "#C8102E", advanced: "#FF1E3C", master: "#FF4159" };


/* ---------------- workout settings (everything that changes exercises, in one place) ---------------- */

function WorkoutSettingsView({ profile, setProfile, onRegenerate, rebuilding, setView }) {
  const [equipment, setEquipment] = useState(profile.equipment);
  const [level, setLevel] = useState(profile.level);
  const [difficultyOverride, setDifficultyOverride] = useState(profile.difficultyOverride || null);
  const [top20Only, setTop20Only] = useState(profile.top20Only !== false);
  const [days, setDays] = useState(profile.days);
  const [session, setSession] = useState(profile.session);
  const [splitDraft, setSplitDraft] = useState(profile.splitConfig || defaultSplitConfig(profile.days));
  const [disabled, setDisabled] = useState(new Set(profile.disabledExercises || []));
  const [dirty, setDirty] = useState(false);
  const [openKey, setOpenKey] = useState(null);
  const [q, setQ] = useState("");

  const touch = () => setDirty(true);
  const toggleEquip = v => { setEquipment(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v]); touch(); };
  const updateDay = (i, next) => { setSplitDraft(d => d.map((day, j) => (j === i ? next : day))); touch(); };
  const changeDays = newDays => {
    setDays(newDays);
    setSplitDraft(defaultSplitConfig(newDays));
    touch();
  };
  const applyPreset = name => {
    const preset = PRESETS.find(p => p.name === name);
    if (!preset) return;
    setSplitDraft(preset.build(days));
    touch();
  };
  const toggleExercise = name => {
    setDisabled(prev => { const next = new Set(prev); if (next.has(name)) next.delete(name); else next.add(name); return next; });
    touch();
  };

  const splitValid = splitDraft.every(d => d.rest || (d.muscles.length > 0 && d.muscles.reduce((s, m) => s + m.weight, 0) === 100));
  const maxDiff = maxDifficultyFor(level, difficultyOverride);

  const regenerate = async () => {
    const updated = {
      ...profile, equipment, level, difficultyOverride, top20Only, days, session,
      splitConfig: splitDraft, disabledExercises: [...disabled],
    };
    setProfile(updated);
    setDirty(false);
    await onRegenerate(updated);
  };

  return (
    <>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => setView("settings")}>← Back to Settings</button>
      <div className="pagehead" style={{ marginBottom: 10 }}>
        <div>
          <div className="eyebrow">Everything that changes your exercises, in one place</div>
          <h1>Workout Settings</h1>
        </div>
        <button className="btn" disabled={!splitValid || rebuilding} onClick={regenerate}>
          {rebuilding ? "Regenerating…" : dirty ? "Regenerate plan" : "Regenerate plan"}
        </button>
      </div>
      {dirty && (
        <p className="mono" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, marginBottom: 18 }}>
          You have unsaved changes — nothing below applies until you tap "Regenerate plan".
        </p>
      )}
      {!splitValid && (
        <p className="mono" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, marginBottom: 18 }}>
          Fix the split below — every training day's percentages must add to 100.
        </p>
      )}

      <div className="card flush" style={{ marginBottom: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 9 }}>Equipment</div>
        <div className="chipwrap">
          {GEAR.map(g => (
            <button key={g} className={"chip" + (equipment.includes(g) ? " on" : "")} onClick={() => toggleEquip(g)}>{g}</button>
          ))}
        </div>
      </div>

      <div className="card flush" style={{ marginBottom: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 9 }}>Level</div>
        <div className="chipwrap">
          {LEVELS.map(l => (
            <button key={l} className={"chip" + (level === l ? " on" : "")} onClick={() => { setLevel(l); touch(); }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card flush" style={{ marginBottom: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 9 }}>Difficulty ceiling</div>
        <div className="chipwrap">
          <button className={"chip" + (!difficultyOverride ? " on" : "")} onClick={() => { setDifficultyOverride(null); touch(); }}>Auto ({level})</button>
          {DIFFICULTY_ORDER.map(d => (
            <button key={d} className={"chip" + (difficultyOverride === d ? " on" : "")} onClick={() => { setDifficultyOverride(d); touch(); }}>
              {d[0].toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card flush" style={{ marginBottom: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 9 }}>Exercise selection</div>
        <button className="dayswitch" onClick={() => { setTop20Only(t => !t); touch(); }} aria-pressed={top20Only}>
          <span className={"lbl" + (!top20Only ? " on" : "")}>Full library</span>
          <span className={"switch-track" + (top20Only ? " on" : "")}><span className="switch-knob" /></span>
          <span className={"lbl" + (top20Only ? " on" : "")}>Top 20 only</span>
        </button>
      </div>

      <div className="eyebrow" style={{ margin: "24px 0 10px" }}>Split — pick muscles per day and set weights</div>
      <div className="chipwrap" style={{ marginBottom: 14 }}>
        {PRESETS.map(preset => (
          <button key={preset.name} className="chip" onClick={() => applyPreset(preset.name)}>{preset.name}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginBottom: 24 }}>
        {splitDraft.map((day, i) => (
          <DayEditor key={i} index={i} day={{ day: DAYS[i], ...day }} onChange={next => updateDay(i, next)} />
        ))}
      </div>

      <div className="eyebrow" style={{ margin: "24px 0 10px" }}>Exercise library — {top20Only ? "Top 20 only is active; toggles below only take effect in Full library" : "toggle any exercise off"}</div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search exercises…" style={{ marginBottom: 14 }} />
      {MUSCLE_META.map(m => {
        const fullList = m.fullPool?.length ? m.fullPool : m.pool;
        const top20Names = new Set(m.pool.map(e => e.name));
        const diffByName = Object.fromEntries(m.pool.map(e => [e.name, e.difficulty]));
        const filtered = q ? fullList.filter(e => e.name.toLowerCase().includes(q.toLowerCase())) : fullList;
        if (q && filtered.length === 0) return null;
        const open = openKey === m.key || !!q;
        const offCount = fullList.filter(e => disabled.has(e.name)).length;
        return (
          <div key={m.key} className="card" style={{ overflow: "hidden", marginBottom: 12 }}>
            <Stripe color={m.color} />
            <button onClick={() => setOpenKey(open ? "" : m.key)} style={{ width: "100%", textAlign: "left", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{m.label}</span>
              <span className="mono muted" style={{ fontSize: 12 }}>{fullList.length} exercises{offCount ? ` · ${offCount} off` : ""} {open ? "−" : "+"}</span>
            </button>
            {open && (
              <div style={{ padding: "0 16px 16px" }}>
                {filtered.map(e => {
                  const isTop20 = top20Names.has(e.name);
                  const difficulty = diffByName[e.name];
                  const withinLevel = !difficulty || DIFFICULTY_ORDER.indexOf(difficulty) <= maxDiff;
                  const on = !disabled.has(e.name);
                  return (
                    <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1.5px solid var(--line)", gap: 10 }}>
                      <span style={{ fontSize: 13.5, opacity: withinLevel && on ? 1 : 0.4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {e.name}
                        {isTop20 && <span className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".05em", padding: "2px 6px", borderRadius: 2, background: "var(--accent)", color: "var(--accent-ink)" }}>TOP 20</span>}
                        {difficulty && <span className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 2, color: "#fff", background: DIFF_COLOR[difficulty] }}>{difficulty}</span>}
                      </span>
                      <button className="dayswitch" onClick={() => toggleExercise(e.name)} aria-pressed={on} style={{ flexShrink: 0 }}>
                        <span className={"switch-track" + (on ? " on" : "")}><span className="switch-knob" /></span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <button className="btn" style={{ marginTop: 10 }} disabled={!splitValid || rebuilding} onClick={regenerate}>
        {rebuilding ? "Regenerating…" : "Regenerate plan"}
      </button>
    </>
  );
}

function GuideView({ setView }) {
  return (
    <>
      <button className="btn ghost sm" style={{ marginBottom: 14 }} onClick={() => setView("settings")}>← Back to Settings</button>
      <div className="pagehead">
        <div>
          <div className="eyebrow">How Spotter works</div>
          <h1>User Guide</h1>
        </div>
      </div>

      <GuideSection title="Today" color="#C8102E">
        Shows the session assigned to whichever day you're viewing. Tap "Log sets" on any exercise to record weight and
        reps per set — use "+ Add set" or the × on a set to change how many you do. Once a set's weight is logged, the
        plate calculator shows exactly what to load on the bar. Tap "Show form" for cues and a demonstration video.
        When you finish, tap "Complete workout" and enter how long it took — that's saved permanently to your History,
        separate from the editable weekly log.
      </GuideSection>

      <GuideSection title="The Week" color="#FF6B7A">
        Shows every day's focus for the current week at a glance. Tap "Why this week looks like this" to see the
        reasoning behind your calorie/protein targets and split. Tap any day to jump straight to it on the Today tab.
      </GuideSection>

      <GuideSection title="PT" color="#C8102E">
        Your personal trainer. It knows today's session, your equipment, and your targets — ask about form, injuries,
        time constraints, or why the plan is built the way it is. This is a demo coach with rule-based answers for now;
        live mode will reason freely over your full plan and history.
      </GuideSection>

      <GuideSection title="Profile → Progress" color="#8A8F98">
        Sets logged, training volume, days trained, and weigh-ins at a glance, plus trend charts for bodyweight and
        session volume. Set or update your goal weight here to track distance to target. Log new weigh-ins any time.
      </GuideSection>

      <GuideSection title="Profile → History" color="#FF8A99">
        A calendar of every workout you've completed. Days with a logged session show a green dot — tap one to see
        every exercise, every set's weight and reps, and how long the session took.
      </GuideSection>

      <GuideSection title="Settings" color="#4A5158">
        Edit your name, goals, level, equipment, training days, session length, and bodyweight any time. Export a full
        backup of your data as a JSON file, or import one to restore. This is also where you reach your Split and this
        guide.
      </GuideSection>

      <GuideSection title="Workout Settings" color="var(--accent)">
        Everything that changes which exercises you get, on one page: equipment, training level, a difficulty
        ceiling, the Top 20-only vs. full-library toggle, your day-by-day split (pick muscles per day and set what
        percentage of that day's exercises come from each — a Pull day at Back 70% / Biceps 30% fills roughly 70%
        of its exercises from your back pool), and the full exercise library where you can turn any individual
        exercise off. Nothing here takes effect until you tap "Regenerate plan" — that's intentional, so you can
        make several changes before rebuilding.
      </GuideSection>

      <GuideSection title="Demo mode" color="#FF6B7A">
        Spotter is currently running in demo mode — workouts, sessions, and the PT's replies are generated locally on
        your device rather than by live AI, so everything works instantly with no network connection required.
      </GuideSection>
    </>
  );
}

function SettingsView({ profile, setProfile, plan, setPlan, logs, setLogs, chat, setChat, setView }) {
  const [p, setP] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef(null);
  const set = (k, v) => { setP(s => ({ ...s, [k]: v })); setSaved(false); };
  const toggle = (k, v) => { setP(s => ({ ...s, [k]: s[k].includes(v) ? s[k].filter(x => x !== v) : [...s[k], v] })); setSaved(false); };

  const save = () => { setProfile(p); setSaved(true); };

  const exportData = () => {
    const bundle = { exportedAt: new Date().toISOString(), profile, plan, logs, chat };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spotter-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importData = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.profile) { setProfile(data.profile); setP(data.profile); }
        if (data.plan !== undefined) setPlan(data.plan);
        if (data.logs) setLogs(data.logs);
        if (data.chat) setChat(data.chat);
        setImportMsg("Imported successfully.");
      } catch {
        setImportMsg("That file couldn't be read — make sure it's a Spotter backup JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn ghost sm" onClick={() => setView("split")}>Workout settings →</button>
        <button className="btn ghost sm" onClick={() => setView("guide")}>User guide →</button>
      </div>

      <div className="card flush">
        <div className="eyebrow" style={{ marginBottom: 9 }}>Appearance</div>
        <button className="dayswitch" onClick={() => {
          const next = p.theme === "light" ? "dark" : "light";
          set("theme", next);
          setProfile(prev => ({ ...prev, theme: next }));
        }} aria-pressed={p.theme === "light"}>
          <span className={"lbl" + (p.theme !== "light" ? " on" : "")}>Dark</span>
          <span className={"switch-track" + (p.theme === "light" ? " on" : "")}><span className="switch-knob" /></span>
          <span className={"lbl" + (p.theme === "light" ? " on" : "")}>Light</span>
        </button>
      </div>

      <div className="card flush">
        <div className="eyebrow" style={{ marginBottom: 9 }}>Your name</div>
        <input value={p.name || ""} onChange={e => set("name", e.target.value)} placeholder="Your first name" />
      </div>

      <div className="card flush">
        <div className="eyebrow" style={{ marginBottom: 9 }}>Goals (up to 3)</div>
        <div className="chipwrap">
          {GOALS.map(g => {
            const on = p.goals.includes(g);
            const disabled = !on && p.goals.length >= 3;
            return (
              <button key={g} className={"chip" + (on ? " on" : "")} disabled={disabled}
                style={disabled ? { opacity: 0.4 } : {}}
                onClick={() => toggle("goals", g)}>{g}</button>
            );
          })}
        </div>
      </div>

      <div className="card flush">
        <div className="eyebrow" style={{ marginBottom: 9 }}>Bodyweight</div>
        <div className="row">
          <input className="mono" type="number" min="0" value={p.weight}
            onChange={e => set("weight", e.target.value)}
            onBlur={() => { if (!p.weight) set("weight", "0"); }} style={{ flex: 1 }} />
          <div className="chipwrap">
            {["kg", "lb"].map(u => (
              <button key={u} className={"chip" + (p.units === u ? " on" : "")} onClick={() => set("units", u)}>{u}</button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn" onClick={save} style={{ alignSelf: "flex-start" }}>{saved ? "Saved ✓" : "Save changes"}</button>

      <div className="card flush">
        <div className="eyebrow" style={{ marginBottom: 9 }}>Your data</div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 0, marginBottom: 12 }}>
          Export everything — profile, plan, logs, history — as a backup file, or restore from one.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn ghost sm" onClick={exportData}>Export data</button>
          <button className="btn ghost sm" onClick={() => fileRef.current?.click()}>Import data</button>
          <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={importData} />
        </div>
        {importMsg && <p className="mono" style={{ fontSize: 11.5, marginTop: 10, color: "var(--iron)" }}>{importMsg}</p>}
      </div>
    </div>
  );
}

/* ---------------- profile (settings + split + progress) ---------------- */

function ProfileView({
  profile, setProfile, subTab, setSubTab, logs, setLogs, units, totalVolume, setsDone, onResetAll,
}) {
  const tabs = [["progress", "Progress"], ["history", "History"]];
  return (
    <>
      <div className="pagehead">
        <div>
          <div className="eyebrow">You</div>
          <h1>Profile</h1>
        </div>
      </div>

      <div className="chipwrap" style={{ marginBottom: 22 }}>
        {tabs.map(([k, label]) => (
          <button key={k} className={"chip" + (subTab === k ? " on" : "")} onClick={() => setSubTab(k)}>{label}</button>
        ))}
      </div>

      {subTab === "progress" && (
        <ProgressView profile={profile} setProfile={setProfile} logs={logs} setLogs={setLogs} units={units}
          totalVolume={totalVolume} setsDone={setsDone} onResetAll={onResetAll} />
      )}
      {subTab === "history" && <HistoryView logs={logs} units={units} />}
    </>
  );
}

/* ============================================================
   APP
   ============================================================ */

export default function Spotter() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);        // {blueprint, weeks:[week1[7 days], week2[7 days]], cycleStart}
  const [logs, setLogs] = useState({ sets: {}, meals: {}, body: [] });
  const [chat, setChat] = useState([]);

  const [view, setView] = useState("today");
  const [profileTab, setProfileTab] = useState("progress");
  const [building, setBuilding] = useState(null);
  const [buildErr, setBuildErr] = useState("");
  const [diag, setDiag] = useState("");
  const [formEx, setFormEx] = useState(null);
  const [dayIdx, setDayIdx] = useState(() => (new Date().getDay() + 6) % 7);
  const [weekIdx, setWeekIdx] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  /* hydrate */
  useEffect(() => {
    (async () => {
      const [pr, pl, lg, ch] = await Promise.all([
        load(K.profile, null), load(K.plan, null),
        load(K.logs, { sets: {}, meals: {}, body: [] }),
        load(K.chat, []),
      ]);
      setProfile(pr); setPlan(pl); setLogs(lg); setChat(ch);
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready && profile) save(K.profile, profile); }, [profile, ready]);
  useEffect(() => { if (ready && plan) save(K.plan, plan); }, [plan, ready]);
  useEffect(() => { if (ready) save(K.logs, logs); }, [logs, ready]);
  useEffect(() => { if (ready) save(K.chat, chat); }, [chat, ready]);

  /* build plan */
  const generate = useCallback(async (p) => {
    setBuildErr("");
    setBuilding("Reading your setup");
    try {
      const bp = await buildBlueprint(p);
      setBuilding("Designing the cycle");
      const skeleton = bp.split.map(d => ({ ...d, workout: null }));
      setPlan({ blueprint: bp, weeks: [skeleton, skeleton] });

      setBuilding("Writing week 1");
      let doneCount = 0;
      const week1 = await pool(bp.split, 3, async d => {
        const w = await buildWorkout(p, bp, d).catch(() => ({ rest: d.rest, focus: d.focus, exercises: [], warmup: [], finisher: "" }));
        doneCount++;
        setBuilding(`Writing week 1 (${doneCount}/${bp.split.length} days)`);
        return { ...d, workout: w };
      });

      setBuilding("Writing week 2 (different exercises)");
      doneCount = 0;
      const week2 = await pool(bp.split.map((d, i) => ({ d, i })), 3, async ({ d, i }) => {
        const usedNames = (week1[i]?.workout?.exercises || []).map(e => e.name);
        const w = await buildWorkout(p, bp, d, usedNames).catch(() => ({ rest: d.rest, focus: d.focus, exercises: [], warmup: [], finisher: "" }));
        doneCount++;
        setBuilding(`Writing week 2 (${doneCount}/${bp.split.length} days)`);
        return { ...d, workout: w };
      });

      const cycleStart = localDateKey(mostRecentMonday());
      setPlan({ blueprint: bp, weeks: [week1, week2], cycleStart, builtAt: Date.now() });
      setWeekIdx(0);
    } catch (e) {
      console.error("Plan build failed:", e);
      setBuildErr(e?.message || "Something went wrong building the plan.");
    } finally {
      setBuilding(null);
    }
  }, []);

  const onboardDone = async (p) => { setProfile(p); setReady(true); generate(p); };

  const swapDay = async () => {
    if (!plan || !profile) return;
    setSwapping(true);
    try {
      const d = plan.weeks[weekIdx][dayIdx];
      const w = await buildWorkout(profile, plan.blueprint, d);
      setPlan(pl => ({
        ...pl,
        weeks: pl.weeks.map((wk, wi) => wi === weekIdx ? wk.map((x, i) => (i === dayIdx ? { ...x, workout: w } : x)) : wk),
      }));
    } catch { /* keep old */ }
    setSwapping(false);
  };

  const completeWorkout = (durationMin) => {
    const today = plan?.weeks?.[weekIdx]?.[dayIdx];
    if (!today || today.rest) return;
    const dateKey = localDateKey();
    const exercises = (today.workout?.exercises || []).map(ex => {
      const key = DAYS[dayIdx] + "|" + ex.name;
      const sets = (logs.sets && logs.sets[key]) || [];
      return { name: ex.name, sets, targetSets: ex.sets, targetReps: ex.reps };
    });
    const entry = { date: dateKey, dayName: DAYS[dayIdx], focus: today.focus, durationMin: +durationMin || 0, exercises };
    setLogs(L => ({ ...L, history: { ...(L.history || {}), [dateKey]: entry } }));
  };

  /* Two-week cycles renew every 14 days, anchored to the most recent
     Monday 00:01. Checked whenever the app loads — there's no real
     background scheduler in a client-only app, so this catches up
     retroactively rather than firing at the exact moment. */
  useEffect(() => {
    if (!plan?.cycleStart || !profile || building) return;
    const elapsed = daysSince(plan.cycleStart);
    if (elapsed >= 14) {
      generate(profile);
    } else {
      setWeekIdx(elapsed >= 7 ? 1 : 0);
    }
  }, [plan?.cycleStart, profile, building]);

  /* chat */
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const logEnd = useRef(null);
  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, thinking]);

  const send = async () => {
    const text = draft.trim();
    if (!text || thinking) return;
    const next = [...chat, { role: "user", content: text }];
    setChat(next); setDraft(""); setThinking(true);
    const today = plan?.weeks?.[weekIdx]?.[dayIdx];
    const reply = await generateCoachReply(text, profile, plan, today, dayIdx);
    setChat(c => [...c, { role: "assistant", content: reply }]);
    setThinking(false);
  };

  /* derived */
  const units = profile?.units || "kg";
  const today = plan?.weeks?.[weekIdx]?.[dayIdx];
  const bp = plan?.blueprint;

  const totalVolume = Object.entries(logs.sets || {}).reduce((sum, [, sets]) =>
    sum + sets.reduce((s, x) => s + (x.done ? (+x.w || 0) * (+x.r || 0) : 0), 0), 0);
  const setsDone = Object.values(logs.sets || {}).reduce((s, sets) => s + sets.filter(x => x.done).length, 0);

  const resetAll = async () => {
    for (const k of Object.values(K)) { try { await window.storage.delete(k); } catch {} }
    try { await window.storage.delete("spotter:chefHistory"); } catch {}
    setProfile(null); setPlan(null); setLogs({ sets: {}, meals: {}, body: [] }); setChat([]);
  };

  /* ---------- render gates ---------- */

  if (!ready) return <div className="sp" style={{ display: "grid", placeItems: "center", height: "100vh" }}><style>{CSS}</style><Spinner label="Loading" /></div>;
  if (!profile) return <Onboarding onDone={onboardDone} />;

  const shellBody = () => {
    if (building) {
      return (
        <div style={{ paddingTop: "12vh", textAlign: "center" }}>
          <h1 style={{ fontSize: 34 }}>Building your week</h1>
          <p className="muted" style={{ marginTop: 12, fontSize: 15 }}>{building}…</p>
          <div style={{ marginTop: 22 }}><Spinner label="Hang tight" /></div>
        </div>
      );
    }
    if (buildErr) {
      return (
        <div className="card flush" style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: 20 }}>Plan didn't build</h2>
          <p className="muted mono" style={{ fontSize: 12.5, margin: "10px 0 18px", whiteSpace: "pre-wrap", background: "var(--panel2)", border: "1.5px solid var(--line)", padding: "10px 12px", borderRadius: 2 }}>
            {buildErr}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => generate(profile)}>Try again</button>
            <button className="btn ghost" onClick={async () => {
              setDiag("Pinging…");
              const r = await diagnosticPing();
              setDiag(r);
            }}>Run connection diagnostic</button>
          </div>
          {diag && (
            <pre className="mono" style={{ fontSize: 11, marginTop: 16, background: "var(--panel2)", border: "1.5px solid var(--line)", padding: 12, borderRadius: 2, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {diag}
            </pre>
          )}
        </div>
      );
    }
    if (!plan && !["profile", "settings", "split", "guide"].includes(view)) {
      return (
        <div className="card flush" style={{ maxWidth: 520 }}>
          <h2 style={{ fontSize: 20 }}>No plan yet</h2>
          <p className="muted" style={{ fontSize: 14, margin: "10px 0 18px" }}>Build your first week and today's session will show up here. Or set up your split first, then build.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={() => generate(profile)}>Build my plan</button>
            <button className="btn ghost" onClick={() => setView("split")}>Set up my split</button>
          </div>
        </div>
      );
    }
    if (!plan && view === "profile") {
      return (
        <ProfileView
          profile={profile} setProfile={setProfile} subTab={profileTab} setSubTab={setProfileTab}
          logs={logs} setLogs={setLogs}
          units={units} totalVolume={totalVolume} setsDone={setsDone}
          onResetAll={resetAll}
        />
      );
    }
    if (!plan && view === "settings") {
      return (
        <SettingsView profile={profile} setProfile={setProfile} plan={plan} setPlan={setPlan}
          logs={logs} setLogs={setLogs} chat={chat} setChat={setChat} setView={setView} />
      );
    }
    if (!plan && view === "split") {
      return (
        <WorkoutSettingsView profile={profile} setProfile={setProfile} rebuilding={!!building} setView={setView}
          onRegenerate={async (updatedProfile) => { await generate(updatedProfile); setView("week"); }} />
      );
    }
    if (!plan && view === "guide") return <GuideView setView={setView} />;

    /* ---- TODAY ---- */
    if (view === "today") return (
      <>
        <div className="pagehead">
          <div>
            <div className="eyebrow">{DAYS[dayIdx]} · Week {weekIdx + 1} of 2 · {today?.rest ? "Recovery" : "Training day"}</div>
            <h1>{today?.rest ? "Rest" : today?.focus}</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn ghost sm" onClick={() => setWeekIdx(w => w === 0 ? 1 : 0)}>Switch to Week {weekIdx === 0 ? 2 : 1}</button>
            <div style={{ display: "flex", gap: 4 }}>
              {DAYS.map((d, i) => (
                <button key={d} onClick={() => setDayIdx(i)}
                  className="mono"
                  style={{
                    width: 38, height: 38, borderRadius: 2, fontSize: 11.5, fontWeight: 700,
                    background: i === dayIdx ? "var(--panel)" : "var(--panel2)",
                    color: i === dayIdx ? dayColor(i) : "var(--iron)",
                    border: "1.5px solid " + (i === dayIdx ? dayColor(i) : "var(--line)"),
                    borderBottom: "4px solid " + dayColor(i),
                  }}>{d[0]}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="stack" style={{ maxWidth: 640 }}>
          <WorkoutCard day={plan.weeks[weekIdx][dayIdx]} dayIndex={dayIdx} workout={today?.workout} dayKey={DAYS[dayIdx]}
            logs={logs} setLogs={setLogs} units={units} onForm={setFormEx} onSwap={swapDay} swapping={swapping}
            onComplete={completeWorkout} completedToday={logs.history?.[localDateKey()]} />
        </div>
      </>
    );

    /* ---- WEEK ---- */
    if (view === "week") return (
      <>
        <div className="pagehead">
          <div>
            <div className="eyebrow">Your split · 14-day cycle, week {weekIdx + 1} of 2</div>
            <h1>The Week</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", border: "1.5px solid var(--line)", borderRadius: 2, overflow: "hidden" }}>
              {[0, 1].map(w => (
                <button key={w} onClick={() => setWeekIdx(w)}
                  className="mono"
                  style={{
                    padding: "9px 16px", fontSize: 12.5, fontWeight: 700,
                    background: weekIdx === w ? "var(--accent)" : "var(--panel2)", color: weekIdx === w ? "var(--accent-ink)" : "var(--iron)",
                  }}>
                  Week {w + 1}
                </button>
              ))}
            </div>
            <button className="btn ghost sm" onClick={() => generate(profile)}>Regenerate cycle</button>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: -14, marginBottom: 20 }}>
          Week 2 uses different exercises from Week 1 where possible. A fresh 2-week cycle generates automatically every 14 days, starting Monday.
        </p>

        {bp?.rationale && (
          <div className="card flush" style={{ marginBottom: 20, maxWidth: 720 }}>
            <button onClick={() => setShowWhy(s => !s)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left" }}>
              <span className="eyebrow">Why this week looks like this</span>
              <span className="mono" style={{ fontSize: 13, color: "var(--iron)" }}>{showWhy ? "−" : "+"}</span>
            </button>
            {showWhy && <p style={{ fontSize: 14.5, margin: "12px 0 0" }}>{bp.rationale}</p>}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 }}>
          {plan.weeks[weekIdx].map((d, i) => (
            <button key={d.day} onClick={() => { setDayIdx(i); setView("today"); }} className="card"
              style={{ overflow: "hidden", textAlign: "left", padding: 0 }}>
              <Stripe color={dayColor(i)} />
              <div style={{ padding: 16 }}>
                <div className="eyebrow">{d.day}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 5, lineHeight: 1.15 }}>{d.focus}</div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--iron)", marginTop: 9 }}>
                  {d.rest ? "recovery" : `${(d.workout?.exercises || []).length} exercises`}
                </div>
                {!d.rest && (d.workout?.exercises || []).slice(0, 3).map((e, j) => (
                  <div key={j} style={{ fontSize: 12.5, color: "var(--iron)", marginTop: 5 }}>{e.name}</div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </>
    );

    /* ---- PROFILE (progress + history) ---- */
    if (view === "profile") return (
      <ProfileView
        profile={profile} setProfile={setProfile} subTab={profileTab} setSubTab={setProfileTab}
        logs={logs} setLogs={setLogs}
        units={units} totalVolume={totalVolume} setsDone={setsDone}
        onResetAll={resetAll}
      />
    );

    /* ---- SETTINGS (standalone) ---- */
    if (view === "settings") return (
      <SettingsView profile={profile} setProfile={setProfile} plan={plan} setPlan={setPlan}
        logs={logs} setLogs={setLogs} chat={chat} setChat={setChat} setView={setView} />
    );

    /* ---- WORKOUT SETTINGS (split + equipment + level + difficulty + exercise library, one page) ---- */
    if (view === "split") return (
      <WorkoutSettingsView profile={profile} setProfile={setProfile} rebuilding={!!building} setView={setView}
        onRegenerate={async (updatedProfile) => { await generate(updatedProfile); setView("week"); }} />
    );

    /* ---- USER GUIDE (standalone) ---- */
    if (view === "guide") return <GuideView setView={setView} />;

    /* ---- COACH (PT + Chef) ---- */
    if (view === "coach") return (
      <>
        <div className="pagehead">
          <div>
            <div className="eyebrow">Your personal trainer</div>
            <h1>PT</h1>
          </div>
          {chat.length > 0 && <button className="btn ghost sm" onClick={() => setChat([])}>Clear</button>}
        </div>

        <div className="card chatwrap" style={{ overflow: "hidden" }}>
          <Stripe color="var(--accent)" />
          <div className="chatlog">
            {chat.length === 0 && (
              <div style={{ margin: "auto", textAlign: "center", maxWidth: 380 }}>
                <p className="muted" style={{ fontSize: 14.5 }}>
                  {profile.name ? `Hey ${profile.name} — your PT knows` : "Your PT knows"} today's session, your equipment, your split, and your targets. Ask about form, swaps, injuries, or why the plan looks the way it does.
                </p>
                <div className="chipwrap" style={{ justifyContent: "center", marginTop: 16 }}>
                  {["My shoulder aches — what should I swap?", "Why so much protein?", "I only have 25 minutes today"].map(q => (
                    <button key={q} className="chip" onClick={() => setDraft(q)}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} className={"bub " + (m.role === "user" ? "me" : "coach")}>{m.content}</div>
            ))}
            {thinking && <div className="bub coach pulse"><Spinner label="Thinking" /></div>}
            <div ref={logEnd} />
          </div>
          <div className="chatbar">
            <input value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask your PT…" aria-label="Message your PT" />
            <button className="btn" onClick={send} disabled={thinking || !draft.trim()}>Send</button>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>
          Demo PT — rule-based canned answers for now. Live mode will reason freely over your full plan and history.
        </p>
      </>
    );

    /* ---- PROGRESS ---- */
    if (view === "progress") return null; // handled inside ProfileView now
    return null;
  };

  return (
    <div className={"sp" + (profile.theme === "light" ? " light" : "")}>
      <style>{CSS}</style>
      <div className="sp-shell">
        <nav className="sp-rail">
          <div className="sp-brand">
            <div className="mark disp">Spotter</div>
            <div className="sub">{(profile.goals || []).join(" · ") || "General fitness"}</div>
            <div className="mono" style={{ display: "inline-block", marginTop: 10, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", padding: "3px 8px", background: "#FF1E3C", color: "#FFFFFF", borderRadius: 2 }}>DEMO MODE</div>
          </div>
          <div className="sp-nav">
            {NAV.map(([k, label, color]) => (
              <button key={k} className={view === k ? "on" : ""} onClick={() => setView(k)}>
                <span className="dot" style={{ background: color }} />{label}
              </button>
            ))}
          </div>
          <div className="sp-rail-foot">
            {profile.days}× / week · {profile.session} min<br />
            {bp ? `${bp.kcal} kcal · ${bp.protein}g protein` : ""}
          </div>
        </nav>

        <main className="sp-main">
          <div className="sp-quickbar">
            <button className="btn ghost sm" onClick={() => setView("settings")}>Settings</button>
          </div>
          {shellBody()}
        </main>
      </div>

      <nav className="sp-tabs">
        {NAV.map(([k, label, color]) => (
          <button key={k} className={view === k ? "on" : ""} onClick={() => setView(k)}
            style={{ borderTopColor: view === k ? color : "transparent" }}>
            <span className="dot" style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            {label}
          </button>
        ))}
      </nav>

      {formEx && <FormSheet ex={formEx} onClose={() => setFormEx(null)} />}
    </div>
  );
}
