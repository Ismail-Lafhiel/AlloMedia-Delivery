const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const routes = require('./src/api/v1/routes'); 

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use routes
app.use('/api', routes);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
