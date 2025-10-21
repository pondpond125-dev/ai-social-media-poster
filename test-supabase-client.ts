import { createClient } from "@supabase/supabase-js";

/**
 * Test Supabase Connection using Supabase Client
 * This is more reliable than direct PostgreSQL connection
 */

const SUPABASE_URL = "https://txjlntoqwdkyqfeswgke.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4amxudG9xd2RreXFmZXN3Z2tlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzNzU0NywiZXhwIjoyMDc2NjEzNTQ3fQ.gDfXPabyFMvUPYwcEllCIip2AucqIziFjloBaqvtaxw";

async function testSupabaseClient() {
  console.log("🔍 Testing Supabase Client connection...\n");

  try {
    // Create Supabase client
    console.log("📡 Creating Supabase client...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test 1: Check users table
    console.log("\n✅ Test 1: Querying users table...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(5);

    if (usersError) {
      console.error("❌ Users query error:", usersError);
    } else {
      console.log(`📝 Users count: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log("👤 Sample user:", users[0]);
      }
    }

    // Test 2: Check posts table
    console.log("\n✅ Test 2: Querying posts table...");
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .limit(5);

    if (postsError) {
      console.error("❌ Posts query error:", postsError);
    } else {
      console.log(`📝 Posts count: ${posts?.length || 0}`);
      if (posts && posts.length > 0) {
        console.log("📄 Sample post:", posts[0]);
      }
    }

    // Test 3: Check facebook_pages table
    console.log("\n✅ Test 3: Querying facebook_pages table...");
    const { data: pages, error: pagesError } = await supabase
      .from("facebook_pages")
      .select("*")
      .limit(5);

    if (pagesError) {
      console.error("❌ Facebook pages query error:", pagesError);
    } else {
      console.log(`📝 Facebook Pages count: ${pages?.length || 0}`);
      if (pages && pages.length > 0) {
        console.log("📘 Sample page:", pages[0]);
      }
    }

    // Test 4: Check api_configs table
    console.log("\n✅ Test 4: Querying api_configs table...");
    const { data: configs, error: configsError } = await supabase
      .from("api_configs")
      .select("*")
      .limit(5);

    if (configsError) {
      console.error("❌ API configs query error:", configsError);
    } else {
      console.log(`📝 API Configs count: ${configs?.length || 0}`);
      if (configs && configs.length > 0) {
        console.log("⚙️ Sample config:", configs[0]);
      }
    }

    // Test 5: Check scheduled_posts table
    console.log("\n✅ Test 5: Querying scheduled_posts table...");
    const { data: scheduled, error: scheduledError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .limit(5);

    if (scheduledError) {
      console.error("❌ Scheduled posts query error:", scheduledError);
    } else {
      console.log(`📝 Scheduled Posts count: ${scheduled?.length || 0}`);
      if (scheduled && scheduled.length > 0) {
        console.log("📅 Sample scheduled post:", scheduled[0]);
      }
    }

    console.log("\n🎉 All tests completed!");
    console.log("\n📊 Summary:");
    console.log(`   - Supabase URL: ${SUPABASE_URL}`);
    console.log(`   - Users: ${users?.length || 0}`);
    console.log(`   - Posts: ${posts?.length || 0}`);
    console.log(`   - Facebook Pages: ${pages?.length || 0}`);
    console.log(`   - API Configs: ${configs?.length || 0}`);
    console.log(`   - Scheduled Posts: ${scheduled?.length || 0}`);

    // Check if any errors occurred
    const hasErrors = usersError || postsError || pagesError || configsError || scheduledError;
    if (hasErrors) {
      console.log("\n⚠️ Some queries had errors. Check the output above.");
    } else {
      console.log("\n✅ All queries successful! Supabase is working perfectly!");
    }

  } catch (error) {
    console.error("\n❌ Test failed!");
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run test
testSupabaseClient();

