// homepage component to be adjusted
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faClipboardList, faUser, faBell, faCog, faC, faL, faF, faComments } from '@fortawesome/free-solid-svg-icons';
import './styles/HomePage.css'; 

const HomePage = () => {
  return (
    <main className="home-page">
      <h1><FontAwesomeIcon icon={faC} size="1.2x" className="heading-icon" />ampus 
      <FontAwesomeIcon icon={faL} size="1.2x" className="heading-icon" />ost and  
      <FontAwesomeIcon icon={faF} size="1.2x" className="heading-icon" />ound</h1>
      <header className="hero-section">
        <p>Here to present your centralized solution for reporting and recovering lost items!</p>
        <p>
          Welcome to our community where lost items find their way back home. Whether you’ve misplaced your laptop, your key or found a wallet, or someone's ID, our platform connects you with fellow students and staff to ensure that lost belongings are reunited with their rightful owners. 
        </p>
      </header>

      <section className="features">
        <h2>Key Features</h2>
        <div className="feature-list">
          <div className="feature">
            <FontAwesomeIcon icon={faSearch} size="3x" />
            <h3>Search for Lost Items</h3>
            <p>Quickly find items reported lost by others.</p>
          </div>
          <div className="feature">
          <Link to='/user/profile' className="feature-link">
              <FontAwesomeIcon icon={faUser } size="3x" /> {/* User icon for View Profile */}
              <h3>View Profile</h3>
              <p>Access and manage your profile information.</p>
            </Link>
          </div>
          <div className="feature">
            <Link to='/report' className="feature-link">
              <FontAwesomeIcon icon={faClipboardList} size="3x" />
              <h3>Report Found Items</h3>
              <p>Easily report items you’ve found to help others.</p>
            </Link>
          </div>
          <div className="feature">
            <Link to='/notifications' className="feature-link">
              <FontAwesomeIcon icon={faBell} size="3x" />
              <h3>Notifications</h3>
              <p>Receive alerts when items matching your search are reported.</p>
            </Link>
          </div>
          <Link to='/chat' className="feature-link">
            <div className="feature">
              <FontAwesomeIcon icon={faComments} size="3x" />
              <h3>Chat</h3>
              <p>Instantly communicate with finders or owners of reported items.</p>
            </div>
          </Link>
          <div className="feature">
            <FontAwesomeIcon icon={faCog} size="3x" />
            <h3>Settings</h3>
            <p>Customize your preferences and manage your account settings.</p>
          </div>
        </div>
      </section>
      <div className="footer">
        <p>&copy; {new Date().getFullYear()} Campus Lost and Found. Created by Adonis Shumba. All rights reserved.</p>
      </div>
    </main>
  );
};

export default HomePage;