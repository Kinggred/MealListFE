<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import {
  createDiet,
  deleteDiet,
  getDiet,
  getDiets,
  updateDiet,
  updateIngredientsInDiet,
} from "@/api/diets"
import { getIngredients } from "@/api/ingredients"
import type { Diet, DietView } from "@/types/Diet"
import type { Ingredient } from "@/types/Ingredient"

const diets = ref<Diet[]>([])
const ingredients = ref<Ingredient[]>([])
const selectedId = ref<string | null>(null)
const selectedDiet = ref<DietView | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const selectedIngredientId = ref("")
const draftIngredientIds = ref<string[]>([])

const form = reactive({
  name: "",
  content: "{}",
})

const currentDiet = computed(
  () => diets.value.find((diet) => diet.id === selectedId.value) ?? null,
)

function parseContent(): Record<string, string> | null {
  try {
    const value = JSON.parse(form.content || "{}")
    return value && typeof value === "object" && !Array.isArray(value) ? value : null
  } catch {
    return null
  }
}

function setForm(diet?: Diet | DietView) {
  form.name = diet?.name ?? ""
  form.content = JSON.stringify(diet?.content ?? {}, null, 2)
}

async function loadData() {
  loading.value = true
  error.value = null

  try {
    const [dietPage, ingredientPage] = await Promise.all([
      getDiets({ size: 100 }),
      getIngredients({ size: 100 }),
    ])

    diets.value = dietPage.items
    ingredients.value = ingredientPage.items
    selectedIngredientId.value = ingredientPage.items[0]?.id ?? ""
  } catch (e) {
    error.value = "Failed to load diets"
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function selectDiet(diet: Diet) {
  selectedId.value = diet.id
  error.value = null

  try {
    const details = await getDiet(diet.id)
    selectedDiet.value = details
    draftIngredientIds.value = []
    setForm(details)
  } catch (e) {
    error.value = "Failed to load diet"
    console.error(e)
  }
}

function newDiet() {
  selectedId.value = null
  selectedDiet.value = null
  draftIngredientIds.value = []
  setForm()
}

function addDraftIngredient() {
  if (!selectedIngredientId.value) return
  if (draftIngredientIds.value.includes(selectedIngredientId.value)) return

  draftIngredientIds.value.push(selectedIngredientId.value)
}

function removeDraftIngredient(ingredientId: string) {
  draftIngredientIds.value = draftIngredientIds.value.filter((id) => id !== ingredientId)
}

async function saveDiet() {
  const content = parseContent()
  if (!content) {
    error.value = "Diet content must be a JSON object"
    return
  }

  saving.value = true
  error.value = null

  try {
    if (selectedId.value) {
      const updated = await updateDiet(selectedId.value, {
        name: form.name,
        content: form.content,
      })
      const index = diets.value.findIndex((diet) => diet.id === updated.id)
      if (index !== -1) diets.value[index] = updated
      await selectDiet(updated)
    } else {
      const created = await createDiet({
        name: form.name,
        content,
        ingredients: draftIngredientIds.value,
      })
      await loadData()
      await selectDiet(created)
    }
  } catch (e) {
    error.value = "Failed to save diet"
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function removeDiet() {
  if (!selectedId.value) return

  saving.value = true
  error.value = null

  try {
    await deleteDiet(selectedId.value)
    diets.value = diets.value.filter((diet) => diet.id !== selectedId.value)
    newDiet()
  } catch (e) {
    error.value = "Failed to delete diet"
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function addIngredientToDiet() {
  if (!selectedId.value || !selectedIngredientId.value) return

  saving.value = true
  error.value = null

  try {
    await updateIngredientsInDiet(selectedId.value, {
      add: [selectedIngredientId.value],
      remove: [],
    })
    selectedDiet.value = await getDiet(selectedId.value)
  } catch (e) {
    error.value = "Failed to add ingredient"
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function removeIngredientFromDiet(connectionId: string) {
  if (!selectedId.value) return

  saving.value = true
  error.value = null

  try {
    await updateIngredientsInDiet(selectedId.value, {
      add: [],
      remove: [connectionId],
    })
    selectedDiet.value = await getDiet(selectedId.value)
  } catch (e) {
    error.value = "Failed to remove ingredient"
    console.error(e)
  } finally {
    saving.value = false
  }
}

function ingredientName(ingredientId: string) {
  return ingredients.value.find((ingredient) => ingredient.id === ingredientId)?.name ?? ingredientId
}

onMounted(loadData)
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

      <div v-if="loading" class="state">
        Loading...
      </div>

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
          <h2>{{ currentDiet ? "Edit diet" : "New diet" }}</h2>
          <p v-if="selectedDiet">{{ selectedDiet.ingredients.length }} ingredients</p>
        </div>
      </div>

      <form class="form" @submit.prevent="saveDiet">
        <label>Name</label>
        <input v-model="form.name" required>

        <label>Content JSON</label>
        <textarea v-model="form.content" rows="5" />

        <section class="subpanel">
          <div class="section-header">
            <h3>Ingredients</h3>
          </div>

          <div class="add-row">
            <select v-model="selectedIngredientId">
              <option
                v-for="ingredient in ingredients"
                :key="ingredient.id"
                :value="ingredient.id"
              >
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

              <button type="button" @click="removeDraftIngredient(ingredientId)">
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
  text-align: left;
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
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  margin-bottom: 12px;
}

.connection-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
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
