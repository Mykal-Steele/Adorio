// src/components/Navbar.jsx
import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="flex justify-between items-center">
        <div className="text-white font-bold text-lg">Feelio</div>
        <div className="space-x-4">
          <a href="/" className="text-white hover:text-gray-300">Home</a>
          <a href="/profile" className="text-white hover:text-gray-300">Profile</a>
          <a href="/logout" className="text-white hover:text-gray-300">Logout</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
