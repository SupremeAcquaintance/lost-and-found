// userProfile.js
const express = require('express');
const sql = require('mssql');
const app = express.Router();
const connectDB = require('./config/config');

app.use(express.json());

// Fetch user profile
app.get('/', async (req, res) => { 
    const { Email } = req.query;

    // Validate input
    if (!Email) {
        console.log('Email is required');
        return res.status(400).send('Email is required');
    }

    // Connect to the database and fetch user profile
    try {
        await connectDB();
        console.log("Connected to Database Entity successfully for User Profile");
        const result = await sql.query`SELECT * FROM Users WHERE Email = ${Email}`;
        
        // Check if user exists
        if (result.recordset.length === 0) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        // Extract user data from the result
        const user = result.recordset[0]; 
        res.json(user); // Return the user data as JSON
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Server Error');
    } finally {
        await sql.close();
    }
});

// Edit user profile
app.put('/', async (req, res) => {
    const { Email, Username, Phone, Residence } = req.body;

    // Validate input
    // Check if the required fields are provided
    if (!Email || !Username || !Phone || !Residence) {
        console.log('Email, Username, and Registration Number are required');
        return res.status(400).send('Email, Username, and Registration Number are required');
    }

    // Connect to the database and update user profile
    try {
        await connectDB();
        console.log("Connected to Database Entity successfully for User Profile Update");

        const result = await sql.query`
            UPDATE Users 
            SET Username = ${Username}, Phone = ${Phone}, Residence = ${Residence}, UpdatedAt = GETDATE() 
            WHERE Email = ${Email}
        `;

        // Check if the update was successful
        // If no rows were affected, it means the user was not found
        if (result.rowsAffected[0] === 0) {
            console.log('User Profile not found for update');
            return res.status(404).send('User Profile not found for update');
        }

        // If the update was successful, return a success message
        console.log('User Profile updated successfully');
        res.status(200).send('User Profile updated successfully');
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Server Error');
    } finally {
        await sql.close();
    }
});

module.exports = app;