import { computed, onMounted, reactive, ref, watch } from 'vue'
import { createIngredient, getIngredients } from '@/api/ingredients'
import { getDiets } from '@/api/diets'
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
import type { Diet } from '@/types/Diet'
import type { Ingredient, IngredientCreate, Unit } from '@/types/Ingredient'
import type { Recipe, RecipeIngredientCreate, RecipeView } from '@/types/Recipe'

type SidePanelMode = 'ingredients' | 'catalog' | 'createIngredient'

const dataImagePattern = /^data:image\//

function imageSource(value: string | null | undefined): string {
  if (!value) return ''
  if (dataImagePattern.test(value) || value.startsWith('http')) return value
  return `data:image/png;base64,${value}`
}

function base64Content(value: string): string {
  return value.replace(/^data:image\/[^;]+;base64,/, '')
}

function contentFromText(text: RecipeView['text'] | Recipe['text']): string {
  if (!text) return ''
  if (typeof text.content === 'string') return text.content
  return Object.entries(text)
    .map(([title, content]) => `${title}\n${typeof content === 'string' ? content : ''}`)
    .join('\n\n')
}

export function useRecipesManager() {
  const recipes = ref<Recipe[]>([])
  const ingredients = ref<Ingredient[]>([])
  const diets = ref<Diet[]>([])
  const selectedId = ref<string | null>(null)
  const selectedRecipe = ref<RecipeView | null>(null)
  const viewMode = ref<'list' | 'editor'>('list')
  const sidePanelMode = ref<SidePanelMode>('ingredients')
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const ingredientSearch = ref('')
  const imageUrlDraft = ref('')
  const showImageOptions = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)
  const selectedDietIds = ref<string[]>([])
  const applyingServerState = ref(false)
  let autosaveTimer: ReturnType<typeof window.setTimeout> | null = null

  const form = reactive({
    name: '',
    image: '',
    content: '',
  })

  const newIngredient = reactive<RecipeIngredientCreate>({
    ingredient_id: '',
    amount: 0,
  })

  const initialIngredients = ref<RecipeIngredientCreate[]>([])
  const ingredientForm = reactive<IngredientCreate>({
    name: '',
    calories: 0,
    cost: 0,
    amount_per_cost: 0,
    unit_of_measurement: 'g',
    animal_produced: false,
    animal_derived: false,
  })

  const currentRecipe = computed(
    () => recipes.value.find((recipe) => recipe.id === selectedId.value) ?? null,
  )

  const visibleIngredients = computed(() => ingredients.value)
  const previewImage = computed(() => imageSource(form.image))
  const recipeImage = (value: string | null | undefined) => imageSource(value)
  const ingredientUnits: Unit[] = ['g', 'ml', 'p']

  function recipePayload() {
    return {
      name: form.name,
      image: form.image,
      text: { content: form.content },
    }
  }

  function setForm(recipe?: Recipe | RecipeView) {
    applyingServerState.value = true
    form.name = recipe?.name ?? ''
    form.image = recipe?.image ?? ''
    form.content = contentFromText(recipe?.text)
    imageUrlDraft.value = imageSource(recipe?.image)
    sidePanelMode.value = 'ingredients'
    showImageOptions.value = false
    queueMicrotask(() => {
      applyingServerState.value = false
    })
  }

  function clearRecipeDraft() {
    selectedId.value = null
    selectedRecipe.value = null
    initialIngredients.value = []
    setForm()
  }

  async function loadData() {
    loading.value = true
    error.value = null

    try {
      const [recipePage, ingredientPage] = await Promise.all([
        getRecipes({ size: 100 }),
        getIngredients({ size: 100 }),
      ])
      const dietPage = await getDiets({ size: 100 })

      recipes.value = recipePage.items
      ingredients.value = ingredientPage.items
      diets.value = dietPage.items
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
    viewMode.value = 'editor'

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
    clearRecipeDraft()
    viewMode.value = 'editor'
  }

  function backToRecipeList() {
    viewMode.value = 'list'
    error.value = null
  }

  function openImageOptions() {
    showImageOptions.value = !showImageOptions.value
  }

  function applyImageUrl() {
    form.image = imageUrlDraft.value
    showImageOptions.value = false
  }

  function chooseImageFile() {
    fileInput.value?.click()
  }

  function uploadImage(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      form.image = base64Content(String(reader.result))
      imageUrlDraft.value = form.image
      showImageOptions.value = false
      input.value = ''
    })
    reader.readAsDataURL(file)
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

  function saveInitialIngredientAmount(index: number, amount: number) {
    const ingredient = initialIngredients.value[index]
    if (ingredient) ingredient.amount = amount
  }

  async function autosaveRecipe() {
    if (!selectedId.value || applyingServerState.value) return

    saving.value = true
    error.value = null

    try {
      const updated = await updateRecipe(selectedId.value, recipePayload())
      const index = recipes.value.findIndex((recipe) => recipe.id === updated.id)
      if (index !== -1) recipes.value[index] = updated
      if (selectedRecipe.value?.id === updated.id) {
        selectedRecipe.value.name = updated.name
        selectedRecipe.value.image = updated.image
        selectedRecipe.value.text = recipePayload().text
      }
    } catch (e) {
      error.value = 'Failed to autosave recipe'
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  function scheduleAutosave() {
    if (!selectedId.value || applyingServerState.value) return
    if (autosaveTimer) window.clearTimeout(autosaveTimer)
    autosaveTimer = window.setTimeout(autosaveRecipe, 500)
  }

  async function saveRecipe() {
    saving.value = true
    error.value = null

    try {
      if (selectedId.value) {
        if (autosaveTimer) window.clearTimeout(autosaveTimer)
        const updated = await updateRecipe(selectedId.value, recipePayload())
        const index = recipes.value.findIndex((recipe) => recipe.id === updated.id)
        if (index !== -1) recipes.value[index] = updated
        await selectRecipe(updated)
      } else {
        const created = await createRecipe({
          name: form.name,
          image: form.image,
          text: recipePayload().text,
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
      clearRecipeDraft()
      viewMode.value = 'list'
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

  async function addIngredientFromCatalog(ingredientId: string) {
    if (!ingredientId) return

    newIngredient.ingredient_id = ingredientId
    newIngredient.amount = 0

    if (selectedRecipe.value) {
      await addIngredient()
    } else {
      addInitialIngredient()
    }

    sidePanelMode.value = 'ingredients'
  }

  function openIngredientCatalog() {
    sidePanelMode.value = 'catalog'
  }

  function openIngredientCreate() {
    sidePanelMode.value = 'createIngredient'
  }

  function resetIngredientForm() {
    ingredientForm.name = ''
    ingredientForm.calories = 0
    ingredientForm.cost = 0
    ingredientForm.amount_per_cost = 0
    ingredientForm.unit_of_measurement = 'g'
    ingredientForm.animal_produced = false
    ingredientForm.animal_derived = false
  }

  async function saveNewIngredient() {
    saving.value = true
    error.value = null
    const createdName = ingredientForm.name

    try {
      await createIngredient({ ...ingredientForm })
      const page = await getIngredients({ size: 100 })
      ingredients.value = page.items
      if (page.items.some((item) => item.name === createdName)) {
        ingredientSearch.value = createdName
      }
      resetIngredientForm()
      sidePanelMode.value = 'catalog'
    } catch (e) {
      error.value = 'Failed to create ingredient'
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  async function saveIngredientAmount(connectionId: string, amount: number) {
    if (!selectedId.value) return

    const ingredient = selectedRecipe.value?.ingredients.find(
      (item) => item.connection_id === connectionId,
    )
    if (ingredient) ingredient.amount = amount

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

  watch(() => ({ ...form }), scheduleAutosave, { deep: true })

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

  function ingredientUnit(ingredientId: string) {
    return ingredients.value.find((item) => item.id === ingredientId)?.unit_of_measurement ?? ''
  }

  onMounted(loadData)

  return {
    recipes,
    ingredients,
    diets,
    selectedId,
    selectedRecipe,
    viewMode,
    sidePanelMode,
    currentRecipe,
    loading,
    saving,
    error,
    ingredientSearch,
    imageUrlDraft,
    showImageOptions,
    fileInput,
    selectedDietIds,
    form,
    newIngredient,
    ingredientForm,
    ingredientUnits,
    initialIngredients,
    visibleIngredients,
    previewImage,
    recipeImage,
    selectRecipe,
    newRecipe,
    backToRecipeList,
    openImageOptions,
    applyImageUrl,
    chooseImageFile,
    uploadImage,
    addInitialIngredient,
    removeInitialIngredient,
    saveInitialIngredientAmount,
    saveRecipe,
    removeRecipe,
    addIngredient,
    addIngredientFromCatalog,
    openIngredientCatalog,
    openIngredientCreate,
    saveNewIngredient,
    saveIngredientAmount,
    removeIngredient,
    ingredientName,
    ingredientUnit,
  }
}
