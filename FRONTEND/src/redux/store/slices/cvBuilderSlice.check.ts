import assert from "node:assert/strict";
import {
  DEFAULT_TEMPLATE,
  cvBuilderInitialState,
  hydrateBuilderDraft,
  normalizeBuilderFormData,
} from "./cvBuilderSlice.ts";

const certsOf = (input: unknown) => normalizeBuilderFormData({ skills: { certifications: input } }).skills.certifications;

// Legacy CVs stored certifications as one comma-separated string.
assert.deepEqual(certsOf("AWS SAA, Scrum Master"), [
  { name: "AWS SAA", issuer: "", date: "", url: "" },
  { name: "Scrum Master", issuer: "", date: "", url: "" },
]);
assert.deepEqual(certsOf(""), []);
assert.deepEqual(certsOf(undefined), []);
assert.deepEqual(certsOf(["AWS SAA"]), [{ name: "AWS SAA", issuer: "", date: "", url: "" }]);
assert.deepEqual(certsOf([{ name: "AWS SAA", issuer: "Amazon", date: "2024", url: "x" }]), [
  { name: "AWS SAA", issuer: "Amazon", date: "2024", url: "x" },
]);
assert.deepEqual(certsOf([{ name: "Partial" }, 42]), [{ name: "Partial", issuer: "", date: "", url: "" }]);

const roundTrip = hydrateBuilderDraft(
  JSON.stringify({
    formData: { personalInfo: { firstName: "Omar" }, experience: [{ jobTitle: "Dev" }] },
    currentCvId: "cv-1",
    title: "Backend CV",
    template: "jake-cv",
    sectionOrder: cvBuilderInitialState.sectionOrder,
  }),
);
assert.equal(roundTrip?.currentCvId, "cv-1");
assert.equal(roundTrip?.title, "Backend CV");
assert.equal(roundTrip?.template, "jake-cv");
assert.equal(roundTrip?.formData.personalInfo.firstName, "Omar");
assert.equal(roundTrip?.formData.experience.length, 1);
assert.equal(roundTrip?.formData.personalInfo.email, "");

assert.equal(hydrateBuilderDraft(null), undefined);
assert.equal(hydrateBuilderDraft("{not json"), undefined);
assert.equal(hydrateBuilderDraft("[]"), undefined);

const junk = hydrateBuilderDraft(
  JSON.stringify({ formData: 42, currentCvId: 7, title: null, template: "", sectionOrder: ["nope"] }),
);
assert.deepEqual(junk?.formData, cvBuilderInitialState.formData);
assert.equal(junk?.currentCvId, null);
assert.equal(junk?.title, "");
assert.equal(junk?.template, DEFAULT_TEMPLATE);
assert.deepEqual(junk?.sectionOrder, cvBuilderInitialState.sectionOrder);

console.log("cvBuilderSlice draft hydration ok");
