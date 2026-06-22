export interface Diet {
  id: string
  name: string
  content?: Record<string, unknown>
}

export interface DietCreate {
  name: string
  content?: Record<string, string>
  ingredients: string[]
}

export type DietUpdate = Partial<{
  name: string | null
  content: Record<string, string> | null
}>

export interface IngredientInDiet {
  id: string
  connection_id: string
  name: string
  animal_produced: boolean
  animal_derived: boolean
}

export interface DietView {
  id: string
  name: string
  content: Record<string, string>
  ingredients: IngredientInDiet[]
}

export interface UpdateIngredientsInDiet {
  add: string[]
  remove: string[]
}
