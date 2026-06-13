import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/dashboard",
      component: () => import("@/views/DashboardView.vue"),
    },
    {
      path: "/planner",
      component: () => import("@/views/PlannerView.vue"),
    },
    {
      path: "/recipes",
      component: () => import("@/views/RecipesView.vue"),
    },
    {
      path: "/ingredients",
      component: () => import("@/views/IngredientsView.vue"),
    },
    {
      path: "/diets",
      component: () => import("@/views/DietsView.vue"),
    },
  ],
})

export default router
