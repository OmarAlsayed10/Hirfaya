import assert from "node:assert/strict";
import { breakUnits, pageBreakPush } from "./pageBreaks.ts";

const PAGE = 1123;
const PAD = 48;

// Fits on the page it started on.
assert.equal(pageBreakPush(0, 200, PAGE, PAD), 0);
assert.equal(pageBreakPush(900, 1075, PAGE, PAD), 0);

// Straddles the boundary: pushed to the top of page 2, below the page padding.
assert.equal(pageBreakPush(1000, 1200, PAGE, PAD), PAGE + PAD - 1000);
// Ends inside the bottom padding: still pushed.
assert.equal(pageBreakPush(1000, 1100, PAGE, PAD), PAGE + PAD - 1000);

// Same rule on later pages.
assert.equal(pageBreakPush(2200, 2300, PAGE, PAD), PAGE * 2 + PAD - 2200);

// Taller than a page: pushing it cannot help, leave it where it is.
assert.equal(pageBreakPush(100, 1400, PAGE, PAD), 0);

const element = (top: number, children: HTMLElement[] = [], list = false, heading = false) => ({
  children,
  matches: (selector: string) => list && selector === 'ul, ol',
  hasAttribute: (attribute: string) => heading && attribute === 'data-cv-drag-handle',
  getBoundingClientRect: () => ({ top }),
}) as unknown as HTMLElement;
const heading = element(100, [], false, true);
const firstExperience = element(140);
const secondExperience = element(260);
const experienceList = element(140, [firstExperience, secondExperience], true);
const experienceSection = element(100, [heading, experienceList]);
const content = {
  querySelectorAll: () => [experienceSection],
} as unknown as HTMLElement;

assert.deepEqual(breakUnits(content), [[heading, firstExperience], [secondExperience]]);

console.log("pageBreaks ok");
