import { query } from "./server/config/database.ts";

async function main() {
  try {
    console.log("=== RUNNING SCHEMA ALTERATION ===");
    // Check if column already exists
    const cols: any = await query("SHOW COLUMNS FROM `users` LIKE 'staff_title'");
    if (cols.length === 0) {
      await query("ALTER TABLE `users` ADD COLUMN `staff_title` VARCHAR(50) DEFAULT NULL");
      console.log("Migration: Added staff_title column to users table successfully.");
    } else {
      console.log("Migration: Column staff_title already exists in users table.");
    }
  } catch (err: any) {
    console.error("Migration error:", err.message);
  } finally {
    process.exit(0);
  }
}

main();
