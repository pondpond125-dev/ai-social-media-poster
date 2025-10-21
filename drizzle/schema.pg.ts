import { pgTable, varchar, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

/**
 * Enums for PostgreSQL
 */
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "generating", "ready", "posting", "completed", "failed"]);
export const scheduledPostStatusEnum = pgEnum("scheduled_post_status", ["pending", "processing", "completed", "failed"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * API configurations table
 * Stores user's API keys for various services
 */
export const apiConfigs = pgTable("api_configs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  
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
export const posts = pgTable("posts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  
  prompt: text("prompt").notNull(),
  referenceImageUrl: varchar("referenceImageUrl", { length: 512 }),
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
  
  status: postStatusEnum("status").default("draft").notNull(),
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
export const scheduledPosts = pgTable("scheduled_posts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  
  prompt: text("prompt").notNull(),
  referenceImageUrl: varchar("referenceImageUrl", { length: 512 }),
  caption: text("caption"),
  affiliateLink: varchar("affiliateLink", { length: 512 }),
  
  // Selected platforms (JSON array)
  platforms: text("platforms").notNull(),
  
  scheduledTime: timestamp("scheduledTime").notNull(),
  status: scheduledPostStatusEnum("status").default("pending").notNull(),
  
  // Reference to the actual post once created
  postId: varchar("postId", { length: 64 }).references(() => posts.id, { onDelete: "set null" }),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

/**
 * Facebook Pages table
 * Stores multiple Facebook Pages for each user
 */
export const facebookPages = pgTable("facebook_pages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  
  pageName: varchar("pageName", { length: 255 }).notNull(),
  pageId: varchar("pageId", { length: 255 }).notNull(),
  pageAccessToken: text("pageAccessToken").notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type FacebookPage = typeof facebookPages.$inferSelect;
export type InsertFacebookPage = typeof facebookPages.$inferInsert;

