import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { register } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/outline";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await register({ username, email, password });
      if (response && response.user && response.token) {
        localStorage.setItem("token", response.token);
        dispatch(
          setUser({
            user: response.user,
            token: response.token,
          })
        );
        navigate("/profile");
      } else {
        setError("Unexpected response data format");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      if (err.response) {
        setError(
          err.response.data.message || "Registration failed: Unknown error"
        );
      } else {
        setError("Registration failed: No response from server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100 dark:border-gray-700">
        <div className="mb-8 flex items-center justify-center gap-2">
          <SparklesIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:opacity-90 transition-all focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Create Account"
            )}
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">
              {error}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
