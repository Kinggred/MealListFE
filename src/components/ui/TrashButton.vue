<script setup lang="ts">
defineProps<{
  label?: string
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="trash-button"
    :aria-label="label ?? 'Remove'"
    :title="label ?? 'Remove'"
    :disabled="disabled"
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  </button>
</template>

<style scoped>
.trash-button {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border);
  background: rgba(214, 69, 69, 0.08);
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

.trash-button:hover {
  border-color: #d64545;
  background: rgba(214, 69, 69, 0.14);
  color: #d64545;
}

.trash-button:active {
  transform: translateY(1px);
}

.trash-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.trash-button svg {
  width: 20px;
  height: 20px;
}
</style>
