import type { Unit } from "@/types/Ingredient"

export interface Recipe {
  id: string
  name: string
  text?: Record<string, unknown>
  image: string
}

export interface RecipeIngredientCreate {
  ingredient_id: string
  amount: number
}

export interface RecipeIngredientUpdate {
  amount: number
}

export interface RecipeCreate {
  name: string
  text?: Record<string, string>
  image: string
  ingredients: RecipeIngredientCreate[]
}

export type RecipeUpdate = Partial<{
  name: string | null
  text: Record<string, string> | null
  image: string | null
}>

export interface IngredientInRecipe {
  id: string
  connection_id: string
  name: string
  counted_calories: number
  counted_cost: number
  amount: number
  unit_of_measurement: Unit
}

export interface RecipeView {
  id: string
  name: string
  text: Record<string, string> | null
  image: string | null
  ingredients: IngredientInRecipe[]
  total_cost: number
  total_calories: number
}
