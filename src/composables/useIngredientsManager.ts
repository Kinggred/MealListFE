import { onMounted, reactive, ref, watch } from 'vue'
import {
  createIngredient,
  deleteIngredient,
  getIngredient,
  getIngredients,
  searchIngredients,
  updateIngredient,
} from '@/api/ingredients'
import type { Ingredient, IngredientCreate, IngredientSearchResult, Unit } from '@/types/Ingredient'

export const ingredientUnits: Unit[] = ['g', 'ml', 'p']

const emptyIngredientForm: IngredientCreate = {
  name: '',
  calories: 0,
  cost: 0,
  amount_per_cost: 0,
  unit_of_measurement: 'g',
  animal_produced: false,
  animal_derived: false,
}

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase()
}

function uniqueIngredients(ingredients: IngredientSearchResult[]) {
  const seen = new Set<string>()

  return ingredients.filter((ingredient) => {
    const key = normalizeSearch(ingredient.name) || ingredient.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function useIngredientsManager() {
  const ingredients = ref<IngredientSearchResult[]>([])
  const selectedIngredient = ref<Ingredient | null>(null)
  const selectedId = ref<string | null>(null)
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  let searchTimer: ReturnType<typeof window.setTimeout> | null = null

  const form = reactive<IngredientCreate>({ ...emptyIngredientForm })

  function setForm(ingredient?: Ingredient) {
    Object.assign(form, {
      name: ingredient?.name ?? emptyIngredientForm.name,
      calories: ingredient?.calories ?? emptyIngredientForm.calories,
      cost: ingredient?.cost ?? emptyIngredientForm.cost,
      amount_per_cost: ingredient?.amount_per_cost ?? emptyIngredientForm.amount_per_cost,
      unit_of_measurement:
        ingredient?.unit_of_measurement ?? emptyIngredientForm.unit_of_measurement,
      animal_produced: ingredient?.animal_produced ?? emptyIngredientForm.animal_produced,
      animal_derived: ingredient?.animal_derived ?? emptyIngredientForm.animal_derived,
    })
  }

  async function loadIngredients() {
    loading.value = true
    error.value = null

    try {
      const query = normalizeSearch(searchQuery.value)
      const page = query
        ? await searchIngredients({ search_query: query, size: 100 })
        : await getIngredients({ size: 100 })
      const visibleIngredients = query
        ? page.items.filter((ingredient) => normalizeSearch(ingredient.name).includes(query))
        : page.items
      ingredients.value = uniqueIngredients(visibleIngredients)
    } catch (e) {
      error.value = 'Failed to load ingredients'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function selectIngredient(ingredient: IngredientSearchResult) {
    selectedId.value = ingredient.id
    error.value = null

    try {
      const details = await getIngredient(ingredient.id)
      selectedIngredient.value = details
      setForm(details)
    } catch (e) {
      error.value = 'Failed to load ingredient'
      console.error(e)
    }
  }

  function newIngredient() {
    selectedId.value = null
    selectedIngredient.value = null
    setForm()
  }

  async function saveIngredient() {
    saving.value = true
    error.value = null

    try {
      if (selectedId.value) {
        const updated = await updateIngredient(selectedId.value, { ...form })
        selectedIngredient.value = updated
        const index = ingredients.value.findIndex((ingredient) => ingredient.id === updated.id)
        if (index !== -1) ingredients.value[index] = { id: updated.id, name: updated.name }
      } else {
        await createIngredient({ ...form })
        await loadIngredients()
        newIngredient()
      }
    } catch (e) {
      error.value = 'Failed to save ingredient'
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  async function removeIngredient(ingredientId = selectedId.value) {
    if (!ingredientId) return

    saving.value = true
    error.value = null

    try {
      await deleteIngredient(ingredientId)
      ingredients.value = ingredients.value.filter((ingredient) => ingredient.id !== ingredientId)
      if (ingredientId === selectedId.value) newIngredient()
    } catch (e) {
      error.value = 'Failed to delete ingredient'
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  function scheduleSearch() {
    if (searchTimer) window.clearTimeout(searchTimer)
    searchTimer = window.setTimeout(loadIngredients, 250)
  }

  watch(searchQuery, scheduleSearch)

  onMounted(loadIngredients)

  return {
    units: ingredientUnits,
    ingredients,
    searchQuery,
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
  }
}
