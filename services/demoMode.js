/**
 * Demo Mode Service
 * Handles demo/sample data and demo authentication
 */

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class DemoModeService {
  constructor() {
    this.isEnabled = process.env.DEMO_MODE === "true";
    this.sampleDataPath = path.join(__dirname, "../data/sample-data.json");
    this.sampleData = null;
    this.demoUser = null;
    this.loadSampleData();
  }

  /**
   * Load sample data from file
   */
  loadSampleData() {
    try {
      if (!fs.existsSync(this.sampleDataPath)) {
        throw new Error(`Sample data file not found: ${this.sampleDataPath}`);
      }
      const fileContent = fs.readFileSync(this.sampleDataPath, "utf-8");
      this.sampleData = JSON.parse(fileContent);
      console.log("✓ Demo mode: Sample data loaded successfully");
    } catch (error) {
      console.error("✗ Failed to load demo sample data:", error.message);
      this.sampleData = this.getDefaultSampleData();
    }
  }

  /**
   * Get default sample data if file loading fails
   */
  getDefaultSampleData() {
    return {
      meters: [
        {
          id: "meter-001",
          name: "Main Electricity Meter Demo",
          type: "electricity",
          unit: "kWh",
          installationDate: "2022-01-15",
          active: true,
        },
      ],
      consumptionData: [],
      todayConsumption: [],
    };
  }

  /**
   * Create a demo user session
   */
  createDemoUser() {
    this.demoUser = {
      id: uuidv4(),
      email: "demo@energyadviser.local",
      name: "Demo User",
      authenticated: true,
      isDemoMode: true,
      timestamp: new Date(),
      accessToken: "demo-token-" + uuidv4(),
    };
    return this.demoUser;
  }

  /**
   * Get demo user
   */
  getDemoUser() {
    if (!this.demoUser) {
      this.createDemoUser();
    }
    return this.demoUser;
  }

  /**
   * Get sample consumption data
   * @param {number} days - Number of days to return (0 for all available)
   */
  getSampleConsumptionData(days = 30) {
    if (!this.sampleData || !this.sampleData.consumptionData) {
      return [];
    }

    let data = this.sampleData.consumptionData;

    if (days > 0) {
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      data = data.filter((item) => new Date(item.timestamp) >= cutoffDate);
    }

    return data;
  }

  /**
   * Get sample today's consumption
   */
  getSampleTodayConsumption() {
    if (!this.sampleData || !this.sampleData.todayConsumption) {
      return [];
    }
    return this.sampleData.todayConsumption;
  }

  /**
   * Get sample meter information
   */
  getSampleMeters() {
    if (!this.sampleData || !this.sampleData.meters) {
      return [];
    }
    return this.sampleData.meters;
  }

  /**
   * Check if demo mode is enabled
   */
  isDemoModeEnabled() {
    return this.isEnabled;
  }

  /**
   * Get demo mode status
   */
  getStatus() {
    return {
      demoModeEnabled: this.isEnabled,
      sampleDataLoaded: !!this.sampleData,
      sampleDataPoints: this.sampleData?.consumptionData?.length || 0,
      meters: this.sampleData?.meters?.length || 0,
    };
  }
}

// Create singleton instance
const demoMode = new DemoModeService();

module.exports = demoMode;
