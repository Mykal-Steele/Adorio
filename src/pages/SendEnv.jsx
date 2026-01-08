import React, { useState } from "react";
import { useSelector } from "react-redux";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../utils/errorHandling";
import { SparklesIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import AdSenseScript from "../Components/AdSenseScript";

const SendEnv = () => {
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [retrievalCommand, setRetrievalCommand] = useState("");
  const [copied, setCopied] = useState(false);
  const user = useSelector((state) => state.user?.user);
  const navigate = useNavigate();

  // If not logged in, redirect to login page
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      if (!message || !password) {
        throw new Error("Please fill in both the message and password fields");
      }

      // Send the request to store the encrypted message
      const response = await API.post("/secretenv", {
        message,
        password,
      });

      setSuccess(true);
      setRetrievalCommand(response.data.retrievalCommand);

      // Clear the form
      setMessage("");
      setPassword("");
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to store secret");
      setError(errorMessage.message || "An unexpected error occurred");
      if (process.env.NODE_ENV !== "production") {
        console.error("Error storing secret:", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(retrievalCommand).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <div className='min-h-screen bg-gray-950 flex items-center justify-center p-4'>
      <AdSenseScript />
      <div className='relative bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-8 max-w-md w-full text-center space-y-6 overflow-hidden shadow-lg'>
        {/* Icon with glow */}
        <div className='flex justify-center relative'>
          <SparklesIcon className='h-16 w-16 text-purple-400 relative z-10' />
          <div className='absolute w-32 h-32 bg-purple-600/20 blur-[50px] rounded-full' />
        </div>

        {/* Title */}
        <h1 className='text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent'>
          Store Secret Message
        </h1>

        {success ? (
          <div className='space-y-4'>
            <div className='p-4 bg-green-900/20 border border-green-500/20 rounded-lg'>
              <p className='text-green-400 mb-2'>
                Your secret has been stored successfully!
              </p>
              <p className='text-gray-400 text-sm'>
                Use this command to retrieve your secret:
              </p>
            </div>

            <div className='relative'>
              <div className='p-3 bg-gray-800 rounded-lg text-left text-gray-300 text-sm font-mono overflow-x-auto'>
                <code>{retrievalCommand}</code>
              </div>
              <button
                onClick={copyToClipboard}
                className='absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md'
                title='Copy to clipboard'
              >
                <ClipboardIcon className='h-4 w-4 text-gray-300' />
              </button>
            </div>

            {copied && (
              <p className='text-green-400 text-sm'>Copied to clipboard!</p>
            )}

            <button
              onClick={() => {
                setSuccess(false);
                setRetrievalCommand("");
              }}
              className='mt-4 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors'
            >
              Store Another Secret
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Secret Message Input */}
            <div className='text-left'>
              <label className='block text-sm font-medium text-gray-300 mb-1'>
                Secret Message
              </label>
              <textarea
                placeholder='Enter your secret message'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='w-full p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 min-h-[100px]'
                required
              />
            </div>

            {/* Password Input */}
            <div className='text-left'>
              <label className='block text-sm font-medium text-gray-300 mb-1'>
                Password
              </label>
              <div className='space-y-1'>
                <input
                  type='password'
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400'
                  required
                />
                <p className='text-xs text-gray-500'>
                  <span className='text-amber-400'>Note:</span> Your username
                  will be automatically added to this password for encryption.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:opacity-90 transition-all focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 relative overflow-hidden group mt-4'
            >
              <span className='relative z-10'>
                {isSubmitting ? (
                  <svg
                    className='animate-spin h-5 w-5 text-white mx-auto'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                ) : (
                  "Store Secret"
                )}
              </span>
              <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </button>

            {/* Error Message */}
            {error && (
              <p className='text-red-500 text-sm mt-4 text-center bg-red-900/20 p-2 rounded-lg'>
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default SendEnv;
