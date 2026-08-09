import assert from "node:assert/strict";
import { pageCountFrom, shouldApplyPageCount } from "./previewEditing.ts";

const PAGE = 1123;

assert.equal(pageCountFrom(0, PAGE), 1);
assert.equal(pageCountFrom(900, PAGE), 1);
assert.equal(pageCountFrom(1131, PAGE), 1);
assert.equal(pageCountFrom(1200, PAGE), 2);
assert.equal(pageCountFrom(2254, PAGE), 2);

// Growing is accepted, shrinking is not — unless the caller allows it (content changed).
assert.equal(shouldApplyPageCount(2, 1, false), true);
assert.equal(shouldApplyPageCount(1, 2, false), false);
assert.equal(shouldApplyPageCount(1, 1, false), false);
assert.equal(shouldApplyPageCount(1, 2, true), true);
assert.equal(shouldApplyPageCount(2, 2, true), false);

// The bug: rendering 2 pages changes the measured height back to a 1-page reading, which
// previously re-dispatched forever. Simulate that oscillation and assert it settles.
const measuredFor = (renderedCount: number) => (renderedCount === 1 ? 1200 : 1000);

let latched = 1;
let dispatches = 0;
let rendered = 1;
for (let tick = 0; tick < 50; tick += 1) {
  const next = pageCountFrom(measuredFor(rendered), PAGE);
  if (!shouldApplyPageCount(next, latched, false)) break;
  latched = next;
  rendered = next;
  dispatches += 1;
}
assert.equal(dispatches, 1);
assert.equal(latched, 2);

console.log("previewEditing page-count latch ok");
