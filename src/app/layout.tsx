import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'CleanMadurai.AI - Smart Waste Management',
  description: 'AI-powered waste management system for Madurai Corporation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-transparent overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-transparent">
        {/* Main Content Container - Elevated above the fixed background */}
        <div className="relative z-10 min-h-screen flex flex-col bg-transparent">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}