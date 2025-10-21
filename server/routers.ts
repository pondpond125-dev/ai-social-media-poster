import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { generateImage } from "./_core/imageGeneration";
import { TRPCError } from "@trpc/server";
import { postToMultiplePlatforms } from "./socialMedia";
import { facebookPages } from "../drizzle/schema.pg";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  apiConfig: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const config = await db.getApiConfig(ctx.user.id);
      return config || null;
    }),

    save: protectedProcedure
      .input(z.object({
        geminiApiKey: z.string().optional(),
        facebookPageId: z.string().optional(),
        facebookToken: z.string().optional(),
        instagramUserId: z.string().optional(),
        instagramToken: z.string().optional(),
        xToken: z.string().optional(),
        uploadPostApiKey: z.string().optional(),
        uploadPostUser: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertApiConfig({
          id: ctx.user.id,
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  posts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserPosts(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const post = await db.getPost(input.id);
        if (!post || post.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return post;
      }),

    create: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        referenceImageUrl: z.string().optional(),
        caption: z.string().optional(),
        affiliateLink: z.string().optional(),
        platforms: z.array(z.enum(["facebook", "instagram", "x", "tiktok"])),
      }))
      .mutation(async ({ ctx, input }) => {
        const postId = nanoid();

        // Create post in database
        await db.createPost({
          id: postId,
          userId: ctx.user.id,
          prompt: input.prompt,
          referenceImageUrl: input.referenceImageUrl,
          caption: input.caption,
          affiliateLink: input.affiliateLink,
          status: "generating",
        });

        // Generate image in background
        try {
          const generateParams: any = { prompt: input.prompt };
          if (input.referenceImageUrl) {
            generateParams.originalImages = [{
              url: input.referenceImageUrl,
              mimeType: "image/jpeg"
            }];
          }
          const { url: imageUrl } = await generateImage(generateParams);
          await db.updatePost(postId, {
            imageUrl,
            status: "ready",
          });
        } catch (error) {
          await db.updatePost(postId, {
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Failed to generate image",
          });
          throw error;
        }

        return { id: postId };
      }),

    postToSocial: protectedProcedure
      .input(z.object({
        postId: z.string(),
        platforms: z.array(z.enum(["facebook", "instagram", "x", "tiktok"])),
        facebookPageIds: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getPost(input.postId);
        if (!post || post.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (post.status !== "ready") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Post is not ready for posting" });
        }

        // Get API config
        const apiConfig = await db.getApiConfig(ctx.user.id);
        if (!apiConfig) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "API configuration not found" });
        }

        await db.updatePost(input.postId, { status: "posting" });

        // Prepare caption with affiliate link
        const fullCaption = post.affiliateLink 
          ? `${post.caption}\n\n${post.affiliateLink}` 
          : post.caption;

        // Handle Facebook Pages
        let facebookResults: any = null;
        if (input.platforms.includes("facebook")) {
          const drizzleDb = await getDb();
          if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
          
          const selectedPageIds = input.facebookPageIds || [];
          
          if (selectedPageIds.length === 0) {
            // ถ้าไม่เลือก ให้โพสต์ทุก Page ที่ active
            const pages = await drizzleDb.select()
              .from(facebookPages)
              .where(
                and(
                  eq(facebookPages.userId, ctx.user.id),
                  eq(facebookPages.isActive, true)
                )
              );
            selectedPageIds.push(...pages.map(p => p.id));
          }
          
          if (selectedPageIds.length > 0) {
            // โพสต์ไปยังทุก Page ที่เลือก (parallel)
            const pageResults = await Promise.all(
              selectedPageIds.map(async (id) => {
                const pageData = await drizzleDb.select()
                  .from(facebookPages)
                  .where(eq(facebookPages.id, id))
                  .limit(1);
                
                if (!pageData[0]) return null;
                
                try {
                  const { postToFacebook } = await import("./socialMedia");
                  const result = await postToFacebook({
                    pageId: pageData[0].pageId,
                    accessToken: pageData[0].pageAccessToken,
                    message: fullCaption || "",
                    imageUrl: post.imageUrl || "",
                  });
                  
                  return {
                    pageName: pageData[0].pageName,
                    pageId: pageData[0].pageId,
                    ...result,
                  };
                } catch (error) {
                  console.error(`Facebook posting error for ${pageData[0].pageName}:`, error);
                  return {
                    pageName: pageData[0].pageName,
                    pageId: pageData[0].pageId,
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                  };
                }
              })
            );
            
            facebookResults = {
              success: pageResults.some(r => r?.success),
              pages: pageResults.filter(r => r !== null),
            };
          }
        }

        // Post to other social media platforms
        const otherPlatforms = input.platforms.filter(p => p !== "facebook");
        const results: any = {};
        
        if (otherPlatforms.length > 0) {
          const otherResults = await postToMultiplePlatforms(otherPlatforms, {
            message: fullCaption || "",
            imageUrl: post.imageUrl || "",
            facebookPageId: apiConfig.facebookPageId || undefined,
            facebookToken: apiConfig.facebookToken || undefined,
            instagramUserId: apiConfig.instagramUserId || undefined,
            instagramToken: apiConfig.instagramToken || undefined,
            xToken: apiConfig.xToken || undefined,
            tiktokApiKey: apiConfig.uploadPostApiKey || undefined,
            tiktokUsername: apiConfig.uploadPostUser || undefined,
          });
          Object.assign(results, otherResults);
        }
        
        if (facebookResults) {
          results.facebook = facebookResults;
        }

        // Update post status for each platform
        for (const [platform, result] of Object.entries(results)) {
          const platformResult = result as any;
          if (platformResult.success) {
            if (platform === "facebook") {
              await db.updatePost(input.postId, {
                postedToFacebook: true,
                facebookPostId: platformResult.postId || "multiple",
              });
            } else if (platform === "instagram") {
              await db.updatePost(input.postId, {
                postedToInstagram: true,
                instagramPostId: platformResult.postId,
              });
            } else if (platform === "x") {
              await db.updatePost(input.postId, {
                postedToX: true,
                xPostId: platformResult.postId,
              });
            } else if (platform === "tiktok") {
              await db.updatePost(input.postId, {
                postedToTiktok: true,
                tiktokPostId: platformResult.postId,
              });
            }
          }
        }

        await db.updatePost(input.postId, { status: "completed" });

        return results;
      }),
  }),

  facebookPages: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const drizzleDb = await getDb();
      if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      return await drizzleDb.select()
        .from(facebookPages)
        .where(eq(facebookPages.userId, ctx.user.id))
        .orderBy(desc(facebookPages.createdAt));
    }),

    create: protectedProcedure
      .input(z.object({
        pageName: z.string(),
        pageId: z.string(),
        pageAccessToken: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const id = nanoid();

        await drizzleDb.insert(facebookPages).values({
          id,
          userId: ctx.user.id,
          pageName: input.pageName,
          pageId: input.pageId,
          pageAccessToken: input.pageAccessToken,
          isActive: true,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        pageName: z.string().optional(),
        pageId: z.string().optional(),
        pageAccessToken: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { id, ...updates } = input;

        const page = await drizzleDb.select()
          .from(facebookPages)
          .where(
            and(
              eq(facebookPages.id, id),
              eq(facebookPages.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!page[0]) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await drizzleDb.update(facebookPages)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(facebookPages.id, id));

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const page = await drizzleDb.select()
          .from(facebookPages)
          .where(
            and(
              eq(facebookPages.id, input.id),
              eq(facebookPages.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!page[0]) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await drizzleDb.delete(facebookPages)
          .where(eq(facebookPages.id, input.id));

        return { success: true };
      }),
  }),

  scheduledPosts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserScheduledPosts(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        referenceImageUrl: z.string().optional(),
        caption: z.string().optional(),
        affiliateLink: z.string().optional(),
        platforms: z.array(z.enum(["facebook", "instagram", "x", "tiktok"])),
        scheduledTime: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = nanoid();

        await db.createScheduledPost({
          id,
          userId: ctx.user.id,
          prompt: input.prompt,
          referenceImageUrl: input.referenceImageUrl,
          caption: input.caption,
          affiliateLink: input.affiliateLink,
          platforms: JSON.stringify(input.platforms),
          scheduledTime: input.scheduledTime,
          status: "pending",
        });

        return { id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const scheduled = await db.getScheduledPost(input.id);
        if (!scheduled || scheduled.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await db.updateScheduledPost(input.id, { status: "failed", errorMessage: "Deleted by user" });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

