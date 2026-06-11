export type Unit = "ml" | "g" | "p"

export interface Ingredient {
  id: string
  name: string
  calories: number
  cost: number
  amount_per_cost: number
  unit_of_measurement: Unit
  animal_produced: boolean
  animal_derived: boolean
}

export type IngredientCreate = Omit<Ingredient, "id">

export type IngredientUpdate = Partial<{
  name: string | null
  calories: number | null
  cost: number | null
  amount_per_cost: number | null
  unit_of_measurement: Unit | null
  animal_produced: boolean | null
  animal_derived: boolean | null
}>

export interface IngredientTieCreate {
  contained_id: string
  is_alternative?: boolean
  include_in_count?: boolean
}

export interface ContainedIngredients {
  counted: Ingredient[]
  uncounted: Ingredient[]
}

export interface IngredientWithTies extends Ingredient {
  alternatives: Ingredient[]
  contains: ContainedIngredients
}
