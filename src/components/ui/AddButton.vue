<script setup lang="ts">
defineProps<{
  label?: string
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="add-button"
    :aria-label="label ?? 'Add'"
    :title="label ?? 'Add'"
    :disabled="disabled"
  >
    <svg
      aria-hidden="true"
      viewBox="5 5 14 14"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  </button>
</template>

<style scoped>
.add-button {
  display: inline-grid;
  place-items: center;
  width: 66px;
  height: 66px;
  border: 1px solid var(--border);
  background: rgba(79, 142, 247, 0.1);
  color: var(--text);
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease;
}

.add-button:hover {
  border-color: #4f8ef7;
  background: rgba(79, 142, 247, 0.18);
  color: #4f8ef7;
}

.add-button:active {
  transform: translateY(1px);
}

.add-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.add-button svg {
  width: 22px;
  height: 22px;
}
</style>
