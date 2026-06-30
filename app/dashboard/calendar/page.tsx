'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Post = {
  id: string;
  platform: string;
  post_type: string;
  caption: string;
  status: string;
  scheduled_for: string;
};

const STAGES = ['Idea', 'Draft', 'Scheduled', 'Published'];

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [postType, setPostType] = useState('Feed');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
  }

  async function addPost() {
    if (!caption.trim()) return;
    await supabase.from('posts').insert({ caption, platform, post_type: postType, status: 'Idea' });
    setCaption('');
    setShowForm(false);
    loadPosts();
  }

  async function moveStage(post: Post, direction: 1 | -1) {
    const idx = STAGES.indexOf(post.status);
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= STAGES.length) return;
    await supabase.from('posts').update({ status: STAGES[nextIdx] }).eq('id', post.id);
    loadPosts();
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'serif', fontSize: 24 }}>Content Calendar</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', borderRadius: 6, background: '#222', color: '#fff', border: 'none' }}>
          + Add Post Idea
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 18, marginBottom: 24 }}>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption or idea notes..."
            style={{ width: '100%', minHeight: 80, padding: 8, border: '1px solid #ccc', borderRadius: 6, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>Pinterest</option>
              <option>Email</option>
            </select>
            <select value={postType} onChange={(e) => setPostType(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
              <option>Feed</option>
              <option>Story</option>
              <option>Carousel</option>
              <option>Reel</option>
            </select>
            <button onClick={addPost} style={{ padding: '8px 16px', borderRadius: 6, background: '#222', color: '#fff', border: 'none' }}>
              Save
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {STAGES.map((stage) => (
          <div key={stage} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 12, minHeight: 200 }}>
            <h3 style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>{stage.toUpperCase()}</h3>
            {posts.filter((p) => p.status === stage).map((post) => (
              <div key={post.id} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8, fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{post.platform} · {post.post_type}</div>
                <div style={{ color: '#555', marginBottom: 8, maxHeight: 60, overflow: 'hidden' }}>{post.caption}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => moveStage(post, -1)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid #ccc', background: '#fff' }}>←</button>
                  <button onClick={() => moveStage(post, 1)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid #ccc', background: '#fff' }}>→</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
