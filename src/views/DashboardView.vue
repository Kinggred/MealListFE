<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlannerStore } from '@/stores/planner'
import { formatLocalDate } from '@/api/meals'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppState from '@/components/ui/AppState.vue'
import MonthCalendar from '@/components/calendar/MonthCalendar.vue'
import ShoppingListTable from '@/components/shopping/ShoppingListTable.vue'
import { useCalendarRange } from '@/composables/useCalendarRange'
import { useShoppingList } from '@/composables/useShoppingList'
import { monthEnd, monthStart } from '@/utils/dates'

const router = useRouter()
const planner = usePlannerStore()
const locale = window.navigator.language

const currentDate = ref(new Date())

const {
  selectedDate,
  selectionStartDate,
  selectionEndDate,
  startDaySelection,
  extendDaySelection,
  finishDaySelection,
} = useCalendarRange(currentDate)

const {
  shoppingList,
  shoppingListLoading,
  shoppingListError,
  generateShoppingList,
  generateShoppingListFile,
} = useShoppingList(selectionStartDate, selectionEndDate)

const selectedDayDishes = computed(() => planner.getDishesForDate(selectedDate.value))

async function loadMonth() {
  await planner.fetchDishes(monthStart(currentDate.value), monthEnd(currentDate.value))
}

onMounted(loadMonth)
watch(currentDate, loadMonth)

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function handleStartSelection(day: number) {
  startDaySelection(day)
}

function handleExtendSelection(day: number) {
  extendDaySelection(day)
}

function dishesCount(date: Date) {
  return planner.countDishesForDate(date)
}

function planMeals() {
  router.push(`/planner?date=${formatLocalDate(selectedDate.value)}`)
}
</script>

<template>
  <section class="page-stack" @mouseup="finishDaySelection">
    <MonthCalendar
      :current-date="currentDate"
      :locale="locale"
      :selected-date-from="selectionStartDate"
      :selected-date-to="selectionEndDate"
      :dishes-count="dishesCount"
      @previous-month="previousMonth"
      @next-month="nextMonth"
      @start-selection="handleStartSelection"
      @extend-selection="handleExtendSelection"
      @finish-selection="finishDaySelection"
    />

    <AppCard>
      <div class="selected-panel">
        <div>
          <h3>
            {{
              selectedDate.toLocaleDateString(locale, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            }}
          </h3>

          <p>{{ selectedDayDishes.length }} dishes planned</p>

          <p class="selected-range">
            Shopping range: {{ selectionStartDate }} → {{ selectionEndDate }}
          </p>
        </div>

        <div class="selected-actions">
          <AppButton
            variant="warning"
            :disabled="shoppingListLoading"
            @click="generateShoppingList"
          >
            {{ shoppingListLoading ? 'Generating...' : 'Generate shopping list' }}
          </AppButton>

          <AppButton
            variant="warning"
            :disabled="shoppingListLoading"
            @click="generateShoppingListFile"
          >
            Get File
          </AppButton>

          <AppButton variant="primary" @click="planMeals"> Plan meals </AppButton>
        </div>
      </div>
    </AppCard>

    <AppState v-if="planner.error" error>
      {{ planner.error }}
    </AppState>

    <AppState v-if="shoppingListLoading"> Loading shopping list... </AppState>

    <AppState v-else-if="shoppingListError" error>
      {{ shoppingListError }}
    </AppState>

    <ShoppingListTable v-else-if="shoppingList" :shopping-list="shoppingList" />
  </section>
</template>

<style scoped>
.selected-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.selected-panel h3 {
  margin: 0 0 4px;
}

.selected-panel p {
  margin: 0;
  color: var(--muted);
}

.selected-range {
  margin: 4px 0 0;
}

.selected-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 760px) {
  .selected-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .selected-actions {
    justify-content: stretch;
  }
}
</style>
