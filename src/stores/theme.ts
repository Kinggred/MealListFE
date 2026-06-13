import { defineStore } from "pinia"
import { ref } from "vue"

export const useThemeStore = defineStore("theme", () => {
  const isDark = ref(localStorage.getItem("theme") === "dark")

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  function toggle() {
    isDark.value = !isDark.value
    applyTheme()
  }

  applyTheme()

  return { isDark, toggle }
})
