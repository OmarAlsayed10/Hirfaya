// Rubric grader (LLM) wobbles ~±5 on the same CV. Round displayed scores to the
// nearest 5 so the same CV doesn't appear to change score run-to-run.
export const roundScore = (n: number) => Math.round(n / 5) * 5;
