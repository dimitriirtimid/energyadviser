const express = require("express");
const router = express.Router();
const axios = require("axios");
const demoMode = require("../services/demoMode");

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Create axios instance for EnergyID API
const energyIDClient = axios.create({
  baseURL: process.env.ENERGYID_API_URL || "https://api.energyid.eu/api",
  timeout: 10000,
});

// Get energy consumption data
router.get("/consumption", requireAuth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Use demo data if in demo mode
    if (req.user.isDemoMode) {
      const data = demoMode.getSampleConsumptionData(days);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return res.json({
        success: true,
        data: data,
        period: {
          start: startDate,
          end: endDate,
          days,
        },
        isDemoData: true,
      });
    }

    // Fetch from real API
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const response = await energyIDClient.get("/interval-data", {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
      params: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
    });

    res.json({
      success: true,
      data: response.data,
      period: {
        start: startDate,
        end: endDate,
        days,
      },
    });
  } catch (error) {
    console.error("Energy fetch error:", error.message);
    res.status(500).json({
      error: "Failed to fetch energy consumption data",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get today's consumption
router.get("/today", requireAuth, async (req, res) => {
  try {
    // Use demo data if in demo mode
    if (req.user.isDemoMode) {
      const data = demoMode.getSampleTodayConsumption();
      const today = new Date().toISOString().split("T")[0];

      return res.json({
        success: true,
        data: data,
        date: today,
        isDemoData: true,
      });
    }

    // Fetch from real API
    const today = new Date().toISOString().split("T")[0];

    const response = await energyIDClient.get("/interval-data", {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
      params: {
        startDate: today,
        endDate: today,
        resolution: "hourly",
      },
    });

    res.json({
      success: true,
      data: response.data,
      date: today,
    });
  } catch (error) {
    console.error("Energy fetch error:", error.message);
    res.status(500).json({
      error: "Failed to fetch today's consumption",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get meter information
router.get("/meters", requireAuth, async (req, res) => {
  try {
    // Use demo data if in demo mode
    if (req.user.isDemoMode) {
      const meters = demoMode.getSampleMeters();

      return res.json({
        success: true,
        meters: meters,
        isDemoData: true,
      });
    }

    // Fetch from real API
    const response = await energyIDClient.get("/meters", {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });

    res.json({
      success: true,
      meters: response.data,
    });
  } catch (error) {
    console.error("Meters fetch error:", error.message);
    res.status(500).json({
      error: "Failed to fetch meters",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
