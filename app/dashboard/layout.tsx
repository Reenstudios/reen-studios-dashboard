'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬛' },
  { href: '/dashboard/library', label: 'Artwork Library', icon: '🖼️' },
  { href: '/dashboard/generator', label: 'Content Generator', icon: '✨' },
  { href: '/dashboard/calendar', label: 'Content Calendar', icon: '📅' },
  { href: '/dashboard/assistant', label: 'AI Assistant', icon: '💬' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: '#faf9f6' }}>
      <aside style={{ width: 220, borderRight: '1px solid #eee', padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#5b6b4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>R</div>
          <strong style={{ fontFamily: 'serif', fontSize: 16 }}>Reën Studios</strong>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: active ? '#222' : '#666',
                  background: active ? '#eee' : 'transparent',
                  fontSize: 14,
                }}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleSignOut}
          style={{ marginTop: 'auto', textAlign: 'left', background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', padding: '8px 10px' }}
        >
          ↩ Sign Out
        </button>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
