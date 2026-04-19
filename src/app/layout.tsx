import type { Metadata } from 'next';
import './globals.css';
import { ServiceProvider } from '@/context/ServiceContext';

export const metadata: Metadata = {
  title: "Erin's Escapades",
  description: 'Collaborative task voting with magic words',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ServiceProvider>
          {children}
        </ServiceProvider>
      </body>
    </html>
  );
}
