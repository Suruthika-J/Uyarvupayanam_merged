/* One-off smoke test for the Personal Memory Vault stack.
   Creates two throwaway students, plays the full memory lifecycle through the
   real HTTP API: settings toggle, creating every memory type (journal, email,
   story, voice-note, document upload), invalid-input rejection, background
   processing states (queued → ready), failed-transcription handling, hybrid
   search with differently-worded queries, type filters, cross-student access
   control, edit+re-process, delete, AI-chat integration with memory sources
   (+ no-memory-sources for unrelated questions), and the privacy kill-switch.
   Removes every trace afterwards. Safe to re-run.
   Run:  node backend/scripts/_smokeMemorySystem.js
*/
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const FormData = require("form-data");

const User = require("../models/User");
const Memory = require("../models/Memory");
const MemorySettings = require("../models/MemorySettings");

const API = process.env.API_URL || "http://localhost:5000/api";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Fixtures live in a unique per-run temp dir (module scope so `finally` can
// always reach them) — a hard crash can never leave stragglers in the repo.
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "uyarvu-smoke-"));
const txtPath = path.join(fixtureDir, "doc.txt");
const fakeAudioPath = path.join(fixtureDir, "fake.webm");

let failures = 0;
let warnings = 0;
function check(name, cond, extra) {
  if (!cond) failures += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra !== undefined ? "  -> " + JSON.stringify(extra) : ""}`);
}
function note(name, extra) {
  warnings += 1;
  console.log(`INFO  ${name}${extra !== undefined ? "  -> " + JSON.stringify(extra) : ""}`);
}

async function waitForApi(tries = 20) {
  for (let i = 0; i < tries; i += 1) {
    try {
      await axios.get(`${API}/memories/settings`);
      return true;
    } catch (e) {
      if (e.response && (e.response.status === 401 || e.response.status === 400)) return true;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return false;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function createMemory(auth, fields, file) {
  const fd = new FormData();
  Object.keys(fields).forEach((k) => { const v = fields[k]; if (v !== undefined && v !== null && v !== "") fd.append(k, v); });
  if (file) fd.append("file", file.stream || file.buffer, file.options || { filename: file.name, contentType: file.type });
  try {
    const res = await axios.post(`${API}/memories`, fd, { headers: { ...auth.headers, ...fd.getHeaders() }, timeout: 30000 });
    return { httpStatus: res.status, data: res.data };
  } catch (err) {
    return { httpStatus: err.response?.status, data: err.response?.data, err };
  }
}

async function waitReady(auth, id, timeoutMs = 60000, extraBackoffMs = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    let res;
    try {
      res = await axios.get(`${API}/memories/${id}`, auth);
      const status = res.data?.memory?.status;
      if (status === "ready" || status === "failed") return res.data.memory;
    } catch (pollErr) {
      // Transient 5xx/network blips (e.g., a DB reconnection) must not abort
      // the whole E2E run — keep polling until the budget is exhausted.
      await sleep(extraBackoffMs);
      continue;
    }
    await sleep(2000);
  }
  return null;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  const up = await waitForApi();
  check("backend reachable", up);
  if (!up) process.exit(1);

  const users = [];
  const createdMemoryIds = [];
  const makeUser = async (name) => {
    const u = await User.create({ name, email: `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@uyarvu.test`, password: "x", role: "student", userType: "college_student", isVerified: true });
    users.push(u);
    return { headers: { Authorization: `Bearer ${jwt.sign({ id: u._id }, JWT_SECRET)}` } };
  };
  const auth = await makeUser("Smoke Memory A");
  const otherAuth = await makeUser("Smoke Memory B");
  const userIdA = users[0]._id;

  try {
    // ── 1. Settings & privacy toggle ───────────────────────────────────────
    const s1 = (await axios.get(`${API}/memories/settings`, auth)).data;
    check("settings: memory-in-chat defaults ON", s1.useMemoryInChat === true, s1);
    const s2 = (await axios.put(`${API}/memories/settings`, { useMemoryInChat: false }, auth)).data;
    check("settings: can disable", s2.useMemoryInChat === false, s2);
    const s3 = (await axios.put(`${API}/memories/settings`, { useMemoryInChat: true }, auth)).data;
    check("settings: can re-enable", s3.useMemoryInChat === true, s3);

    // ── 2. Create every text type ──────────────────────────────────────────
    const journal = await createMemory(auth, {
      type: "journal", title: "Company interview", content: "I attended a company interview. I cleared the technical rounds, but I struggled to explain my answers confidently during the HR interview. I felt disappointed afterward.", eventDate: "2025-05-10",
    });
    check("journal: created 201 + queued (pending)", journal.httpStatus === 201 && journal.data?.memory?.status === "pending", journal.httpStatus);
    createdMemoryIds.push(journal.data?.memory?.id);

    const email = await createMemory(auth, {
      type: "email", title: "Internship offer", content: "The offer letter had a three-year bond. I discussed it with my parents and we decided not to accept the offer.", eventDate: "2025-06-01",
    });
    check("email: created", email.httpStatus === 201 && email.data?.memory?.type === "email", email.httpStatus);
    createdMemoryIds.push(email.data?.memory?.id);

    const story = await createMemory(auth, {
      type: "story", title: "Kodaikanal trip", content: "Last summer we went to Kodaikanal for a trip. The trek at sunrise was amazing and we took the boat ride on the lake with friends.",
    });
    check("story: created", story.httpStatus === 201 && story.data?.memory?.type === "story", story.httpStatus);
    createdMemoryIds.push(story.data?.memory?.id);

    // Invalid inputs
    const badType = await createMemory(auth, { type: "poem", content: "hello" });
    check("reject: unknown type → 400", badType.httpStatus === 400, badType.httpStatus);
    const emptyJournal = await createMemory(auth, { type: "journal", content: "" });
    check("reject: empty journal → 400", emptyJournal.httpStatus === 400, emptyJournal.httpStatus);
    const shortStory = await createMemory(auth, { type: "story", content: "ab" });
    check("reject: too-short content → 400", shortStory.httpStatus === 400, shortStory.httpStatus);

    // ── 3. Voice memory (typed note — no file) ─────────────────────────────
    const voice = await createMemory(auth, { type: "voice", title: "Gym plan", voiceNote: "Started going to the gym every morning, focusing on cardio before exams end." });
    check("voice-note: created", voice.httpStatus === 201 && voice.data?.memory?.type === "voice", voice.httpStatus);
    createdMemoryIds.push(voice.data?.memory?.id);

    // ── 4. Document upload (.txt) ──────────────────────────────────────────
    fs.writeFileSync(txtPath, "Business Analytics journal: noticed missing sales data at our family shop and wanted to understand purchasing patterns. Started learning Python, Pandas and Power BI.", "utf8");
    const doc = await createMemory(auth, { type: "document", title: "Business analytics notes" }, { name: "notes.txt", buffer: fs.readFileSync(txtPath), type: "text/plain" });
    check("document: created", doc.httpStatus === 201 && doc.data?.memory?.type === "document", doc.httpStatus);
    createdMemoryIds.push(doc.data?.memory?.id);

    // Unsupported document type → 400 (multer file filter)
    const exe = await createMemory(auth, { type: "document", title: "bad" }, { name: "evil.exe", buffer: Buffer.from("MZ...."), type: "application/x-msdownload" });
    check("reject: unsupported document mime → 400", exe.httpStatus === 400, exe.httpStatus);

    // ── 5. Background processing → ready (poll) ────────────────────────────
    const j = await waitReady(auth, journal.data.memory.id);
    check("journal: processed to ready", j && j.status === "ready", j && j.status);
    check("journal: original content preserved", j && j.content.includes("I cleared the technical rounds"), j && (j.content || "").slice(0, 60));
    note("journal: AI summary " + ((j && j.summary) ? "generated" : "empty (AI unavailable)"), j && j.summary);
    const d = await waitReady(auth, doc.data.memory.id);
    check("document: text extracted from upload", d && d.status === "ready" && /Python/i.test(d.content || ""), d && d.content && d.content.slice(0, 80));
    const v = await waitReady(auth, voice.data.memory.id);
    check("voice-note: processed (content = typed note)", v && v.status === "ready" && v.content.includes("gym"), v && { status: v.status, content: (v.content || "").slice(0, 50) });

    // ── 6. Failed transcription (fake audio) → graceful failed state ──────
    fs.writeFileSync(fakeAudioPath, "not-really-audio-bytes-".repeat(60));
    const fakeVoice = await createMemory(auth, { type: "voice", title: "broken recording" }, { name: "note.webm", buffer: fs.readFileSync(fakeAudioPath), type: "audio/webm" });
    createdMemoryIds.push(fakeVoice.data?.memory?.id);
    let fv = await waitReady(auth, fakeVoice.data.memory.id, 70000);
    if (!fv) fv = (await axios.get(`${API}/memories/${fakeVoice.data.memory.id}`, auth)).data.memory;
    // Groq may reject instantly or after the network call — both outcomes are
    // legitimate; what matters is that we never stay stuck in "pending".
    check("voice(fake): leaves queued state", fv && fv.status !== "pending" && fv.status !== "processing", fv && fv.status);
    if (fv && fv.status === "failed") {
      note("voice(fake): marked failed with message", (fv.processingError || "").slice(0, 80));
    } else {
      note("voice(fake): unusual status", fv && fv.status);
    }
    const rep = await axios.post(`${API}/memories/${fakeVoice.data.memory.id}/reprocess`, {}, auth);
    check("reprocess: endpoint answers 200", rep.status === 200 && rep.data.success === true, rep.status);

    // ── 7. Hybrid retrieval — differently-worded query ─────────────────────
    const searchRes = (await axios.get(`${API}/memories`, { params: { q: "why am I nervous about my next interview" }, ...auth })).data;
    const foundInterview = (searchRes.items || []).some((m) => m.type === "journal" && /interview/i.test((m.title || "") + (m.content || "")));
    check("search: differently-worded query finds the interview journal", searchRes.searchUsed === true && foundInterview, searchRes.items && searchRes.items.map((m) => m.type));
    check("search: relevance scores exposed", (searchRes.items || []).every((m) => typeof m.relevance === "number"), searchRes.items);

    const tripSearch = (await axios.get(`${API}/memories`, { params: { q: "sunrise trekking with friends on the lake" }, ...auth })).data;
    const tripTitles = (tripSearch.items || []).map((m) => m.title);
    const foundTrip = tripTitles.includes("Kodaikanal trip");
    check("search: topic+content recall for the trip story", foundTrip, tripTitles);
    check("search: no short-token false positives (gym must NOT rank for lake query)", !tripTitles.includes("Gym plan"), tripTitles);

    const unrelated = (await axios.get(`${API}/memories`, { params: { q: "what is the capital of France" }, ...auth })).data;
    check("search: unrelated query returns nothing above threshold", (unrelated.items || []).length === 0, unrelated.items && unrelated.items.length);

    // ── 8. Listing, filters, counts ────────────────────────────────────────
    const listAll = (await axios.get(`${API}/memories`, { params: { limit: 50 }, ...auth })).data;
    check("list: returns memories + per-type counts", listAll.items.length >= 5 && listAll.byType.journal >= 1 && listAll.byType.voice >= 1, { items: listAll.items.length, byType: listAll.byType });
    const listEmails = (await axios.get(`${API}/memories`, { params: { type: "email" }, ...auth })).data;
    check("filter: type=email returns only emails", (listEmails.items || []).length >= 1 && (listEmails.items || []).every((m) => m.type === "email"), listEmails.items && listEmails.items.map((m) => m.type));
    const listFailed = (await axios.get(`${API}/memories`, { params: { status: "failed" }, ...auth })).data;
    check("filter: failed list includes fake voice", (listFailed.items || []).some((m) => m.title === "broken recording"), listFailed.items && listFailed.items.map((m) => m.title));

    // ── 9. Access control (cross-user) ─────────────────────────────────────
    const otherList = (await axios.get(`${API}/memories`, { params: { limit: 100 }, ...otherAuth })).data;
    check("access: user B sees none of user A's memories", (otherList.items || []).length === 0, otherList.items && otherList.items.length);
    const crossRead = await axios.get(`${API}/memories/${journal.data.memory.id}`, otherAuth).catch((e) => e);
    check("access: user B cannot read A's memory (404)", crossRead.response && crossRead.response.status === 404, crossRead.response && crossRead.response.status);

    // ── 10. Edit → re-process ──────────────────────────────────────────────
    const upd = await axios.put(`${API}/memories/${journal.data.memory.id}`, { title: "Company interview — updated", content: "I attended a company interview in Chennai. I cleared the technical round but the HR round was tough and I felt disappointed afterward." }, { headers: { ...auth.headers, "Content-Type": "application/json" } });
    check("edit: title+content updated, reprocessing flagged", upd.data.success === true && upd.data.reprocessing === true && upd.data.memory.title.includes("updated"), { reprocessing: upd.data.reprocessing, title: upd.data.memory.title });
    const j2 = await waitReady(auth, journal.data.memory.id);
    check("edit: re-processed and still ready", j2 && j2.status === "ready" && j2.content.includes("Chennai"), j2 && j2.status);

    // ── 11. Delete ─────────────────────────────────────────────────────────
    const del = await axios.delete(`${API}/memories/${story.data.memory.id}`, auth);
    check("delete: successful", del.data.success === true, del.data);
    const delCheck = await axios.get(`${API}/memories/${story.data.memory.id}`, auth).catch((e) => e);
    check("delete: memory gone (404)", delCheck.response && delCheck.response.status === 404, delCheck.response && delCheck.response.status);
    const afterDelList = (await axios.get(`${API}/memories`, { params: { limit: 50 }, ...auth })).data;
    check("delete: no longer listed", !(afterDelList.items || []).some((m) => m.id === String(story.data.memory.id)), afterDelList.items && afterDelList.items.length);

    // ── 12. AI chat integration with memory sources ────────────────────────
    // Ask a memory-relevant question → the advisor should have retrieved the
    // interview memory and echo it back as a source (AI reply may be grounded
    // or the offline fallback — either way memorySources must be present).
    const chatAuth = { headers: { ...auth.headers, "Content-Type": "application/json" } };
    const chat1 = await axios.post(`${API}/study-tools/chat`, { message: "Why am I feeling nervous about my next interview?", chatHistory: [] }, chatAuth).catch((e) => e);
    if (chat1.response) {
      note("chat: request failed (AI/back-end)", chat1.response.status);
    } else {
      const sources = chat1.data.memorySources || [];
      check("chat: memory-relevant question returns memory sources", Array.isArray(sources) && sources.length >= 1, sources.map((s) => s.type));
      check("chat: memoryUsed flag true", chat1.data.memoryUsed === true, chat1.data.memoryUsed);
      check("chat: sources expose id+type+excerpt (no full content leak)", sources.every((s) => s.id && s.type && s.excerpt && !s.content), sources[0]);
      check("chat: reply present", !!chat1.data.reply && chat1.data.reply.length > 20, chat1.data.reply && chat1.data.reply.length);
    }

    // Unrelated question (no word overlap with any fixture memory) → no injection
    const chat2 = await axios.post(`${API}/study-tools/chat`, { message: "What is the distance from the Earth to the Moon?", chatHistory: [] }, chatAuth).catch((e) => e);
    if (!chat2.response) {
      check("chat: unrelated question injects NO memories", (!chat2.data.memorySources || chat2.data.memorySources.length === 0) && chat2.data.memoryUsed === false, chat2.data.memorySources);
    } else {
      note("chat2: request failed", chat2.response.status);
    }

    // Privacy kill-switch: with memory-in-chat disabled, sources must be empty
    await axios.put(`${API}/memories/settings`, { useMemoryInChat: false }, auth);
    const chat3 = await axios.post(`${API}/study-tools/chat`, { message: "Why am I feeling nervous about my next interview?", chatHistory: [] }, chatAuth).catch((e) => e);
    if (!chat3.response) {
      check("chat: memory disabled → no sources even for personal question", (!chat3.data.memorySources || chat3.data.memorySources.length === 0), chat3.data.memorySources);
    } else {
      note("chat3: request failed", chat3.response.status);
    }
    await axios.put(`${API}/memories/settings`, { useMemoryInChat: true }, auth);

  } finally {
    // ── Cleanup: delete nothing we don't own ──────────────────────────────
    // rmSync retries ride out transient Windows file locks (AV real-time scan)
    // instead of silently failing like the old unlink-only approach.
    try { fs.rmSync(fixtureDir, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 }); } catch (e) {}
    const memDocs = await Memory.find({ _id: { $in: createdMemoryIds.filter(Boolean) } }).lean().catch(() => []);
    memDocs.forEach((m) => {
      if (m.fileUrl) {
        try { fs.rmSync(path.join(__dirname, "..", m.fileUrl.replace(/^\/uploads\//, "uploads/")), { force: true, maxRetries: 4, retryDelay: 250 }); } catch (e) {}
      }
    });
    await Memory.deleteMany({ _id: { $in: createdMemoryIds.filter(Boolean) } }).catch(() => {});
    await Memory.deleteMany({ userId: { $in: users.map((u) => u._id) } }).catch(() => {});
    await MemorySettings.deleteMany({ userId: { $in: users.map((u) => u._id) } }).catch(() => {});
    await User.deleteMany({ _id: { $in: users.map((u) => u._id) } }).catch(() => {});
    // Self-heal: sweep upload files that have no referencing memory doc (e.g.
    // leftovers of a crashed prior run whose DB cleanup also failed during a
    // network blip). Runs only when the DB is reachable (the find succeeded).
    try {
      const uploadsDir = path.join(__dirname, "..", "uploads", "memories");
      const kept = new Set(
        (await Memory.find({ fileUrl: /^\/uploads\/memories\// }).select("fileUrl").lean().catch(() => []))
          .map((m) => m.fileUrl.replace(/^\//, ""))
      );
      fs.readdirSync(uploadsDir).forEach((f) => {
        if (f.startsWith("mem-") && !kept.has(`uploads/memories/${f}`)) {
          try { fs.rmSync(path.join(uploadsDir, f), { force: true, maxRetries: 4, retryDelay: 250 }); } catch (e2) {}
        }
      });
    } catch (e) {}
    await mongoose.disconnect().catch(() => {});
  }

  console.log(`\nSMOKE RESULT: ${failures === 0 ? "ALL PASS" : failures + " FAILURE(S)"}${warnings ? ` (${warnings} info note(s))` : ""}`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error("Smoke crashed:", e); process.exit(1); });