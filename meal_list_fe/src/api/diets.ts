import { api } from "./client"
import type { Page } from "@/types/Page"
import type {
  Diet,
  DietCreate,
  DietUpdate,
  DietView,
  UpdateIngredientsInDiet,
} from "@/types/Diet"

interface PageParams {
  page?: number
  size?: number
}

export async function getDiets(params: PageParams = {}): Promise<Page<Diet>> {
  const response = await api.get("/diets/", { params })
  return response.data
}

export async function createDiet(diet: DietCreate): Promise<Diet> {
  const response = await api.post("/diets/", diet)
  return response.data
}

export async function getDiet(dietId: string): Promise<DietView> {
  const response = await api.get(`/diets/${dietId}`)
  return response.data
}

export async function updateDiet(dietId: string, diet: DietUpdate): Promise<Diet> {
  const response = await api.patch(`/diets/${dietId}`, diet)
  return response.data
}

export async function deleteDiet(dietId: string): Promise<void> {
  await api.delete(`/diets/${dietId}`)
}

export async function updateIngredientsInDiet(
  dietId: string,
  update: UpdateIngredientsInDiet,
): Promise<void> {
  await api.patch(`/diets/${dietId}/ingredients`, update)
}
