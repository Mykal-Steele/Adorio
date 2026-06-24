'use client';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useRouter, usePathname } from 'next/navigation';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/userSlice';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { token } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/') return null;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800/100 shadow-2xl"
    >
      <div className="container mx-auto px-4">
        {/* Desktop: three-column layout so nav links are truly centered */}
        <div className="hidden sm:flex items-center h-16 relative">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.95 }}>
              <SparklesIcon className="h-7 w-7 text-purple-400" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Adorio
            </span>
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            {token ? (
              <>
                <NavLink href="/social" text="Social" />
                <NavLink href="/profile" text="Profile" />
                <NavLink href="/hosting" text="Hosting" />
                <NavLink href="/coding" text="Coding" />
                <NavLink href="/smartcity" text="SmartCity" />
                <NavLink href="/rygame" text="RyGame" />
                <NavLink href="/cao" text="CAO" external />
              </>
            ) : (
              <>
                <NavLink href="/coding" text="Coding" />
                <NavLink href="/smartcity" text="SmartCity" />
                <NavLink href="/cao" text="CAO" external />
              </>
            )}
          </div>

          <div className="ml-auto">
            {token ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 text-sm rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                onClick={handleLogout}
              >
                <span className="relative z-10">Logout</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ) : (
              <div className="flex items-center gap-3">
                <NavLink href="/login" text="Login" />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 text-sm rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group flex items-center"
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: logo + button row, then scrollable nav below */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center space-x-1.5 group">
              <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.95 }}>
                <SparklesIcon className="h-6 w-6 text-purple-400" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Adorio
              </span>
            </Link>

            {token ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 text-sm rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                onClick={handleLogout}
              >
                Logout
              </motion.button>
            ) : (
              <Link
                href="/register"
                className="px-3 py-1.5 text-sm rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                Get Started
              </Link>
            )}
          </div>

          <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-none">
            {token ? (
              <>
                <NavLink href="/social" text="Social" />
                <NavLink href="/profile" text="Profile" />
                <NavLink href="/hosting" text="Hosting" />
                <NavLink href="/coding" text="Coding" />
                <NavLink href="/smartcity" text="SmartCity" />
                <NavLink href="/rygame" text="RyGame" />
                <NavLink href="/cao" text="CAO" external />
              </>
            ) : (
              <>
                <NavLink href="/coding" text="Coding" />
                <NavLink href="/smartcity" text="SmartCity" />
                <NavLink href="/cao" text="CAO" external />
                <NavLink href="/login" text="Login" />
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ href, text, className = '', external = false }) => (
  <motion.div whileHover={{ scale: 1.05 }} className={`relative shrink-0 ${className}`}>
    {external ? (
      <a
        href={href}
        className="text-gray-300 px-3 py-2 text-sm font-medium hover:text-white transition-colors duration-200 flex items-center rounded-lg hover:bg-white/5"
      >
        {text}
      </a>
    ) : (
      <Link
        href={href}
        className="text-gray-300 px-3 py-2 text-sm font-medium hover:text-white transition-colors duration-200 flex items-center rounded-lg hover:bg-white/5"
      >
        {text}
      </Link>
    )}
  </motion.div>
);

NavLink.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  external: PropTypes.bool,
};

export default Navbar;
