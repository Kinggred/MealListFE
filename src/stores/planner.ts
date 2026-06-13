import { defineStore } from "pinia"
import { ref } from "vue"
import {
  addDishToMeal,
  createMeal,
  deleteDishFromMeal,
  deleteMeal,
  getMeal,
  getMeals,
  updateDishInMeal,
  updateMeal,
} from "@/api/meals"
import type { Meal, MealView } from "@/types/Meal"
import type { PlannedDish } from "@/types/Planner"

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function dateKeyFromIso(date: string): string {
  return date.slice(0, 10)
}

function timeFromIso(date: string): string {
  return date.slice(11, 16) || "12:00"
}

function toDateTime(date: string, time: string): string {
  return `${date}T${time}:00`
}

function fromMeal(meal: Meal, current?: PlannedDish): PlannedDish {
  return {
    id: meal.id,
    date: dateKeyFromIso(meal.date),
    time: timeFromIso(meal.date),
    name: meal.name,
    recipes: current?.recipes ?? [],
    detailsLoaded: current?.detailsLoaded ?? false,
  }
}

function applyMealView(dish: PlannedDish, meal: MealView) {
  dish.name = meal.name
  dish.date = dateKeyFromIso(meal.date)
  dish.time = timeFromIso(meal.date)
  dish.recipes = meal.dishes.map((mealDish) => ({
    connectionId: mealDish.connection_id,
    recipeId: mealDish.recipe.id,
    recipeName: mealDish.recipe.name,
    fullPortions: mealDish.full_portions,
    halfPortions: mealDish.half_portions,
  }))
  dish.detailsLoaded = true
}

export const usePlannerStore = defineStore("planner", () => {
  const dishes = ref<PlannedDish[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDishes(dateFrom: Date, dateTo = dateFrom) {
    loading.value = true
    error.value = null

    try {
      const meals = await getMeals({
        date_from: toDateKey(dateFrom),
        date_to: toDateKey(dateTo),
        size: 100,
      })

      dishes.value = meals.results.map((meal) => {
        const current = dishes.value.find((dish) => dish.id === meal.id)
        return fromMeal(meal, current)
      })
    } catch (e) {
      error.value = "Failed to load meals"
      throw e
    } finally {
      loading.value = false
    }
  }

  function getDishesForDate(date: Date): PlannedDish[] {
    const dateKey = toDateKey(date)

    return dishes.value
      .filter((dish) => dish.date === dateKey)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  function countDishesForDate(date: Date): number {
    return getDishesForDate(date).length
  }

  async function fetchDishDetails(dishId: string) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (!dish || dish.detailsLoaded) return

    const meal = await getMeal(dishId)
    applyMealView(dish, meal)
  }

  async function addDish(date: Date): Promise<PlannedDish> {
    const dateKey = toDateKey(date)
    const meal = await createMeal({
      name: "New meal",
      date: toDateTime(dateKey, "12:00"),
      dishes: [],
    })

    const dish = fromMeal(meal)

    dishes.value.push(dish)
    return dish
  }

  async function addRecipeToDish(dishId: string, recipeId: string) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (!dish) return

    await addDishToMeal(dishId, {
      recipe_id: recipeId,
      full_portions: 1,
      half_portions: 0,
    })

    dish.detailsLoaded = false
    await fetchDishDetails(dishId)
  }

  async function removeRecipeFromDish(dishId: string, connectionId: string) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (!dish) return

    await deleteDishFromMeal(dishId, connectionId)
    dish.recipes = dish.recipes.filter((recipe) => recipe.connectionId !== connectionId)
  }

  async function updateRecipePortions(
    dishId: string,
    connectionId: string,
    fullPortions: number,
    halfPortions: number,
  ) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (!dish) return

    await updateDishInMeal(dishId, connectionId, {
      full_portions: fullPortions,
      half_portions: halfPortions,
    })

    const recipe = dish.recipes.find((r) => r.connectionId === connectionId)
    if (recipe) {
      recipe.fullPortions = fullPortions
      recipe.halfPortions = halfPortions
    }
  }

  async function updateDishName(dishId: string, name: string) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (dish) dish.name = name

    await updateMeal(dishId, { name })
  }

  async function updateDishTime(dishId: string, time: string) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (dish) dish.time = time

    if (dish) {
      await updateMeal(dishId, {
        date: toDateTime(dish.date, time),
      })
    }
  }

  async function removeDish(dishId: string) {
    await deleteMeal(dishId)
    dishes.value = dishes.value.filter((dish) => dish.id !== dishId)
  }

  return {
    dishes,
    loading,
    error,
    fetchDishes,
    fetchDishDetails,
    getDishesForDate,
    countDishesForDate,
    addDish,
    addRecipeToDish,
    removeRecipeFromDish,
    updateRecipePortions,
    updateDishName,
    updateDishTime,
    removeDish,
  }
})
