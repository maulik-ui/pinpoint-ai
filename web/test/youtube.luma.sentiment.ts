import 'dotenv/config';
import OpenAI from 'openai';

const YT_KEY = process.env.YOUTUBE_API_KEY!;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const ONE_YEAR_AGO = new Date();
ONE_YEAR_AGO.setFullYear(ONE_YEAR_AGO.getFullYear() - 1);
const publishedAfter = ONE_YEAR_AGO.toISOString(); // RFC3339 for YouTube

async function searchLumaVideos() {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: 'Luma AI OR "Luma Labs AI"',
    maxResults: '15',
    order: 'relevance',
    publishedAfter,
    key: YT_KEY,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
  );
  const data: any = await res.json();

  const videoIds = data.items
    .map((item: any) => item.id?.videoId)
    .filter(Boolean);

  return videoIds as string[];
}

async function getVideoMeta(videoIds: string[]) {
  if (videoIds.length === 0) return [];

  const params = new URLSearchParams({
    part: 'snippet,statistics',
    id: videoIds.join(','),
    key: YT_KEY,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`
  );
  const data: any = await res.json();

  return data.items.map((v: any) => ({
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    channelTitle: v.snippet.channelTitle,
    publishedAt: v.snippet.publishedAt,
    viewCount: Number(v.statistics.viewCount || 0),
    likeCount: Number(v.statistics.likeCount || 0),
    commentCount: Number(v.statistics.commentCount || 0),
  }));
}

async function getTopComments(videoId: string, maxComments = 80) {
  let comments: string[] = [];
  let pageToken: string | undefined = undefined;

  while (comments.length < maxComments) {
    const params = new URLSearchParams({
      part: 'snippet',
      videoId,
      maxResults: '50',
      order: 'relevance',
      textFormat: 'plainText',
      key: YT_KEY,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?${params.toString()}`
    );
    const data: any = await res.json();

    for (const item of data.items || []) {
      const top = item.snippet.topLevelComment.snippet;
      comments.push(top.textDisplay);
      if (comments.length >= maxComments) break;
    }

    if (!data.nextPageToken || comments.length >= maxComments) break;
    pageToken = data.nextPageToken;
  }

  return comments;
}

async function collectTextForVideos() {
  const videoIds = await searchLumaVideos();
  console.log(`Found ${videoIds.length} candidate videos`);

  const videos = await getVideoMeta(videoIds);

  const bundles: { video: any; text: string }[] = [];

  for (const v of videos) {
    const comments = await getTopComments(v.id, 80);
    const text =
      `TITLE: ${v.title}\n` +
      `DESCRIPTION:\n${v.description}\n\n` +
      `TOP COMMENTS:\n` +
      comments.join('\n---\n');

    bundles.push({ video: v, text });
  }

  return bundles;
}

async function analyseWithOpenAI(bundles: { video: any; text: string }[]) {
  const combinedText = bundles
    .map(
      (b) =>
        `VIDEO: ${b.video.title}\n${b.text}`
    )
    .join('\n\n=========================\n\n');

  const prompt = `
You are evaluating sentiment about the AI video tool "Luma AI" (Luma Labs AI) based on YouTube data from the last year.

You are given titles, descriptions and comments from several videos.
Please read everything and respond with **only** a JSON object.

JSON schema:
{
  "tool": "Luma AI",
  "overall_sentiment_0_to_10": number,
  "sentiment_label": "very negative" | "negative" | "mixed" | "positive" | "very positive",
  "summary": string,
  "top_positives": string[],
  "top_negatives": string[]
}

Rules:
- Score should be from the perspective of creators using the tool.
- Consider both hype and complaints.
- Be honest, do not be overly optimistic.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a precise sentiment analyst for AI tools.',
      },
      { role: 'user', content: prompt },
      {
        role: 'user',
        content:
          'Here is the YouTube data for Luma AI (titles, descriptions, comments):\n\n' +
          combinedText,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const json = completion.choices[0].message.content;
  if (!json) throw new Error('No response content from OpenAI');
  return JSON.parse(json);
}

async function main() {
  try {
    const bundles = await collectTextForVideos();
    const result = await analyseWithOpenAI(bundles);

    console.log('\nYouTube sentiment for Luma AI:\n');
    console.dir(result, { depth: null });
  } catch (err) {
    console.error(err);
  }
}

main();