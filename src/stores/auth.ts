import { defineStore } from "pinia"
import { computed, ref } from "vue"

import { login } from "@/api/auth"
import { getCurrentUser } from "@/api/users"

import type { LoginRequest } from "@/types/LoginRequest"
import type { User } from "@/types/User"

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"))
  const user = ref<User | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => {
    return token.value !== null && user.value !== null
  })

  async function initialize() {
    if (!token.value) {
      loading.value = false
      return
    }

    try {
      user.value = await getCurrentUser()
    } catch {
      token.value = null
      user.value = null
      localStorage.removeItem("token")
    } finally {
      loading.value = false
    }
  }

  async function loginUser(loginRequest: LoginRequest) {
    const response = await login(loginRequest)

    token.value = response.access_token
    localStorage.setItem("token", response.access_token)

    user.value = await getCurrentUser()
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem("token")
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    initialize,
    loginUser,
    logout,
  }
})
