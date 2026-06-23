<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import AddButton from '@/components/ui/AddButton.vue'
import type { Diet } from '@/types/Diet'
import type { IngredientSearchResult } from '@/types/Ingredient'

defineProps<{
  ingredients: IngredientSearchResult[]
  diets: Diet[]
  saving: boolean
}>()

const search = defineModel<string>('search', { required: true })
const selectedDietIds = defineModel<string[]>('selectedDietIds', { required: true })

defineEmits<{
  back: []
  create: []
  add: [ingredientId: string]
}>()
</script>

<template>
  <section class="side-section catalog-layout">
    <div class="side-section-header">
      <AppButton type="button" @click="$emit('back')">Back</AppButton>
      <h2>Add ingredient</h2>
      <AddButton label="New ingredient" @click="$emit('create')" />
    </div>

    <div class="catalog-columns">
      <div class="catalog-main">
        <input v-model="search" class="ingredient-search" placeholder="Search" type="search" />

        <div class="ingredient-catalog">
          <button
            v-for="ingredient in ingredients"
            :key="ingredient.id"
            type="button"
            class="ingredient-choice"
            :disabled="saving"
            @click="$emit('add', ingredient.id)"
          >
            {{ ingredient.name }}
          </button>
        </div>
      </div>

      <div class="diet-filter">
        <h3>Diet</h3>

        <label v-for="diet in diets" :key="diet.id" class="diet-option">
          <input v-model="selectedDietIds" type="checkbox" :value="diet.id" />
          {{ diet.name }}
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.side-section,
.catalog-main,
.ingredient-catalog,
.diet-filter {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.catalog-layout {
  min-height: 420px;
}

.side-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.side-section h2 {
  margin: 0;
  font-size: 16px;
}

.catalog-columns {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(120px, 170px);
  gap: 12px;
}

.ingredient-catalog,
.diet-filter {
  max-height: 300px;
  overflow: auto;
  padding-right: 4px;
}

.ingredient-choice {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease;
}

.ingredient-choice:hover {
  border-color: #4f8ef7;
  background: rgba(79, 142, 247, 0.12);
  transform: translateY(-1px);
}

.ingredient-choice:disabled {
  opacity: 0.65;
  cursor: default;
}

.diet-filter {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
}

.diet-filter h3 {
  margin: 0 0 4px;
  font-size: 14px;
}

.diet-option {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 14px;
}

.diet-option input {
  width: auto;
}

input {
  box-sizing: border-box;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  padding: 10px;
  font: inherit;
}

input {
  width: 100%;
}
</style>
