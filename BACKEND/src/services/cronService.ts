import cron from "node-cron";
import prisma from "../lib/prisma";
import { emailService } from "./emailService";
import { refreshMatchesForUser } from "./jobRadarService";
import { ingestJobs } from "./jobIngestionService";

export const startCronJobs = (): void => {
  // Every 6 hours — refill the shared public job board from all sources.
  cron.schedule("0 */6 * * *", async () => {
    try {
      const count = await ingestJobs();
      console.log(`[cron] Job Radar pool ingested ${count} jobs`);
    } catch (err) {
      console.error("[cron] Job Radar pool ingest failed:", err);
    }
  });

  // Daily at 08:00 — refresh every active Job Radar profile and email a digest of top matches.
  cron.schedule("0 8 * * *", async () => {
    try {
      const prefs = await prisma.jobPreference.findMany({
        where: { active: true },
        include: { user: { select: { email: true, firstName: true } } },
      });

      for (const pref of prefs) {
        try {
          await refreshMatchesForUser(pref.userId);
          const top = await prisma.jobMatch.findMany({
            where: { userId: pref.userId, status: "matched" },
            orderBy: [{ earlyBird: "desc" }, { fitScore: "desc" }],
            take: 5,
          });
          if (top.length > 0) {
            await emailService.sendJobDigest(pref.user.email, pref.user.firstName, top);
          }
        } catch (err) {
          console.error(`[cron] Job Radar failed for user ${pref.userId}:`, err);
        }
      }
      console.log(`[cron] Job Radar processed ${prefs.length} profiles`);
    } catch (err) {
      console.error("[cron] Job Radar batch failed:", err);
    }
  });

  // Daily at 09:00 — notify Pro users expiring in ~3 days
  cron.schedule("0 9 * * *", async () => {
    try {
      const now = new Date();
      const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const expiring = await prisma.user.findMany({
        where: {
          role: "pro user",
          proExpiresAt: { gte: in2Days, lte: in3Days },
        },
        select: { email: true, firstName: true, proExpiresAt: true },
      });

      for (const user of expiring) {
        const daysLeft = Math.ceil(
          (user.proExpiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        await emailService.sendProExpiringSoon(user.email, user.firstName, daysLeft);
      }

      if (expiring.length > 0) {
        console.log(`[cron] Sent expiry notices to ${expiring.length} users`);
      }
    } catch (err) {
      console.error("[cron] Pro expiry check failed:", err);
    }
  });

  // First boot on a fresh DB: populate the board once so it isn't empty until the 6h cron.
  prisma.job
    .count()
    .then((n) => {
      if (n === 0) {
        ingestJobs()
          .then((c) => console.log(`[cron] Job Radar pool seeded ${c} jobs on boot`))
          .catch((e) => console.error("[cron] Job Radar pool boot seed failed:", e));
      }
    })
    .catch(() => {});

  console.log("[cron] Scheduled jobs started");
};
