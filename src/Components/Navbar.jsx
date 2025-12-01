import React from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { SparklesIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/userSlice';
import { motion } from 'framer-motion';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { token } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className='sticky top-0 z-50 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800/100 shadow-2xl'
    >
      <div className='container mx-auto px-2 sm:px-4'>
        <div className='flex items-center justify-between h-14 sm:h-16'>
          {/* logo with gradient effect - looks pretty sick when you hover */}
          <Link
            to='/'
            className='flex items-center space-x-1 sm:space-x-2 group ml-1'
          >
            <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.95 }}>
              <SparklesIcon className='h-6 w-6 sm:h-7 sm:w-7 text-purple-400 transition-transform' />
            </motion.div>
            <span className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Adorio
            </span>
          </Link>

          <div className='flex items-center gap-2 sm:gap-4'>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className='p-1 sm:p-2 rounded-full hover:bg-gray-800/20 transition-colors'
              aria-label={
                darkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              <div className='bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text'>
                {darkMode ? (
                  <SunIcon className='h-5 w-5 sm:h-6 sm:w-6 text-transparent' />
                ) : (
                  <MoonIcon className='h-5 w-5 sm:h-6 sm:w-6 text-transparent' />
                )}
              </div>
            </motion.button>

            {token ? (
              <div className='flex items-center gap-2 sm:gap-4'>
                <div className='hidden sm:flex gap-2 sm:gap-4'>
                  <NavLink to='/home' text='Home' />
                  <NavLink to='/profile' text='Profile' />
                  <NavLink to='/coding' text='Coding' />
                  <NavLink to='/smartcity' text='SmartCity' />
                  <NavLink to='/rygame' text='RyGame' />
                  <a
                    href='https://adorio.space/cao'
                    className='text-gray-300 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium hover:text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300'
                  >
                    CAO
                  </a>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='px-3 py-1.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group'
                  onClick={handleLogout}
                >
                  <span className='relative z-10'>Logout</span>
                  <div className='absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                </motion.button>
              </div>
            ) : (
              <div className='flex items-center gap-2 sm:gap-4'>
                <NavLink
                  to='/coding'
                  text='Coding'
                />
                <NavLink
                  to='/smartcity'
                  text='SmartCity'
                  className='hidden sm:block'
                />
                <a
                  href='https://adorio.space/cao'
                  className='hidden sm:block text-gray-300 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium hover:text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300'
                >
                  CAO
                </a>
                <NavLink to='/login' text='Login' className='hidden sm:block' />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='px-3 py-1.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group'
                >
                  <Link to='/register' className='relative z-10'>
                    Get Started
                  </Link>
                  <div className='absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation - CAO always visible */}
        <div className='sm:hidden flex justify-center space-x-4 pb-2'>
          {token ? (
            <>
              <NavLink to='/home' text='Home' />
              <NavLink to='/profile' text='Profile' />
              <NavLink to='/coding' text='Coding' />
              <NavLink to='/smartcity' text='SmartCity' />
              <NavLink to='/rygame' text='RyGame' />
              <a
                href='https://adorio.space/cao'
                className='text-gray-300 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium hover:text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300'
              >
                CAO
              </a>
            </>
          ) : (
            <>
              <NavLink to='/coding' text='Coding' />
              <NavLink to='/smartcity' text='SmartCity' />
              <a
                href='https://adorio.space/cao'
                className='text-gray-300 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium hover:text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300'
              >
                CAO
              </a>
              <NavLink to='/login' text='Login' />
              <NavLink to='/register' text='Register' />
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, text, className = '' }) => (
  <motion.div whileHover={{ scale: 1.05 }} className={`relative ${className}`}>
    <Link
      to={to}
      className='text-gray-300 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium hover:text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300'
    >
      {text}
    </Link>
  </motion.div>
);

const ExternalNavLink = ({ to, text, className = '' }) => (
  <motion.div whileHover={{ scale: 1.05 }} className={`relative ${className}`}>
    <a
      href={to}
      className='text-gray-300 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium hover:text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300'
    >
      {text}
    </a>
  </motion.div>
);

Navbar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
};

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
};

ExternalNavLink.propTypes = {
  to: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Navbar;
