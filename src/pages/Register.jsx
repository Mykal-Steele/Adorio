import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { register } from '../api';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the page user was trying to access, or default to home
  const from = location.state?.from?.pathname || '/home';

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await register({ username, email, password });
      if (response && response.user && response.token) {
        localStorage.setItem('token', response.token);
        dispatch(
          setUser({
            user: response.user,
            token: response.token,
          })
        );
        // Redirect to the page they were trying to access, or home
        navigate(from, { replace: true });
      } else {
        setError('Unexpected response data format');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      if (err.response) {
        setError(
          err.response.data.message || 'Registration failed: Unknown error'
        );
      } else {
        setError('Registration failed: No response from server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-950 flex items-center justify-center p-4'>
      {/* Modern card */}
      <div className='relative bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-8 max-w-md w-full text-center space-y-6 overflow-hidden shadow-lg'>
        {/* Icon with glow */}
        <div className='flex justify-center relative'>
          <SparklesIcon className='h-16 w-16 text-purple-400 relative z-10' />
          <div className='absolute w-32 h-32 bg-purple-600/20 blur-[50px] rounded-full' />
        </div>

        {/* header with that fancy gradient text */}
        <h1 className='text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent'>
          Create Account
        </h1>

        {/* Registration form */}
        <form onSubmit={handleRegister} className='space-y-4'>
          {/* Username input */}
          <div className='text-left'>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
              Username
            </label>
            <input
              type='text'
              placeholder='Enter your username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400'
              required
            />
          </div>

          {/* Email input */}
          <div className='text-left'>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
              Email
            </label>
            <input
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400'
              required
            />
          </div>

          {/* Password input */}
          <div className='text-left'>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
              Password
            </label>
            <input
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400'
              required
            />
          </div>

          {/* Interactive button */}
          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:opacity-90 transition-all focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 relative overflow-hidden group mt-4'
          >
            <span className='relative z-10'>
              {loading ? (
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
                'Create Account'
              )}
            </span>
            <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </button>

          {/* show errors if the backend is being dumb */}
          {error && (
            <p className='text-red-500 text-sm mt-4 text-center bg-red-900/20 p-2 rounded-lg'>
              {error}
            </p>
          )}
        </form>

        {/* that little "or" separator thing */}
        <div className='relative flex items-center justify-center'>
          <div className='flex-grow border-t border-gray-700/50'></div>
          <span className='mx-4 text-gray-400'>or</span>
          <div className='flex-grow border-t border-gray-700/50'></div>
        </div>

        {/* Login link */}
        <p className='mt-4 text-center text-gray-400'>
          Already have an account?{' '}
          <Link
            to='/login'
            state={{ from: location.state?.from }}
            className='text-purple-400 hover:underline font-medium'
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
