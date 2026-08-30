// Seed categories: one entry = a financial content format + the prompt that
// steers the AI to produce that format as GitHub-README-style Markdown.
//
// The renderer composes the final one-screen slide as:
//   # {nn} — {Category}
//   ---
//   ## {hook}      <- the headline/hook, written by the AI
//   {body}         <- the rest, written by the AI (this is what the prompt steers)
//
// Body rules for EVERY category (baked into each prompt below):
// - Rich README Markdown: --thematic break, **bold**, *italic*,
//   ~~strikethrough~~, blockquotes (>), "- " lists, code fences (```text),
//   and tables (| |) where the format calls for them.
// - NEVER use emojis or emoticons — only text and numbers; use symbols
//   (× = ≠ ↓) ONLY when they carry meaning.
// - Keep lines short enough to fit on one 1080x1350 static frame.
// - Every claim must be financially/factually correct — no hype.

function readmeBody({ structure, example }) {
  return `Write the CONTENT BODY in GitHub-README-style Markdown. A headline (the "hook") already sits above as the H2 title; your body is everything after it — pure Markdown that renders beautifully on ONE static slide.

Structure to follow:
${structure}

Exact visual style to emulate (invent fresh content, never copy verbatim):
${example}

Rules: 100% Markdown, GitHub README look. Use only --thematic breaks, **bold** (max 1-2 key words per idea), *italic*, ~~strikethrough~~, blockquotes >, "- " lists, \`\`\`text code fences, and | tables when asked. No emojis, no emoticons, text + numbers only, symbols (× = ≠ ↓) only where meaningful. Every line short enough for one screen. Correct financial theory and accurate numbers.`;
}
export const CATEGORY_SEEDS = [
  {
    name: "Story",
    default_prompt: readmeBody({
      structure: `A 2–3 step symbolic money chain, a dramatic turn signposted by a blockquote, then the payoff line with the key word in **bold**.`,
      example: `**Work harder → Earn more → Become rich**

Until the question changes:

> **"What problem can be solved?"**

Money becomes the **result**, not the goal.`,
    }),
  },
  {
    name: "Myth",
    default_prompt: readmeBody({
      structure: `The myth as a ~~strikethrough~~ claim, the corrected truth in **bold**, then a blockquote whose last line is a **bold** punchline.`,
      example: `~~More hours = More money~~

**Not necessarily.**

> Hard work matters. 
> **Direction matters more.**`,
    }),
  },
  {
    name: "Contrarian",
    default_prompt: readmeBody({
      structure: `One contrarian one-liner, then a \`\`\`text code fence showing a 3-step chain joined by ↓, then a blockquote verdict.`,
      example: `You need **less friction**.

\`\`\`text
Smaller Task
↓
Easier Start
↓
More Repetition
\`\`\`

> **Design the behavior. Don't depend on motivation.**`,
    }),
  },
  {
    name: "Unpopular Truth",
    default_prompt: readmeBody({
      structure: `A blunt unpopular truth in short bold-flagged lines, then a blockquote verdict, then a closer line with the key word in **bold**.`,
      example: `The idea can be brilliant.

The design can be beautiful.

But if nobody needs it:

> **It doesn't matter.**

Customers buy **solutions**, not ideas.`,
    }),
  },
  {
    name: "Reframe",
    default_prompt: readmeBody({
      structure: `A ~~strikethrough~~ of the wrong belief, the right frame in **bold**, a "- " bullet list of what it reveals, then a blockquote closer.`,
      example: `~~Failure = Losing~~

**Failure = Information**

It shows:

- What failed
- What was misunderstood
- What needs to change

> **Learn from it, then move.**`,
    }),
  },
  {
    name: "Q&A",
    default_prompt: readmeBody({
      structure: `A stinging question line, a **X ≠ Y** contrast, a short explanation, then a blockquote whose lines are the verdict.`,
      example: `Because:

**Knowing ≠ Doing**

You can understand everything and still take **zero action**.

> **Knowledge creates potential. 
> Execution creates results.**`,
    }),
  },
  {
    name: "Compare",
    default_prompt: readmeBody({
      structure: `Compare two opposing sides in a small | table | (2 columns × 3 short data rows), then a blockquote verdict with a **bold** contrast.`,
      example: `| Busy | Productive |
|---|---|
| Does more | Achieves more |
| Chases activity | Chases outcomes |
| Fills time | Creates value |

> **Activity ≠ Progress**`,
    }),
  },
  {
    name: "Problem → Solution",
    default_prompt: readmeBody({
      structure: `"The problem might not be X" + a **bold** alternative, then a 3-line "**X → Y**" chain, then a blockquote verdict.`,
      example: `It might be the **system**.

**Distraction → Remove distraction**

**Complexity → Simplify**

**Friction → Reduce friction**

> **Change the system, not just the willpower.**`,
    }),
  },
  {
    name: "Warning",
    default_prompt: readmeBody({
      structure: `A hard warning line, a short "- " list of red flags, "None of these prove **demand**", then a two-line blockquote.`,
      example: `More features.

Better UI.

New logo.

None of these prove **demand**.

> **Building proves capability. 
> Selling proves demand.**`,
    }),
  },
  {
    name: "Tips",
    default_prompt: readmeBody({
      structure: `A rhetorical question, a reframe ("make the action **smaller**"), three short bold numbered lines, then a blockquote punchline.`,
      example: `Don't make the goal bigger.

Make the action **smaller**.

**1 page. 
5 minutes. 
1 repetition.**

> **Consistency starts when starting becomes easy.**`,
    }),
  },
  {
    name: "Formula",
    default_prompt: readmeBody({
      structure: `One correct money formula as a SINGLE HORIZONTAL line of terms joined by × and =, wrapped in a \`\`\`text code fence (terms on one line: A × B × C = Value — never stacked vertically), then a one-line reframe, then a blockquote verdict.`,
      example: `\`\`\`text
Problem × People × Leverage = Value
\`\`\`

Don't just work more.

> **Create more value with the same effort.**`,
    }),
  },
  {
    name: "Stat",
    default_prompt: readmeBody({
      structure: `A "**X = label**" contrast on two lines, a plain line, a blockquote with a bolded contrast, then a **bold** closer.`,
      example: `**Followers = Attention**

**Customers = Demand**

100 people who desperately need something can be worth more than:

> **100,000 people who don't care.**

**Relevance beats reach.**`,
    }),
  },
];

// Pre-rework seed categories that no longer exist in the new 12-category set.
// Removed on boot so the rotation only ever uses the new README-style formats.
export const LEGACY_SEED_NAMES = [
  "story",
  "tips",
  "steps",
  "myth",
  "compare",
  "q&a",
  "quote",
  "stat",
  "tierlist",
  "warning",
  "formula",
  "checklist",
];