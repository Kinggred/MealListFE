<script setup lang="ts">
import type { Recipe } from '@/types/Recipe'

defineProps<{
  recipes: Recipe[]
  selectedId: string | null
  recipeImage: (value: string | null | undefined) => string
}>()

defineEmits<{
  select: [recipe: Recipe]
}>()
</script>

<template>
  <div class="recipe-list">
    <button
      v-for="recipe in recipes"
      :key="recipe.id"
      type="button"
      class="recipe-list-item"
      :class="{ active: recipe.id === selectedId }"
      @click="$emit('select', recipe)"
    >
      <span class="recipe-list-image">
        <img v-if="recipe.image" :src="recipeImage(recipe.image)" alt="" />
        <span v-else>{{ recipe.name.slice(0, 1) }}</span>
      </span>

      <span>
        <strong>{{ recipe.name }}</strong>
        <small>{{ recipe.image || 'No image' }}</small>
      </span>
    </button>
  </div>
</template>

<style scoped>
.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.recipe-list-item {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  padding: 10px 14px;
  text-align: left;
  cursor: pointer;
  min-height: 70px;
  touch-action: manipulation;
}

.recipe-list-item:hover {
  border-color: #4f8ef7;
}

.recipe-list-item.active {
  border-color: #4f8ef7;
  background: rgba(79, 142, 247, 0.15);
}

.recipe-list-image {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: 50%;
}

.recipe-list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-list-item strong,
.recipe-list-item small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-list-item small {
  color: var(--muted);
}

@media (max-width: 640px) {
  .recipe-list {
    grid-template-columns: 1fr;
  }
}
</style>
