<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import TrashButton from '@/components/ui/TrashButton.vue'
import type { RecipeIngredientCreate, RecipeView } from '@/types/Recipe'

defineProps<{
  selectedRecipe: RecipeView | null
  initialIngredients: RecipeIngredientCreate[]
  ingredientName: (ingredientId: string) => string
  ingredientUnit: (ingredientId: string) => string
}>()

defineEmits<{
  add: []
  remove: [connectionId: string]
  removeInitial: [index: number]
  updateAmount: [connectionId: string, amount: number]
  updateInitialAmount: [index: number, amount: number]
}>()
</script>

<template>
  <section class="side-section">
    <div class="side-section-header">
      <h2>Ingredients</h2>
    </div>

    <div v-if="selectedRecipe" class="selected-ingredients">
      <div
        v-for="ingredient in selectedRecipe.ingredients"
        :key="ingredient.connection_id"
        class="selected-ingredient-row"
      >
        <span>{{ ingredient.name }}</span>

        <input
          type="number"
          min="0"
          step="1"
          :value="ingredient.amount"
          @change="
            $emit(
              'updateAmount',
              ingredient.connection_id,
              Number(($event.target as HTMLInputElement).value),
            )
          "
        />

        <small>{{ ingredient.unit_of_measurement }}</small>

        <TrashButton label="Remove ingredient" @click="$emit('remove', ingredient.connection_id)" />
      </div>
    </div>

    <div v-else class="selected-ingredients">
      <div
        v-for="(ingredient, index) in initialIngredients"
        :key="`${ingredient.ingredient_id}-${index}`"
        class="selected-ingredient-row"
      >
        <span>{{ ingredientName(ingredient.ingredient_id) }}</span>

        <input
          type="number"
          min="0"
          step="1"
          :value="ingredient.amount"
          @change="
            $emit('updateInitialAmount', index, Number(($event.target as HTMLInputElement).value))
          "
        />

        <small>{{ ingredientUnit(ingredient.ingredient_id) }}</small>
        <TrashButton label="Remove ingredient" @click="$emit('removeInitial', index)" />
      </div>
    </div>

    <AppButton class="side-primary-action" @click="$emit('add')">Add</AppButton>
  </section>
</template>

<style scoped>
.side-section,
.selected-ingredients {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.side-section {
  min-height: 0;
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

.selected-ingredients {
  max-height: 280px;
  overflow: auto;
  padding-right: 4px;
}

.selected-ingredient-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 92px 42px auto;
  gap: 8px;
  align-items: center;
}

.selected-ingredient-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-ingredient-row small {
  color: var(--muted);
}

.side-primary-action {
  width: 100%;
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
