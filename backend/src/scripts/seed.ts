import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db";
import { UserModel } from "../models/User.model";
import { hashPassword } from "../services/auth.service";

async function main() {
  const email = process.env.SEED_RECRUITER_EMAIL;
  const password = process.env.SEED_RECRUITER_PASSWORD;
  const name = process.env.SEED_RECRUITER_NAME ?? "Demo Recruiter";

  if (!email || !password) {
    console.error(
      "[seed] Missing SEED_RECRUITER_EMAIL or SEED_RECRUITER_PASSWORD in .env. Aborting."
    );
    process.exit(1);
  }

  await connectDB();

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`[seed] Recruiter already exists: ${email}`);
  } else {
    const passwordHash = await hashPassword(password);
    await UserModel.create({ email: email.toLowerCase(), passwordHash, name, role: "recruiter" });
    console.log(`[seed] Created recruiter: ${email}`);
  }

  console.log("\n--- Log in with these credentials ---");
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log("-------------------------------------\n");

  await disconnectDB();
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
