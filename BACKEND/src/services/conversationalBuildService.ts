import { groqChat } from "../lib/groqChat";
import { coerceFormData, BuilderFormData } from "./cvParseService";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function conversationalBuild(
  messages: ChatMessage[],
  currentFormData: BuilderFormData
): Promise<{ formData: BuilderFormData; reply: string }> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const transcript = messages.slice(-8).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

  const userPrompt = `You are building a CV through conversation. Here is the CV data collected so far:
${JSON.stringify(currentFormData)}

Recent conversation:
${transcript}

The user's latest message: "${lastUser}"

Apply the user's requested CV change precisely. When asked to replace, remove, rewrite, shorten, or reorder an entry, change the matching existing entry instead of keeping it. Use ONLY the facts the user provides — never invent employers, dates, metrics, or skills.

CRITICAL — CREATIVE ENHANCEMENT RULES:
When the user provides rough descriptions or bullet points, you MUST creatively enhance and rewrite them into polished, professional ATS-optimized content. DO NOT just split or reformat the user's exact words into separate bullets. Instead:
- Start each bullet with a strong action verb — but NEVER repeat the same verb across bullets. Draw from a wide vocabulary (build, design, lead, optimize, deliver, implement, reduce, scale, launch, establish, accelerate, transform, etc.)
- Transform plain statements into achievement-oriented bullets using the XYZ formula: "Accomplished [X] by doing [Y], resulting in [Z]"
- Preserve the user's facts and metrics but elevate the language to sound professional and impactful
- Add context and scope where the user's facts support it (e.g., "across 5+ projects" → "across a portfolio of 5+ enterprise-grade projects")
- Use industry-standard terminology and keywords naturally
- NEVER open a summary with cliché phrases like 'Results-Driven', 'Highly motivated', 'Dynamic professional', 'Seasoned', or 'Detail-oriented'. Lead with the candidate's actual role title or a concrete strength instead.
- Each bullet should start with "- " and be one concise, powerful line

Example of what NOT to do (bad — just reformatting):
Input: "created 5+ plugins, enhanced performance by 70%, fixed 200+ bugs"
Bad output:
- Created more than 5+ plugins.
- Enhanced performance of development plugins by 70% by developing agents, skills.
- Fixed more than 200+ bugs.

Example of what TO do (good — creative enhancement):
- Architected and delivered 5+ custom plugins, extending platform capabilities and accelerating team workflows.
- Boosted development plugin performance by 70% through engineering intelligent agents and automated skill-based pipelines.
- Resolved 200+ defects across the product lifecycle, improving system stability and reducing regression incidents.

Provide a helpful, conversational response directly answering the user's question, request, or comment in the "reply" field. If they asked to modify their CV, confirm the changes you made. If they asked a general question or requested advice, answer them directly and professionally. Do not use generic template-like confirmation messages; instead, address the user's input directly.

Return ONLY this JSON:
{
  "formData": { ...the full updated CV in the exact same schema as above... },
  "reply": "<your helpful and direct conversational response>"
}`;

  const response = await groqChat({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a friendly, expert CV-building assistant. You MUST output valid JSON only. Never fabricate facts.\n\nALWAYS follow these ATS (Applicant Tracking System) rules:\n1. ACTION VERBS: Start every bullet with strong verbs (e.g., Led, Developed, Optimized, Implemented, Designed, Managed, Delivered).\n2. QUANTIFY: Include metrics (%, $, numbers, time saved) for all achievements.\n3. NO PRONOUNS: Avoid I, me, my, we, our.\n4. FORMATTING: Use simple text only. No icons, tables, or special characters. Use plain '- ' for bullets.\n5. CONCISENESS: Max 3-4 bullets per role/project. Professional summary: 2-3 sentences max.\n6. KEYWORDS: Use industry-standard terms naturally without keyword stuffing.\n7. CONTENT: Focus on technical/soft skills, relevant coursework, honors, and GPA for education." },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  }, { fallback: false });

  let parsed: any = {};
  try { parsed = JSON.parse(response.choices[0].message?.content || "{}"); } catch { /* keep current */ }

  return {
    formData: coerceFormData(parsed.formData ?? currentFormData),
    reply: typeof parsed.reply === "string" && parsed.reply.trim() ? parsed.reply : "Done! Your CV has been updated.",
  };
}

