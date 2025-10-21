import { eq, desc, and, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, apiConfigs, InsertApiConfig, posts, InsertPost, scheduledPosts, InsertScheduledPost } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

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
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
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

  await db.insert(apiConfigs).values(config).onDuplicateKeyUpdate({
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

