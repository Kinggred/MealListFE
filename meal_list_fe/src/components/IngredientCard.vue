<script setup lang="ts">
import type { Ingredient } from "../types/ingredient"

defineProps<{
  ingredient: Ingredient
}>()
</script>

<template>
  <div class="card">
    <div class="title">
      {{ ingredient.name }}
    </div>

    <div class="meta">
      <span>🔥 {{ ingredient.calories }} kcal</span>
      <span>💰 {{ ingredient.cost }}</span>
      <span>📦 {{ ingredient.amount_per_cost }} / {{ ingredient.unit_of_measurement }}</span>
    </div>

    <div class="tags">
      <span v-if="ingredient.animal_produced">🐄 animal</span>
      <span v-if="ingredient.animal_derived">🥛 derived</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--muted);
}

.tags {
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted);
}
</style>
