const dotenv = require("dotenv");
const express = require("express");

// Load environment variables
dotenv.config();

const applySecurityMiddleware = require("./security");
const auth = require("./middleware/auth");
const connectDB = require("./config/db");
const taskController = require("./controllers/taskController");
const User = require("./models/User");

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

const logger = applySecurityMiddleware(app);

// Define routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

// Default route
app.get("/", (req, res) => {
  res.send("Kanban Board API is running");
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
