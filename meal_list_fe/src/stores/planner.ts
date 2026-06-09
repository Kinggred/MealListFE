import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { PlannedDish } from "@/types/Planner"

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export const usePlannerStore = defineStore("planner", () => {
  const dishes = ref<PlannedDish[]>([
    {
      id: "1",
      date: toDateKey(new Date()),
      time: "08:30",
      name: "Breakfast",
      recipes: [
        {
          recipeId: "r1",
          recipeName: "Mock oatmeal recipe",
          portions: 1,
        },
      ],
    },
  ])

  function getDishesForDate(date: Date): PlannedDish[] {
    const dateKey = toDateKey(date)

    return dishes.value
      .filter((dish) => dish.date === dateKey)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  function countDishesForDate(date: Date): number {
    return getDishesForDate(date).length
  }

  function addDish(date: Date): PlannedDish {
    const dish: PlannedDish = {
      id: crypto.randomUUID(),
      date: toDateKey(date),
      time: "12:00",
      name: "New dish",
      recipes: [],
    }

    dishes.value.push(dish)
    return dish
  }

  function addMockRecipeToDish(dishId: string) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (!dish) return

    dish.recipes.push({
      recipeId: crypto.randomUUID(),
      recipeName: "Mock recipe",
      portions: 1,
    })
  }

  function removeRecipeFromDish(dishId: string, recipeId: string) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (!dish) return

    dish.recipes = dish.recipes.filter((recipe) => recipe.recipeId !== recipeId)
  }

  function updateDishName(dishId: string, name: string) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (dish) dish.name = name
  }

  function updateDishTime(dishId: string, time: string) {
    const dish = dishes.value.find((d) => d.id === dishId)
    if (dish) dish.time = time
  }

  return {
    dishes,
    getDishesForDate,
    countDishesForDate,
    addDish,
    addMockRecipeToDish,
    removeRecipeFromDish,
    updateDishName,
    updateDishTime,
  }
})
