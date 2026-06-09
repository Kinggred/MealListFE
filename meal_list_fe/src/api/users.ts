import { api } from "./client"
import type { User } from "../types/User"

export async function getCurrentUser(): Promise<User> {
  const response = await api.get("/user/me")
  return response.data
}
