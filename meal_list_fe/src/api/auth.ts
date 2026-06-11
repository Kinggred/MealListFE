import { api } from "./client"
import type { LoginResponse } from "@/types/LoginResponse"
import type { LoginRequest } from "@/types/LoginRequest"

export async function login(
  loginRequest: LoginRequest,
): Promise<LoginResponse> {
  const body = new URLSearchParams()

  body.append("username", loginRequest.email)
  body.append("password", loginRequest.password)

  const response = await api.post(
    "/auth/token",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )

  return response.data
}
