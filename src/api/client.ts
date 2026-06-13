import axios from "axios"

const apiUrl =
  window.APP_CONFIG?.API_URL && window.APP_CONFIG.API_URL !== "__API_URL__"
    ? window.APP_CONFIG.API_URL
    : import.meta.env.VITE_API_BASE_URL || "http://192.168.1.10:8000/api/v1"

console.log("API URL:", apiUrl)

export const api = axios.create({
  baseURL: apiUrl,
})

api.interceptors.request.use(config => {

  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
