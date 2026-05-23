import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'bodyrec',
  description: 'Body recomposition tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#0f1117] text-gray-100 antialiased">
        <Nav />
        <main className="pb-10">{children}</main>
      </body>
    </html>
  );
}
