import {
  ScoreCategory,
  ObjectiveDiagnostic,
  STD_HEADINGS,
  PRIMARY_SECTION_ORDER,
  pctClamp,
  SHOULD_DEBUG_CV_SCORING,
  ACTION_VERB,
  BULLET_LABEL,
  KEYWORD_SECTION,
} from "./constants";
import { Language } from "../../lib/aiLanguage";
import {
  trimmedLines,
  detectPrimarySectionOrder,
  suspiciousColumnLines,
  bulletStyleDetails,
  detectDateStyles,
  experienceSection,
  projectsSection,
  experienceBullets,
  summarySection,
  skillTokens,
  keywordTokens,
} from "./textParse";

export function atsCompatibilityObjective(
  text: string,
  language: Language = "en",
  pageCount = 0,
): ObjectiveDiagnostic {
  const isArabic = language === "ar";
  const lines = trimmedLines(text);
  const exactHeadingLines = lines.filter((line) =>
    STD_HEADINGS.some((heading) =>
      new RegExp(`^\\s*${heading}\\s*:?\\s*$`, "i").test(line),
    ),
  );
  const sectionOrder = detectPrimarySectionOrder(text);
  const foundPrimaryHeadings = PRIMARY_SECTION_ORDER.filter((section) =>
    sectionOrder.includes(section),
  );
  const multiColumnSignals = suspiciousColumnLines(text);

  let earned = foundPrimaryHeadings.length * 2;
  earned += Math.min(4, exactHeadingLines.length);

  if (multiColumnSignals.length === 0) earned += 8;
  else if (multiColumnSignals.length === 1) earned += 4;

  const details: string[] = [];
  if (foundPrimaryHeadings.length < PRIMARY_SECTION_ORDER.length) {
    const missing = PRIMARY_SECTION_ORDER.filter(
      (section) => !foundPrimaryHeadings.includes(section),
    );
    details.push(
      isArabic
        ? `استخدم عناوين أقسام قياسية لـ: ${missing.join("، ")}`
        : `Use standard heading lines for: ${missing.join(", ")}`,
    );
  }
  if (multiColumnSignals.length > 0) {
    details.push(
      isArabic
        ? "تجنّب علامات التخطيط متعدد الأعمدة مثل المسافات الجدولية أو الخطوط الرأسية المتكررة"
        : "Avoid table-like multi-column layout markers such as tabs or repeated vertical bars",
    );
  }
  // A long CV is still analysed in full; length is reported as advice, not a gate.
  if (pageCount > 2) {
    details.push(
      isArabic
        ? `سيرتك الذاتية ${pageCount} صفحات. اختصرها إلى صفحة أو صفحتين بإبقاء آخر 10–15 سنة من الخبرة والنتائج الأكثر صلة بالوظيفة المستهدفة.`
        : `Your CV is ${pageCount} pages. Cut it to 1–2 pages by keeping the last 10–15 years of experience and the results most relevant to the target role.`,
    );
  }

  const score = pctClamp(earned, 20);
  const checks = {
    exactHeadingLines,
    foundPrimaryHeadings,
    sectionOrder,
    suspiciousColumnLines: multiColumnSignals,
  };

  if (SHOULD_DEBUG_CV_SCORING) {
    console.log("[cv-score] ats compatibility debug", { score, ...checks });
  }

  return { score, details, checks };
}

export function formattingLayoutObjective(
  text: string,
  language: Language = "en",
): ObjectiveDiagnostic {
  const isArabic = language === "ar";
  const sectionOrder = detectPrimarySectionOrder(text);
  const bulletDetails = bulletStyleDetails(text);
  const dateStyles = detectDateStyles(text);
  const matchesPreferredOrder =
    sectionOrder.length >= 3 &&
    sectionOrder.every(
      (section, index) =>
        PRIMARY_SECTION_ORDER.indexOf(section) ===
        PRIMARY_SECTION_ORDER.indexOf(sectionOrder[index]),
    ) &&
    sectionOrder.every((section, index) =>
      index === 0
        ? true
        : PRIMARY_SECTION_ORDER.indexOf(sectionOrder[index - 1]) <
          PRIMARY_SECTION_ORDER.indexOf(section),
    );

  let earned = matchesPreferredOrder
    ? 8
    : Math.max(0, sectionOrder.length * 2 - 2);

  if (bulletDetails.bulletCount === 0) earned += 3;
  else if (bulletDetails.styles.length === 1) earned += 6;
  else earned += 1;

  if (dateStyles.length === 0) earned += 0;
  else if (dateStyles.length === 1) earned += 6;
  else if (dateStyles.length === 2) earned += 3;
  else earned += 1;

  const details: string[] = [];
  if (!matchesPreferredOrder) {
    details.push(
      isArabic
        ? "رتّب الأقسام الرئيسية كالتالي: Summary ← Experience ← Skills ← Education"
        : "Order major sections as Summary → Experience → Skills → Education",
    );
  }
  if (bulletDetails.styles.length > 1) {
    details.push(
      isArabic
        ? "استخدم نمط نقاط موحدًا في كامل السيرة الذاتية"
        : "Use one consistent bullet style throughout",
    );
  }
  if (dateStyles.length === 0) {
    details.push(
      isArabic
        ? "استخدم تنسيق تاريخ موحدًا في الوظائف والتعليم"
        : "Use a consistent date format on roles and education",
    );
  } else if (dateStyles.length > 1) {
    details.push(
      isArabic
        ? `استخدم تنسيق تاريخ واحدًا باستمرار؛ وجدنا: ${dateStyles.join("، ")}`
        : `Use one date format consistently; found: ${dateStyles.join(", ")}`,
    );
  }

  const score = pctClamp(earned, 20);
  const checks = {
    sectionOrder,
    expectedOrder: [...PRIMARY_SECTION_ORDER],
    matchesPreferredOrder,
    bulletStyles: bulletDetails.styles,
    standaloneBulletMarkers: bulletDetails.standaloneMarkers,
    bulletCount: bulletDetails.bulletCount,
    dateStyles,
  };

  if (SHOULD_DEBUG_CV_SCORING) {
    console.log("[cv-score] formatting layout debug", { score, ...checks });
  }

  return { score, details, checks };
}

// ─── Objective, deterministic scoring — same CV always yields the same points ───

export function scoreContact(
  text: string,
  language: Language = "en",
): ScoreCategory {
  const isArabic = language === "ar";
  let earned = 0;
  const missing: string[] = [];
  if (/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(text)) earned += 3;
  else missing.push(isArabic ? "بريد إلكتروني احترافي" : "professional email");
  if (/(\+?\d[\d\s\-()/.]{6,}\d)/.test(text)) earned += 2;
  else missing.push(isArabic ? "رقم هاتف" : "phone number");
  if (/linkedin/i.test(text)) earned += 3;
  else missing.push(isArabic ? "رابط LinkedIn" : "LinkedIn URL");
  if (
    /\b([A-Z][a-z]+,\s*[A-Z][a-z]+|remote|[A-Z][a-z]+\s+[A-Z]{2}\b)/.test(
      text,
    ) ||
    /\b(city|country|egypt|cairo|usa|uk|uae|remote)\b/i.test(text)
  )
    earned += 2;
  else missing.push(isArabic ? "الموقع الجغرافي" : "location");
  return {
    name: "Contact Info",
    earned: Math.min(10, earned),
    max: 10,
    tip: missing.length
      ? isArabic
        ? `أضف: ${missing.join("، ")}`
        : `Add: ${missing.join(", ")}`
      : null,
    blocker: missing.length ? "content" : null,
  };
}

export function scoreEducation(
  text: string,
  language: Language = "en",
): ScoreCategory {
  const isArabic = language === "ar";
  let earned = 0;
  const tips: string[] = [];
  if (/\b(education|academic|qualifications?)\b/i.test(text)) earned += 4;
  else tips.push(isArabic ? "أضف قسم Education" : "add an Education section");
  if (
    /\b(bachelor|master|phd|bsc|msc|mba|diploma|degree|university|college|institute)\b/i.test(
      text,
    )
  )
    earned += 4;
  else
    tips.push(
      isArabic ? "اذكر الدرجة العلمية والجامعة" : "name the degree/institution",
    );
  if (/\b(19|20)\d{2}\b/.test(text)) earned += 2;
  else tips.push(isArabic ? "أضف سنة التخرج" : "add graduation year");
  return {
    name: "Education",
    earned: Math.min(10, earned),
    max: 10,
    tip: tips.length ? tips.join(" · ") : null,
    blocker: tips.length ? "content" : null,
  };
}

export function scoreATSFormatting(
  text: string,
  language: Language = "en",
): ScoreCategory {
  const ats = atsCompatibilityObjective(text, language);
  return {
    name: "ATS Formatting",
    earned: Math.max(0, Math.min(10, Math.round(ats.score / 10))),
    max: 10,
    tip: ats.details.length ? ats.details.join(" · ") : null,
    blocker: ats.details.length ? "content" : null,
  };
}

export function experienceObjective(
  text: string,
  language: Language = "en",
): {
  base: number;
  metric: number;
  verb: number;
  tips: string[];
  bulletCount: number;
  unquantified: number;
  noVerb: number;
} {
  const isArabic = language === "ar";
  const tips: string[] = [];
  let base = 0;
  // Projects/internships count as experience — fair for entry-level candidates.
  if (
    /\b(experience|employment|work history|career|projects?|internship)\b/i.test(
      text,
    )
  )
    base += 3;
  else tips.push("add a Work Experience or Projects section");
  if ((text.match(/\b(19|20)\d{2}\b/g) || []).length >= 2) base += 2;
  else tips.push("add dates to your roles or projects");

  // Extract work experience section and projects section to avoid diluting ratios
  const expBlock = experienceSection(text);
  const projBlock = projectsSection(text);

  const combinedBlocks = `${expBlock}\n${projBlock}`.trim();

  const bullets = experienceBullets(combinedBlocks || text);
  const hasVerb = (l: string) => ACTION_VERB.test(l.replace(BULLET_LABEL, ""));

  const metricRatio = bullets.length
    ? bullets.filter((l) => /\d/.test(l)).length / bullets.length
    : 0;
  const verbRatio = bullets.length
    ? bullets.filter(hasVerb).length / bullets.length
    : 0;
  const metric = Math.round(metricRatio * 10);
  const verb = Math.round(verbRatio * 5);

  if (SHOULD_DEBUG_CV_SCORING) {
    console.log("[cv-score] impact scoring debug", {
      experienceBlockPreview: expBlock.slice(0, 1500),
      projectsBlockPreview: projBlock.slice(0, 1500),
      combinedBlockLength: combinedBlocks.length,
      bulletCount: bullets.length,
      bullets,
      metricRatio,
      verbRatio,
      metric,
      verb,
    });
  }

  if (metricRatio < 0.5)
    tips.push(
      isArabic
        ? "أضف أرقامًا أو نسبًا مئوية لعدد أكبر من النقاط"
        : "quantify more bullets with numbers/percentages",
    );
  if (verbRatio < 0.6)
    tips.push(
      isArabic
        ? "ابدأ النقاط بأفعال إنجاز (قاد، بنى، حسّن)"
        : "start bullets with action verbs (led, built, improved)",
    );
  const unquantified = bullets.filter((l) => !/\d/.test(l)).length;
  const noVerb = bullets.filter((l) => !hasVerb(l)).length;
  return {
    base,
    metric,
    verb,
    tips,
    bulletCount: bullets.length,
    unquantified,
    noVerb,
  };
}

export function contentQualityObjective(
  text: string,
  exp: ReturnType<typeof experienceObjective>,
  language: Language = "en",
): ObjectiveDiagnostic {
  const isArabic = language === "ar";
  const gaps: string[] = [];
  let earned = 0;

  const summary = summarySection(text);
  if (summary) earned += 10;
  else
    gaps.push(
      isArabic
        ? "أضف قسم Professional Summary بالقرب من أعلى السيرة الذاتية."
        : "Add a Professional Summary section near the top.",
    );
  if (/\d/.test(summary)) earned += 10;
  else if (summary)
    gaps.push(
      isArabic
        ? "أضف نتيجة قابلة للقياس إلى الملخص (نسبة مئوية أو عدد أو مبلغ)."
        : "Add a quantified result to your summary (a %, count, or $ figure).",
    );
  if (summary.split(/\s+/).filter(Boolean).length >= 20) earned += 5;
  else if (summary)
    gaps.push(
      isArabic
        ? "وسّع الملخص ليصبح جملتين إلى ثلاث جمل توضّح موقعك المهني."
        : "Expand the summary to 2–3 sentences of positioning.",
    );

  const metricRatio = exp.bulletCount ? 1 - exp.unquantified / exp.bulletCount : 0;
  const verbRatio = exp.bulletCount ? 1 - exp.noVerb / exp.bulletCount : 0;
  earned += Math.round(metricRatio * 30 + verbRatio * 20);
  if (exp.unquantified > 0)
    gaps.push(
      isArabic
        ? `أضف أرقامًا إلى ${exp.unquantified} من نقاط الخبرة/المشاريع التي لا تحتوي على أي رقم.`
        : `Quantify ${exp.unquantified} experience/project bullet${exp.unquantified === 1 ? "" : "s"} with no number.`,
    );
  if (exp.noVerb > 0)
    gaps.push(
      isArabic
        ? `ابدأ ${exp.noVerb} من النقاط بفعل إنجاز (بنى، قاد، خفّض).`
        : `Start ${exp.noVerb} bullet${exp.noVerb === 1 ? "" : "s"} with an action verb (Built, Led, Reduced).`,
    );

  const skills = skillTokens(text);
  if (skills.length > 0) earned += 10;
  else
    gaps.push(
      isArabic
        ? "أضف قسم Skills يعرض أدواتك الأساسية."
        : "Add a Skills section listing your core tools.",
    );
  if (skills.length >= 8) earned += 15;
  else if (skills.length > 0)
    gaps.push(
      isArabic
        ? `اذكر 8 مهارات على الأقل (وجدنا ${skills.length}).`
        : `List at least 8 skills (found ${skills.length}).`,
    );

  return { score: Math.min(100, earned), details: gaps, checks: {} };
}

export function keywordMatchObjective(
  text: string,
  language: Language = "en",
): ObjectiveDiagnostic {
  const isArabic = language === "ar";
  const gaps: string[] = [];
  let earned = 0;

  const hasSkills = KEYWORD_SECTION.test(text);
  if (hasSkills) earned += 40;
  else
    gaps.push(
      isArabic
        ? "أضف قسم Skills يعرض أدواتك وتقنياتك الأساسية."
        : "Add a Skills section listing your core tools and technologies.",
    );

  const distinct = keywordTokens(text);
  earned += Math.min(60, Math.round((distinct.size / 15) * 60));
  if (distinct.size < 15)
    gaps.push(
      isArabic
        ? `اذكر مزيدًا من المهارات أو الأدوات أو الشهادات المرتبطة بالوظيفة (وجدنا ${distinct.size}، استهدف 15+).`
        : `List more role-relevant skills, tools, or certifications (found ${distinct.size}, aim for 15+).`,
    );

  return { score: Math.min(100, earned), details: gaps, checks: {} };
}
