// Run before `prisma db push`:  npx tsx src/scripts/preDeployChecks.ts
// Both new unique constraints fail to apply if the table already holds collisions.
// Read-only — reports what would break, changes nothing.
import prisma from "../lib/prisma";

const main = async () => {
  const duplicateReferences = await prisma.$queryRaw<{ reference: string; count: bigint }[]>`
    SELECT "referenceNumber" AS reference, count(*) AS count
    FROM payment_requests
    WHERE "referenceNumber" IS NOT NULL
    GROUP BY 1 HAVING count(*) > 1
  `;

  const duplicateEmails = await prisma.$queryRaw<{ email: string; count: bigint }[]>`
    SELECT lower(email) AS email, count(*) AS count
    FROM "User"
    GROUP BY 1 HAVING count(*) > 1
  `;

  const mixedCaseEmails = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT count(*) AS count FROM "User" WHERE email <> lower(trim(email))
  `;

  console.log("\n=== Duplicate payment references ===");
  if (duplicateReferences.length === 0) {
    console.log("None. The referenceNumber unique index will apply cleanly.");
  } else {
    console.log(`${duplicateReferences.length} collision(s) — resolve before pushing:`);
    for (const row of duplicateReferences) {
      console.log(`  ${row.reference} appears ${row.count} times`);
    }
  }

  console.log("\n=== Emails that collide when lowercased ===");
  if (duplicateEmails.length === 0) {
    console.log("None. Lowercasing every address is safe.");
  } else {
    console.log(`${duplicateEmails.length} collision(s) — merge these accounts by hand first:`);
    for (const row of duplicateEmails) {
      console.log(`  ${row.email} matches ${row.count} accounts`);
    }
  }

  console.log("\n=== Accounts stored with non-lowercase email ===");
  const affected = Number(mixedCaseEmails[0]?.count ?? 0);
  console.log(
    affected === 0
      ? "None. No backfill needed."
      : `${affected} account(s) cannot log in until you run:\n  UPDATE "User" SET email = lower(trim(email));`
  );

  console.log();
};

main()
  .catch((err) => {
    console.error("Pre-deploy check failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
