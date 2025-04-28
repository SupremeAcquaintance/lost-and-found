const express = require('express'); 
const sql = require('mssql'); 
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const app = express.Router(); 
const connectDB = require('./config/config');

app.use(express.json());

app.post('/', async (req, res) => {
    const { Email, PasswordHash } = req.body;

    // Check if email and password are provided
    if (!Email || !PasswordHash) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Connect to the database and validate user credentials
    try {
        await connectDB();
        console.log("Connected to Database Entity successfully");

        // Query the database to search the user by email
        const result = await sql.query`SELECT * FROM Users WHERE Email = ${Email}`;

        // Check if user exists
        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Account does not exist! Please Register.' });
        }

        // Extract user data from the result
        const user = result.recordset[0];

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(PasswordHash, user.PasswordHash); // Compare plain text password with hashed password
        
        // If the password is invalid, return an error message
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password!' });
        }

        // If everything is valid, send a success response
        return res.status(200).json({ message: 'Sign in successful!' });

    } catch (error) { // Handle any errors that occur during the process
        console.error('Error during sign in:', error);
        return res.status(500).json({ message: 'Sign in failed. Failed to render database connection.' });
    }
});

module.exports = app;