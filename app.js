const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/database");
const routes = require("./src/api/v1/routes");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

// Load the appropriate .env file
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: envFile });

const app = express();

// CORS middleware
const corsOptions = {
  origin: ["http://localhost:5173"], // Removed trailing slash
};

app.use(cors(corsOptions)); // Use CORS middleware before defining routes

app.use(morgan("dev"));

// Creating logs directory if it doesn't exist
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Creating a write stream for logging to the journal.log file
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "journal.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

// Middlewares
app.use(cookieParser());
app.use(express.json()); // Middleware to parse incoming requests with JSON payloads

connectDB();

app.use("/api", routes); // Define your routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Only start the server if not in a test environment
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; // Export the app for testing