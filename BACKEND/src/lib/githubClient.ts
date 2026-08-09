import axios, { AxiosRequestConfig } from "axios";
import { GitHostError } from "./gitHostError";

const API_ROOT = "https://api.github.com";
const REQUEST_TIMEOUT = 8000;

const authHeaders = (token?: string) => {
  const resolved = token || process.env.GITHUB_TOKEN;
  return resolved ? { Authorization: `Bearer ${resolved}` } : {};
};

export async function githubGet<T>(
  path: string,
  token?: string,
  config: AxiosRequestConfig = {},
): Promise<{ data: T; linkHeader: string }> {
  try {
    const response = await axios.get<T>(`${API_ROOT}${path}`, {
      timeout: REQUEST_TIMEOUT,
      ...config,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...authHeaders(token),
        ...config.headers,
      },
    });
    return { data: response.data, linkHeader: String(response.headers?.link || "") };
  } catch (error: any) {
    const status = error?.response?.status ?? 0;
    if (status === 404) throw new GitHostError(404, "Repository not found or not accessible.");
    if (status === 401 || status === 403) {
      const remaining = error?.response?.headers?.["x-ratelimit-remaining"];
      throw new GitHostError(
        status,
        remaining === "0"
          ? "GitHub rate limit reached. Connect a GitHub account to raise the limit."
          : "GitHub denied access to this repository.",
      );
    }
    throw new GitHostError(status, error?.message || "GitHub request failed.");
  }
}

export function lastPageFromLinkHeader(linkHeader: string): number | null {
  const match = linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return match ? Number(match[1]) : null;
}

export function parseGithubRepoUrl(urlStr: string): { owner: string; repo: string } | null {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    return null;
  }
  if (!url.hostname.toLowerCase().includes("github.com")) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
}
