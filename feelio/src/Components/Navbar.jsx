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
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800/100 shadow-2xl"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.95 }}>
              <SparklesIcon className="h-7 w-7 text-purple-400 transition-transform" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]">
              Feelio
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-800/20 transition-colors"
            >
              <div className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                {darkMode ? (
                  <SunIcon className="h-6 w-6 text-transparent" />
                ) : (
                  <MoonIcon className="h-6 w-6 text-transparent" />
                )}
              </div>
            </motion.button>

            {token ? (
              <>
                <NavLink to="/home" text="Home" />
                <NavLink to="/profile" text="Profile" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
                  onClick={handleLogout}
                >
                  <span className="relative z-10">Logout</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </>
            ) : (
              <>
                <NavLink to="/login" text="Login" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    <Link to="/register">Get Started</Link>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
  <motion.div whileHover={{ scale: 1.05 }} className="relative">
    <Link
      to={to}
      className="text-gray-300 px-4 py-2 font-medium hover:text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300"
    >
      {text}
    </Link>
  </motion.div>
);

export default Navbar;
