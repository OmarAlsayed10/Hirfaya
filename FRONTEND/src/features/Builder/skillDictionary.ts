// Curated, deterministic skill dictionary. Matching is case-insensitive and token-aware so
// "C++", "C#", "Node.js" and ".NET" match as whole tokens, not inside other words.
// Extend freely — this is data, not logic.
export const SKILL_DICTIONARY: string[] = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Rust', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'Scala', 'Dart', 'Elixir', 'Haskell', 'Perl', 'R', 'MATLAB', 'SQL', 'Bash',
  // Frontend
  'React', 'Next.js', 'Vue', 'Nuxt', 'Angular', 'Svelte', 'Redux', 'HTML', 'CSS', 'Sass', 'SCSS',
  'Tailwind', 'Bootstrap', 'Material UI', 'jQuery', 'Webpack', 'Vite', 'Three.js', 'D3.js',
  // Backend
  'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', '.NET',
  'Laravel', 'Rails', 'GraphQL', 'REST', 'gRPC', 'Prisma', 'Sequelize', 'Hibernate',
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Cassandra', 'DynamoDB',
  'Elasticsearch', 'Firebase', 'Supabase',
  // Cloud / DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
  'GitLab CI', 'CI/CD', 'Nginx', 'Linux', 'Git', 'Vercel', 'Netlify', 'Cloudflare',
  // Data / ML
  'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'Spark', 'Hadoop', 'Kafka',
  'Airflow', 'Tableau', 'Power BI', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  // Mobile
  'React Native', 'Flutter', 'Android', 'iOS', 'Xamarin',
  // Practices / tools
  'Agile', 'Scrum', 'Kanban', 'Jira', 'Figma', 'Photoshop', 'Illustrator', 'Jest', 'Cypress',
  'Playwright', 'Selenium', 'Postman', 'Microservices', 'TDD', 'OOP', 'Testing',
];

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Precompiled matchers. Token boundaries exclude letters, digits, and the symbols that are part
// of skill tokens (+ # . -) so "C" won't match inside "CSS" and "C++" matches exactly.
const MATCHERS: { skill: string; re: RegExp }[] = SKILL_DICTIONARY.map((skill) => ({
  skill,
  re: new RegExp(`(?<![a-z0-9+#.\\-])${escapeRegex(skill.toLowerCase())}(?![a-z0-9+#.\\-])`, 'i'),
}));

// Returns the canonical skills found in the given free text (deduped, original casing).
export const extractSkills = (text: string): string[] => {
  if (!text || text.trim().length < 2) return [];
  const hay = text.toLowerCase();
  const found: string[] = [];
  for (const { skill, re } of MATCHERS) {
    if (re.test(hay)) found.push(skill);
  }
  return found;
};
