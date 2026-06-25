'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { SparklesIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/userSlice';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.nav
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800 shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── Single bar ─────────────────────────────────────── */}
        <div className="flex items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-6">
            <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.9 }}>
              <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            </motion.div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Adorio
            </span>
          </Link>

          {/* Desktop nav — fills middle, links are centered within it */}
          <div className="hidden sm:flex flex-1 items-center justify-center gap-0.5">
            {links.map(({ href, text, external }) =>
              external ? (
                <a
                  key={href}
                  href={href}
                  className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors whitespace-nowrap"
                >
                  {text}
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors whitespace-nowrap"
                >
                  {text}
                </Link>
              ),
            )}
          </div>

          {/* Desktop action button */}
          {token ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="hidden sm:block ml-6 shrink-0 px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity"
            >
              Logout
            </motion.button>
          ) : (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/register"
                className="hidden sm:block ml-6 shrink-0 px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </motion.div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="sm:hidden ml-auto p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden border-t border-gray-800 bg-gray-950"
          >
            <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
              {links.map(({ href, text, external }) =>
                external ? (
                  <a
                    key={href}
                    href={href}
                    onClick={close}
                    className="px-3 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {text}
                  </a>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="px-3 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {text}
                  </Link>
                ),
              )}

              <div className="mt-2 pt-2 border-t border-gray-800">
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/register"
                    onClick={close}
                    className="block px-3 py-3 text-sm font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-lg transition-colors"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
