export type Language = "en" | "ar";

export const normalizeLanguage = (value: unknown): Language =>
  value === "ar" ? "ar" : "en";

export const jsonProseLanguageInstruction = (language: Language): string =>
  language === "ar"
    ? `\n\nRESPONSE LANGUAGE:
- Write all generated prose (observations, suggestions, rationales, ATS notes, interview questions, and any other descriptive text) in Arabic.
- Keep job titles, technology/framework/tool names, certifications, and other industry-standard terms in their original English form — do not translate or transliterate them (e.g. "Full Stack Developer", "React", "PostgreSQL").
- Do not translate verbatim excerpts copied from the CV; keep cvExcerpt and jobRequirement exactly as they appear in the source.
- Keep the JSON field names themselves in English exactly as specified.`
    : "";
