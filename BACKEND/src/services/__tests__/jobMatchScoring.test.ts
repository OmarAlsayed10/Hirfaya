import { fitScore, Preference, RawJob } from "../jobMatchScoring";

const preference: Preference = {
  role: "frontend developer",
  level: "Senior",
  location: null,
  remote: false,
  keywords: "React TypeScript",
  blocklist: null,
};

const job: RawJob = {
  source: "fixture",
  externalId: "1",
  title: "Senior Frontend Developer",
  company: "Example",
  location: null,
  url: "https://example.com/job",
  postedAt: null,
  description: "Build React and TypeScript applications.",
};

describe("fitScore", () => {
  test("preserves the weighted role and keyword score", () => {
    expect(fitScore(preference, job)).toBe(80);
  });

  test("rejects titles that conflict with the selected level", () => {
    expect(fitScore({ ...preference, level: "Junior" }, job)).toBe(0);
  });
});
