<script setup lang="ts">
import { RouterLink } from "vue-router"

defineOptions({
  name: "AppSidebar",
})
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

@media (max-width: 760px) {
  .sidebar {
    position: sticky;
    top: 0;
    z-index: 3;
    flex-direction: row;
    gap: 6px;
    overflow-x: auto;
    padding: 8px 12px;
    border-right: 0;
    border-bottom: 1px solid var(--border);
    scrollbar-width: none;
  }

  .sidebar::-webkit-scrollbar {
    display: none;
  }

  a {
    flex: 0 0 auto;
    padding: 10px 12px;
    border-radius: 8px;
    white-space: nowrap;
  }
}
</style>
