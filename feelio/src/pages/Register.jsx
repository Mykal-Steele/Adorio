import React, { useState } from 'react';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { setUser } from '../redux/userSlice'; // Import the setUser action
import { register } from '../api'; // Import the register API function

const Register = () => {
  const dispatch = useDispatch();  // Initialize dispatch function
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register({ username, email, password }); // Call the register API
      localStorage.setItem('token', response.data.token); // Store the JWT token in localStorage

      // Dispatch the user data and token to the Redux store
      dispatch(setUser({
        user: response.data.user,
        token: response.data.token,
      }));
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
        <button type="submit">Register</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Register;
