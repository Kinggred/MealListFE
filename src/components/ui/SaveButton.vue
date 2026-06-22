<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    label: 'Save',
    disabled: false,
    type: 'button',
  },
)
</script>

<template>
  <button :type="type" class="save-button" :aria-label="label" :title="label" :disabled="disabled">
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  </button>
</template>

<style scoped>
.save-button {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border);
  background: rgba(34, 197, 94, 0.12);
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

.save-button:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.save-button:active {
  transform: translateY(1px);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.save-button svg {
  width: 20px;
  height: 20px;
}

.save-button.side-primary-action {
  width: 100%;
}
</style>
