const express = require("express");
const router = express.Router();
const analysisService = require("../services/analysisService");

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Analyze energy data for patterns and anomalies
router.post("/analyze", requireAuth, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const analysis = {
      summary: analysisService.calculateSummary(data),
      outliers: analysisService.detectOutliers(data),
      peakHours: analysisService.analyzePeakHours(data),
      nightConsumption: analysisService.analyzeNightConsumption(data),
      trends: analysisService.calculateTrends(data),
      recommendations: [],
    };

    // Generate recommendations based on analysis
    analysis.recommendations =
      analysisService.generateRecommendations(analysis);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error.message);
    res.status(500).json({
      error: "Failed to analyze energy data",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get summary statistics
router.post("/summary", requireAuth, (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const summary = analysisService.calculateSummary(data);

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Summary error:", error.message);
    res.status(500).json({
      error: "Failed to calculate summary",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Detect anomalies and outliers
router.post("/anomalies", requireAuth, (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const outliers = analysisService.detectOutliers(data);

    res.json({
      success: true,
      outliers,
      count: outliers.length,
      message:
        outliers.length > 0
          ? `Found ${outliers.length} anomalies in your energy consumption`
          : "No significant anomalies detected",
    });
  } catch (error) {
    console.error("Anomaly error:", error.message);
    res.status(500).json({
      error: "Failed to detect anomalies",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Analyze peak hours
router.post("/peak-hours", requireAuth, (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const peakHours = analysisService.analyzePeakHours(data);

    res.json({
      success: true,
      peakHours,
      message: `Peak consumption detected between ${peakHours.peakStartHour}:00 and ${peakHours.peakEndHour}:00`,
    });
  } catch (error) {
    console.error("Peak hours error:", error.message);
    res.status(500).json({
      error: "Failed to analyze peak hours",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Analyze night consumption (idle)
router.post("/night-consumption", requireAuth, (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const nightConsumption = analysisService.analyzeNightConsumption(data);

    res.json({
      success: true,
      nightConsumption,
      message: nightConsumption.message,
    });
  } catch (error) {
    console.error("Night consumption error:", error.message);
    res.status(500).json({
      error: "Failed to analyze night consumption",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
