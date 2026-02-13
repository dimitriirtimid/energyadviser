<template>
  <div class="dashboard">
    <div class="hero">
      <h1>Welkom bij Endura energieadviseur</h1>
      <p>Analyseer uw energieverbruik en ontvang persoonlijke aanbevelingen</p>
    </div>

    <div class="auth-section" v-if="!isAuthenticated">
      <div class="card">
        <h2>Get Started</h2>
        <p>
          Connect your EnergyID account to start analyzing your energy
          consumption.
        </p>
        <div class="button-group">
          <a href="/api/auth/login" class="btn btn-primary"
            >Login with EnergyID</a
          >
          <button
            @click="demoLogin"
            class="btn btn-secondary"
            <!--
            :disabled="demoLoading"
            --
          >
            >
            {{ demoLoading ? "Loading Demo..." : "Try Demo Mode" }}
          </button>
        </div>
        <p v-if="demoMessage" :class="['demo-message', demoMessageType]">
          {{ demoMessage }}
        </p>
      </div>
    </div>

    <div v-else class="content-section">
      <div class="grid">
        <div class="stat-box">
          <div class="stat-box-label">Verbruik vandaag</div>
          <div class="stat-box-value">{{ todayConsumption }} kWh</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-label">Gemiddeld per dag</div>
          <div class="stat-box-value">{{ averageConsumption }} kWh</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-label">Piekmomenten</div>
          <div class="stat-box-value">{{ peakTime }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Snelle statistieken</h3>
          <select
            v-model="selectedDays"
            class="period-selector"
            @change="loadData"
          >
            <option value="7">Afgelopen 7 dagen</option>
            <option value="30">Afgelopen 30 dagen</option>
            <option value="90">Afgelopen 90 dagen</option>
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
            <h4>Totaal verbruik</h4>
            <p class="large-number">{{ summary.totalConsumption }} kWh</p>
          </div>
          <div>
            <h4>Gemiddeld per dag</h4>
            <p class="large-number">{{ summary.averageConsumption }} kWh</p>
          </div>
          <div>
            <h4>Minimum verbruik</h4>
            <p class="large-number">{{ summary.minConsumption }} kWh</p>
          </div>
          <div>
            <h4>Maximum verbruik</h4>
            <p class="large-number">{{ summary.maxConsumption }} kWh</p>
          </div>
        </div>
      </div>

      <div v-if="recommendations.length > 0" class="card">
        <h3>Aanbevelingen voor u</h3>
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
        <h3>Gedetailleerde analyse</h3>
        <router-link to="/analysis" class="btn btn-primary"
          >Ga naar analysedashboard</router-link
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
      demoLoading: false,
      demoMessage: "",
      demoMessageType: "info",
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
    async demoLogin() {
      this.demoLoading = true;
      this.demoMessage = "";
      try {
        const response = await axios.get("/api/auth/demo-login");
        if (response.data.success) {
          this.demoMessage = "✅ Demo login successful! Refreshing...";
          this.demoMessageType = "success";
          // Refresh the page to update authentication
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error("Demo login error:", error);
        this.demoMessage =
          "❌ Demo mode is not available. Please try the regular login.";
        this.demoMessageType = "error";
        this.demoLoading = false;
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
          this.error =
            "Geen gegevens beschikbaar. Controleer uw EnergyID-account.";
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
        this.error = "Kan energiegegevens niet laden. Probeer het opnieuw.";
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
    rgba(39, 174, 96, 0.9) 0%,
    rgba(52, 152, 219, 0.9) 100%
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
  border-left: 4px solid #27ae60;
}

.stats-grid h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.large-number {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
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
  border-left: 4px solid #27ae60;
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
  background: #e74c3c;
  color: white;
}

.priority-medium {
  background: #f39c12;
  color: white;
}

.priority-low {
  background: #27ae60;
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

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.button-group .btn {
  flex: 1;
  min-width: 150px;
}

.demo-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.demo-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.demo-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.demo-message.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
