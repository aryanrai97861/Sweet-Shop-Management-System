import "dotenv/config";
import { db } from "./server/db";
import { sweets, transactions } from "./shared/schema";
import { or, like, inArray } from "drizzle-orm";

async function cleanup() {
  console.log("🧹 Cleaning up test data...");

  try {
    // First, find all test sweets to get their IDs
    const testSweets = await db
      .select()
      .from(sweets)
      .where(
        or(
          like(sweets.name, "DeleteTest_%"),
          like(sweets.name, "PurchaseTest_%"),
          like(sweets.name, "RestockTest_%"),
          like(sweets.name, "UpdateTest_%"),
          like(sweets.name, "TestSweet_%")
        )
      );

    if (testSweets.length === 0) {
      console.log("✅ No test sweets found to clean up");
      process.exit(0);
    }

    const testSweetIds = testSweets.map(s => s.id);
    console.log(`Found ${testSweets.length} test sweets to delete`);

    // Delete all transactions related to test sweets
    const deletedTransactions = await db
      .delete(transactions)
      .where(inArray(transactions.sweetId, testSweetIds))
      .returning();

    console.log(`✅ Deleted ${deletedTransactions.length} related transactions`);

    // Now delete the test sweets
    const result = await db
      .delete(sweets)
      .where(
        or(
          like(sweets.name, "DeleteTest_%"),
          like(sweets.name, "PurchaseTest_%"),
          like(sweets.name, "RestockTest_%"),
          like(sweets.name, "UpdateTest_%"),
          like(sweets.name, "TestSweet_%")
        )
      )
      .returning();

    console.log(`✅ Deleted ${result.length} test sweets`);
    
    // Show remaining sweets
    const remaining = await db.select().from(sweets);
    console.log(`📊 Remaining sweets: ${remaining.length}`);
    
    if (remaining.length > 0) {
      console.log("\nRemaining sweets:");
      remaining.forEach(sweet => {
        console.log(`  - ${sweet.name} (${sweet.category})`);
      });
    }

    console.log("\n🎉 Cleanup completed!");
    console.log("💡 Now run 'npm run db:seed' to add sample sweets with images");
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

cleanup();
