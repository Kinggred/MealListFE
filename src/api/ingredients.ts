import { api } from "./client"
import type {
  Ingredient,
  IngredientCreate,
  IngredientSearchResult,
  IngredientTieCreate,
  IngredientUpdate,
  IngredientWithTies,
} from "../types/Ingredient"
import type { Page } from "@/types/Page"

interface PageParams {
  page?: number
  size?: number
}

interface IngredientSearchParams extends PageParams {
  search_query?: string
  diet_ids?: string[]
}

export async function getIngredients(params: PageParams = {}): Promise<Page<Ingredient>> {
  const res = await api.get("/ingredients/", { params })
  return res.data
}

export async function searchIngredients(
  params: IngredientSearchParams = {},
): Promise<Page<IngredientSearchResult>> {
  const searchParams = new URLSearchParams()

  if (params.search_query) searchParams.set("search_query", params.search_query)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.size) searchParams.set("size", String(params.size))
  params.diet_ids?.forEach((dietId) => searchParams.append("diet_ids", dietId))

  const res = await api.get("/ingredients/search", { params: searchParams })
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
