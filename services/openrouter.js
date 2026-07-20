const MODEL = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

export async function generateContent(postType) {
  const prompt = buildPrompt(postType);
  const text = await askAI(prompt);
  return parseContent(postType, text);
}

export async function generateCaption(content) {
  const prompt = `Write one short paragraph in natural English for a social media caption based on this content. Make it feel current and connected to real life — reference the vibe of what's happening in the world right now if it fits. Do not include hashtags. Do not repeat the content verbatim. Describe the overall theme or message in fresh, sharp language.

Content:
${JSON.stringify(content, null, 2)}`;
  const caption = await askAI(prompt);
  return caption.trim() + " #1section";
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

function buildPrompt(type) {
  const prompts = {
    stat: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory. Use reality-based insights and accurate data from real research or proven facts.

Generate content for a statistics social media video. Return a JSON object with these fields:
- "label": a short label/title (3-5 words)
- "title": a compelling headline that introduces the stat (4-8 words)
- "stat": a striking statistic. MUST be 6 characters or fewer (e.g. "73%", "42M", "$1.2B", "1/4", "12yr", "3:1", "99th", "200K"). NO spaces if possible.
- "desc": a one-sentence description of what the stat means (max 12 words)
- "description": a single clear sentence about what this stat means for the audience (max 15 words)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

IMPORTANT: stat field is displayed at huge font size (260px). Anything longer than 6 characters will overflow the screen. Keep it short and punchy.

Make it intellectually interesting for adults. Use varied stat formats, not just percentages. The stat MUST be based on real research, study, or proven data — cite the source subtly if possible. Make the hook so strong people stop scrolling. English only. Return ONLY valid JSON.`,

    steps: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory. Use reality-based insights and accurate data from real research or proven facts.

Generate content for a "steps" social media video — a practical step-by-step framework. Return a JSON object with:
- "title": a specific, concrete title (max 8 words). MUST include the word "Steps" or imply a step-by-step process (e.g. "Steps to Master X", "5 Steps to Master X"). Avoid generic titles.
- "steps": an array of 3-7 objects, each with:
  - "title": short step name (2-5 words)
  - "desc": one-sentence explanation (max 12 words)
- "description": a one-sentence takeaway or summary of why this framework matters (max 15 words)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

Make it a practical mental framework or sequential process for adults. The steps should feel like concrete, actionable stages. Use current trends and relatable challenges. Make the title so compelling people save this video. English only. Return ONLY valid JSON.`,

    compare: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory. Use reality-based insights and accurate data from real research or proven facts.

Generate content for a comparison-style social media video. Return a JSON object with:
- "title": a "X VS Y" style title that frames a meaningful trade-off
- "pairs": an array of 3-5 objects, each with:
  - "left": one side of the comparison in a clear, specific sentence (concise)
  - "right": the contrasting side in a clear, specific sentence (concise)
- "description": a one-sentence takeaway that frames why this comparison matters (max 15 words)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

The comparison can be any interesting contrast — old vs new, cheap vs expensive, fast vs slow, short-term vs long-term, etc. Not just negative vs positive. Make it insightful for adults. Base the comparison on real psychological research or behavioral science. Make the title so provocative people have to watch. English only. Return ONLY valid JSON.`,

    mythfact: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory. Use reality-based insights and accurate data from real research or proven facts.

Generate content for a "myth vs fact" social media video. Return a JSON object with:
- "title": a 4-6 word provocative title
- "pairs": an array of exactly 3 objects, each with:
  - "myth": a commonly believed but false statement (1 sentence, concise)
  - "fact": the actual truth that corrects the myth (1 sentence, concise)
- "description": a one-sentence takeaway or insight about why this myth matters (max 18 words)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

Make it counterintuitive and intellectually engaging for adults. The fact MUST be backed by real research, studies, or proven data. Choose myths that are widely believed today and relevant to people's lives. Make people question what they know. English only. Return ONLY valid JSON.`,

    quote: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory. Use reality-based insights and accurate data from real research or proven facts.

Generate content for an inspirational quote social media video. Return a JSON object with:
- "title": a short theme label (3-4 words)
- "quote": an insightful, thought-provoking quote (1-2 sentences)
- "source": the person who said the quote (first and last name)
- "description": a single clear sentence explaining why this quote matters or how to apply it
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

Make the quote original-sounding, not overly cliché. Use quotes from modern thinkers across any field — tech, finance, science, philosophy, business, psychology — relevant to today's challenges. The quote should feel like a cold hard truth, not generic inspiration. English only. Return ONLY valid JSON.`,

    QnA: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory. Use reality-based insights and accurate data from real research or proven facts.

Generate content for a "question & answer" social media video. Return a JSON object with:
- "title": a short theme/topic label (3-5 words)
- "question": a deep, thought-provoking question (1 sentence, max 15 words)
- "answer": a insightful answer that provides perspective (2-3 sentences)
- "description": a one-sentence takeaway about why this Q&A matters (max 15 words)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

The question should make people pause and think. The answer should offer real insight grounded in psychology, neuroscience, or proven frameworks — not just generic advice. Make the question hit a universal human struggle. English only. Return ONLY valid JSON.`,

    story: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory. Use reality-based insights and accurate data from real research or proven facts.

Generate content for a "micro story" social media video. Return a JSON object with:
- "title": a short theme label that describes the story (2-4 words in English, e.g. "SELF DISCOVERY", "LIFE LESSON" — NOT just "MICRO STORY")
- "hook": a short teaser that sparks curiosity (2-5 words in English)
- "opening": a short relatable story (3-4 short paragraphs, use \\n\\n between paragraphs, max 50 words total in English)
- "description": a one-sentence takeaway that explains what this story teaches us — keep it simple and clear (8-15 words in English)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

Tell a short relatable story about real human struggles — loneliness, ambition, failure, success, identity, purpose. The hook should make people curious, not tell them what to do. The description should help viewers understand the lesson in plain, easy words. Vary the title theme every time. Make it emotionally gripping so people share it. English only. Return ONLY valid JSON.`,

    tips: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory. Use reality-based insights and accurate data from real research or proven facts.

Generate content for a practical tips social media video. Return a JSON object with:
- "title": a clear, specific title (4-6 words). MUST include the word "Tips". Make it descriptive and easy to understand — avoid abstract jargon. E.g. "Tips to Focus Better at Work", "Simple Money Saving Tips", "How to Stay Calm Tips". Minimum 4 words, maximum 6 words.
- "subtitle": an intriguing one-sentence hook that draws viewers in (10-15 words)
- "description": a single clear sentence summarizing the overall message (max 15 words)
- "tips": an array of 3-6 objects, each with:
  - "tip": a short actionable advice (3-6 words)
  - "desc": a substantive 1-2 sentence explanation with practical context
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

Make the tips intellectually stimulating yet easy to understand — covering psychology, behavioral economics, productivity, or practical wisdom. Each tip must be backed by real research or proven framework. Vary the title, tip structure, and depth every time. Avoid repeating same patterns. Make the subtitle so strong people save immediately. English only. Return ONLY valid JSON.`,

    formula: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory.

Generate content for a "formula" social media video — a simple equation that explains success. Return a JSON object with:
- "title": a headline that introduces the formula (4-8 words)
- "term1": a single word or short phrase for the first element (1-2 words)
- "op1": a symbol like "×" or "+" (1 character)
- "term2": a single word or short phrase for the second element (1-2 words)
- "result": a single word for the outcome (1-2 words)
- "caption": a short explanation of the equation (max 10 words)
- "description": a one-sentence takeaway about why this formula works (max 15 words)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

Make it feel like a universal truth or life hack. The formula should be memorable and intuitive. English only. Return ONLY valid JSON.`,

    tierlist: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory.

Generate content for a "tier list" social media video — ranking things from best to worst. Return a JSON object with:
- "title": a headline that frames the ranking (6-10 words)
- "tiers": an array of 4 objects, each with:
  - "label": a single letter grade — "s", "a", "b", or "c" (s = best, c = worst)
  - "name": a short name for the item being ranked (2-5 words)
  - "desc": a one-sentence description of why it belongs in this tier (max 10 words)
- "description": a one-sentence takeaway about the ranking (max 15 words)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

Use first tier "s" for the best option, then "a", "b", "c" in descending order. Make the ranking counterintuitive or insightful. English only. Return ONLY valid JSON.`,

    checklist: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory.

Generate content for a "checklist" social media video — actionable items to accomplish something. Return a JSON object with:
- "title": a headline that promises a result (4-8 words)
- "items": an array of 4-6 concise action items as simple strings (5-15 words each)
- "description": a one-sentence takeaway about what these actions achieve (max 15 words)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

Make the items specific and actionable, not generic. Each item should feel like a concrete step. English only. Return ONLY valid JSON.`,

    warning: `You are a viral content expert focused on self-development. Cover personal growth, productivity, mindset, habits, mental health, motivation, discipline, emotional intelligence, or any self-improvement theme. Don't be stiff or generic. Use simple, sharp language that hits hard. Strong hook is mandatory.

Generate content for a "warning" social media video — a cautionary message about a common mistake. Return a JSON object with:
- "title": a headline that frames the warning (3-6 words)
- "warning": a specific, hard-hitting warning statement (1-2 sentences)
- "description": a one-sentence takeaway or alternative perspective (max 15 words)
- "follow_call": a follow invitation (7-14 words) that specifically relates to this content topic. NO hashtags, NO @ mentions

Make it counterintuitive and eye-opening. The warning should make people realize they're making this mistake right now. English only. Return ONLY valid JSON.`,
  };
  return prompts[type] || prompts.stat;
}

function parseContent(type, text) {
  const json = text.replace(/```json\s*|\s*```/g, "").trim();
  const parsed = JSON.parse(json);

  switch (type) {
    case "steps":
      return {
        title: parsed.title,
        steps: parsed.steps,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "compare":
      return {
        title: parsed.title,
        pairs: parsed.pairs,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "mythfact":
      return {
        title: parsed.title,
        pairs: parsed.pairs,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "quote":
      return {
        title: parsed.title,
        quote: parsed.quote,
        source: parsed.source,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "story":
      return {
        title: parsed.title,
        hook: parsed.hook,
        opening: parsed.opening,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "tips":
      return {
        title: parsed.title,
        subtitle: parsed.subtitle,
        tips: parsed.tips,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "QnA":
      return {
        title: parsed.title,
        question: parsed.question,
        answer: parsed.answer,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "formula":
      return {
        title: parsed.title,
        term1: parsed.term1,
        op1: parsed.op1,
        term2: parsed.term2,
        result: parsed.result,
        caption: parsed.caption,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "tierlist":
      return {
        title: parsed.title,
        tiers: parsed.tiers,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "checklist":
      return {
        title: parsed.title,
        items: parsed.items,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    case "warning":
      return {
        title: parsed.title,
        warning: parsed.warning,
        description: parsed.description,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
    default:
      return {
        ...parsed,
        follow_call: parsed.follow_call || "",
        footer: "1section.com",
      };
  }
}
