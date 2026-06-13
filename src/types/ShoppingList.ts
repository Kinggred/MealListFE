export type ShoppingListIngredient = {
  id: string
  name: string
  exact_amount: number
  amount: number
  estimated_cost: number
  unit_of_measurement: string
}

export type ShoppingList = {
  date_from: string
  date_to: string
  ingredient_list: ShoppingListIngredient[]
}
