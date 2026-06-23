<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import SaveButton from '@/components/ui/SaveButton.vue'
import type { IngredientCreate, Unit } from '@/types/Ingredient'

defineProps<{
  ingredient: IngredientCreate
  units: Unit[]
  saving: boolean
}>()

defineEmits<{
  back: []
  save: []
}>()
</script>

<template>
  <section class="side-section ingredient-create-panel">
    <div class="side-section-header">
      <h2>New ingredient</h2>
      <AppButton type="button" @click="$emit('back')">Back</AppButton>
    </div>

    <label>Name</label>
    <input v-model="ingredient.name" required />

    <div class="ingredient-create-grid">
      <div>
        <label>Calories</label>
        <input v-model.number="ingredient.calories" type="number" min="0" />
      </div>

      <div>
        <label>Cost</label>
        <input v-model.number="ingredient.cost" type="number" min="0" step="any" />
      </div>

      <div>
        <label>Amount per cost</label>
        <input v-model.number="ingredient.amount_per_cost" type="number" min="0" step="any" />
      </div>

      <div>
        <label>Unit</label>
        <select v-model="ingredient.unit_of_measurement">
          <option v-for="unit in units" :key="unit" :value="unit">
            {{ unit }}
          </option>
        </select>
      </div>
    </div>

    <label class="ingredient-check">
      <input v-model="ingredient.animal_produced" type="checkbox" />
      Animal produced
    </label>

    <label class="ingredient-check">
      <input v-model="ingredient.animal_derived" type="checkbox" />
      Animal derived
    </label>

    <SaveButton
      class="side-primary-action"
      :disabled="saving"
      label="Save ingredient"
      @click="$emit('save')"
    />
  </section>
</template>

<style scoped>
.side-section,
.ingredient-create-panel {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.ingredient-create-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

label {
  color: var(--muted);
  font-size: 14px;
}

.ingredient-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ingredient-check input {
  width: auto;
}

.side-primary-action {
  width: 100%;
}

input,
select {
  box-sizing: border-box;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  padding: 10px;
  font: inherit;
  min-height: 44px;
}

input,
select {
  width: 100%;
}

@media (max-width: 640px) {
  .side-section-header {
    align-items: stretch;
    flex-direction: column;
  }

  .ingredient-create-grid {
    grid-template-columns: 1fr;
  }
}
</style>
