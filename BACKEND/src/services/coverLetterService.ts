import { groqChat, MODELS } from "../lib/groqChat";

export async function generateCoverLetter(
  cvText: string,
  job: { title: string; company: string; description: string },
): Promise<string> {
  const systemPrompt = `You are a professional career writer. Write a tailored cover letter in the candidate's own first-person voice.

Ground every claim in the CV — never invent employers, job titles, metrics, dates, or achievements the candidate did not state.

Identity: introduce the candidate in terms of the TARGET role provided below, not necessarily whatever title appears in their CV. If their CV lists a different or broader title, position their relevant experience toward this specific role rather than restating their old title verbatim.

Company grounding: if a job description is provided, reference at least one concrete, specific thing about what the company actually builds or does — not just its name. If no job description is provided, keep the letter role-focused and do not invent claims about the company.

Evidence style: prefer one or two concrete, specific details (what was built, what changed, what tool or approach was used) over stacking multiple percentages in one place. A single well-chosen number is fine; four in one paragraph reads as padding, not evidence.

Avoid generic phrasing common in AI-written cover letters — for example "passion for building scalable applications," "aligns perfectly with," "drive business growth and efficiency," "seasoned professional." Write like a specific person, not a template.

Return ONLY the cover letter body, no headers, addresses, or placeholders.`;

  const userPrompt = `TARGET ROLE: ${job.title} at ${job.company}
${job.description ? `\nJOB DESCRIPTION:\n---\n${job.description}\n---\n` : ""}
CANDIDATE CV:
---
${cvText}
---

Write a 180-220 word cover letter, professional and confident, in the first person. Open with genuine interest in the ${job.title} role at ${job.company}, connect the candidate's real experience and skills from the CV to what the role needs, and close with a call to action. Ground every claim in the CV — do not fabricate.`;

  const response = await groqChat({
    model: MODELS.versatile,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 600,
  },{fallback:false});

  return response.choices[0].message?.content?.trim() || "";
}
