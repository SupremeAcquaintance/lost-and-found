// User Registration backend
const express = require('express'); // Import express for routing
const sql = require('mssql'); // Import mssql for SQL Server connection
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const app = express.Router(); 
const connectDB = require('./config/config'); // Import the database connection function

// Middleware for parsing JSON bodies 
app.use(express.json());

app.post('/', async (req, res) => { 
    const { RegNumber, Username, Email, Phone, UserType, PasswordHash, Residence } = req.body;

    // `Validate input`
    if (!RegNumber || !Username || !Email || !Phone || !UserType || !PasswordHash || !Residence) { 
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        await connectDB();

        // Check if the user already exists
        const existingUser = await sql.query`
            SELECT * FROM Users 
            WHERE Email = ${Email} OR Username = ${Username} OR RegNumber = ${RegNumber}`;

        // If user exists, return an error message
        if (existingUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Email, username, or registration number already registered' });
        }

        // Hash the password
        const HashedPassword = await bcrypt.hash(PasswordHash, 10);

        // Insert the new user into the database
        const insertResult = await sql.query`
            INSERT INTO Users (RegNumber, Username, Email, Phone, UserType, PasswordHash, Residence)
            OUTPUT INSERTED.UserID
            VALUES (${RegNumber}, ${Username}, ${Email}, ${Phone}, ${UserType}, ${HashedPassword}, ${Residence})`;

        // Check if the insert was successful
        if (insertResult.rowsAffected[0] > 0) {
            const userID = insertResult.recordset[0].UserID;

            // Send a welcome message to the user
            const welcomeMessage = `
Hi ${Username}, Welcome to Campus Lost & Found—Your Campus Just Got Smarter.
Thank you for joining our Lost & Found community! Whether it’s a lost water bottle or a found laptop, you’re now part of a smarter, more connected campus where every item has a better chance of getting home.
Stay alert, stay kind and keep an eye out—someone might be looking for what you’ve found, or holding on to what you’ve lost.
Let’s turn good intentions into real actions, one item at a time.
Start exploring now—your campus needs you.
            `.trim();

            // Insert the welcome message into the Notifications table
            await sql.query`
                INSERT INTO Notifications (UserID, Message, IsRead, CreatedAt)
                VALUES (${userID}, ${welcomeMessage}, 0, GETDATE())
            `;

            // Return success response
            return res.status(201).json({ message: 'User registered and welcomed successfully' });
        } else // If the insert failed, return an error message
        { 
            return res.status(500).json({ message: 'Registration failed' }); // BAD RESPONSE
        }
    } catch (error) { // Handle any errors that occur during the process
        // Log the error for debugging
        console.error('Error during registration:', error);
        return res.status(500).json({ message: 'Registration failed due to server error' });
    } finally {
        try {
            await sql.close();
        } catch (closeError) {
            console.error('Error closing SQL connection:', closeError);
        }
    }
});
  
module.exports = app; // Export the router
