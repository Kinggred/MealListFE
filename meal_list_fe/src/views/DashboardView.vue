<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { usePlannerStore } from "@/stores/planner"
import type { ShoppingList } from "@/types/ShoppingList"
import { getShoppingList } from "@/api/meals"

const router = useRouter()
const planner = usePlannerStore()

const currentDate = ref(new Date())
const selectedDate = ref(new Date())

const today = new Date()

const shoppingDateFrom = ref(today.toISOString().slice(0, 10))
const shoppingDateTo = ref(today.toISOString().slice(0, 10))
const shoppingList = ref<ShoppingList | null>(null)

const shoppingListLoading = ref(false)
const shoppingListError = ref<string | null>(null)

async function generateShoppingList() {
  shoppingListLoading.value = true
  shoppingListError.value = null
  shoppingList.value = null

  try {
    shoppingList.value = await getShoppingList(
      shoppingDateFrom.value,
      shoppingDateTo.value,
    )
  } catch (error) {
    console.error(error)
    shoppingListError.value = "Failed to generate shopping list"
  } finally {
    shoppingListLoading.value = false
  }
}

const totalEstimatedCost = computed(() => {
  if (!shoppingList.value) return 0

  return shoppingList.value.ingredient_list.reduce(
    (sum, ingredient) => sum + ingredient.estimated_cost,
    0,
  )
})

const monthName = computed(() =>
  currentDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }),
)

const selectedDayDishes = computed(() =>
  planner.getDishesForDate(selectedDate.value),
)

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function monthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

async function loadMonth() {
  await planner.fetchDishes(monthStart(currentDate.value), monthEnd(currentDate.value))
}

onMounted(loadMonth)

watch(currentDate, loadMonth)

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startOffset = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days: Array<number | null> = []

  for (let i = 0; i < startOffset; i++) {
    days.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return days
})

function dateFromDay(day: number): Date {
  return new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    day,
  )
}

function selectDay(day: number | null) {
  if (!day) return
  selectedDate.value = dateFromDay(day)
}

function isToday(day: number | null) {
  if (!day) return false

  return (
    day === today.getDate() &&
    currentDate.value.getMonth() === today.getMonth() &&
    currentDate.value.getFullYear() === today.getFullYear()
  )
}

function isSelected(day: number | null) {
  if (!day) return false

  return (
    day === selectedDate.value.getDate() &&
    currentDate.value.getMonth() === selectedDate.value.getMonth() &&
    currentDate.value.getFullYear() === selectedDate.value.getFullYear()
  )
}

function dishesCount(day: number | null) {
  if (!day) return 0
  return planner.countDishesForDate(dateFromDay(day))
}

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1,
  )
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1,
  )
}

function planMeals() {
  const date = selectedDate.value.toISOString().slice(0, 10)
  router.push(`/planner?date=${date}`)
}
</script>

<template>
  <section class="dashboard">
    <div class="calendar-card">
      <div class="calendar-header">
        <button @click="previousMonth">←</button>

        <h2>{{ monthName }}</h2>

        <button @click="nextMonth">→</button>
      </div>

      <div class="weekdays">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      <div class="calendar-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day"
          :class="{
            empty: day === null,
            today: isToday(day),
            selected: isSelected(day),
          }"
          @click="selectDay(day)"
        >
          <span v-if="day" class="day-number">
            {{ day }}
          </span>

          <small v-if="day">
            {{ dishesCount(day) }} dishes
          </small>
        </div>
      </div>
    </div>

    <div class="shopping-list-panel">
      <label>
        From
        <input v-model="shoppingDateFrom" type="date" />
      </label>

      <label>
        To
        <input v-model="shoppingDateTo" type="date" />
      </label>

      <button
        class="plan-button"
        :disabled="shoppingListLoading"
        @click="generateShoppingList"
      >
        {{ shoppingListLoading ? "Generating..." : "Generate shopping list" }}
      </button>
    </div>

    <div v-if="shoppingListLoading" class="state">
      Loading shopping list...
    </div>

    <div v-else-if="shoppingListError" class="state error">
      {{ shoppingListError }}
    </div>

    <div v-else-if="shoppingList" class="shopping-list-result">
      <h3>Shopping list</h3>

      <p class="shopping-list-range">
        {{ shoppingList.date_from }} → {{ shoppingList.date_to }}
      </p>

      <p
        v-if="shoppingList.ingredient_list.length === 0"
        class="state"
      >
        No ingredients found for this date range.
      </p>

      <table v-else class="shopping-list-table">
        <thead>
        <tr>
          <th>Ingredient</th>
          <th>Amount</th>
          <th>Unit</th>
          <th>Cost</th>
        </tr>
        </thead>

        <tbody>
        <tr
          v-for="ingredient in shoppingList.ingredient_list"
          :key="ingredient.id"
        >
          <td>{{ ingredient.name }}</td>
          <td>{{ ingredient.amount }}</td>
          <td>{{ ingredient.unit_of_measurement }}</td>
          <td>{{ ingredient.estimated_cost.toFixed(2) }}</td>
        </tr>
        </tbody>

        <tfoot>
        <tr>
          <td colspan="3">
            <strong>Total</strong>
          </td>

          <td>
            <strong>{{ totalEstimatedCost.toFixed(2) }}</strong>
          </td>
        </tr>
        </tfoot>
      </table>
    </div>

    <div class="selected-panel">
      <div>
        <h3>
          {{
            selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })
          }}
        </h3>

        <p>{{ selectedDayDishes.length }} dishes planned</p>
      </div>

      <button class="plan-button" @click="planMeals">
        Plan meals
      </button>
    </div>

    <div v-if="planner.error" class="state error">
      {{ planner.error }}
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

.calendar-card,
.shopping-list-panel,
.shopping-list-result,
.selected-panel {
  box-sizing: border-box;
  width: 100%;
  max-width: 1100px;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
}

.calendar-card {
  padding: 24px;
}

.shopping-list-panel {
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: end;
}

.shopping-list-result {
  padding: 20px;
}

.shopping-list-result h3 {
  margin: 0 0 4px;
}

.shopping-list-range {
  margin: 0 0 16px;
  color: var(--muted);
}

.shopping-list-panel label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--muted);
}

.shopping-list-panel input {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  padding: 8px 12px;
}

.shopping-list-table {
  width: 100%;
  border-collapse: collapse;
}

.shopping-list-table th,
.shopping-list-table td {
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.shopping-list-table th {
  color: var(--muted);
  font-weight: 500;
  text-align: left;
}

.shopping-list-table th:nth-child(2),
.shopping-list-table td:nth-child(2),
.shopping-list-table th:nth-child(3),
.shopping-list-table td:nth-child(3),
.shopping-list-table th:nth-child(4),
.shopping-list-table td:nth-child(4) {
  text-align: right;
  white-space: nowrap;
}

.shopping-list-table tfoot td {
  padding-top: 16px;
  border-top: 2px solid var(--border);
  border-bottom: none;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.calendar-header h2 {
  margin: 0;
}

.calendar-header button,
.plan-button {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
  color: var(--muted);
  font-size: 14px;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.day {
  box-sizing: border-box;
  min-height: clamp(64px, 9vw, 90px);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px;
  background: var(--bg);
  cursor: pointer;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.day:hover {
  border-color: #4f8ef7;
}

.day small {
  color: var(--muted);
  font-size: 12px;
}

.today {
  border: 2px solid #4f8ef7;
  background: rgba(79, 142, 247, 0.15);
}

.selected {
  outline: 2px solid #4f8ef7;
  outline-offset: 2px;
}

.empty {
  opacity: 0.35;
  cursor: default;
}

.selected-panel {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-panel h3 {
  margin: 0 0 4px;
}

.selected-panel p {
  margin: 0;
  color: var(--muted);
}

.plan-button {
  background: #4f8ef7;
  color: white;
}

.plan-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.state {
  color: var(--muted);
}

.error {
  color: #b00020;
}
</style>
