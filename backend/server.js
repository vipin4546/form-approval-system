const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "https://form-approval-system.onrender.com",
  "https://form-approval-system.netlify.app/#", // ⬅️ यहाँ अपना असली Netlify URL डालें
];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
  })
);
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/form-approval")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));

// Routes
app.use("/api/forms", require("./routes/forms"));

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Form Approval System API is running!",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
