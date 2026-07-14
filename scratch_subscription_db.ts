import { query } from "./server/config/database.ts";

async function main() {
  try {
    console.log("Creating subscription_plans table...");
    await query(`
      CREATE TABLE IF NOT EXISTS \`subscription_plans\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`name\` VARCHAR(50) NOT NULL,
        \`price\` DECIMAL(10, 2) NOT NULL,
        \`currency\` VARCHAR(3) NOT NULL DEFAULT 'INR',
        \`billing_cycle\` VARCHAR(20) NOT NULL DEFAULT 'monthly'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Seeding subscription plans...");
    await query(`
      INSERT INTO \`subscription_plans\` (\`id\`, \`name\`, \`price\`, \`currency\`, \`billing_cycle\`)
      VALUES 
        ('starter', 'Starter', 0.00, 'INR', 'trial'),
        ('pro', 'Pro', 499.00, 'INR', 'monthly'),
        ('business', 'Business', 999.00, 'INR', 'monthly')
      ON DUPLICATE KEY UPDATE 
        \`name\` = VALUES(\`name\`),
        \`price\` = VALUES(\`price\`),
        \`currency\` = VALUES(\`currency\`),
        \`billing_cycle\` = VALUES(\`billing_cycle\`)
    `);

    console.log("Creating subscriptions table...");
    await query(`
      CREATE TABLE IF NOT EXISTS \`subscriptions\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`business_id\` BIGINT UNSIGNED NOT NULL,
        \`plan_id\` VARCHAR(50) NOT NULL,
        \`status\` VARCHAR(20) NOT NULL DEFAULT 'trial',
        \`renewal_date\` TIMESTAMP NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`business_id\`) REFERENCES \`businesses\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`plan_id\`) REFERENCES \`subscription_plans\` (\`id\`) ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Creating payment_transactions table...");
    await query(`
      CREATE TABLE IF NOT EXISTS \`payment_transactions\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`business_id\` BIGINT UNSIGNED NOT NULL,
        \`payment_id\` VARCHAR(100) DEFAULT NULL,
        \`order_id\` VARCHAR(100) DEFAULT NULL,
        \`subscription_id\` BIGINT UNSIGNED DEFAULT NULL,
        \`amount\` DECIMAL(10, 2) NOT NULL,
        \`currency\` VARCHAR(3) NOT NULL DEFAULT 'INR',
        \`status\` VARCHAR(20) NOT NULL DEFAULT 'pending',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`business_id\`) REFERENCES \`businesses\` (\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`subscription_id\`) REFERENCES \`subscriptions\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Checking for businesses lacking a subscription record...");
    const businesses: any = await query("SELECT id FROM `businesses`");
    for (const biz of businesses) {
      const existing: any = await query("SELECT id FROM `subscriptions` WHERE `business_id` = ?", [biz.id]);
      if (existing.length === 0) {
        console.log(`Seeding starter trial subscription for business ID ${biz.id}...`);
        const renewalDate = new Date();
        renewalDate.setDate(renewalDate.getDate() + 30);
        await query(
          "INSERT INTO `subscriptions` (`business_id`, `plan_id`, `status`, `renewal_date`) VALUES (?, 'starter', 'trial', ?)",
          [biz.id, renewalDate]
        );
      }
    }

    console.log("Subscription migrations applied successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    process.exit(0);
  }
}

main();
