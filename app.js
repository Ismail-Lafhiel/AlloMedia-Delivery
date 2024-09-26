const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/database");
const routes = require("./src/api/v1/routes");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Loading environment variables based on the NODE_ENV
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: envFile });

const app = express();

app.use(morgan("dev"));

// Creating the logs directory if it doesn't exist
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Creating a write stream for logging to the logs.log file
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "journal.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

connectDB();

app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));