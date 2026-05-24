import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function aiResponse(cvText: string): Promise<{
  score: number;
  positiveFeedback: string[];
  neutralFeedback: string[];
  negativeFeedback: string[];
  sectionsToImprove: { section: string; suggestion: string }[];
  atsCheckerNotes: string[];
  matchJobTitle: string;
  interviewQuestions: string[];
}> {

  const prompt = `You are an AI CV analyzer that checks if a resume is compatible with ATS (Application Tracking System).
Here is the candidate's resume text:

${cvText}

Based on this resume, respond ONLY with a valid JSON object in exactly this format:
{
  "score": 84,
  "positiveFeedback": [
    "Professional summary is well-written and concise",
    "Good use of action verbs in experience descriptions"
  ],
  "neutralFeedback": [
    "Work experience section could include more quantifiable achievements",
    "Consider adding more industry-specific keywords"
  ],
  "negativeFeedback": [
    "Education section is missing graduation dates",
    "Contact information is incomplete"
  ],
  "sectionsToImprove": [
    { "section": "Education", "suggestion": "Include graduation dates for each degree" },
    { "section": "Contact", "suggestion": "Make sure email and phone number are listed clearly" }
  ],
  "atsCheckerNotes": [
    "The CV is ATS-friendly with a simple layout",
    "Avoid using images or graphics that ATS might not read correctly"
  ],
  "interviewQuestions": [
    "Tell me about your experience with...",
    "How did you handle a difficult situation at work?"
  ],
  "matchJobTitle": "Your CV is a good match for Software Engineer roles."
}`;

  const response = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are a professional ATS compliance advisor. Always respond with valid JSON only, no markdown, no code fences, no extra text." },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const resultText = response.choices[0].message?.content || "";

  const cleanedText = resultText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (e) {
    console.error("Parse failed. Cleaned text:", cleanedText);
    throw new Error(`Failed to parse AI response as JSON`);
  }

  return {
    score: parsed.score,
    positiveFeedback: parsed.positiveFeedback || [],
    neutralFeedback: parsed.neutralFeedback || [],
    negativeFeedback: parsed.negativeFeedback || [],
    sectionsToImprove: parsed.sectionsToImprove || [],
    atsCheckerNotes: parsed.atsCheckerNotes || [],
    interviewQuestions: parsed.interviewQuestions || [],
    matchJobTitle: parsed.matchJobTitle || ""
  }
}