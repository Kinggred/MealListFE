<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { usePlannerStore } from "@/stores/planner"

const router = useRouter()
const planner = usePlannerStore()

const currentDate = ref(new Date())
const selectedDate = ref(new Date())

const today = new Date()

const monthName = computed(() =>
  currentDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }),
)

const selectedDayDishes = computed(() =>
  planner.getDishesForDate(selectedDate.value),
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

    <div class="selected-panel">
      <div>
        <h3>
          {{ selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }) }}
        </h3>

        <p>{{ selectedDayDishes.length }} dishes planned</p>
      </div>

      <button class="plan-button" @click="planMeals">
        Plan meals
      </button>
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

.calendar-card {
  box-sizing: border-box;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 1100px;
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
  box-sizing: border-box;
  width: 100%;
  max-width: 1100px;

  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 16px;
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
</style>
