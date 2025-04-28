// File: src/backend/models/notifications.js
// BACKEND notifications.js
const express = require('express');
const sql = require('mssql');
const connectDB = require('./config/config');
const router = express.Router();

// Get user notifications
router.get('/', async (req, res) => {
  const { email } = req.query;
  // Validate input
  // Check if the required fields are provided
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  // Connect to the database and fetch user notifications
  try {
    await connectDB();

    const userResult = await sql.query`SELECT UserID FROM Users WHERE Email = ${email}`;
    if (userResult.recordset.length === 0)
      return res.status(404).json({ message: 'User not found.' });

    const userID = userResult.recordset[0].UserID;

    const result = await sql.query`
      SELECT NotificationID, Message, IsRead, CreatedAt 
      FROM Notifications 
      WHERE UserID = ${userID} 
      ORDER BY CreatedAt DESC
    `;

    // Check if notifications exist
    if (result.recordset.length === 0) return res.status(404).json({ message: 'No notifications found.' });
    // Return the notifications as JSON
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await sql.close();
  }
});

// Mark notification as read
router.put('/read/:notificationID', async (req, res) => {
    const { notificationID } = req.params; // Extract notification ID from the request parameters
    // Validate input
    if (!notificationID) return res.status(400).json({ message: 'Notification ID is required.' });
  
    // Connect to the database and update notification status
    try {
      await connectDB();
      await sql.query`
        UPDATE Notifications 
        SET IsRead = 1 
        WHERE NotificationID = ${notificationID}
      `;
      // Check if the notification was found and updated
      res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error updating notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      await sql.close();
    }
  });
  

module.exports = router;
