import { api } from "./client"
import type {LoginResponse} from "@/types/LoginResponse.ts";
import type {LoginRequest} from "@/types/LoginRequest.ts";


export async function login(
 loginRequest: LoginRequest
): Promise<LoginResponse> {
  console.trace("LOGIN CALLED WITH:", loginRequest)

  const body = new URLSearchParams()

  body.append("username", loginRequest.email)
  body.append("password", loginRequest.password)
  console.log("dupa2")
  console.log(body.toString())

  const response = await api.post(
    "/auth/token",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  )

  return response.data
}
