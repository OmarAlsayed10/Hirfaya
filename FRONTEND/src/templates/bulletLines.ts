// `*` is both a bullet glyph and the first half of `**bold**`. Stripping it blindly ate one
// asterisk off a line that opened with bold text, so the markup never matched and the text
// rendered plain. A lone `*` is a bullet; a doubled one is formatting.
const LEADING_MARKER = /^(?:[-–—•▪●‣⁃]|\*(?!\*))\s*/;

// Imported and AI-written descriptions arrive two ways: real newlines, or one long string with
// inline markers ("… efficiently. - Achieved …"). HTML collapses the newlines and nothing splits
// the inline form, so every bullet ended up in a single paragraph.
// A dash only starts a new bullet after sentence-ending punctuation, which keeps ranges like
// "2020 - 2024" and phrases like "Client - Acme" in one piece. Bullet glyphs always split.
const INLINE_MARKER = /(?<=[.;:!?])\s+(?=[-–—•*▪●‣⁃]\s+\S)|\s+(?=[•▪●‣⁃]\s*\S)/g;

export const bulletLines = (text: string): string[] =>
  (text || '')
    .split('\n')
    .flatMap((line) => line.split(INLINE_MARKER))
    .map((line) => line.replace(LEADING_MARKER, '').trim())
    .filter(Boolean);
