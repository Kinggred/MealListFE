import { computed, onMounted, reactive, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import { createIngredient, getIngredient, searchIngredients } from '@/api/ingredients'
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
import type { IngredientCreate, IngredientSearchResult, Unit } from '@/types/Ingredient'
import type { Recipe, RecipeIngredientCreate, RecipeView } from '@/types/Recipe'

type SidePanelMode = 'ingredients' | 'catalog' | 'createIngredient'

const dataImagePattern = /^data:image\//
const maxRecipeImageSize = 640
const recipeImageQuality = 0.72

function imageSource(value: string | null | undefined): string {
  if (!value) return ''
  if (dataImagePattern.test(value) || value.startsWith('http')) return value
  return `data:image/png;base64,${value}`
}

function base64Content(value: string): string {
  return value.replace(/^data:image\/[^;]+;base64,/, '')
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image), { once: true })
    image.addEventListener('error', () => reject(new Error('Failed to load image')), { once: true })
    image.src = dataUrl
  })
}

function fileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)), { once: true })
    reader.addEventListener('error', () => reject(reader.error ?? new Error('Failed to read file')), {
      once: true,
    })
    reader.readAsDataURL(file)
  })
}

async function compressedImageContent(file: File) {
  const dataUrl = await fileAsDataUrl(file)
  const image = await loadImage(dataUrl)
  const scale = Math.min(1, maxRecipeImageSize / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return base64Content(dataUrl)

  context.drawImage(image, 0, 0, width, height)
  return base64Content(canvas.toDataURL('image/jpeg', recipeImageQuality))
}

function contentFromText(text: RecipeView['text'] | Recipe['text']): string {
  if (!text) return ''
  if (typeof text.content === 'string') return text.content
  return Object.entries(text)
    .map(([title, content]) => `${title}\n${typeof content === 'string' ? content : ''}`)
    .join('\n\n')
}

function normalizeIngredientName(value: string) {
  return value.trim().toLocaleLowerCase()
}

function uniqueIngredientResults(ingredients: IngredientSearchResult[]) {
  const seen = new Set<string>()

  return ingredients.filter((ingredient) => {
    const key = normalizeIngredientName(ingredient.name) || ingredient.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function errorMessage(value: unknown, fallback: string) {
  if (!isAxiosError(value)) return fallback

  const detail = value.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item?.msg === 'string' ? item.msg : null))
      .filter(Boolean)
      .join(', ') || fallback
  }

  return fallback
}

function normalizeRecipeView(recipe: RecipeView): RecipeView {
  return {
    ...recipe,
    ingredients: recipe.ingredients ?? [],
    total_cost: recipe.total_cost ?? 0,
    total_calories: recipe.total_calories ?? 0,
  }
}

export function useRecipesManager() {
  const recipes = ref<Recipe[]>([])
  const ingredients = ref<IngredientSearchResult[]>([])
  const ingredientCandidates = ref<IngredientSearchResult[]>([])
  const ingredientDetails = ref<Record<string, { name: string; unit_of_measurement?: Unit }>>({})
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
  let ingredientSearchTimer: ReturnType<typeof window.setTimeout> | null = null

  const form = reactive({
    name: '',
    image: '',
    content: '',
  })

  const newIngredient = reactive<RecipeIngredientCreate>({
    ingredient_id: '',
    amount: 1,
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
      const [recipePage, ingredientPage, dietPage] = await Promise.all([
        getRecipes({ size: 100 }),
        searchIngredients({ size: 100 }),
        getDiets({ size: 100 }),
      ])

      recipes.value = recipePage.items
      ingredientCandidates.value = ingredientPage.items
      ingredients.value = uniqueIngredientResults(ingredientPage.items)
      diets.value = dietPage.items
      ingredientDetails.value = Object.fromEntries(
        ingredientPage.items.map((ingredient) => [
          ingredient.id,
          {
            name: ingredient.name,
          },
        ]),
      )
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
      selectedRecipe.value = normalizeRecipeView(details)
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

  function closeImageOptions() {
    showImageOptions.value = false
  }

  function applyImageUrl() {
    form.image = imageUrlDraft.value
    showImageOptions.value = false
  }

  function chooseImageFile() {
    fileInput.value?.click()
  }

  async function uploadImage(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    try {
      form.image = await compressedImageContent(file)
      imageUrlDraft.value = form.image
      showImageOptions.value = false
    } catch (e) {
      error.value = 'Failed to process image'
      console.error(e)
    } finally {
      input.value = ''
    }
  }

  function addInitialIngredient() {
    if (!newIngredient.ingredient_id) return

    initialIngredients.value.push({
      ingredient_id: newIngredient.ingredient_id,
      amount: newIngredient.amount,
    })
    newIngredient.amount = 1
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

  async function addIngredient(ingredientId = newIngredient.ingredient_id) {
    if (!selectedId.value || !ingredientId) return false

    saving.value = true
    error.value = null

    try {
      await addIngredientToRecipe(selectedId.value, {
        ingredient_id: ingredientId,
        amount: newIngredient.amount,
      })
      selectedRecipe.value = normalizeRecipeView(await getRecipe(selectedId.value))
      newIngredient.amount = 1
      return true
    } catch (e) {
      error.value = errorMessage(e, 'Failed to add ingredient')
      console.error(e)
      return false
    } finally {
      saving.value = false
    }
  }

  function ingredientAddCandidates(ingredientId: string) {
    const selectedIngredient =
      ingredientCandidates.value.find((ingredient) => ingredient.id === ingredientId) ??
      ingredients.value.find((ingredient) => ingredient.id === ingredientId)
    const selectedName = selectedIngredient ? normalizeIngredientName(selectedIngredient.name) : ''
    const candidates = selectedName
      ? ingredientCandidates.value.filter(
          (ingredient) => normalizeIngredientName(ingredient.name) === selectedName,
        )
      : []
    const candidateIds = [ingredientId, ...candidates.map((ingredient) => ingredient.id)]

    return Array.from(new Set(candidateIds))
  }

  async function loadIngredientDetails(ingredientId: string) {
    const details = await getIngredient(ingredientId)
    const detailsEntry = {
      name: details.name,
      unit_of_measurement: details.unit_of_measurement,
    }
    ingredientDetails.value[ingredientId] = detailsEntry
    ingredientDetails.value[details.id] = detailsEntry
    return details
  }

  async function addIngredientFromCatalog(ingredientId: string) {
    if (!ingredientId) return

    const candidateIds = ingredientAddCandidates(ingredientId)
    let added = false
    let draftIngredientId = ingredientId

    for (const candidateId of candidateIds) {
      try {
        const details = await loadIngredientDetails(candidateId)
        draftIngredientId = details.id
      } catch (e) {
        error.value = errorMessage(e, 'Failed to load ingredient')
        console.error(e)
        continue
      }

      newIngredient.ingredient_id = draftIngredientId
      newIngredient.amount = 1

      if (selectedRecipe.value) {
        added = await addIngredient(draftIngredientId)
        if (added) break
      } else {
        addInitialIngredient()
        added = true
        break
      }
    }

    if (added) {
      error.value = null
      sidePanelMode.value = 'ingredients'
    }
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
      const page = await searchIngredients({ search_query: createdName, size: 100 })
      ingredientCandidates.value = page.items
      ingredients.value = uniqueIngredientResults(page.items)
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

    const ingredient = selectedRecipe.value?.ingredients?.find(
      (item) => item.connection_id === connectionId,
    )
    if (ingredient) ingredient.amount = amount

    saving.value = true
    error.value = null

    try {
      await updateIngredientInRecipe(selectedId.value, connectionId, { amount })
      selectedRecipe.value = normalizeRecipeView(await getRecipe(selectedId.value))
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
      selectedRecipe.value = normalizeRecipeView(await getRecipe(selectedId.value))
    } catch (e) {
      error.value = 'Failed to remove ingredient'
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  function ingredientName(ingredientId: string) {
    return (
      ingredientDetails.value[ingredientId]?.name ??
      ingredients.value.find((item) => item.id === ingredientId)?.name ??
      ''
    )
  }

  function ingredientUnit(ingredientId: string) {
    return ingredientDetails.value[ingredientId]?.unit_of_measurement ?? ''
  }

  async function loadIngredientSearch() {
    try {
      const page = await searchIngredients({
        search_query: ingredientSearch.value,
        diet_ids: selectedDietIds.value,
        size: 100,
      })
      const visibleIngredients = ingredientSearch.value.trim()
        ? page.items.filter((ingredient) =>
            normalizeIngredientName(ingredient.name).includes(
              normalizeIngredientName(ingredientSearch.value),
            ),
          )
        : page.items
      ingredientCandidates.value = visibleIngredients
      ingredients.value = uniqueIngredientResults(visibleIngredients)
      ingredientDetails.value = {
        ...ingredientDetails.value,
        ...Object.fromEntries(
          ingredients.value.map((ingredient) => [
            ingredient.id,
            {
              ...ingredientDetails.value[ingredient.id],
              name: ingredient.name,
            },
          ]),
        ),
      }
      newIngredient.ingredient_id = page.items[0]?.id ?? ''
    } catch (e) {
      error.value = 'Failed to search ingredients'
      console.error(e)
    }
  }

  function scheduleIngredientSearch() {
    if (ingredientSearchTimer) window.clearTimeout(ingredientSearchTimer)
    ingredientSearchTimer = window.setTimeout(loadIngredientSearch, 250)
  }

  watch([ingredientSearch, selectedDietIds], scheduleIngredientSearch, { deep: true })

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
    closeImageOptions,
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
