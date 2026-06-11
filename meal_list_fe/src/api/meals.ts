import { api } from "./client"
import type {
  Meal,
  MealCreate,
  MealDish,
  MealDishCreate,
  MealDishUpdate,
  MealResults,
  MealUpdate,
  MealView,
} from "@/types/Meal"
import type {ShoppingList} from "@/types/ShoppingList.ts";

interface MealPageParams {
  date_from?: string
  date_to?: string
  page?: number
  size?: number
}

interface ShoppingListParams {
  date_from?: string
  date_to?: string
}

export async function getMeals(params: MealPageParams = {}): Promise<MealResults> {
  const response = await api.get("/meals/", { params })
  return response.data
}

export async function createMeal(meal: MealCreate): Promise<Meal> {
  const response = await api.post("/meals/", meal)
  return response.data
}

export async function getShoppingList(
  dateFrom: string,
  dateTo: string,
): Promise<ShoppingList> {
  const response = await api.get<ShoppingList>(
    "/meals/shopping_list",
    {
      params: {
        date_from: dateFrom,
        date_to: dateTo,
      },
    },
  )

  return response.data
}

export async function getMeal(mealId: string): Promise<MealView> {
  const response = await api.get(`/meals/${mealId}`)
  return response.data
}

export async function updateMeal(mealId: string, meal: MealUpdate): Promise<Meal> {
  const response = await api.patch(`/meals/${mealId}`, meal)
  return response.data
}

export async function deleteMeal(mealId: string): Promise<void> {
  await api.delete(`/meals/${mealId}`)
}

export async function addDishToMeal(
  mealId: string,
  dish: MealDishCreate,
): Promise<MealDish> {
  const response = await api.post(`/meals/${mealId}/dishes`, dish)
  return response.data
}

export async function updateDishInMeal(
  mealId: string,
  connectionId: string,
  dish: MealDishUpdate,
): Promise<MealDish> {
  const response = await api.patch(`/meals/${mealId}/dishes/${connectionId}`, dish)
  return response.data
}

export async function deleteDishFromMeal(
  mealId: string,
  connectionId: string,
): Promise<void> {
  await api.delete(`/meals/${mealId}/dishes/${connectionId}`)
}
