import { z } from "zod";
import prisma from "../lib/prisma";
import { MODELS, groqChat } from "../lib/groqChat";
import { parseAiResponse } from "../lib/aiResponseValidation";

export const skillRoadmapSchema = z.object({
  skill: z.string().min(1),
  skillKey: z.string().min(1),
  category: z.string().default("skill"),
  officialDocs: z.object({ title: z.string(), url: z.string().url() }).nullable(),
  playground: z.object({ title: z.string(), url: z.string().url() }).nullable(),
  projectIdeas: z.array(z.string().min(1)).min(1).max(5),
  courseLinks: z.array(z.object({ title: z.string(), url: z.string().url() })).max(4),
});

export type SkillRoadmapData = z.infer<typeof skillRoadmapSchema>;

const SKILL_ALIASES: Record<string, string> = {
  postgres: "postgresql",
  postgresql: "postgresql",
  "postgre-sql": "postgresql",
  "postgres-database": "postgresql",
  "postgresql-database": "postgresql",
  "postgres-db": "postgresql",
  "postgres-sql": "postgresql",
  "relational-database-postgresql": "postgresql",
  "relational-database": "postgresql",
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  react: "react",
  reactjs: "react",
  "react-js": "react",
  node: "nodejs",
  nodejs: "nodejs",
  "node-js": "nodejs",
  next: "nextjs",
  nextjs: "nextjs",
  "next-js": "nextjs",
  docker: "docker",
  k8s: "kubernetes",
  kubernetes: "kubernetes",
};

export function normalizeSkillKey(skillName: string): string {
  if (!skillName || typeof skillName !== "string") return "";
  const baseKey = skillName
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  if (SKILL_ALIASES[baseKey]) return SKILL_ALIASES[baseKey];

  // Postgres always maps regardless of compound suffix (pgvector, pg-sql, etc.)
  if (/postgres|pg-sql|pg-vector|postgre/i.test(baseKey)) return "postgresql";

  // For all other prefix-based aliases, only apply to single-token keys
  // (no hyphen) to avoid collapsing compound names like "react-next-js" → "react"
  const isSingleToken = !baseKey.includes("-");
  if (isSingleToken) {
    if (/^react/i.test(baseKey)) return "react";
    if (/^node/i.test(baseKey)) return "nodejs";
    if (/^next/i.test(baseKey)) return "nextjs";
    if (/^vue/i.test(baseKey)) return "vuejs";
    if (/^express/i.test(baseKey)) return "expressjs";
    if (/^docker/i.test(baseKey)) return "docker";
    if (/^kubernetes|^k8s/i.test(baseKey)) return "kubernetes";
    if (/^ts$|^typescript/i.test(baseKey)) return "typescript";
    if (/^js$|^javascript/i.test(baseKey)) return "javascript";
    if (/^python/i.test(baseKey)) return "python";
    if (/^mongo/i.test(baseKey)) return "mongodb";
  }

  return baseKey;
}

export function extractCoreSkillQuery(skillName: string): string {
  if (!skillName || typeof skillName !== "string") return "technology";
  let cleaned = skillName
    .replace(/^(experience with|knowledge of|proficiency in|strong background in|hands-on experience with|ability to|understanding of|familiarity with|working knowledge of|expert in|skills in|demonstrated experience with)\s+/i, "")
    .replace(/\s+(on the|in the|for the|with|and|or)\s+(frontend|backend|data layer|fullstack|stack|system|application|environment|infrastructure|team|role|project).*$/i, "")
    .trim();

  if (!cleaned || cleaned.length > 50) {
    const words = skillName.replace(/[^\w\s#+.-]/g, "").split(/\s+/).filter(w => w.length > 2);
    cleaned = words.slice(0, 4).join(" ");
  }
  return cleaned || skillName.trim().slice(0, 40);
}

function fallbackUrl(skillName: string, type: "docs" | "course" | "playground"): string {
  const query = extractCoreSkillQuery(skillName);
  if (type === "docs") {
    return `https://www.google.com/search?q=${encodeURIComponent(query + " official documentation guide")}`;
  }
  if (type === "playground") {
    return `https://github.com/search?q=${encodeURIComponent(query + " starter playground sandbox")}&type=repositories`;
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " tutorial course 2026")}`;
}

function sanitizeUrl(rawUrl: string, skillName: string, type: "docs" | "course" | "playground"): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return fallbackUrl(skillName, type);
  }

  const query = extractCoreSkillQuery(skillName);

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    // Direct search/query pages are always valid
    if (parsed.searchParams.has("q") || parsed.searchParams.has("query") || parsed.searchParams.has("search_query")) {
      return rawUrl;
    }

    // Exact top documentation & sandbox home/root sites with reliable structure
    const exactValidPrefixes = [
      "https://docs.docker.com",
      "https://kubernetes.io/docs",
      "https://react.dev",
      "https://www.typescriptlang.org",
      "https://typescriptlang.org",
      "https://www.postgresql.org/docs",
      "https://postgresql.org/docs",
      "https://developer.mozilla.org",
      "https://nextjs.org/docs",
      "https://prisma.io/docs",
      "https://www.prisma.io/docs",
      "https://labs.play-with-docker.com",
      "https://stackblitz.com",
      "https://killercoda.com",
      "https://db-fiddle.com",
      "https://codesandbox.io",
    ];

    if (exactValidPrefixes.some(prefix => rawUrl.startsWith(prefix))) {
      return rawUrl;
    }

    // Replace unverified AI-invented subpaths with direct working search destinations on major platforms
    if (host.includes("coursera.org")) {
      return `https://www.coursera.org/search?query=${encodeURIComponent(query)}`;
    }
    if (host.includes("github.com")) {
      return `https://github.com/search?q=${encodeURIComponent(query + " starter playground")}&type=repositories`;
    }
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " tutorial course 2026")}`;
    }
    if (host.includes("freecodecamp.org")) {
      return `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(query)}`;
    }
  } catch {
    // Ignore invalid URL parsing
  }

  return fallbackUrl(skillName, type);
}

// Curated fallbacks for top common skills to guarantee instant high-quality data
const STATIC_ROADMAPS: Record<string, Omit<SkillRoadmapData, "skillKey">> = {
  docker: {
    skill: "Docker",
    category: "skill",
    officialDocs: { title: "Docker Docs", url: "https://docs.docker.com/get-started/" },
    playground: { title: "Play with Docker (Interactive Sandbox)", url: "https://labs.play-with-docker.com/" },
    projectIdeas: [
      "Containerize a Node.js REST API with a multi-stage Dockerfile",
      "Set up local full-stack dev env using Docker Compose (App + Postgres + Redis)",
      "Publish your custom container image to Docker Hub with GitHub Actions",
    ],
    courseLinks: [
      { title: "FreeCodeCamp Docker Course", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo" },
      { title: "Docker Guides & Tutorials", url: "https://docs.docker.com/get-started/" },
    ],
  },
  kubernetes: {
    skill: "Kubernetes",
    category: "skill",
    officialDocs: { title: "Kubernetes Basics & Tutorials", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
    playground: { title: "Killercoda Kubernetes Playground", url: "https://killercoda.com/playgrounds/scenario/kubernetes" },
    projectIdeas: [
      "Deploy a stateless web service with 3 replicas using K8s Deployments & Services",
      "Configure ConfigMaps and Secrets to pass configuration dynamically",
      "Set up Minikube locally and define an Ingress controller",
    ],
    courseLinks: [
      { title: "Kubernetes Official Tutorials", url: "https://kubernetes.io/docs/tutorials/" },
    ],
  },
  react: {
    skill: "React",
    category: "skill",
    officialDocs: { title: "React Documentation & Quick Start", url: "https://react.dev/learn" },
    playground: { title: "StackBlitz React Playground", url: "https://stackblitz.com/fork/react-ts" },
    projectIdeas: [
      "Build an interactive dashboard with custom hooks and state management",
      "Create a reusable component UI kit using TypeScript and Material UI or Tailwind",
    ],
    courseLinks: [
      { title: "React.dev Interactive Learn Guide", url: "https://react.dev/learn" },
    ],
  },
  typescript: {
    skill: "TypeScript",
    category: "skill",
    officialDocs: { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
    playground: { title: "TypeScript Official Playground", url: "https://www.typescriptlang.org/play" },
    projectIdeas: [
      "Migrate a JavaScript utility library to strict mode TypeScript",
      "Build a type-safe API client with generic interfaces and Zod validation",
    ],
    courseLinks: [
      { title: "TypeScript Official Docs", url: "https://www.typescriptlang.org/docs/" },
    ],
  },
  postgresql: {
    skill: "PostgreSQL",
    category: "skill",
    officialDocs: { title: "PostgreSQL Official Documentation", url: "https://www.postgresql.org/docs/current/tutorial.html" },
    playground: { title: "DB-Fiddle Postgres Sandbox", url: "https://www.db-fiddle.com/" },
    projectIdeas: [
      "Design a relational database schema with foreign keys, indexes, and constraints",
      "Write complex SQL queries using JOINs, Window functions, and CTEs",
    ],
    courseLinks: [
      { title: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/" },
    ],
  },
  prisma: {
    skill: "Prisma ORM",
    category: "skill",
    officialDocs: { title: "Prisma Official Documentation", url: "https://www.prisma.io/docs" },
    playground: { title: "Prisma Playground & Examples", url: "https://github.com/prisma/prisma-examples" },
    projectIdeas: [
      "Define a multi-model relational schema with relations, indexes, and migrations in Prisma",
      "Build a type-safe Express or Next.js backend with Prisma Client queries",
    ],
    courseLinks: [
      { title: "Prisma Official Getting Started Guide", url: "https://www.prisma.io/docs/getting-started" },
    ],
  },
  nodejs: {
    skill: "Node.js & Express API Development",
    category: "skill",
    officialDocs: { title: "Node.js Official Documentation", url: "https://nodejs.org/en/docs/" },
    playground: { title: "StackBlitz Node.js Playground", url: "https://stackblitz.com/fork/node" },
    projectIdeas: [
      "Build a production-ready RESTful API with Express, TypeScript, and middleware validation",
      "Implement JWT authentication, rate limiting, and error handling",
    ],
    courseLinks: [
      { title: "FreeCodeCamp Node.js & Express Course", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" },
    ],
  },
  "ai-agents": {
    skill: "AI Agentic Systems & Engineering",
    category: "2026_market_trend",
    officialDocs: { title: "Groq & OpenAI AI API Documentation", url: "https://console.groq.com/docs/quickstart" },
    playground: { title: "Vercel AI SDK Playground", url: "https://sdk.vercel.ai/" },
    projectIdeas: [
      "Build an autonomous AI coding or research agent with function calling & tool use",
      "Implement RAG (Retrieval-Augmented Generation) using vector embeddings and PostgreSQL PgVector",
      "Build a multi-agent orchestration workflow using LangGraph or custom Express services",
    ],
    courseLinks: [
      { title: "FreeCodeCamp AI Agent Development Tutorial", url: "https://www.youtube.com/results?search_query=building+ai+agents+tutorial" },
      { title: "AI Engineering & LLM Architecture Guide", url: "https://www.google.com/search?q=AI+Engineering+Agentic+Systems+tutorial" },
    ],
  },
  "fullstack-nextjs": {
    skill: "Full-Stack Web Architecture (Next.js & Prisma)",
    category: "2026_market_trend",
    officialDocs: { title: "Next.js App Router Documentation", url: "https://nextjs.org/docs" },
    playground: { title: "StackBlitz Next.js Starter", url: "https://stackblitz.com/fork/nextjs" },
    projectIdeas: [
      "Build a full-stack SaaS application with Next.js App Router, Server Actions, and Prisma",
      "Implement JWT/OAuth authentication and real-time database queries",
    ],
    courseLinks: [
      { title: "Next.js Official Learn Course", url: "https://nextjs.org/learn" },
    ],
  },
};

export async function getOrGenerateSkillRoadmap(skillName: string, category: string = "skill"): Promise<SkillRoadmapData> {
  const skillKey = normalizeSkillKey(skillName);

  // 1. Check DB first (shared cached roadmap)
  try {
    const existing = await (prisma as any).skillRoadmap.findUnique({
      where: { skillKey },
    });
    if (existing) {
      return skillRoadmapSchema.parse({
        skill: existing.skill,
        skillKey: existing.skillKey,
        category: existing.category,
        officialDocs: existing.officialDocs,
        playground: existing.playground,
        projectIdeas: existing.projectIdeas,
        courseLinks: existing.courseLinks,
      });
    }
  } catch (err) {
    console.warn("DB lookup for skill roadmap failed, falling back:", err);
  }

  // 2. Check Static Curated Map if present (exact key or technology keyword match)
  let staticKey = skillKey;
  if (!STATIC_ROADMAPS[staticKey]) {
    const knownKeys = Object.keys(STATIC_ROADMAPS);
    const matchedKey = knownKeys.find(k => skillKey.includes(k));
    if (matchedKey) {
      staticKey = matchedKey;
    }
  }

  if (STATIC_ROADMAPS[staticKey]) {
    const staticData = { ...STATIC_ROADMAPS[staticKey], skillKey };
    try {
      await (prisma as any).skillRoadmap.upsert({
        where: { skillKey },
        create: staticData,
        update: staticData,
      });
    } catch (err) {
      console.warn("Failed to persist static roadmap to DB:", err);
    }
    return staticData;
  }

  // 3. Generate using AI if not found in DB or static list
  const coreQuery = extractCoreSkillQuery(skillName);
  const prompt = `You are a tech mentor creating a practical learning roadmap for a missing candidate skill or requirement: "${skillName}" (Core Technology: "${coreQuery}", category: "${category}").
Return JSON only in this exact format:
{
  "skill": "${coreQuery}",
  "officialDocs": { "title": "Official Docs / Guide Name", "url": "https://docs.domain.com/..." },
  "playground": { "title": "Interactive Sandbox / Playground Name", "url": "https://sandbox.com/..." },
  "projectIdeas": [
    "Practical project idea 1 that proves hands-on mastery for a resume",
    "Practical project idea 2 to test and publish"
  ],
  "courseLinks": [
    { "title": "High quality tutorial or video guide", "url": "https://youtube.com/..." }
  ]
}`;

  try {
    const response = await groqChat(
      {
        model: MODELS.versatile,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a career mentor. Return clean valid JSON adhering strictly to the requested schema." },
          { role: "user", content: prompt },
        ],
      },
      { fallback: false },
    );

    const rawContent = response.choices[0]?.message?.content || "";
    const parsedAi = parseAiResponse(rawContent, z.object({
      skill: z.string().default(skillName),
      officialDocs: z.object({ title: z.string(), url: z.string() }).nullable().optional(),
      playground: z.object({ title: z.string(), url: z.string() }).nullable().optional(),
      projectIdeas: z.array(z.string()).default([]),
      courseLinks: z.array(z.object({ title: z.string(), url: z.string() })).default([]),
    }));

    const projectIdeas = parsedAi.projectIdeas && parsedAi.projectIdeas.length > 0
      ? parsedAi.projectIdeas
      : [`Build a minimal demo project using ${skillName} and push it to GitHub.`];

    const officialDocs = parsedAi.officialDocs?.url
      ? { title: parsedAi.officialDocs.title, url: sanitizeUrl(parsedAi.officialDocs.url, skillName, "docs") }
      : { title: `${skillName} Official Documentation`, url: sanitizeUrl("", skillName, "docs") };

    const playground = parsedAi.playground?.url
      ? { title: parsedAi.playground.title, url: sanitizeUrl(parsedAi.playground.url, skillName, "playground") }
      : null;

    const courseLinks = (parsedAi.courseLinks || []).map(link => ({
      title: link.title,
      url: sanitizeUrl(link.url, skillName, "course"),
    }));

    if (courseLinks.length === 0) {
      courseLinks.push({
        title: `${skillName} 2026 Comprehensive Tutorial`,
        url: sanitizeUrl("", skillName, "course"),
      });
    }

    const result: SkillRoadmapData = {
      skill: parsedAi.skill || skillName,
      skillKey,
      category,
      officialDocs,
      playground,
      projectIdeas,
      courseLinks,
    };

    // Save to DB so future users immediately benefit
    try {
      await (prisma as any).skillRoadmap.upsert({
        where: { skillKey },
        create: result,
        update: result,
      });
    } catch (dbErr) {
      console.warn("Failed to cache AI skill roadmap to DB:", dbErr);
    }

    return result;
  } catch (aiErr) {
    console.error("AI Skill Roadmap generation failed, using fallback:", aiErr);
    const fallbackResult: SkillRoadmapData = {
      skill: skillName,
      skillKey,
      category,
      officialDocs: { title: `${skillName} Documentation Guide`, url: sanitizeUrl("", skillName, "docs") },
      playground: null,
      projectIdeas: [
        `Build a hands-on project demonstrating ${skillName} and add it to your GitHub portfolio.`,
        `Write a clear summary of your work with ${skillName} in your CV experience section.`,
      ],
      courseLinks: [
        { title: `${skillName} Full Tutorial (YouTube/Search)`, url: sanitizeUrl("", skillName, "course") },
      ],
    };
    return fallbackResult;
  }
}

export function get2026MarketTrendRecommendations(): SkillRoadmapData[] {
  return [
    {
      skill: "AI Agentic Systems & Autonomous Workflows",
      skillKey: "ai-agents",
      category: "2026_market_trend",
      officialDocs: STATIC_ROADMAPS["ai-agents"].officialDocs,
      playground: STATIC_ROADMAPS["ai-agents"].playground,
      projectIdeas: STATIC_ROADMAPS["ai-agents"].projectIdeas,
      courseLinks: STATIC_ROADMAPS["ai-agents"].courseLinks,
    },
    {
      skill: "Full-Stack Web Architecture (Next.js & Prisma)",
      skillKey: "fullstack-nextjs",
      category: "2026_market_trend",
      officialDocs: STATIC_ROADMAPS["fullstack-nextjs"].officialDocs,
      playground: STATIC_ROADMAPS["fullstack-nextjs"].playground,
      projectIdeas: STATIC_ROADMAPS["fullstack-nextjs"].projectIdeas,
      courseLinks: STATIC_ROADMAPS["fullstack-nextjs"].courseLinks,
    },
    {
      skill: "Docker & Cloud Native Containerization",
      skillKey: "docker",
      category: "2026_market_trend",
      officialDocs: STATIC_ROADMAPS["docker"].officialDocs,
      playground: STATIC_ROADMAPS["docker"].playground,
      projectIdeas: STATIC_ROADMAPS["docker"].projectIdeas,
      courseLinks: STATIC_ROADMAPS["docker"].courseLinks,
    },
  ];
}

export async function getUserSkillProgress(userId: string) {
  try {
    const list = await (prisma as any).userSkillProgress.findMany({
      where: { userId },
      include: { skillRoadmap: true },
      orderBy: { updatedAt: "desc" },
    });

    const seen = new Set<string>();
    const deduplicated: any[] = [];

    for (const item of list) {
      if (!item.skillRoadmap) continue;
      const canonicalKey = normalizeSkillKey(item.skillRoadmap.skillKey);
      if (!seen.has(canonicalKey)) {
        seen.add(canonicalKey);
        deduplicated.push({
          id: item.id,
          skillKey: canonicalKey,
          skill: item.skillRoadmap.skill,
          category: item.skillRoadmap.category,
          status: item.status,
          learnedAt: item.learnedAt,
          roadmap: {
            ...item.skillRoadmap,
            skillKey: canonicalKey,
          },
        });
      }
    }

    return deduplicated;
  } catch (err) {
    console.error("getUserSkillProgress error:", err);
    return [];
  }
}

export async function updateUserSkillProgress(userId: string, skillName: string, status: "in_progress" | "learned") {
  const roadmap = await getOrGenerateSkillRoadmap(skillName);
  const dbRoadmap = await (prisma as any).skillRoadmap.findUnique({ where: { skillKey: roadmap.skillKey } });
  if (!dbRoadmap) throw new Error("Could not find skill roadmap");

  const allUserProgress = await (prisma as any).userSkillProgress.findMany({
    where: { userId },
    include: { skillRoadmap: true },
    orderBy: { updatedAt: "desc" },
  });

  const matchingEntries = allUserProgress.filter((item: any) => {
    if (!item.skillRoadmap) return item.skillRoadmapId === dbRoadmap.id;
    return (
      normalizeSkillKey(item.skillRoadmap.skillKey) === roadmap.skillKey ||
      item.skillRoadmapId === dbRoadmap.id
    );
  });

  if (matchingEntries.length > 0) {
    const primary = matchingEntries[0];
    const updated = await (prisma as any).userSkillProgress.update({
      where: { id: primary.id },
      data: {
        skillRoadmapId: dbRoadmap.id,
        status,
        learnedAt: status === "learned" ? new Date() : null,
      },
    });

    if (matchingEntries.length > 1) {
      const duplicateIds = matchingEntries.slice(1).map((e: any) => e.id);
      await (prisma as any).userSkillProgress.deleteMany({
        where: { id: { in: duplicateIds } },
      });
    }

    return updated;
  } else {
    return await (prisma as any).userSkillProgress.create({
      data: {
        userId,
        skillRoadmapId: dbRoadmap.id,
        status,
        learnedAt: status === "learned" ? new Date() : null,
      },
    });
  }
}

export async function deleteUserSkillProgress(userId: string, skillName: string) {
  const roadmapKey = normalizeSkillKey(skillName);

  const allUserProgress = await (prisma as any).userSkillProgress.findMany({
    where: { userId },
    include: { skillRoadmap: true },
  });

  const matchingIds = allUserProgress
    .filter((item: any) => {
      if (!item.skillRoadmap) return false;
      const canonical = normalizeSkillKey(item.skillRoadmap.skillKey);
      return canonical === roadmapKey || normalizeSkillKey(item.skillRoadmap.skill) === roadmapKey;
    })
    .map((item: any) => item.id);

  if (matchingIds.length > 0) {
    await (prisma as any).userSkillProgress.deleteMany({
      where: { id: { in: matchingIds } },
    });
  }

  return { deletedCount: matchingIds.length };
}
