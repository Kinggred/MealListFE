export interface Ingredient {
  id: string
  name: string
  calories: number
  cost: number
  amount_per_cost: number
  unit_of_measurement: string
  animal_produced: boolean
  animal_derived: boolean
}
