import assert from "node:assert/strict";
import { collapseSkillBullets, isContactLine, matchSubLabel, splitEntryHeader, splitHeaderLine } from "./plainCvLines.ts";

// The role line under the name carries no contact facts.
assert.equal(isContactLine("Full Stack Developer"), false);
assert.equal(isContactLine("Senior Laboratory Technician"), false);

// Contact lines do.
assert.equal(isContactLine("+1-000-000-0000 | sample@example.com"), true);
assert.equal(isContactLine("sample@example.com"), true);
assert.equal(isContactLine("linkedin.com/in/sample | github.com/sample"), true);
assert.equal(isContactLine("www.portfolio.dev"), true);
assert.equal(isContactLine("555 123 4567"), true);
// The old shape — role glued to the contacts — must still read as contacts, not a role.
assert.equal(isContactLine("Full Stack Developer | sample@example.com"), true);

// Skills sub-labels split into a bold label and its list.
assert.deepEqual(matchSubLabel("Languages: JavaScript, TypeScript"), {
  label: "Languages",
  rest: "JavaScript, TypeScript",
});
assert.deepEqual(matchSubLabel("Tools & Platforms: Docker, AWS"), {
  label: "Tools & Platforms",
  rest: "Docker, AWS",
});

// Prose that happens to contain a colon is not a sub-label.
assert.equal(matchSubLabel("Built the pipeline: it cut runtime in half and freed the team"), null);
assert.equal(matchSubLabel("Languages:"), null);
assert.equal(matchSubLabel("- Reduced latency: 45%"), null);



// The optimizer returned this CV's whole header as one line, so the phone number and email were
// rendered in 22pt bold name styling alongside the name.
assert.deepEqual(
  splitHeaderLine("ABDULRHMAN AL-QASSAS | Frontend Developer | +20 103 076 5500 | a@example.com | Nasr City, Egypt"),
  {
    name: "ABDULRHMAN AL-QASSAS",
    rest: "Frontend Developer  |  +20 103 076 5500  |  a@example.com  |  Nasr City, Egypt",
  },
);
assert.equal(splitHeaderLine("ABDULRHMAN AL-QASSAS"), null);

// A job title opposite a short location is a real two-sided row.
assert.deepEqual(splitEntryHeader("Frontend Developer | Penta-b (Cairo)"), {
  title: "Frontend Developer",
  aside: "Penta-b (Cairo)",
});

// A project title opposite a long technology list is not — pairing them drew one over the other.
assert.equal(
  splitEntryHeader(
    "Blockchain Vaccine Verification System – Secure Blockchain Validation | React, Node.js, Python, Django, SQLite, Blockchain, REST APIs",
  ),
  null,
);

// One skill per bullet is how the optimizer writes them, and no template shows skills that way.
assert.deepEqual(
  collapseSkillBullets(["SKILLS", "• React", "• TypeScript", "• Redux", "• GraphQL", "", "EDUCATION", "• B.Sc. Computer Science"]),
  ["SKILLS", "React, TypeScript, Redux, GraphQL", "", "EDUCATION", "• B.Sc. Computer Science"],
);

// Achievement bullets under EXPERIENCE keep their bullets — only a skills run collapses.
assert.deepEqual(
  collapseSkillBullets(["EXPERIENCE", "• Delivered 10+ features with the platform team.", "• Achieved 30% faster load times."]),
  ["EXPERIENCE", "• Delivered 10+ features with the platform team.", "• Achieved 30% faster load times."],
);

// A single skill bullet stays a bullet rather than becoming a bare line.
assert.deepEqual(collapseSkillBullets(["SKILLS", "• React"]), ["SKILLS", "• React"]);

console.log("plainCvLines ok");
