import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILDER = join(__dirname, "..", "builder");
const COMP_PATH = join(BUILDER, "_render.html");
const MUSIC_DIR = join(__dirname, "..", "music");

const FILE_MAP = { QnA: "qna" };

function findMusic() {
  if (!existsSync(MUSIC_DIR)) return null;
  const files = readdirSync(MUSIC_DIR).filter(f => /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f));
  return files.length ? join(MUSIC_DIR, files[Math.floor(Math.random() * files.length)]) : null;
}

function renderTemplate(tpl, data) {
  tpl = tpl.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, block) => {
    const items = data[key];
    if (!Array.isArray(items)) return "";
    return items.map((item, idx) => {
      let out = block;
      out = out.replace(/\{\{@index\}\}/g, String(idx));
      out = out.replace(/\{\{@index1\}\}/g, String(idx + 1));
      if (typeof item === "string" || typeof item === "number") {
        return out.replace(/\{\{\.\}\}/g, String(item));
      }
      return out.replace(/\{\{(\w+)\}\}/g, (_, f) =>
        item[f] != null ? String(item[f]) : ""
      );
    }).join("");
  });
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    data[key] != null ? String(data[key]) : ""
  );
}

export function renderPost(type, content, outputPath) {
  const file = FILE_MAP[type] || type.toLowerCase();
  let html = readFileSync(join(BUILDER, `${file}.html`), "utf-8");

  content = { ...content, follow: "Follow @1section" };

  if (type === "quote") {
    const q = content.quote || "";
    content.quote_short = q.length > 80 ? q.slice(0, 77) + "..." : q;
    content.source_display = "\u2014 " + (content.source || "");
  }

  if (type === "story") {
    content.title_upper = (content.title || "").toUpperCase();
    if (typeof content.opening === "string")
      content.opening = content.opening.split("\n\n");
  }

  if (type === "tips") {
    content.title_upper = (content.title || "").toUpperCase();
  }

  if (type === "tierlist" && Array.isArray(content.tiers)) {
    content.tiers = content.tiers.map(t => ({
      ...t,
      labelUpper: (t.label || "").toUpperCase(),
    }));
  }

  html = renderTemplate(html, content);

  if (html.includes('<script id="cd"')) {
    html = html.replace(/<script id="cd"[^>]*>[\s\S]*?<\/script>\s*/g, "");
  }

  const musicFile = findMusic();
  if (musicFile) {
    const audio = `<audio id="bgm" src="${musicFile}" data-start="0" data-duration="15" data-volume="0.3" data-has-audio="true"></audio>`;
    html = html.replace("</div>", audio + "\n</div>");
  }

  writeFileSync(COMP_PATH, html, "utf-8");

  return new Promise((resolve, reject) => {
    const args = ["hyperframes", "render", BUILDER, "-c", "_render.html", "-o", outputPath, "--quality", "draft"];
    const child = spawn("npx", args);
    const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("render timed out")); }, 180000);
    child.stdout.on("data", d => process.stdout.write(d));
    child.stderr.on("data", d => process.stderr.write(d));
    child.on("close", code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`render exited ${code}`)); });
    child.on("error", err => { clearTimeout(timer); reject(err); });
  });
}
