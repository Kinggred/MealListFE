import { computed, onMounted, reactive, ref } from 'vue'
import {
  createDiet,
  deleteDiet,
  getDiet,
  getDiets,
  updateDiet,
  updateIngredientsInDiet,
} from '@/api/diets'
import { getIngredients } from '@/api/ingredients'
import type { Diet, DietView } from '@/types/Diet'
import type { Ingredient } from '@/types/Ingredient'

function contentFromDietContent(content: Diet['content'] | DietView['content']): string {
  if (!content) return ''
  if (typeof content.content === 'string') return content.content
  return Object.entries(content)
    .map(([title, value]) => `${title}\n${typeof value === 'string' ? value : ''}`)
    .join('\n\n')
}

export function useDietsManager() {
  const diets = ref<Diet[]>([])
  const ingredients = ref<Ingredient[]>([])
  const selectedId = ref<string | null>(null)
  const selectedDiet = ref<DietView | null>(null)
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const selectedIngredientId = ref('')
  const draftIngredientIds = ref<string[]>([])

  const form = reactive({
    name: '',
    content: '',
  })

  const currentDiet = computed(
    () => diets.value.find((diet) => diet.id === selectedId.value) ?? null,
  )

  function setForm(diet?: Diet | DietView) {
    form.name = diet?.name ?? ''
    form.content = contentFromDietContent(diet?.content)
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
      selectedIngredientId.value = ingredientPage.items[0]?.id ?? ''
    } catch (e) {
      error.value = 'Failed to load diets'
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
      error.value = 'Failed to load diet'
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
    const content = { content: form.content }

    saving.value = true
    error.value = null

    try {
      if (selectedId.value) {
        const updated = await updateDiet(selectedId.value, {
          name: form.name,
          content,
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
      error.value = 'Failed to save diet'
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  async function removeDiet(dietId = selectedId.value) {
    if (!dietId) return

    saving.value = true
    error.value = null

    try {
      await deleteDiet(dietId)
      diets.value = diets.value.filter((diet) => diet.id !== dietId)
      if (dietId === selectedId.value) newDiet()
    } catch (e) {
      error.value = 'Failed to delete diet'
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
      error.value = 'Failed to add ingredient'
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
      error.value = 'Failed to remove ingredient'
      console.error(e)
    } finally {
      saving.value = false
    }
  }

  function ingredientName(ingredientId: string) {
    return (
      ingredients.value.find((ingredient) => ingredient.id === ingredientId)?.name ?? ingredientId
    )
  }

  onMounted(loadData)

  return {
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
  }
}
