import type { Metadata } from 'next';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'BigStep Academy - Admin Boshqaruv Paneli',
  description: 'BigStep Academy o\'quv markazi uchun admin boshqaruv paneli',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="h-full">
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
