// The line under the name is the role only when it carries no contact facts — an email,
// a link, a phone number or a "|" separator means it is the contact line instead.
export const isContactLine = (line: string) => /[@|]|https?:|www\.|\d{3}/.test(line);

// "Languages: JavaScript, TypeScript" — a skills sub-label, not a sentence. A label is a short
// Title Case phrase, so "Built the pipeline: ..." fails on its lowercase words.
const SUB_LABEL_PATTERN = /^([A-Z][A-Za-z&/+\- ]{1,28}):\s+(\S.*)$/;
const LABEL_WORD = /^([A-Z][\w+/#.-]*|&|and)$/;

// The optimizer sometimes returns the whole header as one line — "Name | Role | phone | email | city".
// Rendered as-is that landed the phone number and the email in 22pt bold name styling, because the
// first line is assumed to be the name alone. Split it so only the name gets the name.
export const splitHeaderLine = (line: string): { name: string; rest: string } | null => {
  if (!line.includes(" | ")) return null;
  const [name, ...rest] = line.split("|").map((part) => part.trim()).filter(Boolean);
  if (!name || !rest.length) return null;
  return { name, rest: rest.join("  |  ") };
};

// A title/location row is only a row when the right-hand side is short — a place or a date. A
// project's technology list is neither, and pairing it opposite a long title drew the two on top of
// each other, which is why "…Secure Blockchain Validation" and "React, Node.js…" overlapped.
const MAX_ENTRY_ASIDE = 40;

export const splitEntryHeader = (line: string): { title: string; aside: string } | null => {
  const index = line.lastIndexOf(" | ");
  if (index === -1) return null;
  const title = line.slice(0, index).trim();
  const aside = line.slice(index + 3).trim();
  if (!title || !aside || aside.length > MAX_ENTRY_ASIDE) return null;
  return { title, aside };
};

// "• React" repeated once per skill is how the optimizer writes a skills section, and one bullet per
// word is not how any template shows skills. Consecutive short bullets under a skills heading are
// folded back into a single comma-separated line.
const SKILLS_HEADING = /^(technical\s+skills|core\s+skills|key\s+skills|skills|technologies|competencies|tools)\s*:?\s*$/i;
const HEADING_SHAPE = /^[A-Z][A-Z\s&/]{2,}$|:\s*$/;
const BULLET_START = /^[-•*]\s+/;
const MAX_SKILL_LENGTH = 32;

export const collapseSkillBullets = (lines: string[]): string[] => {
  const out: string[] = [];
  let inSkills = false;
  let run: { raw: string; skill: string }[] = [];

  // A lone bullet is left exactly as it was; only a genuine run becomes a comma list.
  const flush = () => {
    if (run.length >= 2) out.push(run.map((entry) => entry.skill).join(", "));
    else out.push(...run.map((entry) => entry.raw));
    run = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (SKILLS_HEADING.test(line)) {
      flush();
      inSkills = true;
      out.push(raw);
      continue;
    }

    if (inSkills && BULLET_START.test(line)) {
      const skill = line.replace(BULLET_START, "").trim();
      // A bullet that reads like a sentence is an achievement, not a skill — leave those alone.
      if (skill && skill.length <= MAX_SKILL_LENGTH && !/[.!?]$/.test(skill)) {
        run.push({ raw, skill });
        continue;
      }
    }

    flush();
    if (line && HEADING_SHAPE.test(line) && !BULLET_START.test(line)) inSkills = false;
    out.push(raw);
  }

  flush();
  return out;
};

export const matchSubLabel = (line: string) => {
  const m = line.match(SUB_LABEL_PATTERN);
  if (!m) return null;
  const words = m[1].split(/\s+/);
  if (words.length > 3 || !words.every((w) => LABEL_WORD.test(w))) return null;
  return { label: m[1], rest: m[2] };
};
