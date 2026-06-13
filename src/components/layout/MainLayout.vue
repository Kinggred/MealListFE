<script setup lang="ts">
import { RouterView } from "vue-router"
import Sidebar from "./Sidebar.vue"
import HeaderBar from "./HeaderBar.vue"
</script>

<template>
  <div class="layout">
    <HeaderBar />

    <Sidebar />

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 230px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "header header"
    "sidebar content";
  background: var(--bg);
  color: var(--text);
}

.content {
  grid-area: content;
  overflow: auto;
  padding: 28px;
}
</style>
