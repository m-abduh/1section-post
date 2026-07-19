import { renderPost } from "./services/renderer.mjs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "output");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const dummies = {
  stat: { label: "THE STAT", title: "The data is undeniable", stat: "87%", desc: "Of people prefer the better option every single time they choose", sub: "Data shows a clear upward trend across all demographics", footer: "1section.com" },
  steps: { title: "Three moves that change everything", steps: [
    { title: "Start with why", desc: "Understand your core motivation before taking action" },
    { title: "Build momentum", desc: "Small consistent wins compound into massive results" },
    { title: "Stay adaptable", desc: "Adjust your approach based on what the data tells you" }
  ], description: "Follow these steps to transform your approach completely", footer: "1section.com" },
  compare: { title: "The better path is obvious", pairs: [
    { left: "Takes months to see results", right: "See progress in days" },
    { left: "Requires expensive tools", right: "Free or low-cost solutions" },
    { left: "Complex and confusing", right: "Simple and intuitive" }
  ], description: "The new approach is faster, cheaper, and easier than ever before", footer: "1section.com" },
  mythfact: { title: "Don't believe everything", myth: "You need to work 80 hours a week to be successful", fact: "Working smarter, not harder, is what actually works", description: "Productivity is about leverage, not hours", footer: "1section.com" },
  quote: { title: "Words that stick", quote: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.", source: "Steve Jobs", description: "Passion is the foundation of meaningful achievement", footer: "1section.com" },
  QnA: { title: "Real questions, real answers", question: "How do I stay consistent?", answer: "Start so small you can't say no — 2 minutes a day.", description: "Consistency beats intensity every single time", footer: "1section.com" },
  question: { label: "REFLECT", title: "What matters most in your career right now?", options: ["Money & stability", "Growth & learning", "Impact & purpose", "Freedom & flexibility"], description: "Your answer reveals what you truly value", footer: "1section.com" },
  story: { title: "Real talk", hook: "She gave herself permission", opening: "She spent years asking others if she was good enough. Seeking approval from bosses, mentors, and even strangers on the internet.\n\nUntil one day she realized the only permission she ever needed was her own.", description: "Self-belief is the most powerful career move you can make", footer: "1section.com" },
  tips: { title: "FOCUS BETTER", subtitle: "Simple ways to focus better", tips: [
    { tip: "Single-task mode", desc: "One focus block at a time. No multitasking allowed." },
    { tip: "Time boxing", desc: "Set a timer. Work only until it rings. Then rest." },
    { tip: "Environment design", desc: "Remove distractions before they remove your focus." }
  ], footer: "1section.com" },
  formula: { title: "The only formula that matters", term1: "Focus", op1: "\u00d7", term2: "Consistency", result: "Results", caption: "The only equation that matters for growth", description: "Get these two right, and everything else follows", footer: "1section.com" },
  tierlist: { title: "Not all methods are worth your time", tiers: [
    { label: "s", name: "80/20 Rule", desc: "Highest leverage \u2014 do this first" },
    { label: "a", name: "Deep Work", desc: "Focused, uninterrupted sessions" },
    { label: "b", name: "Task Batching", desc: "Group similar work together" },
    { label: "c", name: "To-Do Lists", desc: "Better than nothing" }
  ], description: "Not all productivity methods are created equal", footer: "1section.com" },
  checklist: { title: "Four small wins. Big results.", items: ["Write down your top three priorities", "Block one hour for deep work", "Review what worked and what didn't", "Plan tomorrow before you log off"], description: "Small daily actions compound into massive results", footer: "1section.com" },
  warning: { title: "You're heading for burnout", warning: "Working 10+ hours daily without breaks doesn\u2019t make you productive. It makes you exhausted.", description: "Rest is a strategy, not a reward", footer: "1section.com" }
};

async function main() {
  const types = ["stat", "steps", "compare", "mythfact", "quote", "QnA", "question", "story", "tips", "formula", "tierlist", "checklist", "warning"];
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
