/**
 * Social Media Posting Service
 * Handles posting to Facebook, Instagram, X (Twitter), and TikTok
 */

interface PostToFacebookParams {
  pageId: string;
  accessToken: string;
  message: string;
  imageUrl: string;
}

interface PostToInstagramParams {
  userId: string;
  accessToken: string;
  caption: string;
  imageUrl: string;
}

interface PostToXParams {
  bearerToken: string;
  text: string;
  imageUrl: string;
}

interface PostToTikTokParams {
  apiKey: string;
  username: string;
  caption: string;
  imageUrl: string;
}

interface PostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Post to Facebook Page
 * Uses Facebook Graph API to post photo with message
 */
export async function postToFacebook(params: PostToFacebookParams): Promise<PostResult> {
  try {
    const { pageId, accessToken, message, imageUrl } = params;

    // Step 1: Download image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image");
    }
    const imageBlob = await imageResponse.blob();

    // Step 2: Upload photo to Facebook using multipart/form-data
    const uploadUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;
    
    const formData = new FormData();
    formData.append("source", imageBlob);
    if (message) {
      formData.append("caption", message);
    }
    formData.append("access_token", accessToken);

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error?.message || "Failed to post to Facebook");
    }

    const uploadData = await uploadResponse.json();

    return {
      success: true,
      postId: uploadData.id || uploadData.post_id,
    };
  } catch (error) {
    console.error("Facebook posting error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Post to Instagram Business Account
 * Uses Instagram Graph API (two-step process: create container, then publish)
 */
export async function postToInstagram(params: PostToInstagramParams): Promise<PostResult> {
  try {
    const { userId, accessToken, caption, imageUrl } = params;

    // Step 1: Create media container
    const createUrl = `https://graph.facebook.com/v18.0/${userId}/media`;
    const createParams = new URLSearchParams({
      image_url: imageUrl,
      caption: caption || "",
      access_token: accessToken,
    });

    const createResponse = await fetch(`${createUrl}?${createParams}`, {
      method: "POST",
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.error?.message || "Failed to create Instagram media container");
    }

    const createData = await createResponse.json();
    const containerId = createData.id;

    // Step 2: Publish the container
    const publishUrl = `https://graph.facebook.com/v18.0/${userId}/media_publish`;
    const publishParams = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    });

    const publishResponse = await fetch(`${publishUrl}?${publishParams}`, {
      method: "POST",
    });

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(error.error?.message || "Failed to publish Instagram post");
    }

    const publishData = await publishResponse.json();

    return {
      success: true,
      postId: publishData.id,
    };
  } catch (error) {
    console.error("Instagram posting error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Post to X (Twitter)
 * Uses X API v2 to post tweet with media
 */
export async function postToX(params: PostToXParams): Promise<PostResult> {
  try {
    const { bearerToken, text, imageUrl } = params;

    // Step 1: Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image");
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    // Step 2: Upload media to Twitter
    const uploadUrl = "https://upload.twitter.com/1.1/media/upload.json";
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        media_data: imageBase64,
      }),
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.errors?.[0]?.message || "Failed to upload media to X");
    }

    const uploadData = await uploadResponse.json();
    const mediaId = uploadData.media_id_string;

    // Step 3: Create tweet with media
    const tweetUrl = "https://api.twitter.com/2/tweets";
    const tweetResponse = await fetch(tweetUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text || "",
        media: {
          media_ids: [mediaId],
        },
      }),
    });

    if (!tweetResponse.ok) {
      const error = await tweetResponse.json();
      throw new Error(error.errors?.[0]?.message || "Failed to post to X");
    }

    const tweetData = await tweetResponse.json();

    return {
      success: true,
      postId: tweetData.data?.id,
    };
  } catch (error) {
    console.error("X posting error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Post to TikTok
 * Uses Upload.post API to post to TikTok
 */
export async function postToTikTok(params: PostToTikTokParams): Promise<PostResult> {
  try {
    const { apiKey, username, caption, imageUrl } = params;

    // Upload.post API endpoint
    const uploadUrl = "https://api.upload.post/v1/tiktok/post";
    
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        caption: caption || "",
        media_url: imageUrl,
        privacy: "private", // TikTok posts via API are private by default
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to post to TikTok");
    }

    const data = await response.json();

    return {
      success: true,
      postId: data.post_id || data.id,
    };
  } catch (error) {
    console.error("TikTok posting error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Post to multiple platforms
 */
export async function postToMultiplePlatforms(
  platforms: string[],
  config: {
    message: string;
    imageUrl: string;
    facebookPageId?: string;
    facebookToken?: string;
    instagramUserId?: string;
    instagramToken?: string;
    xToken?: string;
    tiktokApiKey?: string;
    tiktokUsername?: string;
  }
): Promise<Record<string, PostResult>> {
  const results: Record<string, PostResult> = {};

  for (const platform of platforms) {
    try {
      if (platform === "facebook") {
        if (!config.facebookPageId || !config.facebookToken) {
          results[platform] = {
            success: false,
            error: "Facebook credentials not configured",
          };
          continue;
        }
        results[platform] = await postToFacebook({
          pageId: config.facebookPageId,
          accessToken: config.facebookToken,
          message: config.message,
          imageUrl: config.imageUrl,
        });
      } else if (platform === "instagram") {
        if (!config.instagramUserId || !config.instagramToken) {
          results[platform] = {
            success: false,
            error: "Instagram credentials not configured",
          };
          continue;
        }
        results[platform] = await postToInstagram({
          userId: config.instagramUserId,
          accessToken: config.instagramToken,
          caption: config.message,
          imageUrl: config.imageUrl,
        });
      } else if (platform === "x") {
        if (!config.xToken) {
          results[platform] = {
            success: false,
            error: "X credentials not configured",
          };
          continue;
        }
        results[platform] = await postToX({
          bearerToken: config.xToken,
          text: config.message,
          imageUrl: config.imageUrl,
        });
      } else if (platform === "tiktok") {
        if (!config.tiktokApiKey || !config.tiktokUsername) {
          results[platform] = {
            success: false,
            error: "TikTok credentials not configured",
          };
          continue;
        }
        results[platform] = await postToTikTok({
          apiKey: config.tiktokApiKey,
          username: config.tiktokUsername,
          caption: config.message,
          imageUrl: config.imageUrl,
        });
      }
    } catch (error) {
      results[platform] = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  return results;
}

