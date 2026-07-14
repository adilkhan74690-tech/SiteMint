import { query } from "./server/config/database.ts";

async function runMigrations() {
  console.log("Starting schema migrations for Owner Lifecycle...");

  const columnAdditions = [
    // Businesses Table columns
    { table: "businesses", column: "owner_id", sql: "ALTER TABLE `businesses` ADD COLUMN `owner_id` BIGINT UNSIGNED DEFAULT NULL" },
    { table: "businesses", column: "is_completed", sql: "ALTER TABLE `businesses` ADD COLUMN `is_completed` BOOLEAN NOT NULL DEFAULT FALSE" },
    { table: "businesses", column: "google_maps_location", sql: "ALTER TABLE `businesses` ADD COLUMN `google_maps_location` TEXT DEFAULT NULL" },
    { table: "businesses", column: "social_links", sql: "ALTER TABLE `businesses` ADD COLUMN `social_links` JSON DEFAULT NULL" },
    { table: "businesses", column: "working_hours", sql: "ALTER TABLE `businesses` ADD COLUMN `working_hours` JSON DEFAULT NULL" },
    { table: "businesses", column: "seo_title", sql: "ALTER TABLE `businesses` ADD COLUMN `seo_title` VARCHAR(255) DEFAULT NULL" },
    { table: "businesses", column: "seo_description", sql: "ALTER TABLE `businesses` ADD COLUMN `seo_description` TEXT DEFAULT NULL" },
    { table: "businesses", column: "favicon_url", sql: "ALTER TABLE `businesses` ADD COLUMN `favicon_url` VARCHAR(512) DEFAULT NULL" },

    // Users Table columns
    { table: "users", column: "staff_photo_url", sql: "ALTER TABLE `users` ADD COLUMN `staff_photo_url` VARCHAR(512) DEFAULT NULL" },
    { table: "users", column: "working_days", sql: "ALTER TABLE `users` ADD COLUMN `working_days` VARCHAR(100) DEFAULT NULL" },
    { table: "users", column: "working_hours", sql: "ALTER TABLE `users` ADD COLUMN `working_hours` VARCHAR(100) DEFAULT NULL" },
    { table: "users", column: "services_assigned", sql: "ALTER TABLE `users` ADD COLUMN `services_assigned` TEXT DEFAULT NULL" },

    // Products Table columns
    { table: "products", column: "image_url", sql: "ALTER TABLE `products` ADD COLUMN `image_url` VARCHAR(512) DEFAULT NULL" },

    // Services Table columns
    { table: "services", column: "image_url", sql: "ALTER TABLE `services` ADD COLUMN `image_url` VARCHAR(512) DEFAULT NULL" },
  ];

  for (const item of columnAdditions) {
    try {
      console.log(`Checking/Adding column ${item.column} to table ${item.table}...`);
      await query(item.sql);
      console.log(`Successfully added ${item.column} to ${item.table}`);
    } catch (err: any) {
      if (err.message.includes("Duplicate column name") || err.message.includes("already exists")) {
        console.log(`Column ${item.column} already exists in table ${item.table}. Skipping...`);
      } else {
        console.error(`Failed to add column ${item.column} to table ${item.table}:`, err.message);
      }
    }
  }

  // Add constraint for owner_id referencing users(id) if possible
  try {
    console.log("Adding foreign key constraint for businesses.owner_id...");
    await query("ALTER TABLE `businesses` ADD CONSTRAINT `fk_businesses_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
    console.log("Successfully added foreign key constraint!");
  } catch (err: any) {
    if (err.message.includes("Duplicate key name") || err.message.includes("already exists") || err.message.includes("Duplicate constraint") || err.message.includes("Foreign key constraint")) {
      console.log("Foreign key constraint already exists or could not be created. Skipping...");
    } else {
      console.error("Failed to add foreign key constraint:", err.message);
    }
  }

  console.log("Database schema migrations complete!");
  process.exit(0);
}

runMigrations().catch(err => {
  console.error("Migrations failed:", err);
  process.exit(1);
});
