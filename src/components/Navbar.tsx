'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AuthSwitch } from '@/components/AuthSwitch';
import { IntentLink, LinkPending } from '@/components/IntentLink';
import { logout } from '@/store/userSlice';
import { AnimatePresence, motion } from 'framer-motion';

// The width a main link gets its own spot in the bar from. Narrower than that it's listed in
// More instead, so the bar never wraps or runs past the page. 'never' always lives in More.
type Breakpoint = 'md' | 'lg' | 'xl' | 'never';

// page: a full page load (a route handler or a file in public/), not a Next page. A <Link> to
// one asks for app router data first, gets HTML back, and only then loads the page.
type NavItem = {
  href: string;
  text: string;
  external?: boolean;
  page?: boolean;
  from?: Breakpoint;
};
type NavSection = { label: string; items: NavItem[] };

// Written out in full so Tailwind sees every class
const SHOW_IN_BAR: Record<Breakpoint, string> = {
  md: 'hidden md:block',
  lg: 'hidden lg:block',
  xl: 'hidden xl:block',
  never: 'hidden',
};
const SHOW_IN_MORE: Record<Breakpoint, string> = {
  md: 'md:hidden',
  lg: 'lg:hidden',
  xl: 'xl:hidden',
  never: '',
};
const ORDER: Breakpoint[] = ['md', 'lg', 'xl', 'never'];

const ctaClassName =
  'shrink-0 -rotate-1 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-5 py-2 font-paper-mono text-xs font-bold uppercase tracking-[.14em] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px hover:shadow-[2px_5px_0_var(--paper-ink)] active:translate-y-0.5 active:shadow-[1px_1px_0_var(--paper-ink)]';

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

  // The phone menu covers the page, so the page behind it shouldn't scroll
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

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

  const signedInLinks: NavItem[] = [
    { href: '/social', text: 'Social', from: 'md' },
    { href: '/profile', text: 'Profile', from: 'md' },
    { href: '/coding', text: 'Coding', from: 'md' },
    { href: '/hosting', text: 'Hosting', from: 'lg' },
    { href: '/learn-korean', text: 'Learn Korean', page: true, from: 'lg' },
    { href: '/rygame', text: 'RyGame', from: 'lg' },
    { href: '/finance', text: 'Financial Tracker', from: 'xl' },
    { href: '/sendenv', text: 'SendEnv', from: 'never' },
  ];
  const signedOutLinks: NavItem[] = [
    { href: '/coding', text: 'Coding', from: 'md' },
    { href: '/learn-korean', text: 'Learn Korean', page: true, from: 'md' },
  ];
  // The menus open after the session check, so they can read the token directly
  const links = token ? signedInLinks : signedOutLinks;

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
        { href: '/sadnote.html', text: 'SAD Textbook', page: true },
        { href: '/statsNotes.html', text: 'Stats Study Guide', page: true },
        { href: '/statsQuiz.html', text: 'Stats Quiz', page: true },
        { href: '/cogni-report.html', text: 'CogniMax Report', page: true },
      ],
    },
    {
      label: 'Files',
      items: [
        { href: '/resume', text: 'Resume', page: true },
        { href: '/performance', text: 'Performance Report', page: true },
        { href: '/AI_Exam2_Cheat_Sheets.pdf', text: 'AI Exam Cheat Sheets', page: true },
      ],
    },
  );

  // More lists the main links that don't fit in the bar at the current width. The heading
  // hides at the width where the last of them gets its own spot.
  const lastToFit = links.reduce<Breakpoint>(
    (latest, item) =>
      ORDER.indexOf(item.from ?? 'never') > ORDER.indexOf(latest) ? (item.from ?? 'never') : latest,
    'md',
  );

  // More is marked as the current page only where the page actually sits inside it. A main
  // link is in More below its breakpoint, so the mark uses the same classes.
  const currentMain = links.find((item) => pathname === item.href);
  const moreActiveClass = sections.some((section) =>
    section.items.some((item) => pathname === item.href),
  )
    ? ''
    : currentMain
      ? SHOW_IN_MORE[currentMain.from ?? 'never']
      : null;

  const linkClassName =
    'relative px-2 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:text-[var(--paper-accent)]';

  const renderLabel = (text: string, active: boolean) => (
    <span className="relative inline-block px-[7px] py-[2px]">
      {active && (
        <span
          data-active
          aria-hidden="true"
          className="absolute inset-x-[-1px] bottom-0 h-[8px] -rotate-[0.7deg] rounded-[2px_7px_3px_8px] bg-[var(--paper-yellow)]"
        />
      )}
      <span className="relative">{text}</span>
    </span>
  );

  // Next pages get an IntentLink (prefetch on hover, focus or touch). Everything else is a
  // plain <a>, and links off the site get an arrow.
  const renderItem = (
    item: NavItem,
    className: string,
    onClick?: () => void,
    children: ReactNode = item.text,
  ) =>
    item.external || item.page ? (
      <a key={item.href} href={item.href} onClick={onClick} className={className}>
        {children}
        {item.external && (
          <span aria-hidden="true" className="ml-1 text-[10px]">
            ↗
          </span>
        )}
      </a>
    ) : (
      <IntentLink
        key={item.href}
        href={item.href}
        onClick={onClick}
        aria-current={pathname === item.href ? 'page' : undefined}
        className={className}
      >
        {children}
      </IntentLink>
    );

  const renderBarLinks = (list: NavItem[]) => (
    <>
      {list.map((item) => {
        const isActive = pathname === item.href;
        return renderItem(
          item,
          `${SHOW_IN_BAR[item.from ?? 'never']} ${linkClassName}`,
          undefined,
          item.external || item.page ? (
            renderLabel(item.text, isActive)
          ) : (
            // Lights up as soon as it's clicked, before the page arrives
            <LinkPending>{(pending) => renderLabel(item.text, isActive || pending)}</LinkPending>
          ),
        );
      })}
    </>
  );

  const moreItemClassName = (href: string) =>
    `block rounded-[2px] px-2 py-1.5 text-sm transition-colors hover:bg-[var(--paper-yellow-soft)] ${
      pathname === href
        ? 'bg-[var(--paper-yellow-soft)] font-semibold text-[var(--paper-accent-deep)]'
        : ''
    }`;

  const sectionLabelClassName =
    'mb-1.5 border-b border-dashed border-[var(--paper-line)] pb-1 font-paper-mono text-[10px] uppercase tracking-[.18em] text-[var(--paper-muted-2)]';

  return (
    // Deliberately a plain <nav>, not a motion component: animating this in with
    // a transform (e.g. initial={{ y: -64 }}) doesn't reserve layout space, so
    // for the brief window before the transform settles, the space it's about
    // to occupy shows straight through to <body>'s own background instead of
    // the navbar's, position:sticky elements still lay out at their
    // untransformed position. That was invisible on the old dark navbar over a
    // dark body; it's a visible dark flash on this cream one.
    <nav className="font-paper-sans sticky top-0 z-50 bg-[var(--paper-cream)] text-[var(--paper-ink)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center sm:h-16">
          <Link
            href="/social"
            aria-label="Adorio, home"
            className="mr-4 flex shrink-0 items-baseline gap-[6px] lg:mr-6"
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

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex">
            <AuthSwitch
              signedIn={renderBarLinks(signedInLinks)}
              signedOut={renderBarLinks(signedOutLinks)}
            />

            {/* Not relative: the panel lines up with the right edge of the bar, not the button, so it
                stays on screen however few links are in front of it */}
            <div ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                aria-expanded={moreOpen}
                aria-controls="navbar-more-panel"
                className={linkClassName}
              >
                <span className="relative inline-flex items-center gap-0.5 px-[7px] py-[2px]">
                  {moreActiveClass !== null && (
                    <span
                      aria-hidden="true"
                      className={`${moreActiveClass} absolute inset-x-[-1px] bottom-0 h-[8px] -rotate-[0.7deg] rounded-[2px_7px_3px_8px] bg-[var(--paper-yellow)]`}
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
                  className="absolute right-0 top-full z-50 mt-1 max-h-[calc(100dvh-5rem)] w-[min(540px,calc(100vw-2rem))] origin-top-right overflow-y-auto overscroll-contain rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] p-4 shadow-[3px_4px_0_var(--paper-ink)] [scrollbar-width:thin]"
                >
                  {/* Columns, not a grid, so a short section doesn't leave a gap next to a long one */}
                  <div className="columns-2 gap-x-6">
                    <div className={`mb-4 break-inside-avoid ${SHOW_IN_MORE[lastToFit]}`}>
                      <p className={sectionLabelClassName}>Pages</p>
                      <ul>
                        {links.map((item) => (
                          <li key={item.href} className={SHOW_IN_MORE[item.from ?? 'never']}>
                            {renderItem(item, moreItemClassName(item.href), () =>
                              setMoreOpen(false),
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {sections.map((section) => (
                      <div key={section.label} className="mb-4 break-inside-avoid">
                        <p className={sectionLabelClassName}>{section.label}</p>
                        <ul>
                          {section.items.map((item) => (
                            <li key={item.href}>
                              {renderItem(item, moreItemClassName(item.href), () =>
                                setMoreOpen(false),
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <AuthSwitch
            signedIn={
              <button
                onClick={handleLogout}
                className={`hidden md:ml-3 md:block lg:ml-6 ${ctaClassName}`}
              >
                Sign out
              </button>
            }
            signedOut={
              <Link href="/register" className={`hidden md:ml-3 md:block lg:ml-6 ${ctaClassName}`}>
                Get Started
              </Link>
            }
          />

          <button
            onClick={() => setOpen((value) => !value)}
            className="ml-auto rounded-lg p-2.5 text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-yellow-soft)] md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="navbar-menu"
          >
            {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            id="navbar-menu"
            role="dialog"
            aria-label="Menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-x-0 bottom-0 top-14 overflow-y-auto overscroll-contain border-t border-[rgba(60,44,24,.15)] bg-[var(--paper-cream)] [scrollbar-width:thin] sm:top-16 md:hidden"
          >
            <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
              <ul className="grid grid-cols-2 gap-1">
                {links.map((item) => (
                  <li key={item.href}>
                    {renderItem(
                      item,
                      `flex min-h-11 items-center rounded-[3px] px-3 text-[15px] font-medium transition-colors hover:bg-[var(--paper-yellow-soft)] ${
                        pathname === item.href ? 'bg-[var(--paper-yellow-soft)]' : ''
                      }`,
                      close,
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4 columns-2 gap-x-4 border-t border-dashed border-[var(--paper-line)] pt-4">
                {sections.map((section) => (
                  <div key={section.label} className="mb-4 break-inside-avoid">
                    <p className="px-3 pb-1 font-paper-mono text-[10px] uppercase tracking-[.18em] text-[var(--paper-muted-2)]">
                      {section.label}
                    </p>
                    <ul>
                      {section.items.map((item) => (
                        <li key={item.href}>
                          {renderItem(
                            item,
                            `flex min-h-10 items-center rounded-[3px] px-3 text-sm transition-colors hover:bg-[var(--paper-yellow-soft)] ${
                              pathname === item.href ? 'bg-[var(--paper-yellow-soft)]' : ''
                            }`,
                            close,
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6">
                {token ? (
                  <button onClick={handleLogout} className={`w-full py-3 ${ctaClassName}`}>
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/register"
                    onClick={close}
                    className={`block w-full py-3 text-center ${ctaClassName}`}
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
