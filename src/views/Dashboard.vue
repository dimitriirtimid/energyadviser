<template>
  <div class="dashboard">
    <div class="hero">
      <h1>Welcome to Energy Adviser</h1>
      <p>
        Analyze your energy consumption and get personalized recommendations
      </p>
    </div>

    <div class="auth-section" v-if="!isAuthenticated">
      <div class="card">
        <h2>Get Started</h2>
        <p>
          Connect your EnergyID account to start analyzing your energy
          consumption.
        </p>
        <a href="/api/auth/login" class="btn btn-primary"
          >Login with EnergyID</a
        >
      </div>
    </div>

    <div v-else class="content-section">
      <div class="grid">
        <div class="stat-box">
          <div class="stat-box-label">Today's Consumption</div>
          <div class="stat-box-value">{{ todayConsumption }} kWh</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-label">Average Daily</div>
          <div class="stat-box-value">{{ averageConsumption }} kWh</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-label">Peak Time</div>
          <div class="stat-box-value">{{ peakTime }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Quick Stats</h3>
          <select
            v-model="selectedDays"
            class="period-selector"
            @change="loadData"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else class="stats-grid">
          <div>
            <h4>Total Consumption</h4>
            <p class="large-number">{{ summary.totalConsumption }} kWh</p>
          </div>
          <div>
            <h4>Average per Day</h4>
            <p class="large-number">{{ summary.averageConsumption }} kWh</p>
          </div>
          <div>
            <h4>Minimum Usage</h4>
            <p class="large-number">{{ summary.minConsumption }} kWh</p>
          </div>
          <div>
            <h4>Maximum Usage</h4>
            <p class="large-number">{{ summary.maxConsumption }} kWh</p>
          </div>
        </div>
      </div>

      <div v-if="recommendations.length > 0" class="card">
        <h3>Recommendations for You</h3>
        <div class="recommendation-list">
          <div
            v-for="rec in recommendations"
            :key="rec.category"
            class="recommendation-item"
          >
            <div class="rec-header">
              <h4>{{ rec.title }}</h4>
              <span :class="['priority', `priority-${rec.priority}`]">{{
                rec.priority
              }}</span>
            </div>
            <p>{{ rec.description }}</p>
            <p class="rec-impact">💡 {{ rec.impact }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Detailed Analysis</h3>
        <router-link to="/analysis" class="btn btn-primary"
          >Go to Analysis Dashboard</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "Dashboard",
  data() {
    return {
      isAuthenticated: false,
      loading: false,
      error: null,
      selectedDays: 7,
      todayConsumption: 0,
      averageConsumption: 0,
      peakTime: "--",
      summary: {
        totalConsumption: 0,
        averageConsumption: 0,
        minConsumption: 0,
        maxConsumption: 0,
      },
      recommendations: [],
    };
  },
  methods: {
    async checkAuth() {
      try {
        const response = await axios.get("/api/auth/status");
        this.isAuthenticated = response.data.authenticated;
        if (this.isAuthenticated) {
          await this.loadData();
        }
      } catch (error) {
        this.isAuthenticated = false;
      }
    },
    async loadData() {
      this.loading = true;
      this.error = null;
      try {
        // Load consumption data
        const consumptionResponse = await axios.get(
          `/api/energy/consumption?days=${this.selectedDays}`,
        );
        const data = consumptionResponse.data.data;

        if (!data || data.length === 0) {
          this.error = "No data available. Please check your EnergyID account.";
          this.loading = false;
          return;
        }

        // Analyze the data
        const analysisResponse = await axios.post("/api/analysis/analyze", {
          data,
        });
        const analysis = analysisResponse.data.analysis;

        // Update summary
        this.summary = analysis.summary;
        this.averageConsumption = analysis.summary.averageConsumption;
        this.recommendations = analysis.recommendations;

        // Set peak time
        if (analysis.peakHours) {
          this.peakTime = `${analysis.peakHours.peakStartHour}:00 - ${analysis.peakHours.peakEndHour}:00`;
        }

        // Calculate today's consumption
        const today = new Date().toISOString().split("T")[0];
        const todayData = data.filter((d) => {
          const itemDate = new Date(d.timestamp || d.date)
            .toISOString()
            .split("T")[0];
          return itemDate === today;
        });
        this.todayConsumption = todayData
          .reduce(
            (sum, d) => sum + parseFloat(d.consumption || d.value || 0),
            0,
          )
          .toFixed(2);
      } catch (error) {
        console.error("Load data error:", error);
        this.error = "Failed to load energy data. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.checkAuth();
  },
});
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
}

.hero {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.9) 0%,
    rgba(118, 75, 162, 0.9) 100%
  );
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.auth-section .card {
  text-align: center;
  padding: 3rem;
}

.auth-section .btn {
  margin-top: 1rem;
  padding: 0.9rem 2rem;
  font-size: 1.1rem;
}

.content-section {
  margin-bottom: 2rem;
}

.period-selector {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 0.9rem;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stats-grid div {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #667eea;
}

.stats-grid h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.large-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.recommendation-item {
  padding: 1rem;
  background: #f9f9f9;
  border-left: 4px solid #667eea;
  border-radius: 4px;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.rec-header h4 {
  margin: 0;
}

.priority {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.priority-high {
  background: #ff6b6b;
  color: white;
}

.priority-medium {
  background: #ffc107;
  color: white;
}

.priority-low {
  background: #28a745;
  color: white;
}

.recommendation-item p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.rec-impact {
  margin-top: 0.5rem;
  font-style: italic;
  color: #666;
}
</style>
