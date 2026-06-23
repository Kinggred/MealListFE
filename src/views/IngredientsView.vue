<script setup lang="ts">
import AddButton from '@/components/ui/AddButton.vue'
import SaveButton from '@/components/ui/SaveButton.vue'
import TrashButton from '@/components/ui/TrashButton.vue'
import { useIngredientsManager } from '@/composables/useIngredientsManager'

const {
  units,
  ingredients,
  selectedId,
  selectedIngredient,
  loading,
  saving,
  error,
  form,
  selectIngredient,
  newIngredient,
  saveIngredient,
  removeIngredient,
} = useIngredientsManager()
</script>

<template>
  <section class="manager manager--compact">
    <aside class="list-panel">
      <div class="panel-header">
        <div>
          <h1>Ingredients</h1>
          <p>{{ ingredients.length }} ingredients</p>
        </div>

        <AddButton label="New ingredient" @click="newIngredient" />
      </div>

      <div v-if="loading" class="state">Loading...</div>

      <div v-else class="item-list">
        <div
          v-for="ingredient in ingredients"
          :key="ingredient.id"
          class="item-row"
          :class="{ active: ingredient.id === selectedId }"
          role="button"
          tabindex="0"
          @click="selectIngredient(ingredient)"
          @keydown.enter="selectIngredient(ingredient)"
          @keydown.space.prevent="selectIngredient(ingredient)"
        >
          <div class="item-row-main">
            <strong>{{ ingredient.name }}</strong>
            <span
              >{{ ingredient.calories }} kcal · {{ ingredient.amount_per_cost }}
              {{ ingredient.unit_of_measurement }}</span
            >
          </div>

          <TrashButton
            label="Delete ingredient"
            :disabled="saving"
            @click.stop="removeIngredient(ingredient.id)"
          >
          </TrashButton>
        </div>
      </div>
    </aside>

    <main class="editor-panel">
      <div class="panel-header">
        <div>
          <h2>{{ selectedIngredient ? 'Edit ingredient' : 'New ingredient' }}</h2>
          <p v-if="selectedIngredient">{{ selectedIngredient.id }}</p>
        </div>
      </div>

      <form class="form" @submit.prevent="saveIngredient">
        <label>Name</label>
        <input v-model="form.name" required />

        <div class="split">
          <div>
            <label>Calories</label>
            <input v-model.number="form.calories" type="number" min="0" required />
          </div>

          <div>
            <label>Cost</label>
            <input v-model.number="form.cost" type="number" min="0" step="any" required />
          </div>
        </div>

        <div class="split">
          <div>
            <label>Amount per cost</label>
            <input
              v-model.number="form.amount_per_cost"
              type="number"
              min="0"
              step="any"
              required
            />
          </div>

          <div>
            <label>Unit</label>
            <select v-model="form.unit_of_measurement">
              <option v-for="unit in units" :key="unit" :value="unit">
                {{ unit }}
              </option>
            </select>
          </div>
        </div>

        <label class="check">
          <input v-model="form.animal_produced" type="checkbox" />
          Animal produced
        </label>

        <label class="check">
          <input v-model="form.animal_derived" type="checkbox" />
          Animal derived
        </label>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <div class="actions">
          <TrashButton
            v-if="selectedIngredient"
            label="Delete ingredient"
            :disabled="saving"
            @click="removeIngredient"
          />

          <SaveButton type="submit" :disabled="saving" :label="saving ? 'Saving...' : 'Save'" />
        </div>
      </form>
    </main>
  </section>
</template>
