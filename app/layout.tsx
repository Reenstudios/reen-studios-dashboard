export const metadata = {
  title: 'Reën Studios Dashboard',
  description: 'Content planning for Reën Studios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
