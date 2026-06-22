<template>
  <div class="app-card" :class="{ 'app-card-large': large }">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  large?: boolean
}>()
</script>
