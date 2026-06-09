import { api } from "./client"
import type { Ingredient } from "../types/Ingredient"
import type {Page} from "@/types/Page";

export async function getIngredients(): Promise<Page<Ingredient>> {
  const res = await api.get("/ingredients/")
  return res.data
}
