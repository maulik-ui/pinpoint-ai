/**
 * YouTube Data API collector
 * Collects YouTube videos, descriptions, and comments about a tool for sentiment analysis
 * 
 * Environment variables required:
 * - YOUTUBE_API_KEY: YouTube Data API v3 key
 */

import type { Tool, RawSourceData, SentimentConfig } from '../types';
import { DEFAULT_SENTIMENT_CONFIG } from '../config';

/**
 * Collects YouTube data for a given tool
 * Searches YouTube for videos about the tool, then fetches top comments
 * 
 * @param tool - Tool definition with id, name, and optional search_query
 * @param config - Configuration for collection (lookback period, limits, etc.)
 * @returns Raw source data with text blocks and metadata
 */
export async function collectYouTubeData(
  tool: Tool,
  config: SentimentConfig = DEFAULT_SENTIMENT_CONFIG
): Promise<RawSourceData> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY environment variable is not set');
  }

  // Calculate time window
  const windowEnd = new Date();
  const windowStart = new Date();
  windowStart.setMonth(windowStart.getMonth() - config.lookback_months);
  const publishedAfter = windowStart.toISOString();

  // Build search query
  const searchQuery = tool.search_query || `${tool.name} OR "${tool.name} AI"`;

  const textBlocks: string[] = [];
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalVideos = 0;

  try {
    // Step 1: Search for videos
    const searchParams = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      q: searchQuery,
      maxResults: String(config.youtube_max_videos || 15),
      order: 'relevance',
      publishedAfter,
      key: apiKey,
    });

    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text().catch(() => 'Unknown error');
      throw new Error(`YouTube search API error (${searchResponse.status}): ${errorText}`);
    }

    const searchData: any = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.warn(`No YouTube videos found for ${tool.name}`);
      return {
        source: 'youtube',
        tool_id: tool.id,
        text_blocks: [],
        metadata: {
          total_items: 0,
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          window_start: windowStart.toISOString(),
          window_end: windowEnd.toISOString(),
        },
      };
    }

    const videoIds = searchData.items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      throw new Error('No valid video IDs found in search results');
    }

    // Step 2: Get video metadata (title, description, statistics)
    const videoParams = new URLSearchParams({
      part: 'snippet,statistics',
      id: videoIds.join(','),
      key: apiKey,
    });

    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${videoParams.toString()}`
    );

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text().catch(() => 'Unknown error');
      throw new Error(`YouTube videos API error (${videoResponse.status}): ${errorText}`);
    }

    const videoData: any = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      throw new Error('No video metadata returned');
    }

    // Step 3: For each video, collect title, description, and top comments
    for (const video of videoData.items) {
      const videoId = video.id;
      const title = video.snippet?.title || '';
      const description = video.snippet?.description || '';
      const viewCount = Number(video.statistics?.viewCount || 0);
      const likeCount = Number(video.statistics?.likeCount || 0);
      const commentCount = Number(video.statistics?.commentCount || 0);

      totalViews += viewCount;
      totalLikes += likeCount;
      totalComments += commentCount;
      totalVideos++;

      // Collect top comments for this video
      const comments = await getTopComments(
        videoId,
        apiKey,
        config.youtube_max_comments_per_video || 80
      );

      // Build text block for this video
      const videoText = [
        `VIDEO: ${title}`,
        `DESCRIPTION:\n${description}`,
        `STATS: ${viewCount.toLocaleString()} views, ${likeCount.toLocaleString()} likes, ${commentCount.toLocaleString()} comments`,
        `TOP COMMENTS:\n${comments.join('\n---\n')}`,
      ].join('\n\n');

      textBlocks.push(videoText);
    }

  } catch (error) {
    console.error(`YouTube collection failed for tool ${tool.name}:`, error);
    throw new Error(`YouTube collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    source: 'youtube',
    tool_id: tool.id,
    text_blocks: textBlocks,
    metadata: {
      total_items: totalVideos,
      total_views: totalViews,
      total_likes: totalLikes,
      total_comments: totalComments,
      window_start: windowStart.toISOString(),
      window_end: windowEnd.toISOString(),
    },
  };
}

/**
 * Fetches top comments for a YouTube video
 * Uses pagination to collect up to maxComments comments
 */
async function getTopComments(
  videoId: string,
  apiKey: string,
  maxComments: number
): Promise<string[]> {
  const comments: string[] = [];
  let pageToken: string | undefined = undefined;

  while (comments.length < maxComments) {
    const params = new URLSearchParams({
      part: 'snippet',
      videoId,
      maxResults: '50', // YouTube API max per page
      order: 'relevance',
      textFormat: 'plainText',
      key: apiKey,
    });

    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?${params.toString()}`
      );

      if (!response.ok) {
        // If comments are disabled or other error, break gracefully
        if (response.status === 403) {
          console.warn(`Comments disabled or inaccessible for video ${videoId}`);
          break;
        }
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`YouTube comments API error (${response.status}): ${errorText}`);
      }

      const data: any = await response.json();

      if (!data.items || data.items.length === 0) {
        break; // No more comments
      }

      for (const item of data.items) {
        const topComment = item.snippet?.topLevelComment?.snippet;
        if (topComment?.textDisplay) {
          comments.push(topComment.textDisplay);
          if (comments.length >= maxComments) {
            break;
          }
        }
      }

      if (!data.nextPageToken || comments.length >= maxComments) {
        break;
      }

      pageToken = data.nextPageToken;
    } catch (error) {
      console.warn(`Error fetching comments for video ${videoId}:`, error);
      break; // Continue with comments collected so far
    }
  }

  return comments;
}

