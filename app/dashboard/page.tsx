'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardHome() {
  const [stats, setStats] = useState({ artworks: 0, scheduled: 0, published: 0 });
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { count: artworkCount } = await supabase.from('artworks').select('*', { count: 'exact', head: true });
    const { count: scheduledCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'Scheduled');
    const { count: publishedCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'Published');
    setStats({ artworks: artworkCount || 0, scheduled: scheduledCount || 0, published: publishedCount || 0 });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setPendingFile(file);
      setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  }

  async function uploadArtwork() {
    if (!pendingFile) return;
    setUploading(true);
    const fileExt = pendingFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('artwork-images').upload(fileName, pendingFile);
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('artwork-images').getPublicUrl(fileName);
    const { error: insertError } = await supabase.from('artworks').insert({
      title: newTitle || 'Untitled',
      image_url: urlData.publicUrl,
      status: 'Available',
    });

    if (insertError) {
      alert('Saving artwork failed: ' + insertError.message);
    } else {
      setPendingFile(null);
      setNewTitle('');
      await loadStats();
    }
    setUploading(false);
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontFamily: 'serif', fontSize: 28, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: '#888', marginBottom: 28 }}>Welcome back — {dateStr}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="ARTWORKS" value={stats.artworks} />
        <StatCard label="SCHEDULED" value={stats.scheduled} />
        <StatCard label="PUBLISHED" value={stats.published} />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 24, marginBottom: 28 }}
      >
        <h3 style={{ fontFamily: 'serif', fontSize: 16, marginBottom: 16 }}>Drop Images Here</h3>
        <div style={{ border: '2px dashed #ddd', borderRadius: 8, padding: 36, textAlign: 'center', background: '#fafafa' }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Drag & drop artwork images</p>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>or click to browse — add a title and save</p>
          <input type="file" accept="image/*" onChange={handleFileSelect} />
        </div>
        {pendingFile && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14 }}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Artwork title"
              style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
            />
            <button
              onClick={uploadArtwork}
              disabled={uploading}
              style={{ padding: '8px 16px', borderRadius: 6, background: '#222', color: '#fff', border: 'none' }}
            >
              {uploading ? 'Saving...' : 'Save Artwork'}
            </button>
          </div>
        )}
      </div>

      <p style={{ color: '#999', fontSize: 13 }}>
        Visit Artwork Library to browse and generate captions, or Content Calendar to plan posts.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, color: '#999', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontFamily: 'serif', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}
