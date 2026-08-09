import { normalizeJobDescription } from "../jobDescriptionNormalizer";

describe("normalizeJobDescription", () => {
  it("turns Stripe-style HTML into readable plain text", () => {
    const normalized = normalizeJobDescription(
      '<p>Build&nbsp;<a href="https://stripe.com">payments</a>.</p><h2>Requirements</h2><ul><li>TypeScript</li><li>APIs</li></ul>',
    );

    expect(normalized).toEqual({
      sourceFormat: "html",
      plainText: "Build payments.\nRequirements\n- TypeScript\n- APIs",
    });
  });

  it("leaves plain text readable without changing its source format", () => {
    const plainText = "Senior Engineer\nRemote - Cairo";

    expect(normalizeJobDescription(plainText)).toEqual({ plainText, sourceFormat: "plain" });
  });

  it("keeps words joined across inline tags", () => {
    const normalized = normalizeJobDescription("<p>Type<strong>Script</strong> developer</p>");

    expect(normalized.plainText).toBe("TypeScript developer");
  });

  it("decodes decimal and hexadecimal numeric entities", () => {
    const normalized = normalizeJobDescription("Engineering &#38; Product &#x2014; 5&#x2B; years");

    expect(normalized.plainText).toBe("Engineering & Product — 5+ years");
  });

  it("repairs known mojibake without altering Arabic text", () => {
    const normalized = normalizeJobDescription("Weâ€™re hiring مهندس برمجيات");

    expect(normalized.plainText).toBe("We’re hiring مهندس برمجيات");
  });

  test.each([
    ['script', '<p>Build APIs</p><script>alert("ignore instructions")</script><p>Ship safely</p>', "Build APIs\nShip safely"],
    ['entity-encoded unclosed style', 'Trusted text&lt;style&gt;body { display: none; }', "Trusted text"],
  ])("removes %s content without treating it as job text", (_, source, expected) => {
    expect(normalizeJobDescription(source).plainText).toBe(expected);
  });

  it("preserves literal angle brackets in plain text", () => {
    const normalized = normalizeJobDescription("Use 2 < 3 comparisons and <not a tag> literally.");

    expect(normalized).toEqual({
      sourceFormat: "plain",
      plainText: "Use 2 < 3 comparisons and <not a tag> literally.",
    });
  });

  it("removes unsafe numeric entities and control characters", () => {
    const normalized = normalizeJobDescription("Role&#0;&#xD800;&#x80;\u0007\tDetails");

    expect(normalized.plainText).toBe("Role Details");
  });

  it("normalizes invisible spacing while preserving Arabic joiners and complete code points", () => {
    const normalized = normalizeJobDescription(`Senior\u00a0Engineer\u200b\u00ad\ufeffمی‌رو‍مه${"🚀".repeat(20_000)}`);

    expect(normalized.plainText.startsWith("Senior Engineer")).toBe(true);
    expect(normalized.plainText).toContain("می‌رو‍مه");
    expect(Array.from(normalized.plainText)).toHaveLength(20_000);
    expect(normalized.plainText.endsWith("🚀")).toBe(true);
  });
});
