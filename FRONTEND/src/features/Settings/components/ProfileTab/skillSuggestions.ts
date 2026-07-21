const ROLE_SKILLS: { match: RegExp; skills: string[] }[] = [
  { match: /full[\s-]?stack/i, skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST', 'Docker'] },
  { match: /front|react|angular|vue|\bui\b|web/i, skills: ['React', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'Redux'] },
  { match: /back|api|server|node|django|laravel|spring/i, skills: ['Node.js', 'Express', 'PostgreSQL', 'REST', 'Docker', 'Redis'] },
  { match: /data|analyst|scien|\bml\b|machine learning/i, skills: ['Python', 'SQL', 'Pandas', 'Excel', 'Power BI', 'TensorFlow'] },
  { match: /devops|cloud|infra|sre/i, skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux'] },
  { match: /mobile|android|ios|flutter|react native/i, skills: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'Firebase'] },
  { match: /market/i, skills: ['SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Copywriting'] },
  { match: /design|\bux\b|graphic/i, skills: ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'Photoshop'] },
  { match: /account|financ|audit/i, skills: ['Excel', 'QuickBooks', 'Financial Analysis', 'Bookkeeping', 'SAP'] },
  { match: /product manager|\bpm\b|product owner/i, skills: ['Roadmapping', 'Agile', 'Jira', 'Stakeholder Management', 'Analytics'] },
  { match: /support|customer/i, skills: ['Communication', 'CRM', 'Zendesk', 'Problem Solving'] },
];

// Skills relevant to a professional title, minus ones the user already has.
export const suggestSkills = (title: string, exclude: string[]): string[] => {
  if (!title.trim()) return [];
  const have = new Set(exclude.map((s) => s.toLowerCase()));
  const out: string[] = [];
  for (const { match, skills } of ROLE_SKILLS) {
    if (!match.test(title)) continue;
    for (const s of skills) {
      const key = s.toLowerCase();
      if (have.has(key) || out.some((o) => o.toLowerCase() === key)) continue;
      out.push(s);
    }
  }
  return out.slice(0, 12);
};
