import '../styles/globals.css';
import Header from '../components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WRA Dashboard',
  description: 'Dashboard da WRA Technology',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
