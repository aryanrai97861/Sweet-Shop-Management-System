import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Check if admin user already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"));

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log(`   Username: admin`);
      console.log(`   Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await hashPassword("admin123");
    
    const [adminUser] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        role: "admin",
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${adminUser.role}`);
    console.log("");
    console.log("⚠️  IMPORTANT: Change the admin password after first login!");

    // Optionally create a regular test user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, "testuser"));

    if (!existingUser) {
      const userPassword = await hashPassword("password123");
      
      await db.insert(users).values({
        username: "testuser",
        password: userPassword,
        role: "user",
      });

      console.log("");
      console.log("✅ Test user created successfully!");
      console.log(`   Username: testuser`);
      console.log(`   Password: password123`);
      console.log(`   Role: user`);
    }

    console.log("");
    console.log("🎉 Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
