import { computed, onMounted, reactive, ref } from 'vue'
import { getIngredients } from '@/api/ingredients'
import {
  addIngredientToRecipe,
  createRecipe,
  deleteIngredientFromRecipe,
  deleteRecipe,
  getRecipe,
  getRecipes,
  updateIngredientInRecipe,
  updateRecipe,
} from '@/api/recipes'
import type { Ingredient } from '@/types/Ingredient'
import type { Recipe, RecipeIngredientCreate, RecipeView } from '@/types/Recipe'
import { parseJsonObject } from '@/utils/json'

export function useRecipesManager() {
  const recipes = ref<Recipe[]>([])
  const ingredients = ref<Ingredient[]>([])
  const selectedId = ref<string | null>(null)
  const selectedRecipe = ref<RecipeView | null>(null)
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const form = reactive({
    name: '',
    image: '',
    text: '{}',
  })

  const newIngredient = reactive<RecipeIngredientCreate>({
    ingredient_id: '',
    amount: 0,
  })

  const initialIngredients = ref<RecipeIngredientCreate[]>([])

  const currentRecipe = computed(
    () => recipes.value.find((recipe) => recipe.id === selectedId.value) ?? null,
  )

  function setForm(recipe?: Recipe | RecipeView) {
    form.name = recipe?.name ?? ''
    form.image = recipe?.image ?? ''
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
      newIngredient.ingredient_id = ingredientPage.items[0]?.id ?? ''
    } catch (e) {
      error.value = 'Failed to load recipes'
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
      error.value = 'Failed to load recipe'
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
    const text = parseJsonObject(form.text)
    if (!text) {
      error.value = 'Recipe text must be a JSON object'
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
      error.value = 'Failed to save recipe'
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
      error.value = 'Failed to delete recipe'
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
      error.value = 'Failed to add ingredient'
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
      error.value = 'Failed to update ingredient amount'
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
      error.value = 'Failed to remove ingredient'
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  function ingredientName(ingredientId: string) {
    return ingredients.value.find((item) => item.id === ingredientId)?.name ?? ''
  }

  onMounted(loadData)

  return {
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
  }
}
