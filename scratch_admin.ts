import { query } from "./server/config/database.ts";
import bcrypt from "bcryptjs";

async function migrate() {
  try {
    console.log("Applying schema alterations...");
    // Make business_id Nullable
    await query("ALTER TABLE users MODIFY COLUMN business_id BIGINT UNSIGNED DEFAULT NULL");
    
    // Modify role column to VARCHAR to support SUPER_ADMIN and CUSTOMER
    await query("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'STAFF'");

    // Create announcements table
    console.log("Creating announcements table...");
    await query(`
      CREATE TABLE IF NOT EXISTS \`announcements\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`content\` TEXT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("Hashing password for Super Admin...");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("12345678", salt);
    
    console.log("Checking if Super Admin exists...");
    const existing = await query("SELECT id FROM users WHERE email = 'test@gmail.com'");
    
    if (existing.length > 0) {
      console.log("Super Admin exists. Updating password and role...");
      await query("UPDATE users SET password_hash = ?, role = 'SUPER_ADMIN', status = 'active' WHERE email = 'test@gmail.com'", [hash]);
    } else {
      console.log("Super Admin not found. Inserting new record...");
      await query(
        "INSERT INTO users (email, password_hash, role, full_name, status, business_id) VALUES ('test@gmail.com', ?, 'SUPER_ADMIN', 'Super Admin', 'active', NULL)",
        [hash]
      );
    }
    
    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
