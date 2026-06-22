import { computed, onMounted, reactive, ref } from 'vue'
import {
  createIngredient,
  deleteIngredient,
  getIngredients,
  updateIngredient,
} from '@/api/ingredients'
import type { Ingredient, IngredientCreate, Unit } from '@/types/Ingredient'

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

export function useIngredientsManager() {
  const ingredients = ref<Ingredient[]>([])
  const selectedId = ref<string | null>(null)
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const form = reactive<IngredientCreate>({ ...emptyIngredientForm })

  const selectedIngredient = computed(
    () => ingredients.value.find((ingredient) => ingredient.id === selectedId.value) ?? null,
  )

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
      const page = await getIngredients({ size: 100 })
      ingredients.value = page.items
    } catch (e) {
      error.value = 'Failed to load ingredients'
      console.error(e)
    } finally {
      loading.value = false
    }
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
      error.value = 'Failed to save ingredient'
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
      error.value = 'Failed to delete ingredient'
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  onMounted(loadIngredients)

  return {
    units: ingredientUnits,
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
  }
}
