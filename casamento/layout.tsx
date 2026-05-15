import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Casamento Lais & Antônio',
  description: 'Protótipo inicial de um site de casamento feito com Next.js e TypeScript.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}