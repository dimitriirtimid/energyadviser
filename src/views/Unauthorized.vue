<template>
  <div class="unauthorized">
    <div class="card">
      <div class="icon">🔒</div>
      <h2>Authentication Required</h2>
      <p>You need to be logged in to access this page.</p>
      <a href="/api/auth/login" class="btn btn-primary">Login with EnergyID</a>
      <router-link to="/" class="btn btn-secondary">Back to Home</router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "Unauthorized",
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

.btn {
  display: inline-block;
  margin: 0.5rem;
}
</style>
