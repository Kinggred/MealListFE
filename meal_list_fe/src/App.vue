<script setup lang="ts">
import { onMounted } from "vue"
import { useAuthStore } from "./stores/auth"

import AuthCard from "./components/auth/AuthCard.vue"
import MainLayout from "./components/layout/MainLayout.vue"

const auth = useAuthStore()

onMounted(async () => {
  await auth.initialize()
})
</script>

<template>
  <div v-if="auth.loading" class="loading">
    Loading...
  </div>

  <AuthCard v-else-if="!auth.isAuthenticated" />

  <MainLayout v-else />
</template>

<style scoped>
.loading {
  height: 100vh;
  display: grid;
  place-items: center;
  font-size: 20px;
}
</style>
