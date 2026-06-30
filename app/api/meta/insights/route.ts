import { NextResponse } from 'next/server';

// Pulls recent media + insights (reach, saves, engagement) for your Instagram
// Business account. Read-only — works with just instagram_basic +
// instagram_manage_insights permissions, no Meta App Review required.

const GRAPH_URL = 'https://graph.facebook.com/v19.0';

export async function GET() {
  const token = process.env.META_ACCESS_TOKEN;
  const igUserId = process.env.META_IG_USER_ID;

  if (!token || !igUserId) {
    return NextResponse.json({ error: 'Meta credentials not configured yet' }, { status: 400 });
  }

  // Get recent media
  const mediaRes = await fetch(
    `${GRAPH_URL}/${igUserId}/media?fields=id,caption,media_type,timestamp,permalink&limit=20&access_token=${token}`
  );
  const mediaData = await mediaRes.json();

  if (mediaData.error) {
    return NextResponse.json({ error: mediaData.error.message }, { status: 400 });
  }

  // Pull insights for each post
  const withInsights = await Promise.all(
    (mediaData.data || []).map(async (post: any) => {
      const metricSet = post.media_type === 'VIDEO' ? 'plays,reach,saved,comments,likes' : 'reach,saved,comments,likes';
      const insightsRes = await fetch(
        `${GRAPH_URL}/${post.id}/insights?metric=${metricSet}&access_token=${token}`
      );
      const insightsData = await insightsRes.json();
      return { ...post, insights: insightsData.data || [] };
    })
  );

  return NextResponse.json({ posts: withInsights });
}
