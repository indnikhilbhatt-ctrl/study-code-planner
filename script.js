/* ===== EDIT YOUR TIMETABLE HERE: ["time","activity","type"]  type: a=academics c=coding k=college ""=normal ===== */
const SCHEDULES = {
  college: ["College day", [
    ["5:30 AM - 6:15 AM","Wake up, freshen up, light exercise or walk",""],
    ["6:15 AM - 7:00 AM","Breakfast and get ready",""],
    ["7:00 AM - 6:00 PM","College (lectures and labs). Use breaks for quick revision.","k"],
    ["6:00 PM - 7:30 PM","Reach home, freshen up, rest, snack",""],
    ["7:30 PM - 8:30 PM","Academics: revise today’s notes, finish assignments","a"],
    ["8:30 PM - 9:15 PM","Dinner and family time",""],
    ["9:15 PM - 10:15 PM","Coding: DSA practice or the topic of the day","c"],
    ["10:15 PM - 10:30 PM","Plan tomorrow, pack bag",""],
    ["10:30 PM - 11:59 PM","Sleep (7 hours matters)",""]]],
  home: ["Home day", [
    ["6:30 AM - 7:30 AM","Wake up, exercise, freshen up",""],
    ["7:30 AM - 8:30 AM","Breakfast and rest",""],
    ["8:30 AM - 11:00 AM","Academics block 1: hardest subject (Discrete Structures or Data Structures)","a"],
    ["11:00 AM - 11:15 AM","Break",""],
    ["11:15 AM - 1:00 PM","Academics block 2: Digital Systems or OOP","a"],
    ["1:00 PM - 2:30 PM","Lunch and rest",""],
    ["2:30 PM - 5:00 PM","Coding block 1: learn a new concept and implement it","c"],
    ["5:00 PM - 6:00 PM","Break, walk, hobbies, sports",""],
    ["6:00 PM - 7:30 PM","Coding block 2: LeetCode, GeeksforGeeks, CodeChef","c"],
    ["7:30 PM - 8:30 PM","Dinner and free time",""],
    ["8:30 PM - 9:30 PM","Revision: today’s topics and RGPV previous year papers","a"],
    ["9:30 PM - 10:00 PM","Plan tomorrow, relax",""],
    ["10:00 PM - 11:59 PM","Sleep",""]]],
  week: ["Weekly focus", [
    ["Monday","Data Structures: arrays, strings, linked lists","c"],
    ["Tuesday","Data Structures: stacks, queues, trees","c"],
    ["Wednesday","OOP in C++ or Java: classes, inheritance, polymorphism","c"],
    ["Thursday","Problem solving: 3 to 5 DSA questions","c"],
    ["Friday","Mini project work (web, Python, or Java)","c"],
    ["Saturday","Contest or mock practice, plus weekly revision","c"],
    ["Sunday","Rest half the day, plan next week, learn Git, SQL, or HTML/CSS",""]]]
};

/* One task per day. The list rotates automatically with the date. Add your own. */
const TASKS = [
  "Solve 1 easy array problem on LeetCode","Revise one Discrete Structures topic and write 5 key points",
  "Implement a singly linked list from scratch","Solve 2 string problems",
  "Write a small C++ or Java class with inheritance","Practice 3 SQL queries",
  "Revise one RGPV previous year paper question set","Implement stack using an array",
  "Solve 1 binary search problem","Push a small project update to GitHub",
  "Revise Digital Systems: K-maps","Implement queue using two stacks",
  "Solve 1 recursion problem","Read about time complexity and note 3 examples"
];

const KEY = "rgpv-planner-v2";
const EXAM = { name: "Semester exams", date: "2026-12-15" };
let S = { goal: 4, type: "college", days: {}, done: {}, schedules: {} };
try {
  const stored = localStorage.getItem(KEY);
  if (stored) {
    const data = JSON.parse(stored);
    if (data && typeof data === "object" && !Array.isArray(data)) S = Object.assign(S, data);
  }
} catch (e) {}
if (!Number.isFinite(S.goal) || S.goal < 1 || S.goal > 24) S.goal = 4;
if (!Object.prototype.hasOwnProperty.call(SCHEDULES, S.type)) S.type = "college";
if (!S.days || typeof S.days !== "object" || Array.isArray(S.days)) S.days = {};
if (!S.done || typeof S.done !== "object" || Array.isArray(S.done)) S.done = {};
if (!S.schedules || typeof S.schedules !== "object" || Array.isArray(S.schedules)) S.schedules = {};
for (const k of Object.keys(SCHEDULES)) {
  const rows = S.schedules[k];
  if (!Array.isArray(rows)) {
    delete S.schedules[k];
    continue;
  }
  S.schedules[k] = rows
    .filter(row => Array.isArray(row) && row.length >= 3)
    .map(row => [String(row[0]), String(row[1]), ["a", "c", "k"].includes(row[2]) ? row[2] : ""]);
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const $ = id => document.getElementById(id);
const ymd = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const tot = k => S.days[k] && !S.days[k].rest ? (S.days[k].a || 0) + (S.days[k].c || 0) : 0;
const fmt = n => String(Math.round(n * 10) / 10);
let shownDay = ymd(new Date());

function toMin(t) { const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(t); if (!m) return null; let h = +m[1] % 12; if (m[3].toUpperCase() === "PM") h += 12; return h * 60 + +m[2]; }
function esc(s) { return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]); }
function currentSchedule() {
  return [SCHEDULES[S.type][0], S.schedules[S.type] || SCHEDULES[S.type][1]];
}

function drawHeader(now) {
  $("dow").textContent = now.toLocaleDateString("en", { weekday: "long" });
  $("dt").textContent = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
function drawRing(now) {
  const k = ymd(now), e = S.days[k] || {}, half = S.goal / 2;
  const a = e.rest ? 0 : e.a || 0, c = e.rest ? 0 : e.c || 0;
  $("ra").setAttribute("stroke-dasharray", Math.min(a / half, 1) * 100 + " 100");
  $("rc").setAttribute("stroke-dasharray", Math.min(c / half, 1) * 100 + " 100");
  $("pc").textContent = Math.round((Math.min(a, half) + Math.min(c, half)) / S.goal * 100) + "%";
  $("key").innerHTML = e.rest ? '<li>Rest day. Streak safe.</li>' :
    `<li><i style="background:var(--acad)"></i>Academics ${fmt(a)} of ${fmt(half)} h</li><li><i style="background:var(--code)"></i>Coding ${fmt(c)} of ${fmt(half)} h</li>`;
}
function drawTask(now) {
  const k = ymd(now), n = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
  const done = !!S.done[k];
  $("taskCard").innerHTML = `<h2>Today’s one task</h2><span class="status ${done ? "done" : ""}">${done ? "Done" : "Pending"}</span>` +
    `<p>${esc(TASKS[n % TASKS.length])}</p><small>A new task appears every morning.</small>` +
    `<button onclick="toggleTask()">${done ? "Mark as pending" : "Mark as done"}</button>`;
}
function toggleTask() { const k = ymd(new Date()); S.done[k] = !S.done[k]; save(); drawTask(new Date()); }

function drawTimetable(now) {
  $("seg").innerHTML = Object.keys(SCHEDULES).map(k => `<button class="${S.type === k ? "on" : ""}" onclick="setType('${k}')">${SCHEDULES[k][0]}</button>`).join("");
  const rows = currentSchedule()[1], mins = now.getHours() * 60 + now.getMinutes(), wd = now.toLocaleDateString("en", { weekday: "long" });
  $("tt").innerHTML = rows.map(r => {
    let cur = false;
    if (S.type === "week") cur = r[0] === wd;
    else { const t = r[0].split("-"), s = toMin(t[0]), e = toMin(t[1]); cur = s !== null && e !== null && mins >= s && mins < e; }
    return `<div class="row ${r[2]} ${cur ? "now" : ""}"${cur ? ' aria-current="time"' : ""}><div class="t">${esc(r[0])}</div><div class="w">${esc(r[1])}</div></div>`;
  }).join("");
  const current = $("tt").querySelector(".now");
  $("tt").classList.toggle("has-now", !!current);
  $("nowbar").innerHTML = current
    ? `<span class="nb-dot"></span><b>${S.type === "week" ? "Today" : "Right now"}</b><span>${esc(current.querySelector(".w").textContent)}</span>`
    : "";
}
function setType(k) {
  if (!Object.prototype.hasOwnProperty.call(SCHEDULES, k)) return;
  S.type = k; save(); drawTimetable(new Date());
}
function drawScheduleEditor(rows) {
  if (!rows) rows = currentSchedule()[1];
  const types = [["", "General"], ["a", "Academics"], ["c", "Coding"], ["k", "College"]];
  $("scheduleFields").innerHTML = rows.map((row, i) =>
    `<div class="schedule-edit-row">
      <label>Time or day<input class="schedule-label" type="text" value="${esc(row[0])}" maxlength="80" required></label>
      <label>Activity<input class="schedule-activity" type="text" value="${esc(row[1])}" maxlength="200" required></label>
      <label>Category<select class="schedule-type">${types.map(([value, name]) => `<option value="${value}"${row[2] === value ? " selected" : ""}>${name}</option>`).join("")}</select></label>
      <button type="button" class="ghost remove-schedule-row" onclick="removeScheduleRow(${i})" aria-label="Remove item ${i + 1}">Remove</button>
    </div>`
  ).join("");
}
function readScheduleEditor() {
  return Array.from($("scheduleFields").querySelectorAll(".schedule-edit-row")).map(row => [
    row.querySelector(".schedule-label").value.trim(),
    row.querySelector(".schedule-activity").value.trim(),
    row.querySelector(".schedule-type").value
  ]);
}
function addScheduleRow() {
  const rows = readScheduleEditor();
  rows.push([S.type === "week" ? "New day" : "New time", "New activity", ""]);
  drawScheduleEditor(rows);
  $("scheduleFields").lastElementChild.querySelector(".schedule-label").focus();
  $("scheduleMessage").textContent = "";
}
function removeScheduleRow(index) {
  const rows = readScheduleEditor();
  rows.splice(index, 1);
  drawScheduleEditor(rows);
  $("scheduleMessage").textContent = "";
}
function saveSchedule() {
  const rows = readScheduleEditor();
  if (!rows.length || rows.some(row => !row[0] || !row[1])) {
    $("scheduleMessage").textContent = "Add at least one item and fill in its time or day and activity.";
    return;
  }
  S.schedules[S.type] = rows;
  save();
  drawTimetable(new Date());
  drawScheduleEditor();
  $("scheduleMessage").textContent = "Timetable saved in this browser.";
}
function restoreScheduleDefaults() {
  if (!confirm("Restore the default " + SCHEDULES[S.type][0].toLowerCase() + " timetable? Your custom version will be removed.")) return;
  delete S.schedules[S.type];
  save();
  drawTimetable(new Date());
  drawScheduleEditor();
  $("scheduleMessage").textContent = "Default timetable restored.";
}

function streakCount(now) {
  let n = 0, d = new Date(now);
  const ok = k => tot(k) >= 0.5 || (S.days[k] && S.days[k].rest);
  if (!ok(ymd(d))) d.setDate(d.getDate() - 1);
  while (ok(ymd(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function drawStats(now) {
  let wk = 0, pr = 0;
  for (let i = 0; i < 7; i++) { const d = new Date(now); d.setDate(d.getDate() - i); const k = ymd(d); wk += tot(k); pr += (S.days[k] && S.days[k].p) || 0; }
  const st = streakCount(now);
  $("streak").innerHTML = `<b>${st}</b> day streak`;
  $("wk").innerHTML = `<b>${fmt(wk)}</b> h this week`;
  $("stats").innerHTML = `<div class="stat"><b>${fmt(wk)}</b><small>hours this week</small></div><div class="stat"><b>${fmt(wk / 7)}</b><small>average per day</small></div><div class="stat"><b>${pr}</b><small>problems this week</small></div><div class="stat"><b>${st}</b><small>day streak</small></div>`;
}
function drawHeat(now) {
  const start = new Date(now); start.setDate(start.getDate() - 7 * 11 - ((now.getDay() + 6) % 7));
  let html = "";
  for (let i = 0; i < 84; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i); const k = ymd(d), e = S.days[k];
    if (d > now) { html += '<div class="cell f"></div>'; continue; }
    const h = tot(k); let c = "";
    if (e && e.rest) c = "r"; else if (h >= S.goal) c = "l3"; else if (h >= S.goal / 2) c = "l2"; else if (h > 0) c = "l1";
    html += `<div class="cell ${c} ${k === ymd(now) ? "today" : ""}" title="${k}: ${e && e.rest ? "rest day" : fmt(h) + " h"}"></div>`;
  }
  $("heat").innerHTML = html;
}
function drawExam(now) {
  const [year, month, day] = EXAM.date.split("-").map(Number);
  const examDate = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((examDate - today) / 864e5);
  $("exam").textContent = days > 0 ? `${days} days to ${EXAM.name}` : days === 0 ? `${EXAM.name} today` : "";
  $("exam").style.display = days >= 0 ? "" : "none";
}
function logToday(event) {
  event.preventDefault();
  if (!$("logForm").reportValidity()) return;
  const k = ymd(new Date());
  S.days[k] = { a: Number($("ia").value), c: Number($("ic").value), p: Number($("ip").value) };
  S.goal = Number($("ig").value); save(); drawAll();
}
function restDay() {
  const now = new Date();
  for (let i = 0; i < 7; i++) { const d = new Date(now); d.setDate(d.getDate() - i); if (S.days[ymd(d)] && S.days[ymd(d)].rest) return alert("You already took a rest day this week. Next one unlocks after 7 days."); }
  S.days[ymd(now)] = { rest: true }; save(); drawAll();
}
function fillForm(now) {
  const e = S.days[ymd(now)] || {};
  $("ia").value = e.a || 0; $("ic").value = e.c || 0; $("ip").value = e.p || 0; $("ig").value = S.goal;
}
function drawAll() { const n = new Date(); drawHeader(n); drawRing(n); drawTask(n); drawTimetable(n); drawStats(n); drawHeat(n); drawExam(n); }

fillForm(new Date()); drawAll();

/* The date, task and "Now" marker refresh on their own, including at midnight. */
function tick() { const n = new Date(); if (ymd(n) !== shownDay) { shownDay = ymd(n); fillForm(n); } drawAll(); }
setInterval(tick, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });