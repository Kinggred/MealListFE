<script setup lang="ts">
import { useAuthStore } from "../../stores/auth"

const auth = useAuthStore()
</script>

<template>
  <header class="header">
    <h2>MealList</h2>

    <div class="right">
      <span>{{ auth.user?.username }}</span>

      <button @click="auth.logout()">
        Logout
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  grid-area: header;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0 24px;

  border-bottom: 1px solid var(--border);

  background: var(--card);
}

.right {
  display: flex;
  gap: 16px;
  align-items: center;
}
</style>
