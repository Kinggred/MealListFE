import { api } from "./client"
import type { Page } from "@/types/Page"
import type {
  Recipe,
  RecipeCreate,
  RecipeIngredientCreate,
  RecipeIngredientUpdate,
  RecipeUpdate,
  RecipeView,
} from "@/types/Recipe"

interface PageParams {
  page?: number
  size?: number
}

export async function getRecipes(params: PageParams = {}): Promise<Page<Recipe>> {
  const response = await api.get("/recipes/", { params })
  return response.data
}

export async function createRecipe(recipe: RecipeCreate): Promise<Recipe> {
  const response = await api.post("/recipes/", recipe)
  return response.data
}

export async function getRecipe(recipeId: string): Promise<RecipeView> {
  const response = await api.get(`/recipes/${recipeId}`)
  return response.data
}

export async function updateRecipe(recipeId: string, recipe: RecipeUpdate): Promise<Recipe> {
  const response = await api.patch(`/recipes/${recipeId}`, recipe)
  return response.data
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await api.delete(`/recipes/${recipeId}`)
}

export async function addIngredientToRecipe(
  recipeId: string,
  ingredient: RecipeIngredientCreate,
): Promise<void> {
  await api.post(`/recipes/${recipeId}/ingredients`, ingredient)
}

export async function updateIngredientInRecipe(
  recipeId: string,
  connectionId: string,
  ingredient: RecipeIngredientUpdate,
): Promise<void> {
  await api.patch(`/recipes/${recipeId}/ingredients/${connectionId}`, ingredient)
}

export async function deleteIngredientFromRecipe(
  recipeId: string,
  connectionId: string,
): Promise<void> {
  await api.delete(`/recipes/${recipeId}/ingredients/${connectionId}`)
}
