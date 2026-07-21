import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLANS = [
  {
    slug: "pass-7day",
    displayName: "7-Day Pass",
    priceEGP: 99,
    durationDays: 7,
    tier: "pass",
    kind: "subscription",
    grantCredits: 0,
    sortOrder: 0,
  },
  {
    slug: "pro-monthly",
    displayName: "Pro — Monthly",
    priceEGP: 349,
    durationDays: 30,
    tier: "pro",
    kind: "subscription",
    grantCredits: 0,
    sortOrder: 1,
  },
  {
    slug: "pro-annual",
    displayName: "Pro — Annual",
    priceEGP: 2599,
    durationDays: 365,
    tier: "pro",
    kind: "subscription",
    grantCredits: 0,
    sortOrder: 2,
  },
  {
    slug: "ultra-monthly",
    displayName: "Ultra — Monthly",
    priceEGP: 499,
    durationDays: 30,
    tier: "ultra",
    kind: "subscription",
    grantCredits: 0,
    sortOrder: 3,
  },
  {
    slug: "ultra-annual",
    displayName: "Ultra — Annual",
    priceEGP: 3599,
    durationDays: 365,
    tier: "ultra",
    kind: "subscription",
    grantCredits: 0,
    sortOrder: 4,
  },
  {
    slug: "topup-100",
    displayName: "+100 Credits",
    priceEGP: 70,
    durationDays: 0,
    tier: "pro",
    kind: "topup",
    grantCredits: 100,
    sortOrder: 5,
  },
  {
    slug: "topup-500",
    displayName: "+500 Credits",
    priceEGP: 350,
    durationDays: 0,
    tier: "pro",
    kind: "topup",
    grantCredits: 500,
    sortOrder: 6,
  },
  {
    slug: "topup-1500",
    displayName: "+1500 Credits",
    priceEGP: 1050,
    durationDays: 0,
    tier: "pro",
    kind: "topup",
    grantCredits: 1500,
    sortOrder: 7,
  },
];

async function main() {
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log(`Seeded plan: ${plan.slug}`);
  }

  const slugs = PLANS.map((p) => p.slug);
  const { count } = await prisma.plan.updateMany({
    where: { slug: { notIn: slugs } },
    data: { isActive: false },
  });
  console.log(`Deactivated ${count} old plans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
