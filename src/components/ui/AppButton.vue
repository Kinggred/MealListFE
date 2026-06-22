<template>
  <button
    class="app-button"
    :class="variantClass"
    :disabled="disabled"
    :type="type"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    variant?: "default" | "primary" | "warning"
    disabled?: boolean
    type?: "button" | "submit" | "reset"
  }>(),
  {
    variant: "default",
    disabled: false,
    type: "button",
  },
)

const variantClass = computed(() => {
  if (props.variant === "primary") return "app-button-primary"
  if (props.variant === "warning") return "app-button-warning"
  return ""
})
</script>
