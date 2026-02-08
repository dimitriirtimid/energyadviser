import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Analysis from "../views/Analysis.vue";
import Unauthorized from "../views/Unauthorized.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/analysis",
    name: "Analysis",
    component: Analysis,
    meta: { requiresAuth: true },
  },
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: Unauthorized,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Auth guard
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      if (data.authenticated) {
        next();
      } else {
        next("/unauthorized");
      }
    } catch (error) {
      next("/unauthorized");
    }
  } else {
    next();
  }
});

export default router;
