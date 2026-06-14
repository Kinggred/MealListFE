<template>
  <p :class="['app-muted', { 'app-error': error }]">
    <slot />
  </p>
</template>

<script setup lang="ts">
defineProps<{
  error?: boolean
}>()
</script>
