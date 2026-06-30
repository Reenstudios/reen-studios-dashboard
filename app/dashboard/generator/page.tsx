'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function GeneratorInner() {
  const params = useSearchParams();
  const artworkId = params.get('artworkId');
  const [artworks, setArtworks] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(artworkId || '');
  const [captions, setCaptions] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('artworks').select('*').order('created_at', { ascending: false }).then(({ data }) => setArtworks(data || []));
  }, []);

  async function generate() {
    if (!selectedId) return;
    setLoading(true);
    setCaptions('');
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'caption', artworkId: selectedId }),
    });
    const data = await res.json();
    setCaptions(data.result || data.error);
    setLoading(false);
  }

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1 style={{ fontFamily: 'serif', fontSize: 24, marginBottom: 20 }}>Content Generator</h1>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', width: '100%', marginBottom: 14 }}
      >
        <option value="">Choose an artwork...</option>
        {artworks.map((a) => (
          <option key={a.id} value={a.id}>{a.title}</option>
        ))}
      </select>
      <button
        onClick={generate}
        disabled={!selectedId || loading}
        style={{ padding: '10px 20px', borderRadius: 6, background: '#222', color: '#fff', border: 'none', marginBottom: 20 }}
      >
        {loading ? 'Generating...' : '✨ Generate Captions'}
      </button>
      {captions && (
        <div style={{ background: '#fff', border: '1px solid #eee', padding: 18, borderRadius: 10, whiteSpace: 'pre-wrap', fontSize: 14 }}>
          {captions}
        </div>
      )}
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32 }}>Loading...</div>}>
      <GeneratorInner />
    </Suspense>
  );
}
