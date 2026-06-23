<script setup lang="ts">
import { useAuthStore } from "../../stores/auth"
import { useThemeStore } from "@/stores/theme"

const auth = useAuthStore()
const theme = useThemeStore()
</script>

<template>
  <header class="header">
    <h2>MealList</h2>

    <div class="right">
      <span>{{ auth.user?.username }}</span>

      <button
        class="icon-action"
        :aria-label="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="theme.toggle()"
      >
        {{ theme.isDark ? "☀" : "☾" }}
      </button>

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

.header h2 {
  margin: 0;
  font-size: 20px;
}

.right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon-action {
  width: 38px;
  height: 38px;
  display: inline-grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg);
  color: var(--text);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.icon-action:hover {
  border-color: #4f8ef7;
}

@media (max-width: 760px) {
  .header {
    min-height: 58px;
    padding: 10px 12px;
    gap: 12px;
  }

  .right {
    gap: 8px;
    min-width: 0;
  }

  .right span {
    max-width: 36vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .right button:not(.icon-action) {
    min-height: 38px;
    padding: 8px 10px;
  }
}

@media (max-width: 420px) {
  .right span {
    display: none;
  }
}
</style>
