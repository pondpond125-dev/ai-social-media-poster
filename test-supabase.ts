import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, posts, facebookPages } from "./drizzle/schema.pg";

/**
 * Test Supabase Database Connection
 * 
 * Before running this test:
 * 1. Get database password from: https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/settings/database
 * 2. Update DATABASE_URL in .env.supabase
 * 3. Copy .env.supabase to .env
 * 4. Run: tsx test-supabase.ts
 */

async function testConnection() {
  console.log("🔍 Testing Supabase connection...\n");

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set!");
    console.log("\nPlease:");
    console.log("1. Get password from: https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/settings/database");
    console.log("2. Update DATABASE_URL in .env.supabase");
    console.log("3. Copy .env.supabase to .env");
    process.exit(1);
  }

  if (process.env.DATABASE_URL.includes("[YOUR_PASSWORD_HERE]")) {
    console.error("❌ DATABASE_URL still contains placeholder!");
    console.log("\nPlease replace [YOUR_PASSWORD_HERE] with actual password from Supabase Dashboard");
    process.exit(1);
  }

  try {
    // Create connection
    console.log("📡 Connecting to Supabase...");
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);

    // Test 1: Check tables exist
    console.log("\n✅ Test 1: Checking tables...");
    const tablesQuery = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log("📊 Tables found:", tablesQuery.map(t => t.table_name).join(", "));

    // Test 2: Query users table
    console.log("\n✅ Test 2: Querying users table...");
    const usersResult = await db.select().from(users).limit(5);
    console.log(`📝 Users count: ${usersResult.length}`);
    if (usersResult.length > 0) {
      console.log("👤 Sample user:", usersResult[0]);
    }

    // Test 3: Query posts table
    console.log("\n✅ Test 3: Querying posts table...");
    const postsResult = await db.select().from(posts).limit(5);
    console.log(`📝 Posts count: ${postsResult.length}`);
    if (postsResult.length > 0) {
      console.log("📄 Sample post:", postsResult[0]);
    }

    // Test 4: Query facebook_pages table
    console.log("\n✅ Test 4: Querying facebook_pages table...");
    const pagesResult = await db.select().from(facebookPages).limit(5);
    console.log(`📝 Facebook Pages count: ${pagesResult.length}`);
    if (pagesResult.length > 0) {
      console.log("📘 Sample page:", pagesResult[0]);
    }

    // Close connection
    await client.end();

    console.log("\n🎉 All tests passed! Supabase connection is working!");
    console.log("\n📊 Summary:");
    console.log(`   - Database: PostgreSQL 17.6.1`);
    console.log(`   - Region: Singapore (ap-southeast-1)`);
    console.log(`   - Tables: ${tablesQuery.length}`);
    console.log(`   - Users: ${usersResult.length}`);
    console.log(`   - Posts: ${postsResult.length}`);
    console.log(`   - Facebook Pages: ${pagesResult.length}`);

  } catch (error) {
    console.error("\n❌ Connection test failed!");
    console.error("Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("password authentication failed")) {
        console.log("\n💡 Tip: Check your database password");
        console.log("   Get it from: https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/settings/database");
      } else if (error.message.includes("ENOTFOUND")) {
        console.log("\n💡 Tip: Check your DATABASE_URL");
        console.log("   Make sure it's correct in .env file");
      }
    }
    
    process.exit(1);
  }
}

// Run test
testConnection();

