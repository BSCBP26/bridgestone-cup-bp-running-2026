import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'BSCup Running Challenges • Bridgestone - Bekasi Plant', description: 'Dashboard aktivitas dan klasemen lari Bridgestone Bekasi Plant.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="id"><body>{children}</body></html> }
