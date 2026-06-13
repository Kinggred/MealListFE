<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import {
  addIngredientToRecipe,
  createRecipe,
  deleteIngredientFromRecipe,
  deleteRecipe,
  getRecipe,
  getRecipes,
  updateIngredientInRecipe,
  updateRecipe,
} from "@/api/recipes"
import { getIngredients } from "@/api/ingredients"
import type { Ingredient } from "@/types/Ingredient"
import type { Recipe, RecipeIngredientCreate, RecipeView } from "@/types/Recipe"

const recipes = ref<Recipe[]>([])
const ingredients = ref<Ingredient[]>([])
const selectedId = ref<string | null>(null)
const selectedRecipe = ref<RecipeView | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  name: "",
  image: "",
  text: "{}",
})

const newIngredient = reactive<RecipeIngredientCreate>({
  ingredient_id: "",
  amount: 0,
})

const initialIngredients = ref<RecipeIngredientCreate[]>([])

const currentRecipe = computed(
  () => recipes.value.find((recipe) => recipe.id === selectedId.value) ?? null,
)

function parseText(): Record<string, string> | null {
  try {
    const value = JSON.parse(form.text || "{}")
    return value && typeof value === "object" && !Array.isArray(value) ? value : null
  } catch {
    return null
  }
}

function setForm(recipe?: Recipe | RecipeView) {
  form.name = recipe?.name ?? ""
  form.image = recipe?.image ?? ""
  form.text = JSON.stringify(recipe?.text ?? {}, null, 2)
}

async function loadData() {
  loading.value = true
  error.value = null

  try {
    const [recipePage, ingredientPage] = await Promise.all([
      getRecipes({ size: 100 }),
      getIngredients({ size: 100 }),
    ])

    recipes.value = recipePage.items
    ingredients.value = ingredientPage.items
    newIngredient.ingredient_id = ingredientPage.items[0]?.id ?? ""
  } catch (e) {
    error.value = "Failed to load recipes"
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function selectRecipe(recipe: Recipe) {
  selectedId.value = recipe.id
  error.value = null

  try {
    const details = await getRecipe(recipe.id)
    selectedRecipe.value = details
    initialIngredients.value = []
    setForm(details)
  } catch (e) {
    error.value = "Failed to load recipe"
    console.error(e)
  }
}

function newRecipe() {
  selectedId.value = null
  selectedRecipe.value = null
  initialIngredients.value = []
  setForm()
}

function addInitialIngredient() {
  if (!newIngredient.ingredient_id) return

  initialIngredients.value.push({
    ingredient_id: newIngredient.ingredient_id,
    amount: newIngredient.amount,
  })
  newIngredient.amount = 0
}

function removeInitialIngredient(index: number) {
  initialIngredients.value.splice(index, 1)
}

async function saveRecipe() {
  const text = parseText()
  if (!text) {
    error.value = "Recipe text must be a JSON object"
    return
  }

  saving.value = true
  error.value = null

  try {
    if (selectedId.value) {
      const updated = await updateRecipe(selectedId.value, {
        name: form.name,
        image: form.image,
        text,
      })
      const index = recipes.value.findIndex((recipe) => recipe.id === updated.id)
      if (index !== -1) recipes.value[index] = updated
      await selectRecipe(updated)
    } else {
      const created = await createRecipe({
        name: form.name,
        image: form.image,
        text,
        ingredients: initialIngredients.value,
      })
      await loadData()
      await selectRecipe(created)
    }
  } catch (e) {
    error.value = "Failed to save recipe"
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function removeRecipe() {
  if (!selectedId.value) return

  saving.value = true
  error.value = null

  try {
    await deleteRecipe(selectedId.value)
    recipes.value = recipes.value.filter((recipe) => recipe.id !== selectedId.value)
    newRecipe()
  } catch (e) {
    error.value = "Failed to delete recipe"
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function addIngredient() {
  if (!selectedId.value || !newIngredient.ingredient_id) return

  saving.value = true
  error.value = null

  try {
    await addIngredientToRecipe(selectedId.value, { ...newIngredient })
    selectedRecipe.value = await getRecipe(selectedId.value)
    newIngredient.amount = 0
  } catch (e) {
    error.value = "Failed to add ingredient"
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function saveIngredientAmount(connectionId: string, amount: number) {
  if (!selectedId.value) return

  saving.value = true
  error.value = null

  try {
    await updateIngredientInRecipe(selectedId.value, connectionId, { amount })
    selectedRecipe.value = await getRecipe(selectedId.value)
  } catch (e) {
    error.value = "Failed to update ingredient amount"
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function removeIngredient(connectionId: string) {
  if (!selectedId.value) return

  saving.value = true
  error.value = null

  try {
    await deleteIngredientFromRecipe(selectedId.value, connectionId)
    selectedRecipe.value = await getRecipe(selectedId.value)
  } catch (e) {
    error.value = "Failed to remove ingredient"
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
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

      <div v-if="loading" class="state">
        Loading...
      </div>

      <div v-else class="item-list">
        <button
          v-for="recipe in recipes"
          :key="recipe.id"
          class="item-row"
          :class="{ active: recipe.id === selectedId }"
          @click="selectRecipe(recipe)"
        >
          <strong>{{ recipe.name }}</strong>
          <span>{{ recipe.image || "No image" }}</span>
        </button>
      </div>
    </aside>

    <main class="editor-panel">
      <div class="panel-header">
        <div>
          <h2>{{ currentRecipe ? "Edit recipe" : "New recipe" }}</h2>
          <p v-if="selectedRecipe">
            {{ selectedRecipe.total_calories }} kcal · {{ selectedRecipe.total_cost }} cost
          </p>
        </div>
      </div>

      <form class="form" @submit.prevent="saveRecipe">
        <label>Name</label>
        <input v-model="form.name" required>

        <label>Image URL</label>
        <input v-model="form.image" required>

        <label>Text JSON</label>
        <textarea v-model="form.text" rows="5" />

        <section class="subpanel">
          <div class="section-header">
            <h3>Ingredients</h3>
          </div>

          <div class="add-row">
            <select v-model="newIngredient.ingredient_id">
              <option
                v-for="ingredient in ingredients"
                :key="ingredient.id"
                :value="ingredient.id"
              >
                {{ ingredient.name }}
              </option>
            </select>

            <input
              v-model.number="newIngredient.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
            >

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
              class="connection-row"
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
              >

              <button type="button" @click="removeIngredient(ingredient.connection_id)">
                x
              </button>
            </div>
          </div>

          <div v-else class="connection-list">
            <div
              v-for="(ingredient, index) in initialIngredients"
              :key="`${ingredient.ingredient_id}-${index}`"
              class="connection-row"
            >
              <span>
                {{ ingredients.find((item) => item.id === ingredient.ingredient_id)?.name }}
              </span>
              <span>{{ ingredient.amount }}</span>
              <button type="button" @click="removeInitialIngredient(index)">
                x
              </button>
            </div>
          </div>
        </section>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <div class="actions">
          <button :disabled="saving">
            {{ saving ? "Saving..." : "Save" }}
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

<style scoped>
.manager {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(420px, 620px);
  gap: 24px;
}

.list-panel,
.editor-panel {
  box-sizing: border-box;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 8px;
  padding: 20px;
}

.panel-header,
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

h1,
h2,
h3 {
  margin: 0 0 4px;
}

p {
  margin: 0;
  color: var(--muted);
}

.item-list,
.form,
.connection-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.item-row span {
  overflow: hidden;
  color: var(--muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-row.active {
  border-color: #4f8ef7;
  background: rgba(79, 142, 247, 0.15);
}

label {
  color: var(--muted);
  font-size: 14px;
}

input,
select,
textarea {
  box-sizing: border-box;
  width: 100%;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  font: inherit;
}

textarea {
  resize: vertical;
}

button {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
}

button:hover {
  border-color: #4f8ef7;
}

button:disabled {
  opacity: 0.65;
  cursor: default;
}

.subpanel {
  border-top: 1px solid var(--border);
  margin-top: 6px;
  padding-top: 16px;
}

.add-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 100px auto;
  gap: 8px;
  margin-bottom: 12px;
}

.connection-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 100px auto;
  gap: 8px;
  align-items: center;
}

.connection-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 10px;
}

.danger:hover {
  border-color: #d64545;
  color: #d64545;
}

.state {
  color: var(--muted);
}

.error {
  color: #b00020;
}

@media (max-width: 980px) {
  .manager {
    grid-template-columns: 1fr;
  }
}
</style>
