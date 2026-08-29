import { renderPost } from "./services/renderer.mjs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "output");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const SAMPLE = {
  hook: "The hidden cost of distraction",
  content: "**Every notification steals focus**\n\n- 23 minutes lost, gone forever\n- Silence your phone\n- Win your day",
  category: "stat",
  account: "1section.finance",
};

async function main() {
  console.log("====== Rendering unified 1080x1350 template ======");
  const ts = Date.now();
  const out = join(OUT, `unified-${ts}.mp4`);
  try {
    await renderPost(SAMPLE, out);
    console.log(`  ✅ Rendered in ${((Date.now() - ts) / 1000).toFixed(1)}s -> ${out}`);
  } catch (e) {
    console.error(`  ❌ FAILED: ${e.message}`);
    process.exit(1);
  }
}

main();
