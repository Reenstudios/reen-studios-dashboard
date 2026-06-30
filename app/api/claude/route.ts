import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(messages: any[], system: string) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system,
      messages,
    }),
  });
  const data = await res.json();
  const text = data.content?.find((c: any) => c.type === 'text')?.text || '';
  return text;
}

// mode: "caption" -> generate captions for one artwork
// mode: "ideas"   -> generate content ideas across the library
// mode: "chat"    -> free-form assistant, can see full library context
export async function POST(req: Request) {
  const { mode, artworkId, message, history } = await req.json();

  if (mode === 'caption') {
    const { data: artwork } = await supabaseAdmin
      .from('artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (!artwork) return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });

    const system = `You are the social media copywriter for Reën Studios, an acrylic painting studio
focused on landscapes, commissions, and a faith-inspired art series. Write warm, conversational
Instagram captions in the artist's voice — not salesy, not generic. If the artwork has an associated
Bible verse, weave it in naturally rather than just appending it. Give 3 distinct caption options:
one short and punchy, one storytelling/process-focused, one reflective/faith-toned if relevant.`;

    const userMsg = `Artwork: ${artwork.title}
Medium: ${artwork.medium || 'n/a'}
Dimensions: ${artwork.dimensions || 'n/a'}
Status: ${artwork.status}
Tags: ${(artwork.tags || []).join(', ')}
${artwork.is_christian ? `Bible verse: ${artwork.bible_verse}` : ''}
Notes: ${artwork.notes || 'n/a'}

Write 3 caption options for an Instagram feed post.`;

    const text = await callClaude([{ role: 'user', content: userMsg }], system);
    return NextResponse.json({ result: text });
  }

  if (mode === 'ideas') {
    const { data: artworks } = await supabaseAdmin.from('artworks').select('*').limit(50);
    const { data: recentPosts } = await supabaseAdmin
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    const system = `You are a content strategist for Reën Studios, an acrylic painting studio.
Based on the artist's library and recent posting history, suggest 8 fresh content ideas spanning
feed posts, stories, and reels. Mix art-focused content (process, finished pieces, commissions)
with life/behind-the-scenes content (kayaking trips, studio life, inspiration). Flag which existing
artwork (by title) each idea could use, if any.`;

    const userMsg = `Artwork library: ${JSON.stringify(artworks?.map(a => ({ title: a.title, tags: a.tags, status: a.status, is_christian: a.is_christian })))}

Recent posts: ${JSON.stringify(recentPosts?.map(p => ({ platform: p.platform, type: p.post_type, status: p.status })))}

Give me 8 content ideas for the next two weeks.`;

    const text = await callClaude([{ role: 'user', content: userMsg }], system);
    return NextResponse.json({ result: text });
  }

  if (mode === 'chat') {
    const { data: artworks } = await supabaseAdmin.from('artworks').select('*').limit(50);

    const system = `You are the AI assistant inside the Reën Studios dashboard, helping the artist
(a graphic designer and self-taught painter) with captions, content planning, and creative business
advice. You have access to her artwork library below. Be warm, direct, and practical — she's running
this around a full-time job, so respect her time and give concrete, usable suggestions, not vague
inspiration. Library: ${JSON.stringify(artworks?.map(a => ({ title: a.title, tags: a.tags, status: a.status })))}`;

    const text = await callClaude([...(history || []), { role: 'user', content: message }], system);
    return NextResponse.json({ result: text });
  }

  return NextResponse.json({ error: 'Unknown mode' }, { status: 400 });
}
