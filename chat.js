// chat.js
const express = require('express'); // Import express for routing
const connectDB = require('./config/config');  // Import the database connection function
const router = express.Router(); // Create a new router instance
router.use(express.json()); // Middleware to parse JSON request bodies

// POST /api/chat/start - Start a conversation between two users
router.post('/start', async (req, res) => {
    const { user1, user2 } = req.body; // Extract user emails from the request body
    
    // Validate input
    if (!user1 || !user2) {
        return res.status(400).json({ message: 'Both users are required to start a conversation.' }); //bad response
    }

    try {
        const pool = await connectDB(); // Connect to the database

        const recipientCheck = await pool.request()
            .input('user2', user2)
            .query('SELECT * FROM Users WHERE Email = @user2'); // Check if the recipient exists

        if (recipientCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Recipient email not found.' }); // If recipient not found, return 404(bad response)
        }

        //otherwise, check if a conversation already exists between the two users
        const checkConvo = await pool.request()
            .input('user1', user1)
            .input('user2', user2)
            .query(`
                SELECT * FROM Conversations
                WHERE (User1Email = @user1 AND User2Email = @user2)
                   OR (User1Email = @user2 AND User2Email = @user1)
            `);

        // If no conversation exists, create a new one
        if (checkConvo.recordset.length === 0) {
            const insertConvo = await pool.request()
                .input('user1', user1)
                .input('user2', user2)
                .query(`
                    INSERT INTO Conversations (User1Email, User2Email)
                    OUTPUT inserted.ConversationID
                    VALUES (@user1, @user2)
                `);

            // Return the new conversation ID
            const conversationId = insertConvo.recordset[0].ConversationID;
            return res.status(201).json({ ConversationID: conversationId });
        } else {
            // If a conversation already exists, return its ID
            const conversationId = checkConvo.recordset[0].ConversationID;
            return res.status(200).json({ ConversationID: conversationId });
        }
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).send('Server Error');
    }
});

// POST /api/chat/message - Send a message
router.post('/message', async (req, res) => {
    const { conversationId, senderEmail, messageText } = req.body; // Extract data from the request body

    // Validate input
    if (!conversationId || !senderEmail || !messageText) {
        return res.status(400).json({ message: 'All fields are required.' }); // bad response
    }

    try {
        const pool = await connectDB(); // Connect to the database

        // Insert the message into the database
        await pool.request()
            .input('conversationId', conversationId)
            .input('senderEmail', senderEmail)
            .input('messageText', messageText)
            .query(`
                INSERT INTO Messages (ConversationID, SenderEmail, MessageText)
                VALUES (@conversationId, @senderEmail, @messageText)
            `);

        res.status(201).send('Message sent'); // Return success response
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Server Error');
    }
});
// GET /api/chat/user-conversations/:userEmail - Fetch recent conversations for a user
router.get('/user-conversations/:userEmail', async (req, res) => {
    const { userEmail } = req.params; // Extract user email from the request parameters

    if (!userEmail) {
        return res.status(400).json({ message: 'User email is required.' }); // bad response
    }

    try { 
        const pool = await connectDB(); // Connect to the database
        // Fetch conversations where the user is either User1 or User2
        // and get the other participant's email  
        const result = await pool.request()
            .input('userEmail', userEmail)
            .query(`
                SELECT 
                    c.ConversationID,
                    CASE 
                        WHEN c.User1Email = @userEmail THEN c.User2Email
                        ELSE c.User1Email
                    END AS ParticipantEmail
                FROM Conversations c
                WHERE c.User1Email = @userEmail OR c.User2Email = @userEmail
            `); // 

        res.json(result.recordset); // Return the list of conversations
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).send('Server Error');
    }
});

// GET /api/chat/messages/:conversationId - Fetch messages
router.get('/messages/:conversationId', async (req, res) => {
    const { conversationId } = req.params; // Extract conversation ID from the request parameters

    if (!conversationId) {
        return res.status(400).json({ message: 'Conversation ID is required.' }); // bad response
    }

    try {
        const pool = await connectDB(); // Connect to the database

        const result = await pool.request()
            .input('conversationId', conversationId)
            .query(`
                SELECT SenderEmail, MessageText, SentAt
                FROM Messages
                WHERE ConversationID = @conversationId
                ORDER BY SentAt ASC
            `); // Fetch messages for the specified conversation ID

        res.json(result.recordset); // Return the list of messages
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
