import { renderPost } from "./services/renderer.mjs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "output");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const dummies = {
  stat: { label: "THE STAT", stat: "87%", desc: "Of people prefer the better option every single time they choose", sub: "Data shows a clear upward trend across all demographics", footer: "1section.com" },
  steps: { title: "MASTER IT IN 3 STEPS", steps: [
    { title: "Start with why", desc: "Understand your core motivation before taking action" },
    { title: "Build momentum", desc: "Small consistent wins compound into massive results" },
    { title: "Stay adaptable", desc: "Adjust your approach based on what the data tells you" }
  ], description: "Follow these steps to transform your approach completely", footer: "1section.com" },
  compare: { title: "OLD WAY VS NEW WAY", pairs: [
    { left: "Takes months to see results", right: "See progress in days" },
    { left: "Requires expensive tools", right: "Free or low-cost solutions" },
    { left: "Complex and confusing", right: "Simple and intuitive" }
  ], description: "The new approach is faster, cheaper, and easier than ever before", footer: "1section.com" },
  mythfact: { title: "COMMON MISCONCEPTION", mythLabel: "THE MYTH", myth: "You need to work 80 hours a week to be successful", factLabel: "THE TRUTH", fact: "Working smarter, not harder, is what actually works", description: "Productivity is about leverage, not hours", footer: "1section.com" },
  quote: { quote: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.", source: "Steve Jobs", description: "Passion is the foundation of meaningful achievement", footer: "1section.com" },
  QnA: { title: "ASK THE RIGHT QUESTION", question: "What is the one habit that changed everything for you?", answer: "Showing up every single day, even when motivation is low.", description: "Consistency beats intensity every single time", footer: "1section.com" },
  question: { label: "QUICK POLL", title: "What matters most in your career?", options: ["Money & stability", "Growth & learning", "Impact & purpose", "Freedom & flexibility"], footer: "1section.com" },
  story: { title: "LIFE CHANGING MOMENT", hook: "The day she stopped waiting for permission", opening: "She spent years asking others if she was good enough. Seeking approval from bosses, mentors, and even strangers on the internet. Until one day she realized the only permission she ever needed was her own.", description: "Self-belief is the most powerful career move you can make", footer: "1section.com" },
  tips: { title: "FOCUS BETTER", subtitle: "Simple productivity hacks", tips: [
    { tip: "Single-task mode", desc: "One focus block at a time. No multitasking allowed." },
    { tip: "Time boxing", desc: "Set a timer. Work only until it rings. Then rest." },
    { tip: "Environment design", desc: "Remove distractions before they remove your focus." }
  ], footer: "1section.com" }
};

async function main() {
  const types = ["stat", "steps", "compare", "mythfact", "quote", "QnA", "question", "story", "tips"];
  for (const type of types) {
    console.log(`\n====== Rendering ${type} ======`);
    const ts = Date.now();
    const out = join(OUT, `${type}-${ts}.mp4`);
    try {
      const content = dummies[type];
      await renderPost(type, content, out);
      console.log(`  ✅ ${type} rendered in ${((Date.now()-ts)/1000).toFixed(1)}s`);
    } catch (e) {
      console.error(`  ❌ ${type} FAILED: ${e.message}`);
    }
  }
  console.log("\n====== ALL DONE ======");
}

main();
