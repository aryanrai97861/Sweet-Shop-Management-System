import "dotenv/config";
import { db } from "./server/db";
import { users, sweets } from "./shared/schema";
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
    } else {
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
    }

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

    // Add sample sweets with images
    console.log("");
    console.log("🍬 Adding sample sweets...");
    
    const sampleSweets = [
      {
        name: "Chocolate Chip Cookies",
        category: "Cookies",
        price: "4.99",
        quantity: 50,
        description: "Delicious homemade chocolate chip cookies",
        imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop"
      },
      {
        name: "Gummy Bears",
        category: "Gummies",
        price: "3.99",
        quantity: 100,
        description: "Colorful and chewy gummy bears",
        imageUrl: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=400&fit=crop"
      },
      {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: "2.99",
        quantity: 75,
        description: "Rich and creamy milk chocolate bar",
        imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop"
      },
      {
        name: "Lollipops",
        category: "Candy",
        price: "1.99",
        quantity: 120,
        description: "Assorted fruit-flavored lollipops",
        imageUrl: "https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=400&h=400&fit=crop"
      },
      {
        name: "Croissant",
        category: "Pastry",
        price: "3.49",
        quantity: 30,
        description: "Buttery and flaky French croissant",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop"
      },
      {
        name: "Jelly Beans",
        category: "Candy",
        price: "4.49",
        quantity: 80,
        description: "Mixed flavor jelly beans",
        imageUrl: "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=400&h=400&fit=crop"
      },
      {
        name: "Macarons",
        category: "Pastry",
        price: "6.99",
        quantity: 40,
        description: "Assorted French macarons",
        imageUrl: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&h=400&fit=crop"
      },
      {
        name: "Sour Gummy Worms",
        category: "Gummies",
        price: "3.49",
        quantity: 90,
        description: "Tangy sour gummy worms",
        imageUrl: "https://images.unsplash.com/photo-1609126721429-4ea3c046a8f3?w=400&h=400&fit=crop"
      }
    ];

    await db.insert(sweets).values(sampleSweets);
    console.log(`✅ Added ${sampleSweets.length} sample sweets!`);

    console.log("");
    console.log("🎉 Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
