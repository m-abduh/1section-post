import cron from "node-cron";
import { runPipeline } from "./pipeline.js";
import { store } from "./db.mjs";

function buildSchedule(videosPerDay, startMin, endMin) {
  if (videosPerDay <= 0) return [];
  if (videosPerDay === 1) {
    const m = startMin;
    return [`${m % 60} ${Math.floor(m / 60)} * * *`];
  }
  const span = Math.max(0, endMin - startMin);
  const step = span / (videosPerDay - 1 || 1);
  const times = [];
  for (let i = 0; i < videosPerDay; i++) {
    const m = startMin + Math.round(step * i);
    times.push(`${m % 60} ${Math.floor(m / 60)} * * *`);
  }
  return times;
}

export function getSettings() {
  const videosPerDay = Number(store.getSetting("videos_per_day", "3")) || 3;
  const tz = store.getSetting("tz", process.env.TZ || "America/New_York");
  const startRaw = store.getSetting("window_start", "06:00");
  const endRaw = store.getSetting("window_end", "22:00");
  const [sh, sm] = startRaw.split(":").map(Number);
  const [eh, em] = endRaw.split(":").map(Number);
  return {
    videosPerDay,
    tz,
    windowStart: startRaw,
    windowEnd: endRaw,
    startMin: sh * 60 + (sm || 0),
    endMin: eh * 60 + (em || 0),
    schedules: buildSchedule(videosPerDay, sh * 60 + (sm || 0), eh * 60 + (em || 0)),
  };
}

export function startScheduler() {
  const { tz, schedules } = getSettings();
  if (!schedules.length) {
    console.log("[scheduler] No schedules (videos_per_day=0)");
    return;
  }
  for (const expr of schedules) {
    cron.schedule(expr, () => {
      console.log(`[scheduler] Trigger ${expr} at ${new Date().toISOString()}`);
      runPipeline().catch((err) => console.error("[scheduler] Error:", err.message));
    }, { timezone: tz });
  }
  console.log(`[scheduler] Started ${schedules.length} daily job(s) (timezone: ${tz})`);
  console.log(`[scheduler] Times: ${schedules.join(" ")}`);
}
