const express = require('express');
const multer = require('multer'); // Middleware for handling multipart/form-data (for the image upload)
const sql = require('mssql');
const axios = require('axios'); // For making HTTP requests to the Python embedding service
const connectDB = require('./config/config');
const router = express.Router();

const storage = multer.memoryStorage(); // Store files in memory as Buffer objects

const upload = multer({ storage: storage });// Configure multer to use the memory storage

// Helper: Call Python embedding service
async function getEmbedding(text) {
  try {
    const response = await axios.post('http://localhost:5001/embed', { texts: [text] });
    return response.data.embeddings[0]; // Return the first embedding
  } catch (err) {
    console.error('Embedding generation failed:', err.message);
    return null;
  }
}

// POST /api/items - Report item
router.post('/', upload.single('image'), async (req, res) => {
  const { itemName, description, category, location, status, userEmail } = req.body; // Extract fields from the request body
  const picture = req.file?.buffer || null; // Get the image buffer from the request file
  if (picture && picture.length > 5 * 1024 * 1024) { // Check if the image size exceeds 5MB
    return res.status(400).json({ message: 'Image size should be less than 5MB.' });
  }

  // Validate required fields
  // Check if the required fields are provided
  if (!itemName || !status || !userEmail) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  // Combine text into a meaningful sentence for embedding generation
  const combinedText = `A ${itemName} with ${description} was discovered at the ${location}`; 
  const embedding = await getEmbedding(combinedText); // Call the embedding service to get the embedding vector
  // Check if embedding generation was successful
  if (!embedding) return res.status(500).json({ message: 'Embedding generation failed.' });

  // Connect to the database and insert the item
  try {
    await connectDB();

    // Check if the user exists
    const user = await sql.query`SELECT UserID FROM Users WHERE Email = ${userEmail}`;
    if (user.recordset.length === 0) return res.status(404).json({ message: 'User not found' });

    // Extract the UserID from the result
    const userID = user.recordset[0].UserID;

    // Insert the item into the database
    // Use parameterized queries to prevent SQL injection attacks
    const request = new sql.Request(); 
    request.input('ItemName', sql.NVarChar, itemName);
    request.input('Description', sql.NVarChar, description);
    request.input('Category', sql.NVarChar, category);
    request.input('Location', sql.NVarChar, location);
    request.input('Status', sql.NVarChar, status);
    request.input('UserID', sql.Int, userID);
    request.input('Picture', sql.VarBinary(sql.MAX), picture); // Store the image as binary data
    request.input('Embedding', sql.VarChar(sql.MAX), JSON.stringify(embedding)); // Store the embedding as a JSON string

    // Insert the item into the database and get the inserted ItemID
    // Use parameterized queries to prevent SQL injection attacks
    const insertItemResult = await request.query(`
      INSERT INTO Items (ItemName, Description, Category, Location, Status, UserID, Picture, Embedding)
      OUTPUT INSERTED.ItemID
      VALUES (@ItemName, @Description, @Category, @Location, @Status, @UserID, @Picture, @Embedding)
    `);

    // Check if the item was inserted successfully
    const insertedItemID = insertItemResult.recordset[0].ItemID;

    // Determine the status to match against
    const matchStatus = status === 'Lost' ? 'Found' : 'Lost'; 

    // Find matching items in the database
    const matchQuery = await sql.query`SELECT ItemID, UserID, Embedding FROM Items WHERE Status = ${matchStatus} AND UserID != ${userID}`; // Exclude the current user from the match

    // Use cosine similarity to find similar items
    const similarities = matchQuery.recordset.map(item => { // Calculate cosine similarity
      const existingEmbedding = JSON.parse(item.Embedding); 
      const dotProduct = embedding.reduce((acc, val, i) => acc + val * existingEmbedding[i], 0); // Calculate dot product
      return { ...item, similarity: dotProduct }; // Add similarity score to the item
    });

    const threshold = 0.60; // Cosine similarity threshold
    const matchedItems = similarities.filter(m => m.similarity > threshold); // Filter items based on the threshold
    
    // Notify users of potentially matching items
    for (const match of matchedItems) {
      const msg = `A potentially matching item was ${status === 'Lost' ? 'found' : 'reported lost'}: "${itemName}" at "${location}". Check now!`;
      await sql.query`INSERT INTO Notifications (UserID, Message) VALUES (${match.UserID}, ${msg})`;
    }

    // Fetch details of matched items
    const matchedItemIDs = matchedItems.map(m => m.ItemID);
    let matchedItemDetails = [];

    // If there are matched items, fetch their details
    // Use parameterized queries to prevent SQL injection attacks
    if (matchedItemIDs.length > 0) {
      const idList = matchedItemIDs.join(',');
      const detailQuery = await sql.query(`
        SELECT i.ItemID, i.ItemName, i.Description, i.Category, i.Location, i.Status, u.Email
        FROM Items i
        JOIN Users u ON i.UserID = u.UserID
        WHERE i.ItemID IN (${idList})
      `);
      matchedItemDetails = detailQuery.recordset; // Get details of matched items
    }

    // Return success response with inserted item ID and matched items
    res.status(201).json({
      message: 'Item reported successfully.',
      insertedItemID,
      matchedCount: matchedItems.length,
      matchedItems: matchedItemDetails
    });
  } catch (error) {
    console.error('Error reporting item:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    try { await sql.close(); } catch {}
  }
});

// GET /api/items/:id - Get item by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await connectDB();

    // Fetch item details by ID
    const result = await sql.query`
      SELECT Items.*, Users.Email
      FROM Items
      INNER JOIN Users ON Items.UserID = Users.UserID
      WHERE ItemID = ${id}
    `;

    // Check if the item exists
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    res.status(500).json({ message: 'Failed to fetch item details' });
  } finally {
    try { await sql.close(); } catch {}
  }
});

//GET /history/:email Get history router
router.get('/history/:email', async (req, res) => {
  const { email } = req.params;
  // Validate input
  // Check if the required fields are provided
  if (!email) return res.status(400).json({ message: 'Unauthorized 1.' });
  try { 
    await connectDB();

    const user = await sql.query`SELECT UserID FROM Users WHERE Email = ${email}`;
    if (user.recordset.length === 0) return res.status(404).json({ message: 'Unauthorized' }); // User not found

    // Fetch items reported by the user
    const result = await sql.query`SELECT * FROM Items WHERE UserID = ${user.recordset[0].UserID} ORDER BY CreatedAt DESC`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Item not found' });
  } finally {
    try { await sql.close(); } catch {}
  }
});

// Helper: Calculate cosine similarity for item matching
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (magA * magB);
}

// POST /api/items/match - Manual item match (for testing purposes and admin use)
// This endpoint is used to find similar items based on their embeddings
router.post('/match', async (req, res) => {
  const { itemID } = req.body; // Extract item ID from the request body

  await connectDB();
  const current = await sql.query`SELECT * FROM Items WHERE ItemID = ${itemID}`; // Fetch the current item by ID
  // Check if the item exists
  if (current.recordset.length === 0) return res.status(404).json({ message: 'Item not found' });

  // Extract the current item's embedding and status
  // Parse the embedding from JSON string to array
  const currentEmbedding = JSON.parse(current.recordset[0].Embedding);
  const matchStatus = current.recordset[0].Status === 'Lost' ? 'Found' : 'Lost'; // Determine the status to match against

  // Fetch candidates for matching items
  // Use parameterized queries to prevent SQL injection attacks
  const candidates = await sql.query`
    SELECT ItemID, Embedding FROM Items
    WHERE Status = ${matchStatus} AND Embedding IS NOT NULL
  `;

  // Check if candidates exist
  if (candidates.recordset.length === 0) return res.status(404).json({ message: 'No candidates found' });

  // Calculate cosine similarity for each candidate
  const similarities = candidates.recordset.map(row => ({
    itemID: row.ItemID,
    similarity: cosineSimilarity(currentEmbedding, JSON.parse(row.Embedding)),
  })); // Parse the embedding from JSON string to array
  
  // Filter and sort the results based on similarity threshold
  const topMatches = similarities.filter(m => m.similarity > 0.60).sort((a, b) => b.similarity - a.similarity);
  res.json(topMatches);
});

module.exports = router;
