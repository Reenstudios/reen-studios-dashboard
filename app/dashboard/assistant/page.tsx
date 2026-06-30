'use client';
import { useState } from 'react';

export default function AssistantPage() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);

  async function sendChat() {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'chat', message: chatInput, history: chatHistory }),
    });
    const data = await res.json();
    setChatHistory([...newHistory, { role: 'assistant', content: data.result || data.error }]);
  }

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1 style={{ fontFamily: 'serif', fontSize: 24, marginBottom: 20 }}>AI Assistant</h1>
      <div style={{ height: 500, overflowY: 'auto', border: '1px solid #eee', borderRadius: 10, padding: 14, marginBottom: 10, background: '#fff' }}>
        {chatHistory.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>Ask for help with captions, planning, or business advice based on your library.</p>}
        {chatHistory.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <span style={{ display: 'inline-block', background: m.role === 'user' ? '#222' : '#f0f0ee', color: m.role === 'user' ? '#fff' : '#000', padding: '8px 12px', borderRadius: 8, fontSize: 14, maxWidth: '85%' }}>
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendChat()}
          placeholder="Ask anything..."
          style={{ flex: 1, padding: 10, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <button onClick={sendChat} style={{ padding: '10px 16px', borderRadius: 6, background: '#222', color: '#fff', border: 'none' }}>
          Send
        </button>
      </div>
    </div>
  );
}
