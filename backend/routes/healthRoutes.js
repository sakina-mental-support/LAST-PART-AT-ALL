const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// GET /api/health
router.get("/", async (req, res) => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    services: {
      database: "unknown",
      python_ai: "unknown",
      tts_engine: "unknown"
    }
  };

  // 1. Check MongoDB Database
  try {
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      healthStatus.services.database = "connected";
    } else {
      healthStatus.services.database = "disconnected";
      healthStatus.status = "degraded";
    }
  } catch (error) {
    healthStatus.services.database = "error";
    healthStatus.status = "degraded";
  }

  // 2. Ping Python AI Microservice
  try {
    const pythonAiUrl = (process.env.PYTHON_AI_URL || "http://127.0.0.1:5001/api/chat").replace('/chat', '/health');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(pythonAiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const aiData = await response.json();
      healthStatus.services.python_ai = aiData.status === "healthy" ? "connected" : "degraded";
      healthStatus.services.tts_engine = aiData.tts_status === "ready" ? "connected" : "offline";
      
      if (aiData.status !== "healthy") {
        healthStatus.status = "degraded";
      }
    } else {
      healthStatus.services.python_ai = "offline";
      healthStatus.services.tts_engine = "offline";
      healthStatus.status = "degraded";
    }
  } catch (error) {
    healthStatus.services.python_ai = "offline (timeout or refused)";
    healthStatus.services.tts_engine = "offline";
    healthStatus.status = "degraded";
  }

  // Return aggregated health
  const statusCode = healthStatus.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

module.exports = router;
