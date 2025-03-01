//feelio\src\Components\Settings.jsx
import React from "react";
import { Link } from "react-router-dom";
import { CogIcon } from "@heroicons/react/24/outline";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto max-w-2xl px-4 py-8 pt-20">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>
        <div className="space-y-4">
          <Link
            to="/change-password"
            className="block p-4 bg-gray-900/50 rounded-xl text-white hover:bg-gray-800/50 transition-colors"
          >
            Change Password
          </Link>
          <Link
            to="/privacy"
            className="block p-4 bg-gray-900/50 rounded-xl text-white hover:bg-gray-800/50 transition-colors"
          >
            Privacy Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Settings;
