<script setup lang="ts">
import { computed } from "vue"
import type { ShoppingList } from "@/types/ShoppingList"
import AppCard from "@/components/ui/AppCard.vue"
import AppState from "@/components/ui/AppState.vue"

const props = defineProps<{
  shoppingList: ShoppingList
}>()

const totalEstimatedCost = computed(() =>
  props.shoppingList.ingredient_list.reduce(
    (sum, ingredient) => sum + ingredient.estimated_cost,
    0,
  ),
)
</script>

<template>
  <AppCard>
    <h3 class="shopping-list-title">Shopping list</h3>

    <p class="shopping-list-range">
      {{ shoppingList.date_from }} → {{ shoppingList.date_to }}
    </p>

    <AppState v-if="shoppingList.ingredient_list.length === 0">
      No ingredients found for this date range.
    </AppState>

    <table v-else class="app-table">
      <thead>
      <tr>
        <th>Ingredient</th>
        <th class="number">Amount</th>
        <th class="number">Unit</th>
        <th class="number">Cost</th>
      </tr>
      </thead>

      <tbody>
      <tr
        v-for="ingredient in shoppingList.ingredient_list"
        :key="ingredient.id"
      >
        <td>{{ ingredient.name }}</td>
        <td class="number">{{ ingredient.amount }}</td>
        <td class="number">{{ ingredient.unit_of_measurement }}</td>
        <td class="number">{{ ingredient.estimated_cost.toFixed(2) }}</td>
      </tr>
      </tbody>

      <tfoot>
      <tr>
        <td colspan="3">
          <strong>Total</strong>
        </td>

        <td class="number">
          <strong>{{ totalEstimatedCost.toFixed(2) }}</strong>
        </td>
      </tr>
      </tfoot>
    </table>
  </AppCard>
</template>

<style scoped>
.shopping-list-title {
  margin: 0 0 4px;
}

.shopping-list-range {
  margin: 4px 0 16px;
  color: var(--muted);
}
</style>
