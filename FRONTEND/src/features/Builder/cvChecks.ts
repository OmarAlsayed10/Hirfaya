import type { BuilderFormData, CvSection } from '../../redux/store/slices/cvBuilderSlice';
import { bulletLines } from '../../templates/bulletLines.ts';

// `message` is an i18n key with {{placeholders}}; the caller resolves it with `values` so the
// counts inside a suggestion do not break translation lookup.
export interface CvCheck {
  id: string;
  section: CvSection;
  severity: 'warning' | 'tip';
  message: string;
  values?: Record<string, string | number>;
}

// Thresholds mirror BACKEND/src/services/cvScoring (objectiveScores.ts, constants.ts). They are
// duplicated because the frontend cannot import from the backend — keep both sides in step, or
// the builder will call a CV good that the analysis report then marks down.
const MIN_SKILLS = 8;
const MIN_SUMMARY_WORDS = 20;
const MAX_PAGES = 2;

// A recruiter-readable floor of 9pt = 12px at 96 DPI. Body text in the templates is 0.88rem
// (14.08px), so anything under this scale prints smaller than 9pt.
const MIN_READABLE_FONT_SCALE = 12 / 14.08;

// Kept character-for-character identical to ACTION_VERB in the backend constants.
const ACTION_VERB =
  /^(achieved|accelerated|administered|advised|analy[sz]ed|architected|arranged|assessed|assisted|audited|authored|automated|briefed|built|championed|collaborated|communicated|compiled|completed|conducted|consolidated|contributed|controlled|converted|coordinated|counseled|created|cut|decreased|defined|delivered|demonstrated|deployed|designed|developed|devised|diagnosed|directed|documented|doubled|drafted|drove|eliminated|engineered|enhanced|ensured|escalated|established|evaluated|examined|executed|expanded|facilitated|forecast|formulated|generated|grew|guided|handled|headed|identified|implemented|improved|increased|influenced|initiated|inspected|installed|instructed|integrated|interpreted|introduced|investigated|launched|led|maintained|managed|maximized|mentored|minimized|modernized|monitored|negotiated|operated|optimized|organized|overhauled|oversaw|performed|pioneered|planned|prepared|presented|prevented|processed|produced|promoted|provided|published|ran|rebuilt|recommended|recorded|recruited|reduced|refactored|reported|researched|resolved|restructured|reviewed|revamped|saved|scaled|scheduled|secured|simplified|sold|sourced|spearheaded|standardi[sz]ed|streamlined|strengthened|supervised|supported|sustained|tested|tracked|trained|transformed|translated|troubleshot|upgraded|validated|verified|wrote)\b/i;

// The order the analysis rewards: Summary → Experience → Skills → Education. Sections the
// builder has but the scorer does not care about are free to sit anywhere.
const PREFERRED_ORDER: CvSection[] = ['personal', 'experience', 'skills', 'education'];

const filledEntries = <T extends Record<string, any>>(entries: T[], key: keyof T): T[] =>
  entries.filter((entry) => String(entry?.[key] ?? '').trim());

export const runCvChecks = (
  formData: BuilderFormData,
  sectionOrder: CvSection[],
  pageCount: number,
  fontScale: number,
): CvCheck[] => {
  const checks: CvCheck[] = [];
  const personal = formData.personalInfo;
  const experience = filledEntries(formData.experience, 'jobTitle');
  const bullets = experience.flatMap((job) => bulletLines(job.description || ''));

  if (fontScale < MIN_READABLE_FONT_SCALE) {
    checks.push({
      id: 'font-too-small',
      section: 'personal',
      severity: 'warning',
      message: 'Your text is under 9pt. Recruiters skim — cut a bullet instead of shrinking the font.',
    });
  }

  if (pageCount > MAX_PAGES) {
    checks.push({
      id: 'too-many-pages',
      section: 'experience',
      severity: 'warning',
      message: 'Your CV is {{pages}} pages. Keep it to 1–2 by trimming the oldest or least relevant roles.',
      values: { pages: pageCount },
    });
  }

  if (!personal.email.trim() || !personal.phone.trim()) {
    checks.push({
      id: 'missing-contact',
      section: 'personal',
      severity: 'warning',
      message: 'Add both an email and a phone number so recruiters can reach you.',
    });
  }

  const summaryWords = personal.ProfessionalSummary.trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords < MIN_SUMMARY_WORDS) {
    checks.push({
      id: 'summary-too-short',
      section: 'personal',
      severity: 'tip',
      message: 'Your summary is {{words}} words. Aim for {{target}}+ covering your role, years, and strongest result.',
      values: { words: summaryWords, target: MIN_SUMMARY_WORDS },
    });
  }

  const orderInCv = PREFERRED_ORDER.filter((section) => sectionOrder.includes(section))
    .sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));
  const followsPreferredOrder = orderInCv.every(
    (section, index) => section === PREFERRED_ORDER[index],
  );
  if (!followsPreferredOrder) {
    checks.push({
      id: 'section-order',
      section: 'experience',
      severity: 'tip',
      message: 'Drag your sections into Summary → Experience → Skills → Education. That is the order ATS parsers expect.',
    });
  }

  if (formData.skills.skills.length < MIN_SKILLS) {
    checks.push({
      id: 'too-few-skills',
      section: 'skills',
      severity: 'tip',
      message: 'You listed {{count}} skills. {{target}}+ gives keyword matching something to work with.',
      values: { count: formData.skills.skills.length, target: MIN_SKILLS },
    });
  }

  if (bullets.length > 0 && !bullets.some((bullet) => /\d/.test(bullet))) {
    checks.push({
      id: 'no-numbers',
      section: 'experience',
      severity: 'tip',
      message: 'No bullet has a number in it. Add scale or results — team size, %, revenue, time saved.',
    });
  }

  const weakBullets = bullets.filter((bullet) => !ACTION_VERB.test(bullet)).length;
  if (weakBullets > 0) {
    checks.push({
      id: 'weak-verbs',
      section: 'experience',
      severity: 'tip',
      message: '{{count}} of your bullets do not start with an action verb (Built, Led, Reduced…).',
      values: { count: weakBullets },
    });
  }

  return checks;
};
