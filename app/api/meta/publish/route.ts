import { NextResponse } from 'next/server';

// STUB: auto-publishing to Instagram requires the instagram_content_publish
// permission, which requires Meta App Review (see SETUP.md Step 3.7).
// Once approved, this two-step Graph API flow goes here:
//   1. POST /{ig-user-id}/media with image_url + caption -> returns a creation_id
//   2. POST /{ig-user-id}/media_publish with that creation_id -> publishes it
// Until then, this route just confirms what WOULD be posted, so you can wire
// up the UI button now and flip it on later without touching the frontend.

const GRAPH_URL = 'https://graph.facebook.com/v19.0';

export async function POST(req: Request) {
  const { imageUrl, caption } = await req.json();
  const token = process.env.META_ACCESS_TOKEN;
  const igUserId = process.env.META_IG_USER_ID;

  if (!token || !igUserId) {
    return NextResponse.json({ error: 'Meta credentials not configured yet' }, { status: 400 });
  }

  // Once instagram_content_publish is approved, uncomment:
  //
  // const createRes = await fetch(`${GRAPH_URL}/${igUserId}/media?access_token=${token}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ image_url: imageUrl, caption }),
  // });
  // const createData = await createRes.json();
  //
  // const publishRes = await fetch(`${GRAPH_URL}/${igUserId}/media_publish?access_token=${token}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ creation_id: createData.id }),
  // });
  // const publishData = await publishRes.json();
  // return NextResponse.json(publishData);

  return NextResponse.json({
    status: 'not_yet_enabled',
    message: 'Publishing requires Meta App Review approval. Mark this post as Scheduled and post manually for now.',
    wouldPost: { imageUrl, caption },
  });
}
