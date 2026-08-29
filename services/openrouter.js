const MODEL = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-super-120b-a12b:free";

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
  const base = `You write short, punchy, scroll-stopping social media content for a video channel called "${accountName}", focused on the category "${categoryName}".

"content" is a single Markdown string (2 to 5 short lines). Use Markdown formatting: a bold headline, then bullet points ("- "), and short paragraphs. Separate lines/paragraphs with real line breaks. This is what the video shows, so keep every line short enough to fit a 1080x1350 video.

Return ONLY valid JSON matching EXACTLY this shape and format:
{
  "hook": "a 2-5 word strong hook line",
  "content": "**Short bold headline**\\n\\n- point one\\n- point two\\n- point three",
  "caption": "one short paragraph for the social post caption (no hashtags, no @ mentions)"
}

Keep every line short enough to fit a 1080x1350 video. Make it factual, specific, and emotionally engaging.`;

  const userPrompt = (prompt && prompt.trim())
    ? `${prompt.trim()}\n\nOutput (ONLY valid JSON):\n${base}`
    : `${base}\n\nThe topic is up to you — pick something timely and relevant to ${categoryName}.`;

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
