import assert from "node:assert/strict";
import { applyMarker, isFormatted, toggleFormat } from "./fieldFormatting.ts";

// Wrapping a selection.
assert.deepEqual(toggleFormat("hello world", 6, 11, "**"), {
  value: "hello **world**",
  selectionStart: 8,
  selectionEnd: 13,
});

// The reported bug: clicking twice used to give ****text****. Now the second click unwraps.
const once = toggleFormat("hello world", 6, 11, "**");
const twice = toggleFormat(once.value, once.selectionStart, once.selectionEnd, "**");
assert.equal(twice.value, "hello world");
assert.deepEqual([twice.selectionStart, twice.selectionEnd], [6, 11]);

// Clicking a third time re-wraps rather than doing nothing.
const thrice = toggleFormat(twice.value, twice.selectionStart, twice.selectionEnd, "**");
assert.equal(thrice.value, "hello **world**");

// Markers included in the selection are recognised too.
assert.equal(toggleFormat("hello **world**", 6, 15, "**").value, "hello world");

// No selection wraps the whole field, and unwraps it again.
assert.equal(toggleFormat("note", 0, 0, "^^").value, "^^note^^");
assert.equal(toggleFormat("^^note^^", 0, 0, "^^").value, "note");

// Asymmetric markers.
assert.equal(toggleFormat("big", 0, 0, "[[large]]", "[[/large]]").value, "[[large]]big[[/large]]");
assert.equal(toggleFormat("[[large]]big[[/large]]", 0, 0, "[[large]]", "[[/large]]").value, "big");

// Active state drives the button highlight.
assert.equal(isFormatted("hello **world**", 8, 13, "**", "**"), true);
assert.equal(isFormatted("hello world", 6, 11, "**", "**"), false);
// Bold markers must not report italic as active.
assert.equal(isFormatted("**bold**", 0, 0, "__", "__"), false);

// Weight is one property: applying semi bold to bold text replaces it rather than nesting,
// so switching it off leaves plain text instead of falling back to bold.
const BOLD = { prefix: "**", suffix: "**" };
const SEMI = { prefix: "^^", suffix: "^^" };
const ITALIC = { prefix: "__", suffix: "__" };

const bolded = applyMarker("hello world", 6, 11, BOLD, [SEMI]);
assert.equal(bolded.value, "hello **world**");

const semied = applyMarker(bolded.value, bolded.selectionStart, bolded.selectionEnd, SEMI, [BOLD]);
assert.equal(semied.value, "hello ^^world^^");

const cleared = applyMarker(semied.value, semied.selectionStart, semied.selectionEnd, SEMI, [BOLD]);
assert.equal(cleared.value, "hello world");

// Italic is a different property, so it stacks with a weight instead of replacing it.
const italic = applyMarker("hello world", 6, 11, ITALIC, []);
const italicBold = applyMarker(italic.value, italic.selectionStart, italic.selectionEnd, BOLD, [SEMI]);
assert.equal(italicBold.value, "hello __**world**__");
assert.equal(isFormatted(italicBold.value, italicBold.selectionStart, italicBold.selectionEnd, "**", "**"), true);

// Sizes are their own exclusive group.
const SMALL = { prefix: "[[small]]", suffix: "[[/small]]" };
const LARGE = { prefix: "[[large]]", suffix: "[[/large]]" };
const small = applyMarker("note", 0, 0, SMALL, [LARGE]);
assert.equal(small.value, "[[small]]note[[/small]]");
const large = applyMarker(small.value, small.selectionStart, small.selectionEnd, LARGE, [SMALL]);
assert.equal(large.value, "[[large]]note[[/large]]");

console.log("fieldFormatting ok");
