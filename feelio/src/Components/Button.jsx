// src/components/Button.jsx
import React from 'react';

const Button = ({ label, onClick, style = 'bg-blue-600 hover:bg-blue-700' }) => {
  return (
    <button
      onClick={onClick}
      className={`text-white font-semibold py-2 px-4 rounded-md ${style}`}
    >
      {label}
    </button>
  );
};

export default Button;
