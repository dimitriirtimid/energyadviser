<template>
  <div class="analysis">
    <h1>Energy Analysis</h1>

    <div class="controls">
      <div>
        <label for="days">Select Period:</label>
        <select id="days" v-model="selectedDays" @change="loadData">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
      <div>
        <button @click="loadData" class="btn btn-primary">Refresh Data</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else class="analysis-content">
      <!-- Peak Hours Analysis -->
      <div class="card">
        <div class="card-header">
          <h2>Peak Consumption Hours</h2>
        </div>
        <div v-if="analysis.peakHours" class="peak-info">
          <div class="peak-stat">
            <span class="label">Peak Time Range</span>
            <span class="value"
              >{{ analysis.peakHours.peakStartHour }}:00 -
              {{ analysis.peakHours.peakEndHour }}:00</span
            >
          </div>
          <div class="peak-stat">
            <span class="label">Peak Consumption</span>
            <span class="value"
              >{{ analysis.peakHours.peakConsumption }} kWh</span
            >
          </div>
          <div class="peak-stat">
            <span class="label">Average Consumption</span>
            <span class="value"
              >{{ analysis.peakHours.averageConsumption }} kWh</span
            >
          </div>
          <div class="peak-stat">
            <span class="label">Difference</span>
            <span class="value positive">
              +{{
                (
                  (analysis.peakHours.peakConsumption /
                    analysis.peakHours.averageConsumption -
                    1) *
                  100
                ).toFixed(1)
              }}%
            </span>
          </div>
        </div>

        <h3 style="margin-top: 1.5rem">Hourly Breakdown</h3>
        <div class="hourly-chart">
          <div
            v-for="hour in analysis.peakHours.hourlyBreakdown"
            :key="hour.hour"
            class="hour-bar"
          >
            <div class="bar-container">
              <div
                class="bar"
                :style="{
                  height: (hour.consumption / maxHourlyConsumption) * 100 + '%',
                }"
                :class="{ active: isInPeakHours(hour.hour) }"
              ></div>
            </div>
            <span class="hour-label"
              >{{ String(hour.hour).padStart(2, "0") }}:00</span
            >
          </div>
        </div>
      </div>

      <!-- Night Consumption Analysis -->
      <div class="card">
        <div class="card-header">
          <h2>Night & Idle Consumption</h2>
        </div>
        <div v-if="analysis.nightConsumption" class="night-info">
          <div
            class="alert"
            :class="
              analysis.nightConsumption.nightPercentage > 30
                ? 'alert-warning'
                : 'alert-success'
            "
          >
            {{ analysis.nightConsumption.message }}
          </div>

          <div class="consumption-grid">
            <div>
              <h4>Night (00:00 - 06:00)</h4>
              <p class="big-number">
                {{ analysis.nightConsumption.nightConsumption }} kWh
              </p>
            </div>
            <div>
              <h4>Day (06:00 - 18:00)</h4>
              <p class="big-number">
                {{ analysis.nightConsumption.dayConsumption }} kWh
              </p>
            </div>
            <div>
              <h4>Evening (19:00 - 23:00)</h4>
              <p class="big-number">
                {{ analysis.nightConsumption.eveningConsumption }} kWh
              </p>
            </div>
            <div>
              <h4>Night as % of Day</h4>
              <p class="big-number">
                {{ analysis.nightConsumption.nightPercentage }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Outliers Detection -->
      <div class="card">
        <div class="card-header">
          <h2>Anomalies Detected</h2>
          <span
            v-if="analysis.outliers.length > 0"
            class="badge badge-danger"
            >{{ analysis.outliers.length }}</span
          >
        </div>

        <div v-if="analysis.outliers.length === 0" class="empty-state">
          <p>✓ No anomalies detected. Your consumption looks normal!</p>
        </div>

        <div v-else class="outliers-list">
          <div
            v-for="(outlier, index) in analysis.outliers.slice(0, 10)"
            :key="index"
            class="outlier-item"
          >
            <div class="outlier-header">
              <span class="timestamp">{{ formatDate(outlier.timestamp) }}</span>
              <span :class="['severity', `severity-${outlier.severity}`]">{{
                outlier.severity
              }}</span>
            </div>
            <div class="outlier-details">
              <span
                >Consumption:
                <strong>{{ outlier.consumption }} kWh</strong></span
              >
              <span
                >Deviation: <strong>{{ outlier.deviation }}%</strong></span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Trends Analysis -->
      <div class="card">
        <div class="card-header">
          <h2>Consumption Trends</h2>
        </div>

        <div v-if="analysis.trends" class="trends-info">
          <div class="trend-indicator">
            <span class="label">Overall Trend</span>
            <span :class="['trend-badge', `trend-${analysis.trends.trend}`]">
              {{ analysis.trends.trend.toUpperCase() }}
            </span>
          </div>

          <div v-if="analysis.trends.trend !== 'stable'" class="trend-change">
            <span class="label">Change</span>
            <span
              :class="{
                positive: analysis.trends.percentageChange > 0,
                negative: analysis.trends.percentageChange < 0,
              }"
            >
              {{ analysis.trends.percentageChange > 0 ? "+" : ""
              }}{{ analysis.trends.percentageChange }}%
            </span>
          </div>

          <div class="trend-comparison">
            <div>
              <h4>First Half Average</h4>
              <p class="big-number">{{ analysis.trends.firstHalf }} kWh</p>
            </div>
            <div>
              <h4>Second Half Average</h4>
              <p class="big-number">{{ analysis.trends.secondHalf }} kWh</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="analysis.recommendations.length > 0" class="card">
        <div class="card-header">
          <h2>Personalized Recommendations</h2>
        </div>

        <div class="recommendations">
          <div
            v-for="rec in analysis.recommendations"
            :key="rec.category"
            class="recommendation-card"
          >
            <div class="rec-title">
              <h3>{{ rec.title }}</h3>
              <span :class="['rec-priority', `priority-${rec.priority}`]">{{
                rec.priority
              }}</span>
            </div>
            <p class="rec-description">{{ rec.description }}</p>
            <p class="rec-impact">{{ rec.impact }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "Analysis",
  data() {
    return {
      loading: false,
      error: null,
      selectedDays: 30,
      analysis: {
        peakHours: null,
        nightConsumption: null,
        outliers: [],
        trends: null,
        recommendations: [],
      },
      maxHourlyConsumption: 1,
    };
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = null;
      try {
        // Fetch consumption data
        const consumptionResponse = await axios.get(
          `/api/energy/consumption?days=${this.selectedDays}`,
        );
        const data = consumptionResponse.data.data;

        if (!data || data.length === 0) {
          this.error = "No data available for the selected period.";
          this.loading = false;
          return;
        }

        // Analyze the data
        const analysisResponse = await axios.post("/api/analysis/analyze", {
          data,
        });
        this.analysis = analysisResponse.data.analysis;

        // Calculate max hourly consumption for chart
        if (
          this.analysis.peakHours &&
          this.analysis.peakHours.hourlyBreakdown
        ) {
          this.maxHourlyConsumption = Math.max(
            ...this.analysis.peakHours.hourlyBreakdown.map(
              (h) => h.consumption,
            ),
          );
        }
      } catch (error) {
        console.error("Load data error:", error);
        this.error = "Failed to load analysis data. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    isInPeakHours(hour) {
      if (!this.analysis.peakHours) return false;
      return (
        hour >= this.analysis.peakHours.peakStartHour &&
        hour <= this.analysis.peakHours.peakEndHour
      );
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
  },
  mounted() {
    this.loadData();
  },
});
</script>

<style scoped>
.analysis {
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: flex-end;
}

.controls > div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.controls label {
  font-weight: bold;
}

.controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.peak-info,
.night-info,
.trends-info {
  padding: 1rem;
}

.peak-stat {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.peak-stat:last-child {
  border-bottom: none;
}

.peak-stat .label {
  font-weight: 600;
  color: #666;
}

.peak-stat .value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
}

.peak-stat .value.positive {
  color: #ff6b6b;
}

.hourly-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.hour-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 80%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  min-height: 5px;
  transition: all 0.3s ease;
}

.bar.active {
  background: linear-gradient(180deg, #ff6b6b 0%, #ff5252 100%);
}

.bar:hover {
  opacity: 0.8;
}

.hour-label {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.5rem;
}

.consumption-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.consumption-grid div {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  text-align: center;
}

.consumption-grid h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.big-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.outliers-list {
  max-height: 500px;
  overflow-y: auto;
}

.outlier-item {
  padding: 1rem;
  background: #f9f9f9;
  border-left: 4px solid #ff6b6b;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.outlier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timestamp {
  font-weight: bold;
  color: #333;
}

.severity {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.severity-high {
  background: #ff6b6b;
  color: white;
}

.severity-medium {
  background: #ffc107;
  color: white;
}

.outlier-details {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.trend-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.trend-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

.trend-stable {
  background: #28a745;
  color: white;
}

.trend-increasing {
  background: #ff6b6b;
  color: white;
}

.trend-decreasing {
  background: #28a745;
  color: white;
}

.trend-change {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.trend-change .label {
  font-weight: bold;
}

.trend-change .positive {
  color: #ff6b6b;
  font-weight: bold;
  font-size: 1.2rem;
}

.trend-change .negative {
  color: #28a745;
  font-weight: bold;
  font-size: 1.2rem;
}

.trend-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.trend-comparison div {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  text-align: center;
}

.recommendation-card {
  padding: 1rem;
  background: #f9f9f9;
  border-left: 4px solid #667eea;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.rec-title {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.rec-title h3 {
  margin: 0;
}

.rec-priority {
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

.rec-description {
  margin: 0.5rem 0;
  color: #666;
}

.rec-impact {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: bold;
}
</style>
