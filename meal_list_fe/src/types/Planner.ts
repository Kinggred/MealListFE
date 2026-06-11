export interface PlannedRecipe {
  recipeId: string
  recipeName: string
  connectionId: string
  fullPortions: number
  halfPortions: number
}

export interface PlannedDish {
  id: string
  date: string
  time: string
  name: string
  recipes: PlannedRecipe[]
  detailsLoaded: boolean
}
