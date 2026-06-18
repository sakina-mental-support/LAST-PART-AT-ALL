const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// ================= SECURITY =================
// Set secure HTTP headers
app.use(helmet());

// Basic rate limiting setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development and polling
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ================= ROUTES =================
const userRoutes = require("./routes/userRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const moodRoutes = require("./routes/moodRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const chatRoutes = require("./routes/chatRoutes");
const healthRoutes = require("./routes/healthRoutes");
const journalRoutes = require("./routes/journalRoutes");
const interventionRoutes = require("./routes/interventionRoutes");
const riskRoutes = require("./routes/riskRoutes");
const eventRoutes = require("./routes/eventRoutes");

app.use("/api/health", healthRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/users", userRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/risk-assessment", riskRoutes);
app.use("/api/events", eventRoutes);

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.send("Sakina Backend is running 🚀");
});

// ================= GLOBAL ERROR HANDLER =================
// ⚠️ لازم ييجي بعد كل الـ routes
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// ================= MONGODB CONNECTION =================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,  // 15s to find a server
      socketTimeoutMS: 45000,           // 45s socket timeout
      connectTimeoutMS: 15000,          // 15s connection timeout
    });
    console.log("✅ MongoDB Connected to ClusterSakina");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:");
    console.error("   Reason:", err.message);
    console.error("   ⚠️  Check: 1) Atlas IP Whitelist  2) Username/Password  3) Network access");
    console.error("   The server will continue running but DB operations will fail.");
  }
};

connectDB();

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});