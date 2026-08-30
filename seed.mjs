// Seed categories: one entry = a financial content format + the prompt that
// steers the AI to produce that format. Each prompt embeds stricter rules
// (hook length, VISUAL markdown structure, correct financial theory) so the
// generator stays consistent per category. Edit freely — it is applied on
// boot (idempotent) and does overwrite default_prompt to keep it in sync.

// Voice: senior copywriter. Short, dense, emotional, personal.
// Formats use VISUAL Markdown so the slide never reads as plain paragraphs:
// **bold**, *italic*, blockquotes (>), - lists, tables (| |),
// arrows (↓), symbols (× = ≠), because the video is ONE static 1080x1350 slide.
// Global rules baked into every prompt below:
// - Hook: 7 to 14 words, punchy, emotional, specific. No clickbait lies.
// - Content: SHORT (2-5 visual lines) but DENSE. Lines must be readable on one slide.
// - Financial theory must be correct; numbers must be accurate. No hype.
// - Caption: one short personal paragraph, no hashtags/@-mentions.

const H = (p) => `HOOK: 7 to 14 words, punchy, emotional, specific. No clickbait lies.
CONTENT: SHORT but DENSE — 2-5 VISUAL lines (bold, arrows ↓, a small table or a blockquote where the format asks for it) so the slide is never a plain paragraph. NEVER use emojis or emoticons — only text and numbers; use symbols (× = ≠ ↓) ONLY when they help the meaning. Leave a BLANK line between sections so they breathe instead of cramming. Use **bold** ONLY on the 1-2 words that carry the idea — never bold whole lines or sentences. Speak to the viewer as "you"; be personal, honest, never generic. Correct financial theory, accurate numbers.
CAPTION: one short personal paragraph, no hashtags, no @ mentions.

${p.tag}`;

export const CATEGORY_SEEDS = [
  {
    name: "story",
    default_prompt: H({
      tag: `A 2-3 line micro-fiction about money with an emotional twist that lands a real financial lesson (compounding rewards time, lifestyle inflation eats raises, income is not wealth). Structure it like this — a normal line, then a flipped italic question inside a blockquote, then the payoff:

Example:
"The harder I chased money, the more I focused on **what I could get**.
Then I flipped the question:
> *"What problem can I solve?"*
Money became the result — not the goal."`,
    }),
  },
  {
    name: "tips",
    default_prompt: H({
      tag: `ONE practical money habit the viewer can do today, laid out VISUALLY: a one-line intro, then a bullet list of 2-3 micro-actions, then a bold closer. The habit must be economically sound (automation, paying yourself first, removing friction). Example:

"Start ridiculously small:
* Read **1 page**
* Move **5 minutes**
* Learn **10 minutes**

**Consistency comes from repetition, not motivation.**"`,
    }),
  },
  {
    name: "steps",
    default_prompt: H({
      tag: `A short numbered process for one specific money goal, shown as stacked steps joined by ↓ arrows, then a bold two-word punchline. 3-4 steps max, correct order, most important first. Put a BLANK line between each step (step line, then ↓ on its own line, then a blank line) so every step renders as its own block — never squeeze the steps into one paragraph. Example:

"**01** — Find a real problem
↓

**02** — Who is willing to pay
↓

**03** — Ship the simplest fix

**Sell first. Improve later.**"`,
    }),
  },
  {
    name: "myth",
    default_prompt: H({
      tag: `A MYTH vs FACT piece that feels like a realisation. Line 1 states the myth. Line 2-3 give the correct math (opportunity cost, real vs nominal, time value of money) with a ≠ in bold. End with a bold blockquote that sums it up. Example:

"Hard work alone ≠ Wealth
10 hours on something nobody needs
is beaten by 2 hours on an important problem.
> **Work hard — on work that is actually valuable.**"`,
    }),
  },
  {
    name: "compare",
    default_prompt: H({
      tag: `Compare two financial choices in a small MARKDOWN TABLE (2 columns + 2-3 data rows), then one bold closer. Keep cells very short (2-4 words). Right vs wrong, active vs passive, saving vs investing, avalanche vs snowball. Example:

"| Passive | Active |
|---|---|
| Owns the market | Beats rarely |
| Tiny fees | Higher fees |
| Long-run ≈ 7% real | Most trail the index |
Low cost wins over time. **Own the market.**"`,
    }),
  },
  {
    name: "q&a",
    default_prompt: H({
      tag: `A question-and-answer piece. Hook is a personal money question that stings. Content: a bold term → *italic meaning* on 2 short lines, then a bold blockquote with the verdict. Real mechanism (time value of money, leverage, liquidity), not a slogan. Example:

"**Knowledge** tells you *what could work*
**Action** makes it *actually work*
> **Knowledge creates potential. Execution creates results.**"`,
    }),
  },
  {
    name: "quote",
    default_prompt: H({
      tag: `A quote-style piece with a real, correctly attributed authority (Buffett, Graham, Malkiel, Keynes, Thaler — or a clearly-sound paraphrase, never fabricated). Content: 2-3 short lines where the final 1-2 lines are the quote, then the attribution. Hook sets the emotion. Example:

"Money is the **reward**.
Value is why people pay you.
> "Someone's sitting in the shade today because someone planted a tree a long time ago."
— Warren Buffett"`,
    }),
  },
  {
    name: "stat",
    default_prompt: H({
      tag: `A statistic-driven insight that turns a number into a personal realisation. Two label lines with a **bold keyword** each (X vs Y), then a contrast line with a big **number**, then a blockquote punchline. Real, dated data, correctly read. Example:

"Followers = **Audience size**
Customers = **Demand**
100 people who desperately need what you sell
can be worth more than **100,000** who scroll past.
> Reach gets attention. Relevance gets sales."`,
    }),
  },
  {
    name: "tierlist",
    default_prompt: H({
      tag: `A priority tierlist (S/A/B/C/D) of where money should go, ONE line per tier with the tier letter **bold** and a short label. Right hierarchy: emergency fund and high-interest debt outrank speculation. End with a blockquote warning. Example:

"**S** — Emergency fund
**A** — High-interest debt gone
**B** — 5+ year index money
**C** — Trend chasing
**D** — "Guaranteed" returns
> A solid base beats a pretty plan."`,
    }),
  },
  {
    name: "warning",
    default_prompt: H({
      tag: `A cautionary piece: 2-3 named red flags as an emoji-free short list, then a "But..." twist line, then a bold blockquote. Genuinely dangerous money traps (guaranteed returns, urgency as pressure, products nobody wants). Example:

"You're:
* Building more features
* Redesigning the logo
* Tweaking the colors
But you **haven't tried selling it yet**.
> **Don't spend months building what nobody has proven they want.**"`,
    }),
  },
  {
    name: "formula",
    default_prompt: H({
      tag: `ONE correct money formula, laid out as stacked terms separated by × and = on their own lines, then a bold one-line honest explanation. Real math only (Net Worth = Assets − Liabilities; Real Return = Nominal − Inflation; Rule of 72 = 72 ÷ rate). Example:

"Big Problem
×
People Helped
×
Hard to Replace
=
Economic Value
**Solve bigger problems. Help more people. Become harder to replace.**"`,
    }),
  },
  {
    name: "checklist",
    default_prompt: H({
      tag: `A short pre-decision checklist of 3-4 questions, each a single line prefixed with a plain "* " bullet (plain bullets only, never checkbox brackets) and one **bold** keyword, then a bold blockquote verdict. Right thresholds for money decisions (emergency fund before investing, debt before speculation). Example:

"Before you invest:
* Is the problem **real**?
* Who actually **has it**?
* Are they **willing to pay**?
* Is your fix **better** than the alternatives?
> **If you can't answer these, don't build yet.**"`,
    }),
  },
];