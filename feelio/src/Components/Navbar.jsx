//feelio\src\Components\Navbar.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/userSlice";
import { Link } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/login");
  };

  // src/Components/Navbar.jsx
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/Home"
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Feelio
          </Link>

          <div className="flex items-center space-x-4">
            {token ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
