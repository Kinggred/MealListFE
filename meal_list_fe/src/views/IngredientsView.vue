<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import {
  createIngredient,
  deleteIngredient,
  getIngredients,
  updateIngredient,
} from "@/api/ingredients"
import type { Ingredient, IngredientCreate, Unit } from "@/types/Ingredient"

const units: Unit[] = ["g", "ml", "p"]

const ingredients = ref<Ingredient[]>([])
const selectedId = ref<string | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const form = reactive<IngredientCreate>({
  name: "",
  calories: 0,
  cost: 0,
  amount_per_cost: 0,
  unit_of_measurement: "g",
  animal_produced: false,
  animal_derived: false,
})

const selectedIngredient = computed(
  () => ingredients.value.find((ingredient) => ingredient.id === selectedId.value) ?? null,
)

async function loadIngredients() {
  loading.value = true
  error.value = null

  try {
    const page = await getIngredients({ size: 100 })
    ingredients.value = page.items
  } catch (e) {
    error.value = "Failed to load ingredients"
    console.error(e)
  } finally {
    loading.value = false
  }
}

function setForm(ingredient?: Ingredient) {
  form.name = ingredient?.name ?? ""
  form.calories = ingredient?.calories ?? 0
  form.cost = ingredient?.cost ?? 0
  form.amount_per_cost = ingredient?.amount_per_cost ?? 0
  form.unit_of_measurement = ingredient?.unit_of_measurement ?? "g"
  form.animal_produced = ingredient?.animal_produced ?? false
  form.animal_derived = ingredient?.animal_derived ?? false
}

function selectIngredient(ingredient: Ingredient) {
  selectedId.value = ingredient.id
  setForm(ingredient)
}

function newIngredient() {
  selectedId.value = null
  setForm()
}

async function saveIngredient() {
  saving.value = true
  error.value = null

  try {
    if (selectedId.value) {
      const updated = await updateIngredient(selectedId.value, { ...form })
      const index = ingredients.value.findIndex((ingredient) => ingredient.id === updated.id)
      if (index !== -1) ingredients.value[index] = updated
    } else {
      await createIngredient({ ...form })
      await loadIngredients()
      newIngredient()
    }
  } catch (e) {
    error.value = "Failed to save ingredient"
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function removeIngredient() {
  if (!selectedId.value) return

  saving.value = true
  error.value = null

  try {
    await deleteIngredient(selectedId.value)
    ingredients.value = ingredients.value.filter(
      (ingredient) => ingredient.id !== selectedId.value,
    )
    newIngredient()
  } catch (e) {
    error.value = "Failed to delete ingredient"
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(loadIngredients)
</script>

<template>
  <section class="manager">
    <aside class="list-panel">
      <div class="panel-header">
        <div>
          <h1>Ingredients</h1>
          <p>{{ ingredients.length }} ingredients</p>
        </div>

        <button @click="newIngredient">New</button>
      </div>

      <div v-if="loading" class="state">
        Loading...
      </div>

      <div v-else class="item-list">
        <button
          v-for="ingredient in ingredients"
          :key="ingredient.id"
          class="item-row"
          :class="{ active: ingredient.id === selectedId }"
          @click="selectIngredient(ingredient)"
        >
          <strong>{{ ingredient.name }}</strong>
          <span>{{ ingredient.calories }} kcal · {{ ingredient.amount_per_cost }} {{ ingredient.unit_of_measurement }}</span>
        </button>
      </div>
    </aside>

    <main class="editor-panel">
      <div class="panel-header">
        <div>
          <h2>{{ selectedIngredient ? "Edit ingredient" : "New ingredient" }}</h2>
          <p v-if="selectedIngredient">{{ selectedIngredient.id }}</p>
        </div>
      </div>

      <form class="form" @submit.prevent="saveIngredient">
        <label>Name</label>
        <input v-model="form.name" required>

        <div class="split">
          <div>
            <label>Calories</label>
            <input v-model.number="form.calories" type="number" min="0" required>
          </div>

          <div>
            <label>Cost</label>
            <input v-model.number="form.cost" type="number" min="0" step="0.01" required>
          </div>
        </div>

        <div class="split">
          <div>
            <label>Amount per cost</label>
            <input
              v-model.number="form.amount_per_cost"
              type="number"
              min="0"
              step="0.01"
              required
            >
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
          <input v-model="form.animal_produced" type="checkbox">
          Animal produced
        </label>

        <label class="check">
          <input v-model="form.animal_derived" type="checkbox">
          Animal derived
        </label>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <div class="actions">
          <button :disabled="saving">
            {{ saving ? "Saving..." : "Save" }}
          </button>

          <button
            v-if="selectedIngredient"
            type="button"
            class="danger"
            :disabled="saving"
            @click="removeIngredient"
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
  grid-template-columns: minmax(280px, 1fr) minmax(360px, 520px);
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

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

h1,
h2 {
  margin: 0 0 4px;
}

p {
  margin: 0;
  color: var(--muted);
}

.item-list {
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
  color: var(--muted);
  font-size: 13px;
}

.item-row.active {
  border-color: #4f8ef7;
  background: rgba(79, 142, 247, 0.15);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.split > div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: var(--muted);
  font-size: 14px;
}

input,
select {
  box-sizing: border-box;
  width: 100%;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
}

.check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.check input {
  width: auto;
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

@media (max-width: 900px) {
  .manager {
    grid-template-columns: 1fr;
  }
}
</style>
