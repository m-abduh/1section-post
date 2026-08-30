import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { marked } from "marked";

marked.setOptions({ breaks: true });

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILDER = join(__dirname, "..", "builder");
const COMP_PATH = join(BUILDER, "_render.html");
const MUSIC_DIR = join(__dirname, "..", "music");

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

const BOX_PALETTE = [
  { fill: "#4f8cff", text: "#ffffff" },
  { fill: "#ff7849", text: "#ffffff" },
  { fill: "#3ecf8e", text: "#093b24" },
  { fill: "#ffce3d", text: "#3a2b00" },
  { fill: "#a66cff", text: "#ffffff" },
  { fill: "#3ad6d6", text: "#062424" },
  { fill: "#ff5d8f", text: "#ffffff" },
  { fill: "#7de84f", text: "#17300a" },
];

export async function renderPost({ hook, content, category, account, content_text }, outputPath) {
  const htmlTpl = readFileSync(join(BUILDER, "unified.html"), "utf-8");
  const palette = BOX_PALETTE[Math.floor(Math.random() * BOX_PALETTE.length)];

  const body = Array.isArray(content)
    ? content.join("\n")
    : (content_text || content || "");
  const htmlContent = marked.parse(body).replace(/<input\b[^>]*>/gi, "");
  const data = {
    hook: hook || "",
    content: htmlContent,
    category: category || "",
    account: account || "",
    box_fill: palette.fill,
    text_color: palette.text,
  };
  let html = renderTemplate(htmlTpl, data);

  html = html.replace("--box-fill:#4f8cff", `--box-fill:${palette.fill}`);
  html = html.replace("--text-color:#ffffff", `--text-color:${palette.text}`);

  if (html.includes('<script id="cd"')) {
    html = html.replace(/<script id="cd"[^>]*>[\s\S]*?<\/script>\s*/g, "");
  }

  const musicFile = findMusic();
  if (musicFile) {
    const bgmPath = join(BUILDER, "_bgm.mp3");
    await new Promise((resolve, reject) => {
      const ff = spawn("ffmpeg", [
        "-y", "-i", musicFile,
        "-t", "15",
        "-af", "afade=t=out:st=11:d=4",
        "-c:a", "libmp3lame", "-q:a", "2",
        bgmPath
      ]);
      ff.on("close", c => c === 0 ? resolve() : reject(new Error(`ffmpeg exited ${c}`)));
      ff.on("error", reject);
    });
    const audio = `<audio id="bgm" src="./_bgm.mp3" data-start="0" data-duration="15" data-volume="0.3" data-has-audio="true"></audio>`;
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
