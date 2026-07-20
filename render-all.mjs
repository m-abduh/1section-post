import { renderPost } from "./services/renderer.mjs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "output");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const dummies = {
  stat: { label: "THE STAT", title: "The data is undeniable", stat: "87%", desc: "Of people prefer the better option every single time they choose", sub: "Data shows a clear upward trend across all demographics", cta: "The data speaks. Start tracking what matters.", follow_call: "Follow @1section for more insights", footer: "1section.com", icon: "ti-chart-bar" },
  steps: { title: "Three moves that change everything", icon: "ti-stairs-up", cta: "Follow the steps. One at a time.", follow_call: "Follow for more step-by-step guides", steps: [
    { title: "Start with why", desc: "Understand your core motivation before taking action" },
    { title: "Build momentum", desc: "Small consistent wins compound into massive results" },
    { title: "Stay adaptable", desc: "Adjust your approach based on what the data tells you" }
  ], description: "Follow these steps to transform your approach completely", footer: "1section.com" },
  compare: { title: "The better path is obvious", icon: "ti-arrows-left-right", cta: "See the difference. Choose better.", follow_call: "Follow for more comparisons that matter", pairs: [
    { left: "Takes months to see results", right: "See progress in days" },
    { left: "Requires expensive tools", right: "Free or low-cost solutions" },
    { left: "Complex and confusing", right: "Simple and intuitive" }
  ], description: "The new approach is faster, cheaper, and easier than ever before", footer: "1section.com" },
  mythfact: { title: "Don't believe everything", icon: "ti-alert-triangle", cta: "Separate fact from fiction.", follow_call: "Follow for more myth busters", pairs: [
    { myth: "You need to work 80 hours a week to be successful", fact: "Working smarter, not harder, is what actually works" },
    { myth: "Multitasking makes you more productive", fact: "Single-tasking produces higher quality results" },
    { myth: "Success happens overnight", fact: "Consistent small wins compound over time" }
  ], description: "Productivity is about leverage, not hours", footer: "1section.com" },
  quote: { title: "Daily Wisdom", icon: "ti-quote", follow_call: "Follow for daily wisdom that rewires how you think about personal growth", quote: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.", source: "Steve Jobs", description: "Passion is the foundation of meaningful achievement", footer: "1section.com" },
  QnA: { title: "Deep Questions", icon: "ti-help-circle", follow_call: "Follow for real answers to the questions holding your growth back", question: "How do I stay consistent?", answer: "Start so small you can't say no — 2 minutes a day. The secret isn't motivation. It's identity. Become the kind of person who shows up.", description: "Consistency beats intensity every single time", footer: "1section.com" },
  story: { title: "TRANSFORMATION", icon: "ti-book-2", follow_call: "Stories like this prove growth is possible. Follow for more real transformation stories", hook: "She gave herself permission", opening: "She spent years asking others if she was good enough. Seeking approval from bosses, mentors, and even strangers on the internet.\n\nUntil one day she realized the only permission she ever needed was her own.", description: "Self-belief is the most powerful career move you can make", footer: "1section.com" },
  tips: { title: "Tips to Master Your Focus", subtitle: "Simple ways to focus better", icon: "ti-bulb", follow_call: "Small daily habits that rewire your brain for deep focus. Follow for more practical tips", tips: [
    { tip: "Single-task mode", desc: "One focus block at a time. No multitasking allowed." },
    { tip: "Time boxing", desc: "Set a timer. Work only until it rings. Then rest." },
    { tip: "Environment design", desc: "Remove distractions before they remove your focus." }
  ], description: "Your focus determines your reality", footer: "1section.com" },
  formula: { title: "The Growth Formula", icon: "ti-math", follow_call: "Master the formula for personal growth. Follow for more insights that compound", terms: ["Focus", "Consistency", "Patience", "Rest", "Habits"], result: "Growth", caption: "The only equation that matters for self-improvement", description: "Get these right, and everything else follows", footer: "1section.com" },
  tierlist: { title: "Productivity methods ranked from best to worst", icon: "ti-layers-difference", follow_call: "Stop wasting time on low-impact habits. Follow for more evidence-based rankings", tiers: [
    { label: "s", name: "80/20 Rule", desc: "Highest leverage \u2014 do this first" },
    { label: "a", name: "Deep Work", desc: "Focused, uninterrupted sessions" },
    { label: "b", name: "Task Batching", desc: "Group similar work together" },
    { label: "c", name: "To-Do Lists", desc: "Better than nothing" }
  ], description: "Not all productivity methods are created equal", footer: "1section.com" },
  checklist: { title: "Your daily growth checklist", icon: "ti-checklist", follow_call: "Follow for actionable self-development checklists that actually move the needle", items: ["Write down your top three priorities for today", "Block one hour for deep work without your phone", "Review what worked and what didn't before bed", "Plan tomorrow's most important task tonight"], description: "Small daily actions compound into massive results", footer: "1section.com" },
  warning: { title: "The burnout trap", icon: "ti-alert-octagon", follow_call: "Follow for wellness insights that protect your mental health while you grow", warning: "Working 10+ hours daily without breaks doesn\u2019t make you productive. It makes you exhausted. Rest isn't a reward. It's a strategy.", description: "Rest is a strategy, not a reward", footer: "1section.com" }
};

async function main() {
  const types = ["stat", "steps", "compare", "mythfact", "quote", "QnA", "story", "tips", "formula", "tierlist", "checklist", "warning"];
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
