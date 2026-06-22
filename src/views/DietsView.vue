<script setup lang="ts">
import { useDietsManager } from '@/composables/useDietsManager'

const {
  diets,
  ingredients,
  selectedId,
  selectedDiet,
  currentDiet,
  loading,
  saving,
  error,
  selectedIngredientId,
  draftIngredientIds,
  form,
  selectDiet,
  newDiet,
  addDraftIngredient,
  removeDraftIngredient,
  saveDiet,
  removeDiet,
  addIngredientToDiet,
  removeIngredientFromDiet,
  ingredientName,
} = useDietsManager()
</script>

<template>
  <section class="manager">
    <aside class="list-panel">
      <div class="panel-header">
        <div>
          <h1>Diets</h1>
          <p>{{ diets.length }} diets</p>
        </div>

        <button @click="newDiet">New</button>
      </div>

      <div v-if="loading" class="state">Loading...</div>

      <div v-else class="item-list">
        <button
          v-for="diet in diets"
          :key="diet.id"
          class="item-row"
          :class="{ active: diet.id === selectedId }"
          @click="selectDiet(diet)"
        >
          <strong>{{ diet.name }}</strong>
        </button>
      </div>
    </aside>

    <main class="editor-panel">
      <div class="panel-header">
        <div>
          <h2>{{ currentDiet ? 'Edit diet' : 'New diet' }}</h2>
          <p v-if="selectedDiet">{{ selectedDiet.ingredients.length }} ingredients</p>
        </div>
      </div>

      <form class="form" @submit.prevent="saveDiet">
        <label>Name</label>
        <input v-model="form.name" required />

        <label>Content JSON</label>
        <textarea v-model="form.content" rows="5" />

        <section class="subpanel">
          <div class="section-header">
            <h3>Ingredients</h3>
          </div>

          <div class="add-row">
            <select v-model="selectedIngredientId">
              <option v-for="ingredient in ingredients" :key="ingredient.id" :value="ingredient.id">
                {{ ingredient.name }}
              </option>
            </select>

            <button
              v-if="selectedDiet"
              type="button"
              :disabled="saving || !selectedIngredientId"
              @click="addIngredientToDiet"
            >
              Add
            </button>

            <button
              v-else
              type="button"
              :disabled="!selectedIngredientId"
              @click="addDraftIngredient"
            >
              Add
            </button>
          </div>

          <div v-if="selectedDiet" class="connection-list">
            <div
              v-for="ingredient in selectedDiet.ingredients"
              :key="ingredient.connection_id"
              class="connection-row"
            >
              <span>{{ ingredient.name }}</span>

              <button type="button" @click="removeIngredientFromDiet(ingredient.connection_id)">
                x
              </button>
            </div>
          </div>

          <div v-else class="connection-list">
            <div
              v-for="ingredientId in draftIngredientIds"
              :key="ingredientId"
              class="connection-row"
            >
              <span>{{ ingredientName(ingredientId) }}</span>

              <button type="button" @click="removeDraftIngredient(ingredientId)">x</button>
            </div>
          </div>
        </section>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <div class="actions">
          <button :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>

          <button
            v-if="selectedDiet"
            type="button"
            class="danger"
            :disabled="saving"
            @click="removeDiet"
          >
            Delete
          </button>
        </div>
      </form>
    </main>
  </section>
</template>
