<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import { usePlannerStore } from "@/stores/planner"

const route = useRoute()
const planner = usePlannerStore()

function parseInitialDate(): Date {
  if (typeof route.query.date === "string") {
    return new Date(route.query.date)
  }

  return new Date()
}

const selectedDate = ref(parseInitialDate())
const currentDate = ref(
  new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1),
)

const selectedDishId = ref<string | null>(null)

const today = new Date()

const monthName = computed(() =>
  currentDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }),
)

const dayDishes = computed(() =>
  planner.getDishesForDate(selectedDate.value),
)

const selectedDish = computed(() =>
  planner.dishes.find((dish) => dish.id === selectedDishId.value) ?? null,
)

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
  selectedDishId.value = null
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

function addDish() {
  const dish = planner.addDish(selectedDate.value)
  selectedDishId.value = dish.id
}

function addMockRecipe() {
  if (!selectedDish.value) return
  planner.addMockRecipeToDish(selectedDish.value.id)
}

function removeRecipe(recipeId: string) {
  if (!selectedDish.value) return
  planner.removeRecipeFromDish(selectedDish.value.id, recipeId)
}
</script>

<template>
  <section class="planner">
    <aside class="dish-editor">
      <h2>Dish panel</h2>

      <div v-if="!selectedDish" class="muted">
        Select a dish or create one.
      </div>

      <template v-else>
        <label>Name</label>
        <input
          :value="selectedDish.name"
          @input="
            planner.updateDishName(
              selectedDish.id,
              ($event.target as HTMLInputElement).value,
            )
          "
        />

        <label>Serving time</label>
        <input
          type="time"
          :value="selectedDish.time"
          @input="
            planner.updateDishTime(
              selectedDish.id,
              ($event.target as HTMLInputElement).value,
            )
          "
        />

        <div class="section-header">
          <h3>Recipes</h3>
          <button @click="addMockRecipe">+</button>
        </div>

        <div
          v-for="recipe in selectedDish.recipes"
          :key="recipe.recipeId"
          class="recipe-row"
        >
          <span>{{ recipe.recipeName }}</span>

          <input
            v-model.number="recipe.portions"
            type="number"
            min="1"
          />

          <button @click="removeRecipe(recipe.recipeId)">x</button>
        </div>
      </template>
    </aside>

    <main class="day-panel">
      <div class="day-header">
        <div>
          <h1>
            {{ selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }) }}
          </h1>

          <p class="muted">
            {{ dayDishes.length }} dishes planned
          </p>
        </div>

        <button @click="addDish">Add dish</button>
      </div>

      <div class="timeline">
        <button
          v-for="dish in dayDishes"
          :key="dish.id"
          class="dish-card"
          :class="{ active: dish.id === selectedDishId }"
          @click="selectedDishId = dish.id"
        >
          <strong>{{ dish.time }}</strong>

          <div>
            <h3>{{ dish.name }}</h3>
            <p>{{ dish.recipes.length }} recipes</p>
          </div>
        </button>
      </div>
    </main>

    <aside class="mini-calendar">
      <div class="calendar-header">
        <button @click="previousMonth">←</button>

        <h2>{{ monthName }}</h2>

        <button @click="nextMonth">→</button>
      </div>

      <div class="weekdays">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>

      <div class="calendar-grid">
        <button
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            empty: day === null,
            today: isToday(day),
            selected: isSelected(day),
          }"
          @click="selectDay(day)"
        >
          <span v-if="day">{{ day }}</span>
          <small v-if="day && dishesCount(day) > 0">
            {{ dishesCount(day) }}
          </small>
        </button>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.planner {
  height: 100%;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 24px;
}

.dish-editor,
.day-panel,
.mini-calendar {
  box-sizing: border-box;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
  padding: 20px;
}

.dish-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.day-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-header h1 {
  margin: 0;
  font-size: 22px;
}

.muted {
  color: var(--muted);
}

input {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
}

button {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}

button:hover {
  border-color: #4f8ef7;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-card {
  width: 100%;
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 12px;
  text-align: left;
}

.dish-card h3 {
  margin: 0;
}

.dish-card p {
  margin: 4px 0 0;
  color: var(--muted);
}

.dish-card.active {
  border-color: #4f8ef7;
  background: rgba(79, 142, 247, 0.15);
}

.recipe-row {
  display: grid;
  grid-template-columns: 1fr 70px auto;
  gap: 8px;
  align-items: center;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-header h2 {
  margin: 0;
  font-size: 16px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  color: var(--muted);
  font-size: 12px;
  text-align: center;
  margin-bottom: 8px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.calendar-day {
  aspect-ratio: 1;
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.calendar-day small {
  font-size: 10px;
  color: var(--muted);
}

.calendar-day.today {
  border-color: #4f8ef7;
  background: rgba(79, 142, 247, 0.15);
}

.calendar-day.selected {
  outline: 2px solid #4f8ef7;
  outline-offset: 2px;
}

.calendar-day.empty {
  opacity: 0.25;
  cursor: default;
}
</style>
