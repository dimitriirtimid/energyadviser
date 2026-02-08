<template>
  <div id="app" class="app">
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <h1>⚡ Energy Adviser</h1>
        </div>
        <div class="navbar-menu">
          <router-link to="/">Dashboard</router-link>
          <router-link v-if="isAuthenticated" to="/analysis"
            >Analysis</router-link
          >
          <button v-if="isAuthenticated" @click="logout" class="btn-logout">
            Logout
          </button>
          <a v-else href="/api/auth/login" class="btn-login"
            >Login with EnergyID</a
          >
        </div>
      </div>
    </nav>

    <main class="container">
      <router-view></router-view>
    </main>

    <footer class="footer">
      <p>
        &copy; 2026 Energy Adviser. Helping you understand and reduce energy
        consumption.
      </p>
    </footer>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  name: "App",
  data() {
    return {
      isAuthenticated: false,
    };
  },
  methods: {
    async checkAuth() {
      try {
        const response = await axios.get("/api/auth/status");
        this.isAuthenticated = response.data.authenticated;
      } catch (error) {
        this.isAuthenticated = false;
      }
    },
    async logout() {
      try {
        await axios.get("/api/auth/logout");
        this.isAuthenticated = false;
        this.$router.push("/");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
  },
  mounted() {
    this.checkAuth();
    // Check auth status periodically
    setInterval(() => this.checkAuth(), 60000);
  },
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.navbar-menu a,
.navbar-menu button {
  color: white;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.navbar-menu a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0.7rem 1.5rem;
  font-weight: bold;
}

.btn-logout {
  background: #ff6b6b;
}

.btn-logout:hover {
  background: #ff5252;
}

main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: 2rem;
}

.footer p {
  margin: 0;
}
</style>
