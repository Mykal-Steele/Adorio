'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/userSlice';
import { AnimatePresence, motion } from 'framer-motion';

type NavItem = { href: string; text: string; external?: boolean };
type NavSection = { label: string; items: NavItem[] };

const Navbar = () => {
  const { token, user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setMoreOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
    setOpen(false);
  }, [pathname]);

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
        { href: '/rygame', text: 'RyGame' },
        { href: '/sendenv', text: 'SendEnv' },
        { href: '/finance', text: 'Financial Tracker' },
        { href: '/learn-korean', text: 'Learn Korean' },
      ]
    : [
        { href: '/coding', text: 'Coding' },
        { href: '/learn-korean', text: 'Learn Korean' },
      ];

  const sections: NavSection[] = [];

  if (token) {
    sections.push({
      label: 'Apps',
      items: [
        { href: '/data-lookup', text: 'Data Lookup' },
        ...(user?.isAdmin ? [{ href: '/hosting/admin', text: 'Hosting Admin' }] : []),
      ],
    });
  }

  sections.push(
    {
      label: 'Explore',
      items: [
        { href: '/smartcity', text: 'SmartCity' },
        { href: '/tempBeforeReal', text: 'Retro TV' },
        { href: '/cao', text: 'CAO', external: true },
      ],
    },
    {
      label: 'Study Pages',
      items: [
        { href: '/algo', text: 'Algo Cheat Sheet' },
        { href: '/sadnote.html', text: 'SAD Textbook' },
        { href: '/statsNotes.html', text: 'Stats Study Guide' },
        { href: '/statsQuiz.html', text: 'Stats Quiz' },
        { href: '/cogni-report.html', text: 'CogniMax Report' },
      ],
    },
    {
      label: 'Files',
      items: [
        { href: '/resume', text: 'Resume' },
        { href: '/performance', text: 'Performance Report' },
        { href: '/AI_Exam2_Cheat_Sheets.pdf', text: 'AI Exam Cheat Sheets' },
      ],
    },
  );

  const isMoreActive = sections.some((section) =>
    section.items.some((item) => pathname === item.href),
  );

  const linkClassName =
    'relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:text-[var(--paper-accent)]';

  const renderLabel = (text: string, active: boolean) => (
    <span className="relative inline-block px-[7px] py-[2px]">
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-x-[-1px] bottom-0 h-[8px] -rotate-[0.7deg] rounded-[2px_7px_3px_8px] bg-[var(--paper-yellow)]"
        />
      )}
      <span className="relative">{text}</span>
    </span>
  );

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
            <span className="font-paper-serif text-2xl font-bold italic tracking-[-.015em] sm:text-3xl">
              Adorio
            </span>
            <span
              aria-hidden="true"
              className="font-paper-serif text-xl font-bold leading-none sm:text-2xl"
            >
              <span className="text-[#d1a413]">{'{'}</span>
              <span className="text-[#7f9c3c]">{'_}'}</span>
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-0.5 xl:flex">
            {links.map(({ href, text, external }) => {
              const isActive = pathname === href;
              return external ? (
                <a key={href} href={href} className={linkClassName}>
                  {renderLabel(text, isActive)}
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={linkClassName}
                >
                  {renderLabel(text, isActive)}
                </Link>
              );
            })}

            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                aria-expanded={moreOpen}
                aria-controls="navbar-more-panel"
                className={linkClassName}
              >
                <span className="relative inline-flex items-center gap-0.5 px-[7px] py-[2px]">
                  {isMoreActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-[-1px] bottom-0 h-[8px] -rotate-[0.7deg] rounded-[2px_7px_3px_8px] bg-[var(--paper-yellow)]"
                    />
                  )}
                  <span className="relative">More</span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className={`relative h-3.5 w-3.5 transition-transform duration-150 ${
                      moreOpen ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              {moreOpen && (
                <div
                  id="navbar-more-panel"
                  className="absolute right-0 top-full z-50 mt-1 w-[540px] origin-top-right rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] p-4 shadow-[3px_4px_0_var(--paper-ink)]"
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {sections.map((section) => (
                      <div key={section.label}>
                        <p className="mb-1.5 border-b border-dashed border-[var(--paper-line)] pb-1 font-paper-mono text-[10px] uppercase tracking-[.18em] text-[var(--paper-muted-2)]">
                          {section.label}
                        </p>
                        <ul>
                          {section.items.map((item) => {
                            const isActive = pathname === item.href;
                            const className = `block rounded-[2px] px-2 py-1.5 text-sm transition-colors hover:bg-[var(--paper-yellow-soft)] ${
                              isActive
                                ? 'bg-[var(--paper-yellow-soft)] font-semibold text-[var(--paper-accent-deep)]'
                                : ''
                            }`;
                            return (
                              <li key={item.href}>
                                {item.external ? (
                                  <a
                                    href={item.href}
                                    onClick={() => setMoreOpen(false)}
                                    className={className}
                                  >
                                    {item.text}
                                    <span aria-hidden="true" className="ml-1 text-[10px]">
                                      ↗
                                    </span>
                                  </a>
                                ) : (
                                  <Link
                                    href={item.href}
                                    onClick={() => setMoreOpen(false)}
                                    className={className}
                                  >
                                    {item.text}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {token ? (
            <button
              onClick={handleLogout}
              className="hidden shrink-0 -rotate-1 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-5 py-2 font-paper-mono text-xs font-bold uppercase tracking-[.14em] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px hover:shadow-[2px_5px_0_var(--paper-ink)] active:translate-y-0.5 active:shadow-[1px_1px_0_var(--paper-ink)] xl:ml-6 xl:block"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/register"
              className="hidden shrink-0 -rotate-1 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-5 py-2 font-paper-mono text-xs font-bold uppercase tracking-[.14em] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px hover:shadow-[2px_5px_0_var(--paper-ink)] active:translate-y-0.5 active:shadow-[1px_1px_0_var(--paper-ink)] xl:ml-6 xl:block"
            >
              Get Started
            </Link>
          )}

          <button
            onClick={() => setOpen((value) => !value)}
            className="ml-auto rounded-lg p-2 text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-yellow-soft)] xl:hidden"
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
            className="overflow-hidden border-t border-[rgba(60,44,24,.15)] bg-[var(--paper-cream)] xl:hidden"
          >
            <div className="mx-auto flex max-h-[calc(100vh-4rem)] max-w-6xl flex-col overflow-y-auto px-4 py-2">
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

              {sections.map((section) => (
                <div
                  key={section.label}
                  className="mt-2 border-t border-dashed border-[var(--paper-line)] pt-2"
                >
                  <p className="px-3 pb-1 font-paper-mono text-[10px] uppercase tracking-[.18em] text-[var(--paper-muted-2)]">
                    {section.label}
                  </p>
                  {section.items.map((item) =>
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        className="block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-[var(--paper-yellow-soft)]"
                      >
                        {item.text}
                        <span aria-hidden="true" className="ml-1 text-[10px]">
                          ↗
                        </span>
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        className="block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-[var(--paper-yellow-soft)]"
                      >
                        {item.text}
                      </Link>
                    ),
                  )}
                </div>
              ))}

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
