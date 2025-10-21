-- AI Social Media Poster - Supabase PostgreSQL Schema
-- Converted from MySQL Drizzle schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "lastSignedIn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Configurations table
CREATE TABLE IF NOT EXISTS api_configs (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  
  -- Image generation
  "geminiApiKey" TEXT,
  
  -- Social media platforms
  "facebookPageId" VARCHAR(255),
  "facebookToken" TEXT,
  "instagramUserId" VARCHAR(255),
  "instagramToken" TEXT,
  "xToken" TEXT,
  "uploadPostApiKey" TEXT,
  "uploadPostUser" VARCHAR(255),
  
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  
  prompt TEXT NOT NULL,
  "referenceImageUrl" VARCHAR(512),
  caption TEXT,
  "affiliateLink" VARCHAR(512),
  "imageUrl" VARCHAR(512),
  
  -- Platform posting status
  "postedToFacebook" BOOLEAN DEFAULT FALSE,
  "postedToInstagram" BOOLEAN DEFAULT FALSE,
  "postedToX" BOOLEAN DEFAULT FALSE,
  "postedToTiktok" BOOLEAN DEFAULT FALSE,
  
  -- Posting results
  "facebookPostId" VARCHAR(255),
  "instagramPostId" VARCHAR(255),
  "xPostId" VARCHAR(255),
  "tiktokPostId" VARCHAR(255),
  
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'posting', 'completed', 'failed')),
  "errorMessage" TEXT,
  
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Scheduled Posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  
  prompt TEXT NOT NULL,
  "referenceImageUrl" VARCHAR(512),
  caption TEXT,
  "affiliateLink" VARCHAR(512),
  
  -- Selected platforms (JSON array)
  platforms TEXT NOT NULL,
  
  "scheduledTime" TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Reference to the actual post once created
  "postId" VARCHAR(64),
  "errorMessage" TEXT,
  
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY ("postId") REFERENCES posts(id) ON DELETE SET NULL
);

-- Facebook Pages table
CREATE TABLE IF NOT EXISTS facebook_pages (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  
  "pageName" VARCHAR(255) NOT NULL,
  "pageId" VARCHAR(255) NOT NULL,
  "pageAccessToken" TEXT NOT NULL,
  
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_configs_userId ON api_configs("userId");
CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts("userId");
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_userId ON scheduled_posts("userId");
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduledTime ON scheduled_posts("scheduledTime");
CREATE INDEX IF NOT EXISTS idx_facebook_pages_userId ON facebook_pages("userId");
CREATE INDEX IF NOT EXISTS idx_facebook_pages_isActive ON facebook_pages("isActive");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_api_configs_updated_at BEFORE UPDATE ON api_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON scheduled_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facebook_pages_updated_at BEFORE UPDATE ON facebook_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

