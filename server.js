// BACKEND server.js
const express = require('express'); // Import express for routing
const cors = require('cors'); // Import cors for handling cross-origin requests
// Import Routers
const loginRouter = require('./login'); 
const registerRouter = require('./register'); 
const userProfileRouter = require('./profile');
const itemRouter = require('./Items');
const notificationRouter = require('./notifications');
const chatRouter = require('./chat');

const app = express();
const PORT = 3000; // Define the port for the server

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
})); // Enable CORS for all routes

// Route mounting
app.use('/api/login', loginRouter); 
app.use('/api/register', registerRouter); 
app.use('/api/user/profile', userProfileRouter);
app.use('/api/items', itemRouter); 
app.use('/api/notifications', notificationRouter); 
app.use('/api/chat', chatRouter); 

// Start the server and listen on the specified port 3000
app.listen(PORT, () => {
  console.log(`🚀Server is running on http://localhost:${PORT}`);
});
