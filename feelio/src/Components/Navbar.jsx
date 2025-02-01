// feelio\src\components\Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SparklesIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/userSlice";
import { motion } from "framer-motion";

const Navbar = ({ darkMode, setDarkMode }) => {
  const { token } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <SparklesIcon className="h-7 w-7 text-purple-600 dark:text-purple-400 transition-transform group-hover:rotate-12" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Feelio
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <MoonIcon className="h-6 w-6 text-gray-600" />
              )}
            </button>

            {token ? (
              <>
                <NavLink to="/home" text="Home" />
                <NavLink to="/profile" text="Profile" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={handleLogout}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <NavLink to="/login" text="Login" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Link to="/register">Get Started</Link>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, text }) => (
  <motion.div whileHover={{ scale: 1.05 }}>
    <Link
      to={to}
      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-lg transition-colors font-medium"
    >
      {text}
    </Link>
  </motion.div>
);

export default Navbar;
