// Notification.js
import React from 'react';
import './styles/notification.css'; // Add your styles here

const Notification = ({ message, type }) => {
    return (
        <div className={`notification ${type}`}>
            {message}
        </div>
    );
};

export default Notification;