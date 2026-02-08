/**
 * Energy Analysis Service
 * Provides algorithms for energy data analysis and recommendations
 */

class AnalysisService {
  /**
   * Calculate summary statistics
   */
  calculateSummary(data) {
    if (!data || data.length === 0) {
      return {
        totalConsumption: 0,
        averageConsumption: 0,
        minConsumption: 0,
        maxConsumption: 0,
        dataPoints: 0,
      };
    }

    const values = data.map((d) => parseFloat(d.consumption || d.value || 0));
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      totalConsumption: parseFloat(total.toFixed(2)),
      averageConsumption: parseFloat(average.toFixed(2)),
      minConsumption: parseFloat(min.toFixed(2)),
      maxConsumption: parseFloat(max.toFixed(2)),
      dataPoints: values.length,
      variance: this.calculateVariance(values),
    };
  }

  /**
   * Detect outliers using statistical methods
   */
  detectOutliers(data) {
    if (!data || data.length < 3) return [];

    const values = data.map((d, idx) => ({
      index: idx,
      timestamp: d.timestamp || d.date,
      consumption: parseFloat(d.consumption || d.value || 0),
    }));

    const consumptions = values.map((v) => v.consumption);
    const mean = consumptions.reduce((a, b) => a + b) / consumptions.length;
    const std = Math.sqrt(
      consumptions.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) /
        consumptions.length,
    );

    // Identify outliers (values beyond 2 standard deviations)
    const threshold = 2;
    const outliers = values.filter((v) => {
      const zScore = Math.abs((v.consumption - mean) / std);
      return zScore > threshold;
    });

    return outliers.map((o) => ({
      timestamp: o.timestamp,
      consumption: parseFloat(o.consumption.toFixed(2)),
      deviation: parseFloat((((o.consumption - mean) / mean) * 100).toFixed(1)),
      severity: Math.abs((o.consumption - mean) / std) > 3 ? "high" : "medium",
    }));
  }

  /**
   * Analyze peak consumption hours
   */
  analyzePeakHours(data) {
    if (!data || data.length === 0) {
      return {
        peakStartHour: 0,
        peakEndHour: 0,
        peakConsumption: 0,
        averageConsumption: 0,
      };
    }

    const hourlyData = {};

    // Group by hour
    data.forEach((d) => {
      const timestamp = d.timestamp || d.date;
      if (!timestamp) return;

      const hour = new Date(timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(parseFloat(d.consumption || d.value || 0));
    });

    // Calculate average per hour
    const hourlyAverages = Object.keys(hourlyData).map((hour) => ({
      hour: parseInt(hour),
      average:
        hourlyData[hour].reduce((a, b) => a + b) / hourlyData[hour].length,
    }));

    if (hourlyAverages.length === 0) {
      return {
        peakStartHour: 0,
        peakEndHour: 0,
        peakConsumption: 0,
        averageConsumption: 0,
        hourlyBreakdown: [],
      };
    }

    const sorted = hourlyAverages.sort((a, b) => b.average - a.average);
    const peak = sorted[0];
    const overall =
      hourlyAverages.reduce((sum, h) => sum + h.average, 0) /
      hourlyAverages.length;

    // Find consecutive peak hours
    const peakHours = sorted
      .slice(0, 3)
      .map((h) => h.hour)
      .sort((a, b) => a - b);
    const peakStartHour = peakHours[0];
    const peakEndHour = peakHours[peakHours.length - 1];

    return {
      peakStartHour,
      peakEndHour,
      peakConsumption: parseFloat(peak.average.toFixed(2)),
      averageConsumption: parseFloat(overall.toFixed(2)),
      hourlyBreakdown: hourlyAverages
        .sort((a, b) => a.hour - b.hour)
        .map((h) => ({
          hour: h.hour,
          consumption: parseFloat(h.average.toFixed(2)),
        })),
    };
  }

  /**
   * Analyze night consumption (idle/standby consumption)
   */
  analyzeNightConsumption(data) {
    if (!data || data.length === 0) {
      return {
        nightConsumption: 0,
        dayConsumption: 0,
        nightPercentage: 0,
        message: "Insufficient data",
      };
    }

    const nightHours = [0, 1, 2, 3, 4, 5]; // 00:00 - 06:00
    const dayHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]; // 06:00 - 18:00
    const eveningHours = [19, 20, 21, 22, 23]; // 19:00 - 23:00

    let nightTotal = 0,
      nightCount = 0;
    let dayTotal = 0,
      dayCount = 0;
    let eveningTotal = 0,
      eveningCount = 0;

    data.forEach((d) => {
      const timestamp = d.timestamp || d.date;
      if (!timestamp) return;

      const hour = new Date(timestamp).getHours();
      const consumption = parseFloat(d.consumption || d.value || 0);

      if (nightHours.includes(hour)) {
        nightTotal += consumption;
        nightCount++;
      } else if (dayHours.includes(hour)) {
        dayTotal += consumption;
        dayCount++;
      } else if (eveningHours.includes(hour)) {
        eveningTotal += consumption;
        eveningCount++;
      }
    });

    const nightAvg = nightCount > 0 ? nightTotal / nightCount : 0;
    const dayAvg = dayCount > 0 ? dayTotal / dayCount : 0;
    const eveningAvg = eveningCount > 0 ? eveningTotal / eveningCount : 0;

    const nightPercentage = dayAvg > 0 ? (nightAvg / dayAvg) * 100 : 0;

    return {
      nightConsumption: parseFloat(nightAvg.toFixed(2)),
      dayConsumption: parseFloat(dayAvg.toFixed(2)),
      eveningConsumption: parseFloat(eveningAvg.toFixed(2)),
      nightPercentage: parseFloat(nightPercentage.toFixed(1)),
      message:
        nightPercentage > 30
          ? `Your night consumption is ${nightPercentage.toFixed(1)}% of day consumption - consider checking for idle devices`
          : `Your night consumption is normal at ${nightPercentage.toFixed(1)}% of day consumption`,
    };
  }

  /**
   * Calculate trends in consumption
   */
  calculateTrends(data) {
    if (!data || data.length < 2) {
      return {
        trend: "stable",
        percentageChange: 0,
        firstHalf: 0,
        secondHalf: 0,
      };
    }

    const values = data.map((d) => parseFloat(d.consumption || d.value || 0));
    const midpoint = Math.floor(values.length / 2);

    const firstHalf =
      values.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
    const secondHalf =
      values.slice(midpoint).reduce((a, b) => a + b, 0) /
      (values.length - midpoint);

    const percentageChange = ((secondHalf - firstHalf) / firstHalf) * 100;
    let trend = "stable";

    if (percentageChange > 5) trend = "increasing";
    else if (percentageChange < -5) trend = "decreasing";

    return {
      trend,
      percentageChange: parseFloat(percentageChange.toFixed(1)),
      firstHalf: parseFloat(firstHalf.toFixed(2)),
      secondHalf: parseFloat(secondHalf.toFixed(2)),
    };
  }

  /**
   * Calculate variance
   */
  calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return parseFloat(variance.toFixed(2));
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Night consumption recommendation
    if (
      analysis.nightConsumption &&
      analysis.nightConsumption.nightPercentage > 30
    ) {
      recommendations.push({
        category: "idle-consumption",
        priority: "high",
        title: "Reduce Idle Consumption",
        description: `Your night consumption is ${analysis.nightConsumption.nightPercentage}% of day consumption. Check for devices left on during the night, use smart plugs, or enable sleep modes.`,
        impact: "Could save 10-20% on energy bills",
      });
    }

    // Peak hour recommendation
    if (analysis.peakHours) {
      recommendations.push({
        category: "peak-shifting",
        priority: "medium",
        title: "Shift Peak Usage",
        description: `Peak consumption occurs between ${analysis.peakHours.peakStartHour}:00 and ${analysis.peakHours.peakEndHour}:00. Consider moving high-consumption activities to off-peak hours.`,
        impact: "Could save 5-15% during peak hours",
      });
    }

    // Outlier investigation
    if (analysis.outliers && analysis.outliers.length > 0) {
      const highOutliers = analysis.outliers.filter(
        (o) => o.severity === "high",
      );
      if (highOutliers.length > 0) {
        recommendations.push({
          category: "anomaly-investigation",
          priority: "high",
          title: "Investigate Unusual Usage",
          description: `Detected ${highOutliers.length} instance(s) of unusually high consumption. Check for malfunctioning appliances or unexpected device usage.`,
          impact: "Could identify equipment issues early",
        });
      }
    }

    // Increasing trend recommendation
    if (
      analysis.trends &&
      analysis.trends.trend === "increasing" &&
      analysis.trends.percentageChange > 10
    ) {
      recommendations.push({
        category: "consumption-trend",
        priority: "medium",
        title: "Address Rising Consumption",
        description: `Your consumption increased by ${analysis.trends.percentageChange}% in recent period. Review recent appliance purchases or usage changes.`,
        impact: "Could prevent further increases",
      });
    }

    // Generic efficiency recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        category: "general-efficiency",
        priority: "low",
        title: "General Efficiency Tips",
        description:
          "Your consumption patterns look healthy. Continue monitoring for anomalies and consider regular efficiency audits.",
        impact: "Maintain current efficiency levels",
      });
    }

    return recommendations;
  }
}

module.exports = new AnalysisService();
