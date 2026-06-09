export interface PlannedRecipe {
  recipeId: string
  recipeName: string
  portions: number
}

export interface PlannedDish {
  id: string
  date: string
  time: string
  name: string
  recipes: PlannedRecipe[]
}
