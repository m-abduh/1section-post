import { store } from "../db.mjs";

const MODEL = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-super-120b-a12b:free";

const DEFAULT_BASE_PROMPT = `You are a senior copywriter writing short, punchy, scroll-stopping PERSONAL FINANCE content for a video channel. Every claim must be financially correct — real theory, accurate numbers, no get-rich-quick nonsense.

Voice: SHORT, DENSE, EMOTIONAL, PERSONAL. Speak directly to the viewer as "you" — like a mentor who has been through the same money struggles. Every line must earn its place.

"hook" MUST be 7 to 14 words: a strong, emotional, specific scroll-stopping statement or question. It becomes the H2 title on the slide.
"caption" MUST be one short personal paragraph (no hashtags, no @ mentions).

"content" is the Markdown BODY printed below the hook title — GitHub-README-style, rich and visual, rendered as ONE static slide. Use the full Markdown vocabulary where the source instructions ask for it: --thematic breaks, **bold** (1-2 key words max), *italic*, ~~strikethrough~~, blockquotes (>), "- " lists, \`\`\`text code fences, and | | tables. Bold is used SPARINGLY — never bold an entire line, blockquote, table cell, or whole code block; inside blockquotes (>) and \`\`\`text code fences keep the text normal-weight by default and bold only a word or two when it truly matters. NEVER use emojis or emoticons — only text and numbers; symbols (× = ≠ ↓) only where meaningful. Leave a BLANK line between sections so they breathe. Keep every line short enough to fit on one screen. The source instructions define the exact structure of "content" — follow them first.

Return ONLY valid JSON matching EXACTLY this shape:
{
  "hook": "a 7-14 word strong hook line",
  "content": "the Markdown body following the source instructions (no H1, no title)",
  "caption": "one short paragraph for the social post caption (no hashtags, no @ mentions)"
}`;

function loadBasePrompt() {
  const saved = store ? store.getSetting("ai_base_prompt", "") : "";
  return saved && saved.trim() ? saved.trim() : DEFAULT_BASE_PROMPT;
}

async function askAI(prompt, retries = 3) {
  const key = process.env.OPENROUTER_KEY;
  if (!key) throw new Error("OPENROUTER_KEY not set");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      signal: controller.signal,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error(`OpenRouter returned empty response: ${JSON.stringify(data)}`);
    return content;
  } catch (e) {
    if (retries > 0 && (e.cause?.code === "EAI_AGAIN" || e.code === "EAI_AGAIN" || e.type === "system" || e.message?.includes("fetch failed"))) {
      console.log(`OpenRouter DNS/network error, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, 2000));
      return askAI(prompt, retries - 1);
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

function extractJSON(text) {
  const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in AI response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

/**
 * Generate post content (copywriting + caption) for an account+category.
 * @param {object} opts
 * @param {string} opts.accountName  Buffer account name
 * @param {string} opts.categoryName  Category label (e.g. "stat", "story")
 * @param {string} opts.prompt  Per-account-category AI prompt (customizable)
 * @returns {{hook, content, caption, content_json}}
 */
export async function generatePost({ accountName, categoryName, prompt }) {
  const base = loadBasePrompt();

  const src = (prompt && prompt.trim())
    ? prompt.trim()
    : `The topic is up to you — pick something timely and relevant to ${categoryName}.`;

  const userPrompt = `Video channel name: ${accountName}
Category: ${categoryName}

SOURCE INSTRUCTIONS (these define the content style, structure, and format — follow them first):
${src}

${base}`;

  const text = await askAI(userPrompt);
  const parsed = extractJSON(text);

  const content = Array.isArray(parsed.content)
    ? parsed.content.join("\n")
    : String(parsed.content || "");

  return {
    hook: String(parsed.hook || parsed.title || ""),
    content,
    caption: String(parsed.caption || parsed.follow_call || "").trim() + " #1section",
    content_json: JSON.stringify(parsed),
  };
}
