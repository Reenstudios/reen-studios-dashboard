'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Artwork = {
  id: string;
  title: string;
  status: string;
  image_url: string;
};

export default function LibraryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadArtworks();
  }, []);

  async function loadArtworks() {
    const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
    setArtworks(data || []);
  }

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontFamily: 'serif', fontSize: 24, marginBottom: 20 }}>Artwork Library</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
        {artworks.map((art) => (
          <div
            key={art.id}
            onClick={() => router.push(`/dashboard/generator?artworkId=${art.id}`)}
            style={{ cursor: 'pointer', border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', background: '#fff' }}
          >
            {art.image_url && <img src={art.image_url} alt={art.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
            <div style={{ padding: 10 }}>
              <strong style={{ fontSize: 13 }}>{art.title}</strong>
              <div style={{ fontSize: 11, color: '#888' }}>{art.status}</div>
            </div>
          </div>
        ))}
        {artworks.length === 0 && <p style={{ color: '#999' }}>No artworks yet — add one from the Dashboard page.</p>}
      </div>
    </div>
  );
}
