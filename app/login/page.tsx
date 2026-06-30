'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError('Incorrect password');
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Reën Studios</h1>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, border: '1px solid #ccc', borderRadius: 6 }}
        />
        {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
        <button type="submit" style={{ padding: 10, borderRadius: 6, background: '#222', color: '#fff', border: 'none' }}>
          Enter
        </button>
      </form>
    </div>
  );
}
