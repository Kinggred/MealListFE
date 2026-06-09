<script setup lang="ts">
import { onMounted, ref } from "vue"
import type { Page } from "../types/Page"
import type { Ingredient } from "../types/Ingredient"
import { getIngredients } from "../api/ingredients"
import IngredientCard from "../components/IngredientCard.vue"
import { useThemeStore } from "../stores/theme"

const ingredients = ref<Page<Ingredient> | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    ingredients.value = await getIngredients()
  } catch (e) {
    error.value = "Failed to load ingredients"
    console.error(e)
  } finally {
    loading.value = false
  }
})


const theme = useThemeStore()
</script>

<template>
    <button class="toggle" @click="theme.toggle()">
    {{ theme.isDark ? "🌙 Dark" : "☀️ Light" }}
  </button>
  <div class="page">
    <h1>Ingredients</h1>

    <div v-if="loading" class="state">
      Loading...
    </div>

    <div v-else-if="error" class="state error">
      {{ error }}
    </div>

    <div v-else class="grid">
      <IngredientCard
        v-for="i in ingredients?.items || []"
        :key="i.id"
        :ingredient="i"
      />
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 16px;
}

h1 {
  margin-bottom: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.state {
  padding: 12px;
  color: #555;
}

.error {
  color: #b00020;
}
</style>

