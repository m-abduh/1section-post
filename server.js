import "dotenv/config";
import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { unlinkSync } from "fs";
import { startScheduler } from "./scheduler.js";
import { runPipeline } from "./pipeline.js";
import { store } from "./db.mjs";
import { getSettings } from "./scheduler.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/videos", express.static(join(__dirname, "output")));
app.use("/music", express.static(join(__dirname, "music")));

app.get("/", (req, res) => {
  const accounts = store.listAccounts();
  const categories = store.listCategories();
  const videos = store.listVideos();
  const failed = videos.filter((v) => v.status === "failed").length;
  res.render("index", {
    accounts,
    categories,
    videos,
    failed,
    settings: getSettings(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ---------- Accounts ----------
app.get("/api/accounts", (req, res) => {
  res.json(store.listAccounts());
});

app.post("/api/accounts", (req, res) => {
  const { name, buffer_token } = req.body || {};
  if (!name || !buffer_token) return res.status(400).json({ error: "name and buffer_token required" });
  try {
    res.json(store.createAccount({ name: name.trim(), buffer_token: buffer_token.trim() }));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/accounts/:id", (req, res) => {
  const { name, buffer_token } = req.body || {};
  const existing = store.getAccount(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: "not found" });
  const updated = store.updateAccount(existing.id, {
    name: name !== undefined ? name : existing.name,
    buffer_token: buffer_token !== undefined ? buffer_token : existing.buffer_token,
  });
  res.json(updated);
});

app.delete("/api/accounts/:id", (req, res) => {
  store.deleteAccount(Number(req.params.id));
  res.json({ ok: true });
});

app.post("/api/accounts/reorder", (req, res) => {
  store.reorderAccounts(req.body?.ids || []);
  res.json({ ok: true });
});

// ---------- Categories ----------
app.get("/api/categories", (req, res) => {
  res.json(store.listCategories());
});

app.post("/api/categories", (req, res) => {
  const { name, default_prompt } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    res.json(store.createCategory({ name: name.trim(), default_prompt: default_prompt || "" }));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/categories/:id", (req, res) => {
  const { name, default_prompt } = req.body || {};
  const existing = store.getCategory(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: "not found" });
  res.json(store.updateCategory(existing.id, {
    name: name !== undefined ? name : existing.name,
    default_prompt: default_prompt !== undefined ? default_prompt : existing.default_prompt,
  }));
});

app.delete("/api/categories/:id", (req, res) => {
  store.deleteCategory(Number(req.params.id));
  res.json({ ok: true });
});

// ---------- Per-account category: prompts + enabled list ----------
app.get("/api/accounts/:id/categories", (req, res) => {
  res.json(store.listAccountCategories(Number(req.params.id)));
});

app.put("/api/accounts/:id/categories", (req, res) => {
  // body: { pairs: [{category_id, prompt}] } — full replace of that account's mapping
  const accountId = Number(req.params.id);
  const pairs = req.body?.pairs || [];
  const normalized = pairs.map((p, i) => ({
    category_id: Number(p.category_id),
    prompt: p.prompt ?? null,
    position: i,
  }));
  store.syncAccountCategories(accountId, normalized);
  res.json(store.listAccountCategories(accountId));
});

app.put("/api/accounts/:id/categories/:categoryId/prompt", (req, res) => {
  const accountId = Number(req.params.id);
  const categoryId = Number(req.params.categoryId);
  store.setAccountPrompt(accountId, categoryId, req.body?.prompt ?? "");
  res.json(store.listAccountCategories(accountId));
});

// ---------- Videos ----------
app.get("/api/videos", (req, res) => {
  const accountId = req.query.account_id ? Number(req.query.account_id) : undefined;
  res.json(store.listVideos({ accountId }));
});

app.get("/api/videos/:id", (req, res) => {
  const v = store.getVideo(Number(req.params.id));
  if (!v) return res.status(404).json({ error: "not found" });
  res.json(v);
});

app.post("/api/videos/:id/retry", async (req, res) => {
  const result = await runPipeline({ videoId: Number(req.params.id) });
  res.json(result);
});

app.delete("/api/videos/:id", (req, res) => {
  const v = store.getVideo(Number(req.params.id));
  if (v && v.video_path) {
    try { unlinkSync(v.video_path); } catch {}
  }
  store.deleteVideo(Number(req.params.id));
  res.json({ ok: true });
});

// Manually run the next rotation slot now (generate -> render -> post to Buffer)
app.post("/api/generate", async (req, res) => {
  try {
    const result = await runPipeline();
    res.json(result);
  } catch (err) {
    console.error("[server] /api/generate error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- Settings ----------
app.get("/api/settings", (req, res) => {
  res.json({
    videos_per_day: store.getSetting("videos_per_day", "3"),
    tz: store.getSetting("tz", process.env.TZ || "America/New_York"),
    window_start: store.getSetting("window_start", "06:00"),
    window_end: store.getSetting("window_end", "22:00"),
    schedules: getSettings().schedules,
  });
});

app.put("/api/settings", (req, res) => {
  const body = req.body || {};
  if (body.videos_per_day !== undefined) store.setSetting("videos_per_day", body.videos_per_day);
  if (body.tz !== undefined) store.setSetting("tz", body.tz);
  if (body.window_start !== undefined) store.setSetting("window_start", body.window_start);
  if (body.window_end !== undefined) store.setSetting("window_end", body.window_end);
  res.json(getSettings());
});

// Backward-compatible legacy endpoint
app.post("/generate", async (req, res) => {
  try {
    const result = await runPipeline({ videoId: req.body?.videoId });
    res.json(result);
  } catch (err) {
    console.error("[server] /generate error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/delete", (req, res) => {
  const { file } = req.body;
  if (!file) return res.status(400).json({ error: "Missing file name" });
  const safe = file.replace(/[^a-zA-Z0-9._-]/g, "");
  try {
    unlinkSync(join(__dirname, "output", safe));
    res.redirect("/");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[server] Marketing backend on :${PORT}`);
  if (process.env.DISABLE_SCHEDULER !== "1") {
    startScheduler();
  }
});
