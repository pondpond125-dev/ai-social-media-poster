import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { generateImage } from "./_core/imageGeneration";
import { TRPCError } from "@trpc/server";

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
      return await db.getApiConfig(ctx.user.id);
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
          caption: input.caption,
          affiliateLink: input.affiliateLink,
          status: "generating",
        });

        // Generate image in background
        try {
          const { url: imageUrl } = await generateImage({ prompt: input.prompt });
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

        const results: Record<string, { success: boolean; error?: string; postId?: string }> = {};

        // Post to each platform
        // Note: Actual API calls would be implemented here
        // For now, we'll simulate the posting
        for (const platform of input.platforms) {
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            results[platform] = {
              success: true,
              postId: nanoid(),
            };

            // Update post status
            if (platform === "facebook") {
              await db.updatePost(input.postId, {
                postedToFacebook: true,
                facebookPostId: results[platform].postId,
              });
            } else if (platform === "instagram") {
              await db.updatePost(input.postId, {
                postedToInstagram: true,
                instagramPostId: results[platform].postId,
              });
            } else if (platform === "x") {
              await db.updatePost(input.postId, {
                postedToX: true,
                xPostId: results[platform].postId,
              });
            } else if (platform === "tiktok") {
              await db.updatePost(input.postId, {
                postedToTiktok: true,
                tiktokPostId: results[platform].postId,
              });
            }
          } catch (error) {
            results[platform] = {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }

        await db.updatePost(input.postId, { status: "completed" });

        return results;
      }),
  }),

  scheduledPosts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserScheduledPosts(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        prompt: z.string(),
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

