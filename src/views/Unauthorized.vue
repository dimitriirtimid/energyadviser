<template>
  <div class="unauthorized">
    <div class="card">
      <div class="icon">🔒</div>
      <h2>Verificatie vereist</h2>
      <p>U moet ingelogd zijn om deze pagina te openen.</p>
      <div class="button-group">
        <a href="/api/auth/login" class="btn btn-primary"
          >Inloggen met EnergyID</a
        >
        <button
          @click="demoLogin"
          class="btn btn-secondary"
          :disabled="demoLoading"
        >
          {{ demoLoading ? "Demo wordt geladen..." : "Demo-modus proberen" }}
        </button>
      </div>
      <p v-if="demoMessage" :class="['demo-message', demoMessageType]">
        {{ demoMessage }}
      </p>
      <router-link to="/" class="btn btn-link">Terug naar start</router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "Unauthorized",
  data() {
    return {
      demoLoading: false,
      demoMessage: "",
      demoMessageType: "info",
    };
  },
  methods: {
    async demoLogin() {
      this.demoLoading = true;
      this.demoMessage = "";
      try {
        const response = await axios.get("/api/auth/demo-login");
        if (response.data.success) {
          this.demoMessage =
            "✅ Demo-login succesvol! Pagina wordt vernieuwd...";
          this.demoMessageType = "success";
          // Refresh the page to update authentication
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error("Demo login error:", error);
        this.demoMessage =
          "❌ Demo-modus is niet beschikbaar. Probeer de normale inloggen.";
        this.demoMessageType = "error";
        this.demoLoading = false;
      }
    },
  },
});
</script>

<style scoped>
.unauthorized {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 300px);
}

.card {
  text-align: center;
  padding: 3rem;
  max-width: 500px;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.card h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.card p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.button-group .btn {
  flex: 1;
  min-width: 150px;
  display: inline-block;
}

.btn {
  display: inline-block;
  margin: 0.5rem;
}

.btn-link {
  background: none;
  border: none;
  color: #27ae60;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
}

.demo-message {
  margin: 1rem 0;
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
