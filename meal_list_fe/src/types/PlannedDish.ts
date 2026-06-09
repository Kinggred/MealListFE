type PlannedDish = {
  id: string
  date: string
  time: string
  name: string
  recipes: {
    recipeId: string
    recipeName: string
    portions: number
  }[]
}
