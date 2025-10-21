import { mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, int } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * API configurations table
 * Stores user's API keys for various services
 */
export const apiConfigs = mysqlTable("api_configs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  
  // Image generation
  geminiApiKey: text("geminiApiKey"),
  
  // Social media platforms
  facebookPageId: varchar("facebookPageId", { length: 255 }),
  facebookToken: text("facebookToken"),
  instagramUserId: varchar("instagramUserId", { length: 255 }),
  instagramToken: text("instagramToken"),
  xToken: text("xToken"),
  uploadPostApiKey: text("uploadPostApiKey"),
  uploadPostUser: varchar("uploadPostUser", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ApiConfig = typeof apiConfigs.$inferSelect;
export type InsertApiConfig = typeof apiConfigs.$inferInsert;

/**
 * Posts table
 * Stores generated posts and their metadata
 */
export const posts = mysqlTable("posts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  
  prompt: text("prompt").notNull(),
  caption: text("caption"),
  affiliateLink: varchar("affiliateLink", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  
  // Platform posting status
  postedToFacebook: boolean("postedToFacebook").default(false),
  postedToInstagram: boolean("postedToInstagram").default(false),
  postedToX: boolean("postedToX").default(false),
  postedToTiktok: boolean("postedToTiktok").default(false),
  
  // Posting results
  facebookPostId: varchar("facebookPostId", { length: 255 }),
  instagramPostId: varchar("instagramPostId", { length: 255 }),
  xPostId: varchar("xPostId", { length: 255 }),
  tiktokPostId: varchar("tiktokPostId", { length: 255 }),
  
  status: mysqlEnum("status", ["draft", "generating", "ready", "posting", "completed", "failed"]).default("draft").notNull(),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Scheduled posts table
 * Stores posts scheduled for future posting
 */
export const scheduledPosts = mysqlTable("scheduled_posts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  
  prompt: text("prompt").notNull(),
  caption: text("caption"),
  affiliateLink: varchar("affiliateLink", { length: 512 }),
  
  // Selected platforms
  platforms: text("platforms").notNull(), // JSON array of platform names
  
  scheduledTime: timestamp("scheduledTime").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  
  // Reference to the actual post once created
  postId: varchar("postId", { length: 64 }),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

