// UserProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './auth/AuthContext'; // Import the useAuth hook
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faHome, faEdit, faSpinner, faX } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; 
import EditProfile from './EditProfile'; // Import the EditProfile Modal component
import './styles/User Profile.css'; 

const UserProfile = () => {
  const { userEmail } = useAuth(); // Get the user's email from the context
  const [user, setUser ] = useState(null);
  const [loading, setLoading] = useState(true); // State to manage loading status (initially true since data is being fetched on render) 
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const navigate = useNavigate();

  useEffect(() => { // Fetch user profile data when the component mounts or userEmail changes
    const fetchUserProfile = async () => { // Function to fetch user profile data
      try {
        const response = await axios.get('http://localhost:3000/api/user/profile', { // Fetch user profile data from backend express the server
          params: { Email: userEmail }
        });
        setUser (response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError(error.response?.data?.error || 'Failed to load user profile.');
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    // Check if userEmail is available before fetching user profile
    if (userEmail) {
      fetchUserProfile();
    }
  }, [userEmail]);

  const handleEditProfile = (updatedUser ) => {
    console.log('Updated User:', updatedUser );
    //Update the local state
    setUser ((prevUser ) => ({
      ...prevUser ,
      ...updatedUser ,
    })); // Update the user state with the updated user data
  };

  if (loading) { /* Loading state: show a spinner while data is being fetched */
    return <div className="loading"><FontAwesomeIcon icon={faSpinner} spin />Loading...</div>;
  }

  if (error) { /* Error state: show an error message if there was an error fetching data */
    return <div className="error"><FontAwesomeIcon icon={faX} spin />{error}</div>;
  }

  return ( /* Render the user profile information */
    <div className="profile-form">
      <div className="profile-container">
        <div className="profile-header">
          <FontAwesomeIcon icon={faUserCircle} size="3x" className="profile-icon" />
          <h2>{user.Username}</h2>
        </div>
        <div className="profile-details">
          <p><strong>Email:</strong> {user.Email}</p>
          <p><strong>Phone:</strong> {user.Phone || 'N/A'}</p>
          <p><strong>Reg Number:</strong> {user.RegNumber}</p>
          <p><strong>User ID:</strong> {user.UserID}</p>
          <p><strong>User Privilege:</strong> {user.UserType}</p>
          <p><strong>Residence:</strong> {user.Residence}</p>
          <p><strong>Joined on:</strong> {new Date(user.CreatedAt).toLocaleDateString()}</p>
          <p><strong>Last Modified on:</strong> {new Date(user.UpdatedAt).toLocaleDateString()}</p>
        </div>
        <div className="profile-buttons">
          <button onClick={() => navigate('/home')} className="homing-btn">
              <FontAwesomeIcon icon={faHome} style={{ marginRight: '5px' }} className='home-icon' />
              GO HOME
          </button>
          
          <button className="edit-btn" onClick={() => setIsModalOpen(true)}>
              <FontAwesomeIcon icon={faEdit} style={{ marginRight: '5px' }} className='edit-icon' />
              Edit Profile
          </button>
        </div>

        {isModalOpen && ( /* Render the EditProfile modal when isModalOpen is true */
          <EditProfile 
            user={user} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleEditProfile} 
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;