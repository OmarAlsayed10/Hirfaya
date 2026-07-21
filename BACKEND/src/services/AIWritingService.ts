import { groqChat, MODELS } from "../lib/groqChat";
import { BuilderFormData } from "./cvParseService";
import { buildCvContext } from "../lib/cvContextBuilder";

// Turn a user's rough notes for ONE item into polished CV content — no fabrication.
export async function polishEntry(
  sectionName: string,
  raw: string,
  jobTitle = "",
  formData?: BuilderFormData
): Promise<string> {
  const guide: Record<string, string> = {
    experience: "2-4 concise achievement bullets using the Google XYZ formula (action verb + what + measurable result). One bullet per line, start each with '- '.",
    education: "a short, clean description line (relevant coursework, honors, or focus).",
    skills: "a comma-separated list of specific, relevant skills.",
    summary: "a 2-3 sentence professional summary naming the role, key strengths, and value. NEVER open with cliché phrases like 'Results-Driven', 'Highly motivated', 'Dynamic professional', 'Seasoned', or 'Detail-oriented'. Instead, lead with the candidate's actual role title or a concrete strength.",
  };
  const rule = guide[sectionName.toLowerCase()] || "polished, professional CV wording.";
  const cvContext = formData ? buildCvContext(formData, { compact: true }) : "";

  const response = await groqChat({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: `You turn a candidate's rough notes into polished, professional CV text. Use ONLY the facts they give — never invent metrics, employers, dates, or achievements. Return only the text, no preamble.\n\nCRITICAL — CREATIVE ENHANCEMENT:\nDo NOT just split or reformat the user's exact words into separate bullets. You MUST creatively rewrite and enhance the content into polished, impactful professional language:\n- Start each bullet with a unique, strong action verb. NEVER repeat the same verb across bullets.\n- Transform plain statements into achievement-oriented bullets: 'Accomplished [X] by doing [Y], resulting in [Z]'\n- Preserve the user's facts and metrics but elevate the language to sound professional and impactful\n- Add context and scope where the user's facts support it\n- Use industry-standard terminology and keywords naturally\n- NEVER open a summary with cliché phrases like 'Results-Driven', 'Highly motivated', 'Dynamic professional', 'Seasoned', 'Detail-oriented', 'Passionate', or 'Expert'. Lead with the candidate's actual role title or a concrete strength instead.\n\nALWAYS follow ATS (Applicant Tracking System) rules:\n- Quantify achievements with metrics where the user provides data\n- Use industry keywords naturally\n- Avoid personal pronouns (I, me, my)\n- Use simple bullet format (start each with '- ') for experience/project descriptions\n- Keep content concise and scannable${cvContext ? `\n\nCANDIDATE'S FULL CV CONTEXT:\n${cvContext}\n\nUse this context to ensure your polished text complements the rest of their CV. Avoid repeating action verbs or achievements that already exist in their other entries.` : ""}` },
      { role: "user", content: `Section: ${sectionName}${jobTitle ? ` (target role: ${jobTitle})` : ""}\nRough notes: ${raw}\n\nWrite ${rule}` },
    ],
    temperature: 0.4,
    max_tokens: 400,
  });

  return (response.choices[0].message?.content || "").trim();
}

export const generateAIContent = async (
  jobTitle: string,
  sectionName: string,
  industry: string,
  experience: string,
  formData?: BuilderFormData
): Promise<string> => {
  const cvContext = formData ? buildCvContext(formData, { excludeSection: sectionName }) : "";
  
  const response = await groqChat({
    model: MODELS.fast,
    messages: [
      {
        role: "system",
        content: `You write CV content. Output ONLY the finished text for the requested section — no preamble, no labels, no headings, no quotes, no explanation. Never start with phrases like 'Here's' or 'Sure'. Do not repeat the section name.\n\nALWAYS follow ATS best practices: use strong action verbs, quantify achievements, use industry keywords naturally, avoid pronouns (I, me, my), use simple bullet format ('- ') for descriptions.\n\n${cvContext ? `CANDIDATE'S EXISTING CV CONTEXT:\n${cvContext}\n\nYou must generate the ${sectionName} to perfectly fit this specific candidate. Synthesize their actual skills, experience, and background into the generated text. Do not invent fake metrics or employers, but do create highly relevant, professional content that builds upon what they actually know and have done.` : "Generate high-quality professional content for this role."}`,
      },
      {
        role: "user",
        content: `Write a ${sectionName} for a ${jobTitle} in the ${industry} industry at ${experience}. Return only the content itself.`,
      },
    ],
    max_tokens: 250,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0.3,
    presence_penalty: 0.1,
  });

  return (response.choices[0].message?.content || "")
    .trim()
    .replace(/\*\*/g, "")
    .replace(/^\s*(sure|here'?s|here is|below is)\b[^:]*:?\s*/i, "")
    .replace(new RegExp(`^\\s*${sectionName}\\s*:?\\s*`, "i"), "")
    .replace(/\\n/g, " ")
    .replace(/\n/g, " ")
    .trim();
};

export async function optimizeCvLength(formData: any): Promise<any> {
  const expCount = Array.isArray(formData?.experience) ? formData.experience.length : 0;
  const eduCount = Array.isArray(formData?.education) ? formData.education.length : 0;
  const projCount = Array.isArray(formData?.projects) ? formData.projects.length : 0;

  const response = await groqChat({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a professional CV writing assistant. Your job is to make CV descriptions more concise so the CV fits on one page.

ABSOLUTE RULES — VIOLATION IS UNACCEPTABLE:
1. NEVER remove any experience, education, or project entry. The input has ${expCount} experience entries, ${eduCount} education entries, and ${projCount} project entries. The output MUST have the EXACT SAME number of entries in each array.
2. NEVER remove or change any jobTitle, company, institution, degree, dates, location, or project name.
3. ONLY shorten the "description" and "ProfessionalSummary" text fields by making the wording more concise.
4. Keep the core meaning, key achievements, and metrics intact — just use fewer words.
5. Return a JSON object matching the exact input structure (personalInfo, experience, education, projects, skills).
6. Do NOT remove any skills, languages, or certifications.
7. CROSS-SECTION CONSOLIDATION: Identify content that is repeated across experience and project descriptions and consolidate it. If a skill is heavily featured in descriptions, it doesn't need elaboration in the summary.`
      },
      {
        role: "user",
        content: `Make the descriptions in this CV more concise to fit one page. Do NOT remove any entries:\n\n${JSON.stringify(formData)}`
      }
    ],
    temperature: 0.3,
  }, { fallback: false });

  const content = response.choices[0].message?.content || "";
  try {
    const parsed = JSON.parse(content);

    const parsedExpCount = Array.isArray(parsed?.experience) ? parsed.experience.length : 0;
    const parsedEduCount = Array.isArray(parsed?.education) ? parsed.education.length : 0;

    if (parsedExpCount < expCount || parsedEduCount < eduCount) {
      console.warn(`optimizeCvLength: LLM dropped entries (exp: ${expCount}->${parsedExpCount}, edu: ${eduCount}->${parsedEduCount}). Merging descriptions only.`);

      const result = JSON.parse(JSON.stringify(formData));
      if (parsed?.personalInfo?.ProfessionalSummary) {
        result.personalInfo.ProfessionalSummary = parsed.personalInfo.ProfessionalSummary;
      }
      if (parsedExpCount > 0) {
        for (let i = 0; i < Math.min(expCount, parsedExpCount); i++) {
          if (parsed.experience[i]?.description) {
            result.experience[i].description = parsed.experience[i].description;
          }
        }
      }
      if (parsedEduCount > 0) {
        for (let i = 0; i < Math.min(eduCount, parsedEduCount); i++) {
          if (parsed.education[i]?.description) {
            result.education[i].description = parsed.education[i].description;
          }
        }
      }
      return result;
    }

    return parsed;
  } catch (e) {
    console.error("Failed to parse JSON response from Groq:", content);
    throw new Error("Failed to parse optimized CV JSON");
  }
}

export async function editFieldWithAI(
  sectionName: string,
  userPrompt: string,
  currentContent: string,
  context: { jobTitle?: string; company?: string; projectName?: string; technologies?: string; institution?: string; degree?: string },
  formData?: BuilderFormData
): Promise<string> {
  const contextParts: string[] = [];
  if (context.jobTitle) contextParts.push(`Role: ${context.jobTitle}`);
  if (context.company) contextParts.push(`Company: ${context.company}`);
  if (context.projectName) contextParts.push(`Project: ${context.projectName}`);
  if (context.technologies) contextParts.push(`Technologies: ${context.technologies}`);
  if (context.institution) contextParts.push(`Institution: ${context.institution}`);
  if (context.degree) contextParts.push(`Degree: ${context.degree}`);
  const contextStr = contextParts.length > 0 ? `\nField Context: ${contextParts.join(', ')}` : '';
  const existingContent = currentContent?.trim() ? `\nExisting content:\n${currentContent}` : '';
  const cvContext = formData ? buildCvContext(formData, { excludeSection: sectionName }) : '';

  const response = await groqChat({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a professional CV writing assistant. You edit and generate CV content based on the user's instructions. Return ONLY the finished text — no preamble, no labels, no quotes, no explanation. NEVER ask follow-up questions — just return the content.

CRITICAL — CREATIVE ENHANCEMENT:
When the user provides rough notes, descriptions, or bullet points, you MUST creatively enhance and rewrite them into polished, impactful, ATS-optimized professional content. DO NOT just split or reformat the user's exact words. Instead:
- Choose precise opening verbs that describe the candidate's actual work and do not repeat an opening already used in the supplied CV context.
- Never use generic openings such as "Spearheaded", "Leveraged", "Utilized", "Orchestrated", or "Revolutionized". Prefer concrete verbs supported by the content, such as built, configured, diagnosed, migrated, tested, documented, reduced, or designed.
- Start each bullet with a strong action verb — but NEVER repeat the same verb across bullets. Draw from a wide vocabulary.
- Transform plain statements into achievement-oriented bullets: "Accomplished [X] by doing [Y], resulting in [Z]"
- Preserve the user's facts and metrics but elevate the language to sound professional, impactful, and polished
- Add context and scope where the user's facts support it
- Use industry-standard terminology and keywords naturally
- NEVER open a summary with cliché phrases like 'Results-Driven', 'Highly motivated', 'Dynamic professional', 'Seasoned', or 'Detail-oriented'. Lead with the candidate's actual role title or a concrete strength instead.

When there is EXISTING content, use it as a base to enhance — keep the professional structure and style but incorporate the user's new information and improve the wording. Do not throw away well-written existing content.

ATS (Applicant Tracking System) rules:
- Quantify achievements with metrics wherever possible
- Use industry-standard keywords naturally — never keyword-stuff
- Avoid personal pronouns (I, me, my, we)
- No graphics, icons, tables, or special characters
- Use simple bullet formatting (start each bullet with '- ') for experience and project descriptions
- Keep descriptions concise: max 3-4 bullets per entry
- Professional Summary: 2-3 sentences, name the role, key strengths, and value proposition
- Skills: comma-separated list of specific, relevant skills
- Never fabricate information — only rephrase, enhance, or generate based on what the user provides
${cvContext ? `\nCANDIDATE'S FULL CV CONTEXT:\n${cvContext}\n\nYou have the candidate's full CV context. Use it to: avoid repeating action verbs or achievements already used in other entries, reference relevant skills/projects/education when writing experience bullets, and ensure tone and style consistency across sections. Check other entries to ensure no verb duplication and complementary achievement framing.` : ""}`
      },
      {
        role: "user",
        content: `Section: ${sectionName}${contextStr}${existingContent}\n\nUser request: ${userPrompt}`
      }
    ],
    temperature: 0.65,
    max_tokens: 500,
  });

  return (response.choices[0].message?.content || "").trim();
}

export async function generateSmartSkills(formData: BuilderFormData): Promise<string[]> {
  const cvContext = buildCvContext(formData);
  if (!cvContext) return [];

  const response = await groqChat({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert technical recruiter and CV analyzer. Your job is to extract and infer a comprehensive list of professional skills based ON ACTUAL EVIDENCE from a candidate's CV text.

RULES:
1. Extract explicitly mentioned tools, languages, frameworks, methodologies, and platforms.
2. Infer highly probable related skills IF the evidence is strong (e.g., if they deployed containerized microservices to AWS, you can infer Docker/AWS if not explicitly stated, but do not invent unrelated skills).
3. Include relevant soft skills and domain expertise (e.g., Team Leadership, Agile/Scrum, Financial Modeling) if demonstrated by their achievements.
4. Output a clean, deduplicated array of strings. Do not include categories or groupings, just a flat array of the best 10-25 skills.

Return JSON in exactly this format:
{
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}`
      },
      {
        role: "user",
        content: `CANDIDATE'S CV CONTEXT:\n${cvContext}\n\nExtract and infer their skills.`
      }
    ],
    temperature: 0.1,
  }, { fallback: false });

  try {
    const parsed = JSON.parse(response.choices[0].message?.content || "{}");
    if (Array.isArray(parsed.skills)) {
      return parsed.skills.filter((s: any) => typeof s === "string");
    }
  } catch (e) {
    console.error("Failed to parse JSON response for smart skills", e);
  }
  
  return [];
}
