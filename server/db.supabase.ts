import { eq, desc, and, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { InsertUser, users, apiConfigs, InsertApiConfig, posts, InsertPost, scheduledPosts, InsertScheduledPost, facebookPages, InsertFacebookPage } from "../drizzle/schema.pg";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _supabase: SupabaseClient | null = null;

/**
 * Get Drizzle ORM instance for PostgreSQL
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Get Supabase client instance
 */
export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL || "https://txjlntoqwdkyqfeswgke.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4amxudG9xd2RreXFmZXN3Z2tlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzNzU0NywiZXhwIjoyMDc2NjEzNTQ3fQ.gDfXPabyFMvUPYwcEllCIip2AucqIziFjloBaqvtaxw";
    
    _supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabase;
}

/**
 * Upsert user (insert or update)
 * PostgreSQL uses ON CONFLICT instead of ON DUPLICATE KEY UPDATE
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
    }
    
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
      }
    } else {
      values.role = user.role;
    }

    // PostgreSQL upsert using ON CONFLICT
    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...values,
          lastSignedIn: new Date(),
        },
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// API Config helpers
export async function upsertApiConfig(config: InsertApiConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(apiConfigs)
    .values(config)
    .onConflictDoUpdate({
      target: apiConfigs.id,
      set: {
        ...config,
        updatedAt: new Date(),
      },
    });
}

export async function getApiConfig(userId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(apiConfigs).where(eq(apiConfigs.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Post helpers
export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(posts).values(post);
}

export async function updatePost(id: string, updates: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(posts).set({ ...updates, updatedAt: new Date() }).where(eq(posts.id, id));
}

export async function getPost(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserPosts(userId: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt)).limit(limit);
}

// Scheduled Post helpers
export async function createScheduledPost(post: InsertScheduledPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(scheduledPosts).values(post);
}

export async function updateScheduledPost(id: string, updates: Partial<InsertScheduledPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(scheduledPosts).set({ ...updates, updatedAt: new Date() }).where(eq(scheduledPosts.id, id));
}

export async function getScheduledPost(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(scheduledPosts).where(eq(scheduledPosts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserScheduledPosts(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(scheduledPosts).where(eq(scheduledPosts.userId, userId)).orderBy(desc(scheduledPosts.scheduledTime));
}

export async function getPendingScheduledPosts(now: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(scheduledPosts).where(
    and(
      eq(scheduledPosts.status, "pending"),
      lte(scheduledPosts.scheduledTime, now)
    )
  );
}

// Facebook Pages helpers
export async function createFacebookPage(page: InsertFacebookPage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(facebookPages).values(page);
}

export async function updateFacebookPage(id: string, updates: Partial<InsertFacebookPage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(facebookPages).set({ ...updates, updatedAt: new Date() }).where(eq(facebookPages.id, id));
}

export async function deleteFacebookPage(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(facebookPages).where(eq(facebookPages.id, id));
}

export async function getFacebookPage(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(facebookPages).where(eq(facebookPages.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserFacebookPages(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(facebookPages).where(eq(facebookPages.userId, userId)).orderBy(desc(facebookPages.createdAt));
}

export async function getActiveFacebookPages(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(facebookPages).where(
    and(
      eq(facebookPages.userId, userId),
      eq(facebookPages.isActive, true)
    )
  ).orderBy(desc(facebookPages.createdAt));
}

