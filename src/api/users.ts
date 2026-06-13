import { api } from "./client"
import type { User } from "../types/User"
import type { UserCreate } from "@/types/User"

export async function createUser(user: UserCreate): Promise<User> {
  const response = await api.post("/users/", user)
  return response.data
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get("/users/me")
  return response.data
}
