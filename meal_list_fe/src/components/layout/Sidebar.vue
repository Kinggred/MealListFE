<script setup lang="ts">
import { RouterLink } from "vue-router"
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/dashboard">Dashboard</RouterLink>
    <RouterLink to="/recipes">Recipes</RouterLink>
    <RouterLink to="/ingredients">Ingredients</RouterLink>
    <RouterLink to="/diets">Diets</RouterLink>
    <RouterLink to="/planner">Planner</RouterLink>
  </aside>
</template>

<style scoped>
.sidebar {
  grid-area: sidebar;
  padding: 20px;
  border-right: 1px solid var(--border);
  background: var(--card);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

a {
  color: inherit;
  text-decoration: none;
  padding: 12px;
  border-radius: 10px;
}

a.router-link-active {
  background: #4f8ef7;
  color: white;
}
</style>
