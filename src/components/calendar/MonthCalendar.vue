<script setup lang="ts">
import { computed } from "vue"
import AppCard from "@/components/ui/AppCard.vue"
import AppButton from "@/components/ui/AppButton.vue"

const props = defineProps<{
  currentDate: Date
  locale: string
  selectedDateFrom: string
  selectedDateTo: string
  dishesCount: (date: Date) => number
}>()

const emit = defineEmits<{
  previousMonth: []
  nextMonth: []
  startSelection: [day: number]
  extendSelection: [day: number]
  finishSelection: []
}>()

const today = new Date()

const monthName = computed(() =>
  props.currentDate.toLocaleDateString(props.locale, {
    month: "long",
    year: "numeric",
  }),
)

const calendarDays = computed(() => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()

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
    props.currentDate.getFullYear(),
    props.currentDate.getMonth(),
    day,
  )
}

function formatDayKey(day: number): string {
  const date = dateFromDay(day)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const dateDay = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${dateDay}`
}

function isToday(day: number | null): boolean {
  if (!day) return false

  return (
    day === today.getDate() &&
    props.currentDate.getMonth() === today.getMonth() &&
    props.currentDate.getFullYear() === today.getFullYear()
  )
}

function isSelected(day: number | null): boolean {
  if (!day) return false

  const key = formatDayKey(day)

  return key >= props.selectedDateFrom && key <= props.selectedDateTo
}

function handleMouseDown(day: number | null) {
  if (!day) return
  emit("startSelection", day)
}

function handleMouseEnter(day: number | null) {
  if (!day) return
  emit("extendSelection", day)
}
</script>

<template>
  <AppCard large>
    <div class="calendar-header">
      <AppButton @click="emit('previousMonth')">←</AppButton>

      <h2>{{ monthName }}</h2>

      <AppButton @click="emit('nextMonth')">→</AppButton>
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
        class="calendar-day"
        :class="{
          empty: day === null,
          today: isToday(day),
          selected: isSelected(day),
        }"
        @mousedown="handleMouseDown(day)"
        @mouseenter="handleMouseEnter(day)"
        @mouseup="emit('finishSelection')"
      >
        <span v-if="day" class="day-number">
          {{ day }}
        </span>

        <small v-if="day">
          {{ props.dishesCount(dateFromDay(day)) }} dishes
        </small>
      </div>
    </div>
  </AppCard>
</template>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.calendar-header h2 {
  margin: 0;
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

.calendar-day {
  box-sizing: border-box;
  min-height: clamp(64px, 9vw, 90px);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px;
  background: var(--bg);
  cursor: pointer;
  user-select: none;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.calendar-day:hover {
  border-color: #4f8ef7;
}

.calendar-day small {
  color: var(--muted);
  font-size: 12px;
}

.today {
  border: 2px solid #4f8ef7;
  background: rgba(79, 142, 247, 0.15);
}

.selected {
  outline-offset: 2px;
  background: rgb(18 90 158 / 0.2);
}

.empty {
  opacity: 0.35;
  cursor: default;
}
</style>
