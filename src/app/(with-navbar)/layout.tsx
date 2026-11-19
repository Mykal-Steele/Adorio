import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

// the apps here are part of Adorio, my project; the rest of oakar.dev is my portfolio
export const metadata: Metadata = {
  title: { default: 'Adorio', template: '%s | Adorio' },
};

export default function NavbarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
