import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext'; // Import the useAuth hook
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'; // Import the sign-in icon
import './styles/User Login.css';
import Notification from './Notification'; // Import the Notification component

const UserLogin = () => {
  const { setUserEmail } = useAuth(); // Use the useAuth hook to get setUser Email
  const [Email, setEmail] = useState('');
  const [PasswordHash, setPassword] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' }); // Notification state

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { Email, PasswordHash };

    setLoading(true); // Set loading to true when the sign-in process starts

    try {
      const response = await axios.post('http://localhost:3000/api/login', userData);
      setNotification({ message: response.data.message, type: 'success' }); // Use notification for success
      console.log('Login Successful:', response.data);
      setUserEmail(Email); // Set the user's email in the context
      navigate('/home', { state: { userEmail: Email } });
    } catch (error) {
      console.error('Error during sign in:', error);
      setNotification({ message: error.response?.data?.message || 'Sign in failed. Check your email and password then try again!', type: 'error' });
      setEmail('');
      setPassword('');
    } finally {
      setLoading(false); // Set loading to false when the process is complete
    }
  };

  return (
    <div className="login-page">
      <p>Sign in to Lost and Found</p>
      <div className="login-container">
        <FontAwesomeIcon icon={faSignInAlt} size="3x" className="login-icon" />
        <h2>Sign In</h2>
        {notification.message && <Notification message={notification.message} type={notification.type} />} {/* Notification component */}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={PasswordHash}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="register-prompt">
          Don’t have an account? <button onClick={() => navigate('/register')} className="link-btn">Register</button>
        </p>
        
      </div>
    </div>
  );
};

export default UserLogin; // Export the UserLogin component for use in other parts of the application
// This component handles user login functionality, including form submission, API calls, and displaying notifications.
// It uses React hooks for state management and axios for making HTTP requests to the backend server.
// The component also utilizes FontAwesome icons for visual elements and CSS for styling.
// The useAuth hook is used to manage user authentication state across the application.