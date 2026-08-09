import { z } from "zod";
import { groqChat } from "../lib/groqChat";
import { InvalidAiResponseError, parseAiResponse } from "../lib/aiResponseValidation";
import { coerceFormData, BuilderFormData } from "./cvParseService";
import { cvOutputLanguage } from "./AIWritingService";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const conversationalBuildResponseSchema = z.object({
  formData: z.object({
    personalInfo: z.object({
      firstName: z.string(), lastName: z.string(), email: z.string(), phoneCode: z.string(),
      phone: z.string(), country: z.string(), city: z.string(), town: z.string(),
      professionalTitle: z.string(), ProfessionalSummary: z.string(), linkedin: z.string(),
      github: z.string(), portfolio: z.string(),
    }),
    experience: z.array(z.object({
      jobTitle: z.string(), company: z.string(), location: z.string(), startDate: z.string(),
      endDate: z.string(), description: z.string(),
    })),
    education: z.array(z.object({
      institution: z.string(), degree: z.string(), location: z.string(), startYear: z.string(),
      endYear: z.string(), description: z.string(),
    })),
    projects: z.array(z.object({
      name: z.string(), technologies: z.string(), demoUrl: z.string(), githubUrl: z.string(),
      description: z.string(),
    })),
    skills: z.object({
      skills: z.array(z.string()),
      languages: z.string(),
      certifications: z.array(z.object({
        name: z.string(), issuer: z.string(), date: z.string(), url: z.string(),
      })),
    }),
  }),
  reply: z.string().trim().min(1),
});

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

Route each fact to the section it belongs to. A certification, course, or credential belongs in skills.certifications, not in an experience description. Job duties belong in the description of the matching experience entry.

skills.certifications is an array with one object per credential: { "name", "issuer", "date", "url" }. Leave any field "" when the user has not stated it — never guess an issuer or a date. Return [] when there are no certifications.

LANGUAGE:
Write every CV field in ${cvOutputLanguage(JSON.stringify(currentFormData))}. This is fixed. The user may write to you in Arabic, English, or a mix — never mirror the language of their message in the CV itself, and never switch the CV's language because a request was phrased in another one. The conversational "reply" field should match the user's own language.

CRITICAL — CREATIVE ENHANCEMENT RULES:
When the user provides rough descriptions or bullet points, you MUST creatively enhance and rewrite them into polished, professional ATS-optimized content. DO NOT just split or reformat the user's exact words into separate bullets. Instead:
- Start each bullet with a strong action verb — but NEVER repeat the same verb across bullets. Draw from a wide vocabulary (build, design, lead, optimize, deliver, implement, reduce, scale, launch, establish, accelerate, transform, etc.)
- Transform plain statements into achievement-oriented bullets using the XYZ formula: "Accomplished [X] by doing [Y], resulting in [Z]" — but ONLY when the user actually stated the result. Otherwise write the action alone.
- Preserve the user's facts and metrics but elevate the language to sound professional and impactful
- Use industry-standard terminology and keywords naturally
- NEVER open a summary with cliché phrases like 'Results-Driven', 'Highly motivated', 'Dynamic professional', 'Seasoned', or 'Detail-oriented'. Lead with the candidate's actual role title or a concrete strength instead.
- Each bullet should start with "- " and be one concise, powerful line
- Put every bullet on its own line, separated by a real newline character. Never join bullets onto a single line.

HARD LIMIT — ENHANCE WORDING, NEVER ADD FACTS:
Enhancement means better wording for what the user said. It never means new information.
- Never invent outcomes, results, metrics, percentages, scope, team sizes, tools, or responsibilities the user did not state.
- Write no more bullets than the user's facts support. Two facts means two bullets. Never pad to reach a target count.
- A certification, course, credential, or training is a completed qualification, not a job duty. Record it in skills.certifications. Never expand it into responsibilities performed, protocols implemented, or results achieved.
- If the user's note is too thin to enhance, return it cleanly worded and stop. A short accurate entry beats a padded invented one.
- Never change a field the user did not ask about. Leave every other part of the CV exactly as supplied.

Input for the examples below: "created 5+ plugins, enhanced performance by 70%, fixed 200+ bugs"

Bad — flat reformatting of the user's exact words:
- Created more than 5+ plugins.
- Enhanced performance of development plugins by 70%.
- Fixed more than 200+ bugs.

Bad — invented facts. The user never mentioned enterprise platforms, intelligent agents, team workflows, or regression incidents:
- Architected and delivered 5+ enterprise-grade plugins, extending platform capabilities and accelerating team workflows.
- Boosted performance by 70% through engineering intelligent agents and automated skill-based pipelines.
- Resolved 200+ defects across the product lifecycle, reducing regression incidents.

Good — stronger wording, same facts, nothing added:
- Designed and shipped 5+ production plugins.
- Improved plugin performance by 70%.
- Diagnosed and resolved 200+ defects across the codebase.

Provide a helpful, conversational response directly answering the user's question, request, or comment in the "reply" field. If they asked to modify their CV, confirm the changes you made. If they asked a general question or requested advice, answer them directly and professionally. Do not use generic template-like confirmation messages; instead, address the user's input directly.

Return ONLY this JSON:
{
  "formData": { ...the full updated CV in the exact same schema as above... },
  "reply": "<your helpful and direct conversational response>"
}`;

  const response = await groqChat({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a friendly, expert CV-building assistant. You MUST output valid JSON only. Never fabricate facts.\n\nALWAYS follow these ATS (Applicant Tracking System) rules:\n1. ACTION VERBS: Start every bullet with strong verbs (e.g., Led, Developed, Optimized, Implemented, Designed, Managed, Delivered).\n2. QUANTIFY: Include metrics (%, $, numbers, time saved) only where the user supplied them. Never estimate or invent a number.\n3. NO PRONOUNS: Avoid I, me, my, we, our.\n4. FORMATTING: Use simple text only. No icons, tables, or special characters. Use plain '- ' for bullets, one bullet per line separated by a newline escape inside the JSON string.\n5. CONCISENESS: Max 3-4 bullets per role/project. Professional summary: 2-3 sentences max.\n6. KEYWORDS: Use industry-standard terms naturally without keyword stuffing.\n7. CONTENT: Focus on technical/soft skills, relevant coursework, honors, and GPA for education." },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  }, { fallback: false });

  const responseContent = response.choices[0]?.message?.content;
  if (typeof responseContent !== "string" || responseContent.trim().length === 0) {
    throw new InvalidAiResponseError("invalid_shape", "The AI provider returned no conversational build response.");
  }

  const parsed = parseAiResponse(responseContent, conversationalBuildResponseSchema);

  return {
    formData: coerceFormData(parsed.formData),
    reply: parsed.reply,
  };
}

