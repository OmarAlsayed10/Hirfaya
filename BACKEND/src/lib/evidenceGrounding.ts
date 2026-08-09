const NUMBER_PATTERN = /\d+(?:[.,]\d+)*/g;
const PERCENT_SUFFIX_PATTERN = /^\s*(?:%|percent(?:age)?)/i;

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sourceContainsClaim = (
  statement: string,
  numberMatch: RegExpMatchArray,
  sourceText: string,
): boolean => {
  const number = numberMatch[0].replace(/,/g, "");
  const matchEnd = (numberMatch.index ?? 0) + numberMatch[0].length;
  const isPercentage = PERCENT_SUFFIX_PATTERN.test(statement.slice(matchEnd));
  const escapedNumber = escapeRegex(number);
  const suffix = isPercentage ? "\\s*(?:%|percent(?:age)?)" : "";
  const claimEnd = isPercentage ? "(?!\\w)" : "\\b";
  return new RegExp(`\\b${escapedNumber}${suffix}${claimEnd}`, "i").test(
    sourceText.replace(/,/g, ""),
  );
};

export function unsourcedNumbers(statement: string, sourceText: string): string[] {
  return [...statement.matchAll(NUMBER_PATTERN)]
    .filter((numberMatch) => !sourceContainsClaim(statement, numberMatch, sourceText))
    .map((numberMatch) => numberMatch[0]);
}

export function statementUsesOnlySourceNumbers(statement: string, sourceText: string): boolean {
  return unsourcedNumbers(statement, sourceText).length === 0;
}

export function evidenceGroundedDescription(description: string, sourceText: string): string {
  return statementUsesOnlySourceNumbers(description, sourceText) ? description : "";
}
