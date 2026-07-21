import { groqChat, MODELS } from "../lib/groqChat";

export async function generateCoverLetter(
  cvText: string,
  job: { title: string; company: string; description: string }
): Promise<string> {
  const systemPrompt = `You are a professional career writer. Write a tailored cover letter in the candidate's own first-person voice. You may only use facts present in the CV — never invent employers, job titles, metrics, dates, or achievements the candidate did not state. Return ONLY the cover letter body, no headers, addresses, or placeholders.`;

  const userPrompt = `TARGET ROLE: ${job.title} at ${job.company}
${job.description ? `\nJOB DESCRIPTION:\n---\n${job.description}\n---\n` : ""}
CANDIDATE CV:
---
${cvText}
---

Write a 180-220 word cover letter, professional and confident, in the first person. Open with genuine interest in the ${job.title} role at ${job.company}, connect the candidate's real experience and skills from the CV to what the role needs, and close with a call to action. Ground every claim in the CV — do not fabricate.`;

  const response = await groqChat({
    model: MODELS.fast,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 600,
  });

  return response.choices[0].message?.content?.trim() || "";
}
