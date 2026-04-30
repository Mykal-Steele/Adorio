import Navbar from '@/components/Navbar';

export default function NavbarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
