import React, { useState } from 'react';
import { useDispatch } from 'react-redux'; // Import the useDispatch hook
import { setUser } from '../redux/userSlice'; // Import the setUser action
import { login } from '../api'; // Import the login API function

const Login = () => {
  const dispatch = useDispatch();  // Initialize dispatch function
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password }); // Call the login API
      localStorage.setItem('token', response.data.token); // Store the JWT token in localStorage

      // Dispatch the user data and token to the Redux store
      dispatch(setUser({
        user: response.data.user,
        token: response.data.token,
      }));
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
