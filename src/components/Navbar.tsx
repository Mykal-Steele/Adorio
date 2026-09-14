'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/userSlice';
import { AnimatePresence, motion } from 'framer-motion';

type NavItem = { href: string; text: string; external?: boolean };

const Navbar = () => {
  const { token } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === '/') return null;

  const close = () => setOpen(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
    close();
  };

  const links: NavItem[] = token
    ? [
        { href: '/social', text: 'Social' },
        { href: '/profile', text: 'Profile' },
        { href: '/hosting', text: 'Hosting' },
        { href: '/coding', text: 'Coding' },
        { href: '/smartcity', text: 'SmartCity' },
        { href: '/rygame', text: 'RyGame' },
        { href: '/cao', text: 'CAO', external: true },
      ]
    : [
        { href: '/coding', text: 'Coding' },
        { href: '/smartcity', text: 'SmartCity' },
        { href: '/cao', text: 'CAO', external: true },
        { href: '/login', text: 'Login' },
      ];

  return (
    // Deliberately a plain <nav>, not a motion component: animating this in with
    // a transform (e.g. initial={{ y: -64 }}) doesn't reserve layout space, so
    // for the brief window before the transform settles, the space it's about
    // to occupy shows straight through to <body>'s own background instead of
    // the navbar's — position:sticky elements still lay out at their
    // untransformed position. That was invisible on the old dark navbar over a
    // dark body; it's a visible dark flash on this cream one.
    <nav className="font-paper-sans sticky top-0 z-50 bg-[var(--paper-cream)] text-[var(--paper-ink)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center sm:h-16">
          <Link
            href="/social"
            aria-label="Adorio, home"
            className="mr-6 flex shrink-0 items-baseline gap-[6px]"
          >
            <span className="font-paper-serif text-xl font-bold italic tracking-[-.015em] sm:text-2xl">
              Adorio
            </span>
            <span
              aria-hidden="true"
              className="font-paper-serif text-lg font-bold leading-none sm:text-xl"
            >
              <span className="text-[#d1a413]">{'{'}</span>
              <span className="text-[#7f9c3c]">{'_}'}</span>
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-0.5 sm:flex">
            {links.map(({ href, text, external }) => {
              const isActive = pathname === href;
              const className =
                'relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:text-[var(--paper-accent)]';
              const label = (
                <span className="relative inline-block px-[7px] py-[2px]">
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-[-1px] bottom-0 h-[8px] -rotate-[0.7deg] rounded-[2px_7px_3px_8px] bg-[var(--paper-yellow)]"
                    />
                  )}
                  <span className="relative">{text}</span>
                </span>
              );
              return external ? (
                <a key={href} href={href} className={className}>
                  {label}
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={className}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {token ? (
            <button
              onClick={handleLogout}
              className="hidden shrink-0 -rotate-1 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-5 py-2 font-paper-mono text-xs font-bold uppercase tracking-[.14em] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px hover:shadow-[2px_5px_0_var(--paper-ink)] active:translate-y-0.5 active:shadow-[1px_1px_0_var(--paper-ink)] sm:ml-6 sm:block"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/register"
              className="hidden shrink-0 -rotate-1 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-5 py-2 font-paper-mono text-xs font-bold uppercase tracking-[.14em] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px hover:shadow-[2px_5px_0_var(--paper-ink)] active:translate-y-0.5 active:shadow-[1px_1px_0_var(--paper-ink)] sm:ml-6 sm:block"
            >
              Get Started
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-auto rounded-lg p-2 text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-yellow-soft)] sm:hidden"
            aria-label="Toggle navigation menu"
          >
            {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[rgba(60,44,24,.15)] bg-[var(--paper-cream)] sm:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
              {links.map(({ href, text, external }) =>
                external ? (
                  <a
                    key={href}
                    href={href}
                    onClick={close}
                    className="rounded-lg px-3 py-3 text-sm transition-colors hover:bg-[var(--paper-yellow-soft)]"
                  >
                    {text}
                  </a>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="rounded-lg px-3 py-3 text-sm transition-colors hover:bg-[var(--paper-yellow-soft)]"
                  >
                    {text}
                  </Link>
                ),
              )}

              <div className="mt-2 border-t border-dashed border-[var(--paper-line)] pt-2">
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-[#8d3a33] transition-colors hover:bg-[var(--paper-yellow-soft)]"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/register"
                    onClick={close}
                    className="block rounded-lg px-3 py-3 text-sm font-semibold text-[var(--paper-accent)] transition-colors hover:bg-[var(--paper-yellow-soft)]"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
