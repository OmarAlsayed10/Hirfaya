import assert from "node:assert/strict";
import { bulletLines } from "./bulletLines.ts";

assert.deepEqual(bulletLines(""), []);
assert.deepEqual(bulletLines("Single line of text"), ["Single line of text"]);

// Newline-separated, with and without markers.
assert.deepEqual(bulletLines("- Built A\n- Led B"), ["Built A", "Led B"]);
assert.deepEqual(bulletLines("Built A\nLed B"), ["Built A", "Led B"]);

// The reported bug: one string, inline dashes after sentence ends.
assert.deepEqual(
  bulletLines("- Handled 50+ calls daily, resolving issues efficiently. - Achieved monthly targets. - Trained in CRM systems."),
  [
    "Handled 50+ calls daily, resolving issues efficiently.",
    "Achieved monthly targets.",
    "Trained in CRM systems.",
  ],
);

// En dash separators too.
assert.deepEqual(bulletLines("– Conducted inspections. – Communicated with citizens."), [
  "Conducted inspections.",
  "Communicated with citizens.",
]);

// Dashes that are not bullets stay put.
assert.deepEqual(bulletLines("Managed the account from 2020 - 2024 without escalation"), [
  "Managed the account from 2020 - 2024 without escalation",
]);
assert.deepEqual(bulletLines("Owned the Client - Acme relationship"), ["Owned the Client - Acme relationship"]);

// Bullet glyphs split regardless of punctuation.
assert.deepEqual(bulletLines("• Built A • Led B"), ["Built A", "Led B"]);

// A line that opens with bold markup must keep both asterisks, or FormattedText never
// matches it and the text renders plain.
assert.deepEqual(bulletLines("**Bold start** then text"), ["**Bold start** then text"]);
assert.deepEqual(bulletLines("- **Bold** after marker"), ["**Bold** after marker"]);
assert.deepEqual(bulletLines("^^Semi bold^^ start"), ["^^Semi bold^^ start"]);
// A single asterisk is still a bullet glyph.
assert.deepEqual(bulletLines("* Plain bullet"), ["Plain bullet"]);

console.log("bulletLines ok");
