import React, { useEffect, useState } from 'react'; // import React and hooks for state and effect
import axios from 'axios'; // import axios for making HTTP requests
import { useAuth } from './auth/AuthContext'; // import custom AuthContext for user authentication

// import FontAwesomeIcon and icons for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faN, faBell, faCheckCircle, faExclamationCircle,
  faInbox, faSpinner, faHome } from '@fortawesome/free-solid-svg-icons';
import './styles/Notifications.css';
import { useNavigate } from 'react-router-dom'; // import useNavigate for navigation between routes

const Notifications = () => { // Define the Notifications component
  // Use the custom AuthContext to get user email
  const { userEmail } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading status
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try { // Fetch notifications from the server
        const response = await axios.get('http://localhost:3000/api/notifications', {
          params: { email: userEmail }
        }); // Pass user email as a query parameter
        setNotifications(response.data); // Set the notifications state with the fetched data
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
 // Check if userEmail is available before fetching notifications
    if (userEmail) fetchNotifications(); // Fetch functions
  }, [userEmail]); // 

  // Function to mark a notification as read
  // This function is called when the user clicks the "Mark as read" button
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:3000/api/notifications/read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.NotificationID === notificationId ? { ...n, IsRead: true } : n // Update the notification state to mark it as read
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return ( // Render the notifications component

    <div className="notifications-form">
      <div className="notification-header">
        <FontAwesomeIcon icon={faBell} size="4x" className="bell-icon" />
          <h2><FontAwesomeIcon icon={faN} size="1x" className="n-icon" />otifictions</h2>
          <button className="home-btn" onClick={() => navigate('/home')}>
            <FontAwesomeIcon icon={faHome} className="home-icon" /> Home
          </button>
        </div>
      <div className="notification-container">

        {loading ? (
          <div className="loading">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            <FontAwesomeIcon icon={faInbox} /> No notifications yet.
          </div>
        ) : (
          <ul className="notification-list">
            {notifications.map((notif) => ( // Map through the notifications and render each one
              <li
                key={notif.NotificationID}
                className={`notification-item ${notif.IsRead ? 'read' : 'unread'}`}
              >
                <div className="notification-icon">
                  <FontAwesomeIcon
                    icon={notif.IsRead ? faCheckCircle : faExclamationCircle}
                  />
                </div>
                <div className="notification-content">
                  <p className="message">{notif.Message}</p>
                  <span className="timestamp">
                    {new Date(notif.CreatedAt).toLocaleString()}
                  </span>
                </div>
                {!notif.IsRead && ( // Show the "Mark as read" button only for unread notifications
                  <button
                    className="mark-read-btn"
                    onClick={() => markAsRead(notif.NotificationID)}
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

  );
};

export default Notifications; // Export the Notifications component for use in other parts of the application
// This code defines a Notifications component that fetches and displays user notifications from a server. 
// It uses React hooks for state management and side effects, and axios for making HTTP requests. 
// The component also includes functionality to mark notifications as read.
