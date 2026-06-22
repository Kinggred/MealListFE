<script setup lang="ts">
import { useRecipesManager } from '@/composables/useRecipesManager'

const {
  recipes,
  ingredients,
  selectedId,
  selectedRecipe,
  currentRecipe,
  loading,
  saving,
  error,
  form,
  newIngredient,
  initialIngredients,
  selectRecipe,
  newRecipe,
  addInitialIngredient,
  removeInitialIngredient,
  saveRecipe,
  removeRecipe,
  addIngredient,
  saveIngredientAmount,
  removeIngredient,
  ingredientName,
} = useRecipesManager()
</script>

<template>
  <section class="manager">
    <aside class="list-panel">
      <div class="panel-header">
        <div>
          <h1>Recipes</h1>
          <p>{{ recipes.length }} recipes</p>
        </div>

        <button @click="newRecipe">New</button>
      </div>

      <div v-if="loading" class="state">Loading...</div>

      <div v-else class="item-list">
        <button
          v-for="recipe in recipes"
          :key="recipe.id"
          class="item-row"
          :class="{ active: recipe.id === selectedId }"
          @click="selectRecipe(recipe)"
        >
          <strong>{{ recipe.name }}</strong>
          <span>{{ recipe.image || 'No image' }}</span>
        </button>
      </div>
    </aside>

    <main class="editor-panel">
      <div class="panel-header">
        <div>
          <h2>{{ currentRecipe ? 'Edit recipe' : 'New recipe' }}</h2>
          <p v-if="selectedRecipe">
            {{ selectedRecipe.total_calories }} kcal · {{ selectedRecipe.total_cost }} cost
          </p>
        </div>
      </div>

      <form class="form" @submit.prevent="saveRecipe">
        <label>Name</label>
        <input v-model="form.name" required />

        <label>Image URL</label>
        <input v-model="form.image" required />

        <label>Text JSON</label>
        <textarea v-model="form.text" rows="5" />

        <section class="subpanel">
          <div class="section-header">
            <h3>Ingredients</h3>
          </div>

          <div class="add-row add-row--amount">
            <select v-model="newIngredient.ingredient_id">
              <option v-for="ingredient in ingredients" :key="ingredient.id" :value="ingredient.id">
                {{ ingredient.name }}
              </option>
            </select>

            <input
              v-model.number="newIngredient.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
            />

            <button
              v-if="selectedRecipe"
              type="button"
              :disabled="saving || !newIngredient.ingredient_id"
              @click="addIngredient"
            >
              Add
            </button>

            <button
              v-else
              type="button"
              :disabled="!newIngredient.ingredient_id"
              @click="addInitialIngredient"
            >
              Add
            </button>
          </div>

          <div v-if="selectedRecipe" class="connection-list">
            <div
              v-for="ingredient in selectedRecipe.ingredients"
              :key="ingredient.connection_id"
              class="connection-row connection-row--amount"
            >
              <span>{{ ingredient.name }}</span>

              <input
                type="number"
                min="0"
                step="0.01"
                :value="ingredient.amount"
                @change="
                  saveIngredientAmount(
                    ingredient.connection_id,
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />

              <button type="button" @click="removeIngredient(ingredient.connection_id)">x</button>
            </div>
          </div>

          <div v-else class="connection-list">
            <div
              v-for="(ingredient, index) in initialIngredients"
              :key="`${ingredient.ingredient_id}-${index}`"
              class="connection-row connection-row--amount"
            >
              <span>
                {{ ingredientName(ingredient.ingredient_id) }}
              </span>
              <span>{{ ingredient.amount }}</span>
              <button type="button" @click="removeInitialIngredient(index)">x</button>
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
            v-if="selectedRecipe"
            type="button"
            class="danger"
            :disabled="saving"
            @click="removeRecipe"
          >
            Delete
          </button>
        </div>
      </form>
    </main>
  </section>
</template>
