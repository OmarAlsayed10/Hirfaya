export const cvToText = (cv: any): string => {
  const personal = cv.personalInfo || {};
  const experience = Array.isArray(cv.experience) ? cv.experience : [];
  const education = Array.isArray(cv.education) ? cv.education : [];
  const skills = cv.skills || {};
  const lines: string[] = [];

  lines.push([personal.firstName, personal.lastName].filter(Boolean).join(" "));
  if (personal.professionalTitle) lines.push(personal.professionalTitle);
  lines.push([personal.email, personal.phone, personal.city, personal.country].filter(Boolean).join(" | "));
  if (personal.ProfessionalSummary) lines.push(`\nSUMMARY\n${personal.ProfessionalSummary}`);

  if (experience.length) {
    lines.push("\nEXPERIENCE");
    experience.forEach((entry: any) => lines.push(
      [entry.jobTitle, entry.company, [entry.startDate, entry.endDate].filter(Boolean).join(" - ")]
        .filter(Boolean).join(" | ") + (entry.description ? `\n${entry.description}` : ""),
    ));
  }
  if (education.length) {
    lines.push("\nEDUCATION");
    education.forEach((entry: any) => lines.push(
      [entry.degree, entry.school, entry.fieldOfStudy, [entry.startDate, entry.endDate].filter(Boolean).join(" - ")]
        .filter(Boolean).join(" | "),
    ));
  }

  const skillList = Array.isArray(skills.skills) ? skills.skills : [];
  if (skillList.length) lines.push(`\nSKILLS\n${skillList.join(", ")}`);
  if (skills.languages) lines.push(`LANGUAGES\n${Array.isArray(skills.languages) ? skills.languages.join(", ") : skills.languages}`);
  if (skills.certifications) lines.push(`CERTIFICATIONS\n${Array.isArray(skills.certifications) ? skills.certifications.join(", ") : skills.certifications}`);
  return lines.filter(Boolean).join("\n");
};