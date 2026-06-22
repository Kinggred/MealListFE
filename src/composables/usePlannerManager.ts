import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getRecipes } from '@/api/recipes'
import { usePlannerStore } from '@/stores/planner'
import type { Recipe } from '@/types/Recipe'
import { monthEnd, monthStart } from '@/utils/dates'

function parseRouteDate(value: unknown): Date {
  if (typeof value === 'string') {
    return new Date(value)
  }

  return new Date()
}

export function usePlannerManager() {
  const route = useRoute()
  const planner = usePlannerStore()
  const recipes = ref<Recipe[]>([])
  const selectedRecipeId = ref('')
  const actionError = ref<string | null>(null)
  const locale = window.navigator.language

  const selectedDate = ref(parseRouteDate(route.query.date))
  const currentDate = ref(
    new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1),
  )
  const selectedDishId = ref<string | null>(null)
  const today = new Date()

  const monthName = computed(() =>
    currentDate.value.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
  )

  const dayDishes = computed(() => planner.getDishesForDate(selectedDate.value))

  const selectedDish = computed(
    () => planner.dishes.find((dish) => dish.id === selectedDishId.value) ?? null,
  )

  const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startOffset = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: Array<number | null> = []

    for (let i = 0; i < startOffset; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  })

  function dateFromDay(day: number): Date {
    return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  }

  async function loadMonth() {
    await planner.fetchDishes(monthStart(currentDate.value), monthEnd(currentDate.value))
  }

  async function loadRecipes() {
    const page = await getRecipes({ size: 100 })
    recipes.value = page.items
    selectedRecipeId.value = page.items[0]?.id ?? ''
  }

  function selectDay(day: number | null) {
    if (!day) return

    selectedDate.value = dateFromDay(day)
    selectedDishId.value = null
  }

  function isToday(day: number | null) {
    if (!day) return false

    return (
      day === today.getDate() &&
      currentDate.value.getMonth() === today.getMonth() &&
      currentDate.value.getFullYear() === today.getFullYear()
    )
  }

  function isSelected(day: number | null) {
    if (!day) return false

    return (
      day === selectedDate.value.getDate() &&
      currentDate.value.getMonth() === selectedDate.value.getMonth() &&
      currentDate.value.getFullYear() === selectedDate.value.getFullYear()
    )
  }

  function dishesCount(day: number | null) {
    if (!day) return 0
    return planner.countDishesForDate(dateFromDay(day))
  }

  function previousMonth() {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1,
    )
  }

  function nextMonth() {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1,
    )
  }

  async function addDish() {
    actionError.value = null

    try {
      const dish = await planner.addDish(selectedDate.value)
      selectedDishId.value = dish.id
    } catch {
      actionError.value = 'Failed to add meal'
    }
  }

  async function addRecipe() {
    if (!selectedDish.value || !selectedRecipeId.value) return
    actionError.value = null

    try {
      await planner.addRecipeToDish(selectedDish.value.id, selectedRecipeId.value)
    } catch {
      actionError.value = 'Failed to add recipe'
    }
  }

  async function removeDish() {
    if (!selectedDish.value) return
    actionError.value = null

    try {
      const dishId = selectedDish.value.id
      await planner.removeDish(dishId)
      selectedDishId.value = null
    } catch {
      actionError.value = 'Failed to remove meal'
    }
  }

  async function saveDishName(name: string) {
    if (!selectedDish.value) return
    actionError.value = null

    try {
      await planner.updateDishName(selectedDish.value.id, name)
    } catch {
      actionError.value = 'Failed to update meal name'
    }
  }

  async function saveDishTime(time: string) {
    if (!selectedDish.value) return
    actionError.value = null

    try {
      await planner.updateDishTime(selectedDish.value.id, time)
    } catch {
      actionError.value = 'Failed to update meal time'
    }
  }

  async function saveRecipePortions(
    connectionId: string,
    fullPortions: number,
    halfPortions: number,
  ) {
    if (!selectedDish.value) return
    actionError.value = null

    try {
      await planner.updateRecipePortions(
        selectedDish.value.id,
        connectionId,
        fullPortions,
        halfPortions,
      )
    } catch {
      actionError.value = 'Failed to update portions'
    }
  }

  async function removeRecipe(connectionId: string) {
    if (!selectedDish.value) return
    actionError.value = null

    try {
      await planner.removeRecipeFromDish(selectedDish.value.id, connectionId)
    } catch {
      actionError.value = 'Failed to remove recipe'
    }
  }

  function selectDish(dishId: string) {
    selectedDishId.value = dishId
  }

  onMounted(async () => {
    await Promise.all([loadMonth(), loadRecipes()])
  })

  watch(currentDate, loadMonth)

  watch(selectedDishId, async (dishId) => {
    if (dishId) await planner.fetchDishDetails(dishId)
  })

  return {
    planner,
    recipes,
    selectedRecipeId,
    actionError,
    locale,
    selectedDate,
    selectedDishId,
    monthName,
    dayDishes,
    selectedDish,
    calendarDays,
    selectDay,
    isToday,
    isSelected,
    dishesCount,
    previousMonth,
    nextMonth,
    addDish,
    addRecipe,
    removeDish,
    saveDishName,
    saveDishTime,
    saveRecipePortions,
    removeRecipe,
    selectDish,
  }
}
