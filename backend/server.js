const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS with your actual Netlify frontend URL
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://eclectic-pegasus-4e1cf2.netlify.app", // YOUR ACTUAL FRONTEND URL
    ],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/forms", require("./routes/forms"));

// Basic test route
app.get("/", (req, res) => {
  res.json({
    message: "Form Approval System API is running!",
    frontend: "Connected to Netlify",
    environment: process.env.NODE_ENV || "production",
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.log("❌ MongoDB Connection Failed:", err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
