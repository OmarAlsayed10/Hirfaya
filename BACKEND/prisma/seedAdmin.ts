import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";

// Usage: ts-node prisma/seedAdmin.ts <email> <password>
// Falls back to ADMIN_EMAIL / ADMIN_PASSWORD env vars.
async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Provide email and password (args or ADMIN_EMAIL/ADMIN_PASSWORD).");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "admin", emailVerified: true, passwordHash },
    create: {
      email,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      emailVerified: true,
      passwordHash,
    },
    select: { id: true, email: true, role: true },
  });

  console.log("Admin ready:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
