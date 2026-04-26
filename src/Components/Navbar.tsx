'use client';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useRouter, usePathname } from 'next/navigation';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/userSlice';
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
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 relative">
          <Link
            href="/"
            className="flex items-center space-x-1 sm:space-x-2 group ml-1"
          >
            <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.95 }}>
              <SparklesIcon className="h-6 w-6 sm:h-7 sm:w-7 text-purple-400 transition-transform" />
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Adorio
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 mr-1">
              {token ? (
                <>
                  <NavLink href="/home" text="Home" />
                  <NavLink href="/profile" text="Profile" />
                  <NavLink href="/coding" text="Coding" />
                  <NavLink href="/smartcity" text="SmartCity" />
                  <NavLink href="/rygame" text="RyGame" />
                  <NavLink href="/cao" text="CAO" />
                  <NavLink href="/algo" text="Algorithms" />
                </>
              ) : (
                <>
                  <NavLink href="/coding" text="Coding" />
                  <NavLink href="/smartcity" text="SmartCity" />
                  <NavLink href="/cao" text="CAO" />
                  <NavLink href="/algo" text="Algorithms" />
                </>
              )}
            </div>

            {token ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group flex items-center justify-center"
                  onClick={handleLogout}
                >
                  <span className="relative z-10">Logout</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <NavLink
                  href="/login"
                  text="Login"
                  className="hidden sm:block"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group flex items-center justify-center"
                >
                  <Link href="/register" className="relative z-10">
                    Get Started
                  </Link>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        <div className="sm:hidden flex justify-center space-x-4 pb-2">
          {token ? (
            <>
              <NavLink href="/home" text="Home" />
              <NavLink href="/profile" text="Profile" />
              <NavLink href="/coding" text="Coding" />
              <NavLink href="/smartcity" text="SmartCity" />
              <NavLink href="/rygame" text="RyGame" />
              <NavLink href="/cao" text="CAO" />
            </>
          ) : (
            <>
              <NavLink href="/coding" text="Coding" />
              <NavLink href="/smartcity" text="SmartCity" />
              <NavLink href="/cao" text="CAO" />
              <NavLink href="/login" text="Login" />
              <NavLink href="/register" text="Register" />
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

/** @param {{ href: string, text: string, className?: string }} props */
const NavLink = ({ href, text, className = '' }) => (
  <motion.div whileHover={{ scale: 1.05 }} className={`relative ${className}`}>
    <Link
      href={href}
      className="text-gray-300 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium hover:text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 flex items-center"
    >
      {text}
    </Link>
  </motion.div>
);

NavLink.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Navbar;
