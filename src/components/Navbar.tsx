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
      className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800 shadow-lg"
    >
      <div className="container mx-auto px-3 sm:px-4">
        {/* Single row at every viewport: [logo] [nav fills middle] [button] */}
        <div className="flex items-center h-14 sm:h-16 gap-2 relative">
          {/* Logo — always left, never shrinks */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
            <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.9 }}>
              <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            </motion.div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Adorio
            </span>
          </Link>

          {/* Desktop nav — absolutely centered so it doesn't shift with logo/button widths */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-0.5">
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

          {/* Mobile nav — flex-1 fills the middle, scrollable if it overflows */}
          <div className="flex-1 sm:hidden overflow-x-auto flex items-center gap-0.5 [&::-webkit-scrollbar]:hidden">
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

          {/* Button — always right, never shrinks */}
          <div className="ml-auto shrink-0">
            {token ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-shadow"
              >
                Logout
              </motion.button>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-shadow"
                >
                  Get Started
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ href, text, className = '', external = false }) => (
  <motion.div whileHover={{ scale: 1.05 }} className={`shrink-0 ${className}`}>
    {external ? (
      <a
        href={href}
        className="block px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors whitespace-nowrap"
      >
        {text}
      </a>
    ) : (
      <Link
        href={href}
        className="block px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors whitespace-nowrap"
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
