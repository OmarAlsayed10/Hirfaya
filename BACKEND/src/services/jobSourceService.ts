import axios from "axios";
import type { RawJob } from "./jobRadarService";

interface JobBoard {
  company: string;
  board: string;
}

interface XPost {
  id: string;
  text: string;
  author_id: string;
  created_at?: string;
}

interface XUser {
  id: string;
  name?: string;
  username?: string;
  location?: string;
}

export const configuredJobBoards = (value?: string): JobBoard[] =>
  (value ?? "")
    .split(",")
    .map((entry) => {
      const [company, ...boardParts] = entry.trim().split(":");
      return { company: company?.trim(), board: boardParts.join(":").trim() };
    })
    .filter((board): board is JobBoard => Boolean(board.company && board.board));

const fromGreenhouse = (company: string, job: any): RawJob => ({
  source: "greenhouse",
  externalId: company + ":" + job.id,
  title: job.title ?? "",
  company,
  location: job.location?.name ?? null,
  url: job.absolute_url ?? "",
  postedAt: job.updated_at ? new Date(job.updated_at) : null,
  description: job.content ?? "",
});

export async function fetchGreenhouseJobs(): Promise<RawJob[]> {
  const boards = configuredJobBoards(process.env.GREENHOUSE_BOARDS);
  const responses = await Promise.all(boards.map(async ({ company, board }) => {
    try {
      const { data } = await axios.get(
        "https://boards-api.greenhouse.io/v1/boards/" + encodeURIComponent(board) + "/jobs?content=true",
        { timeout: 15000 },
      );
      return (data.jobs ?? []).map((job: any) => fromGreenhouse(company, job));
    } catch (error) {
      console.error("[jobRadar] Greenhouse " + company + " fetch failed:", (error as Error).message);
      return [];
    }
  }));
  return responses.flat();
}

const fromLever = (company: string, job: any): RawJob => ({
  source: "lever",
  externalId: company + ":" + job.id,
  title: job.text ?? "",
  company,
  location: job.categories?.location ?? null,
  url: job.hostedUrl ?? "",
  postedAt: typeof job.createdAt === "number" ? new Date(job.createdAt) : null,
  description: job.descriptionPlain ?? job.description ?? "",
});

export async function fetchLeverJobs(): Promise<RawJob[]> {
  const boards = configuredJobBoards(process.env.LEVER_SITES);
  const responses = await Promise.all(boards.map(async ({ company, board }) => {
    try {
      const { data } = await axios.get(
        "https://api.lever.co/v0/postings/" + encodeURIComponent(board) + "?mode=json",
        { timeout: 15000 },
      );
      return Array.isArray(data) ? data.map((job: any) => fromLever(company, job)) : [];
    } catch (error) {
      console.error("[jobRadar] Lever " + company + " fetch failed:", (error as Error).message);
      return [];
    }
  }));
  return responses.flat();
}

const xJobQuery = '("we are hiring" OR "job opening" OR "\u0645\u0637\u0644\u0648\u0628" OR "\u0648\u0638\u0627\u0626\u0641" OR "\u0641\u0631\u0635\u0629 \u0639\u0645\u0644") has:links -is:retweet -is:reply';

export async function fetchXJobs(): Promise<RawJob[]> {
  const token = process.env.X_API_BEARER_TOKEN;
  if (!token) return [];
  try {
    const { data } = await axios.get("https://api.x.com/2/tweets/search/recent", {
      headers: { Authorization: "Bearer " + token },
      params: {
        query: xJobQuery,
        max_results: 100,
        "tweet.fields": "author_id,created_at",
        expansions: "author_id",
        "user.fields": "name,username,location",
      },
      timeout: 15000,
    });
    const authors = new Map<string, XUser>((data.includes?.users ?? []).map((user: XUser) => [user.id, user]));
    return (data.data ?? []).map((post: XPost): RawJob => {
      const author = authors.get(post.author_id);
      const title = post.text.split("\n")[0].trim().slice(0, 180);
      return {
        source: "x",
        externalId: post.id,
        title: title || "Job post on X",
        company: author?.name ?? author?.username ?? "X",
        location: author?.location ?? null,
        url: "https://x.com/" + (author?.username ?? "i") + "/status/" + post.id,
        postedAt: post.created_at ? new Date(post.created_at) : null,
        description: post.text,
      };
    });
  } catch (error) {
    console.error("[jobRadar] X fetch failed:", (error as Error).message);
    return [];
  }
}