import axios, { AxiosRequestConfig } from "axios";
import { GitHostError } from "./gitHostError";

const API_ROOT = "https://gitlab.com/api/v4";
const REQUEST_TIMEOUT = 8000;

const authHeaders = (token?: string) => {
  const resolved = token || process.env.GITLAB_TOKEN;
  return resolved ? { "PRIVATE-TOKEN": resolved } : {};
};

export async function gitlabGet<T>(
  path: string,
  token?: string,
  config: AxiosRequestConfig = {},
): Promise<{ data: T; total: number | null }> {
  try {
    const response = await axios.get<T>(`${API_ROOT}${path}`, {
      timeout: REQUEST_TIMEOUT,
      ...config,
      headers: { ...authHeaders(token), ...config.headers },
    });
    const totalHeader = response.headers?.["x-total"];
    return { data: response.data, total: totalHeader ? Number(totalHeader) : null };
  } catch (error: any) {
    const status = error?.response?.status ?? 0;
    if (status === 404) throw new GitHostError(404, "Repository not found or not accessible.");
    if (status === 401 || status === 403) {
      throw new GitHostError(status, "GitLab denied access to this repository.");
    }
    if (status === 429) {
      throw new GitHostError(429, "GitLab rate limit reached. Connect a GitLab account to raise the limit.");
    }
    throw new GitHostError(status, error?.message || "GitLab request failed.");
  }
}

export function parseGitlabRepoUrl(urlStr: string): { owner: string; repo: string } | null {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    return null;
  }
  if (!url.hostname.toLowerCase().includes("gitlab.com")) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  const trimmed = parts[parts.length - 1] === "-" ? parts.slice(0, -1) : parts;
  if (trimmed.length < 2) return null;

  return {
    owner: trimmed.slice(0, -1).join("/"),
    repo: trimmed[trimmed.length - 1].replace(/\.git$/i, ""),
  };
}

export const gitlabProjectId = (owner: string, repo: string): string =>
  encodeURIComponent(`${owner}/${repo}`);
