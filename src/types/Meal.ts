export interface Meal {
  id: string
  name: string
  date: string
}

export interface MealResults {
  results: Meal[]
}

export interface MealDishCreate {
  recipe_id: string
  full_portions: number
  half_portions: number
}

export interface MealDish {
  id: string
  meal_id: string
  recipe_id: string
  full_portions: number
  half_portions: number
}

export interface MealDishUpdate {
  full_portions: number | null
  half_portions: number | null
}

export interface RecipeInDish {
  id: string
  name: string
}

export interface MealDishView {
  connection_id: string
  recipe: RecipeInDish
  full_portions: number
  half_portions: number
}

export interface MealCreate {
  name: string
  date: string
  dishes: MealDishCreate[]
}

export type MealUpdate = Partial<{
  name: string | null
  date: string | null
}>

export interface MealView {
  name: string
  date: string
  dishes: MealDishView[]
}

export interface IngredientInShoppingList {
  id: string
  name: string
  exact_amount: number
  amount: number
  estimated_cost: number
}

export interface formatLocalDate {
  date: Date
}
