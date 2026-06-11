import { api } from "./client"
import type {
  Ingredient,
  IngredientCreate,
  IngredientTieCreate,
  IngredientUpdate,
  IngredientWithTies,
} from "../types/Ingredient"
import type { Page } from "@/types/Page"

interface PageParams {
  page?: number
  size?: number
}

export async function getIngredients(params: PageParams = {}): Promise<Page<Ingredient>> {
  const res = await api.get("/ingredients/", { params })
  return res.data
}

export async function createIngredient(ingredient: IngredientCreate): Promise<void> {
  await api.post("/ingredients/", ingredient)
}

export async function getIngredient(ingredientId: string): Promise<IngredientWithTies> {
  const res = await api.get(`/ingredients/${ingredientId}`)
  return res.data
}

export async function updateIngredient(
  ingredientId: string,
  ingredient: IngredientUpdate,
): Promise<Ingredient> {
  const res = await api.patch(`/ingredients/${ingredientId}`, ingredient)
  return res.data
}

export async function deleteIngredient(ingredientId: string): Promise<void> {
  await api.delete(`/ingredients/${ingredientId}`)
}

export async function tieIngredients(
  ingredientId: string,
  tie: IngredientTieCreate,
): Promise<void> {
  await api.post(`/ingredients/ties/${ingredientId}`, tie)
}
