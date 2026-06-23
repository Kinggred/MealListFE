<script setup lang="ts">
import TrashButton from '@/components/ui/TrashButton.vue'
import { usePlannerManager } from '@/composables/usePlannerManager'

const {
  planner,
  recipes,
  selectedRecipeId,
  actionError,
  locale,
  selectedDate,
  selectedDishId,
  monthName,
  dayDishes,
  selectedDish,
  calendarDays,
  selectDay,
  isToday,
  isSelected,
  dishesCount,
  previousMonth,
  nextMonth,
  addDish,
  addRecipe,
  removeDish,
  saveDishName,
  saveDishTime,
  saveRecipePortions,
  removeRecipe,
  selectDish,
} = usePlannerManager()
</script>

<template>
  <section class="planner">
    <aside class="dish-editor">
      <h2>Dish panel</h2>

      <div v-if="!selectedDish" class="muted">Select a dish or create one.</div>

      <template v-else>
        <label>Name</label>
        <input
          :value="selectedDish.name"
          @change="saveDishName(($event.target as HTMLInputElement).value)"
        />

        <label>Serving time</label>
        <input
          type="time"
          :value="selectedDish.time"
          @change="saveDishTime(($event.target as HTMLInputElement).value)"
        />

        <div class="section-header">
          <h3>Recipes</h3>
          <TrashButton label="Delete meal" @click="removeDish" />
        </div>

        <div class="add-recipe-row">
          <select v-model="selectedRecipeId">
            <option v-for="recipe in recipes" :key="recipe.id" :value="recipe.id">
              {{ recipe.name }}
            </option>
          </select>

          <button :disabled="!selectedRecipeId" @click="addRecipe">Add</button>
        </div>

        <p v-if="actionError" class="error">
          {{ actionError }}
        </p>

        <div v-for="recipe in selectedDish.recipes" :key="recipe.connectionId" class="recipe-row">
          <span>{{ recipe.recipeName }}</span>

          <input
            type="number"
            min="0"
            :value="recipe.fullPortions"
            title="Full portions"
            @change="
              saveRecipePortions(
                recipe.connectionId,
                Number(($event.target as HTMLInputElement).value),
                recipe.halfPortions,
              )
            "
          />

          <input
            type="number"
            min="0"
            :value="recipe.halfPortions"
            title="Half portions"
            @change="
              saveRecipePortions(
                recipe.connectionId,
                recipe.fullPortions,
                Number(($event.target as HTMLInputElement).value),
              )
            "
          />

          <TrashButton label="Remove recipe" @click="removeRecipe(recipe.connectionId)" />
        </div>
      </template>
    </aside>

    <main class="day-panel">
      <div class="day-header">
        <div>
          <h1>
            {{
              selectedDate.toLocaleDateString(locale, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            }}
          </h1>

          <p class="muted">{{ dayDishes.length }} dishes planned</p>
        </div>

        <button @click="addDish">Add dish</button>
      </div>

      <div class="timeline">
        <button
          v-for="dish in dayDishes"
          :key="dish.id"
          class="dish-card"
          :class="{ active: dish.id === selectedDishId }"
          @click="selectDish(dish.id)"
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

      <div v-if="planner.loading" class="state">Loading...</div>

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
  width: 100%;
  min-height: 44px;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
}

select {
  width: 100%;
  min-height: 44px;
  min-width: 0;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
}

button {
  min-height: 44px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  touch-action: manipulation;
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
  grid-template-columns: minmax(0, 1fr) 70px 70px auto;
  gap: 8px;
  align-items: center;
}

.recipe-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-recipe-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.danger:hover {
  border-color: #d64545;
  color: #d64545;
}

.state,
.error {
  color: var(--muted);
}

.error {
  color: #b00020;
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

@media (max-width: 1180px) {
  .planner {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  }

  .dish-editor {
    grid-column: 1 / -1;
    order: 3;
  }
}

@media (max-width: 760px) {
  .planner {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .dish-editor,
  .day-panel,
  .mini-calendar {
    border-radius: 8px;
    padding: 14px;
  }

  .mini-calendar {
    order: 1;
  }

  .day-panel {
    order: 2;
  }

  .dish-editor {
    grid-column: auto;
    order: 3;
  }

  .day-header {
    gap: 12px;
  }

  .calendar-grid {
    gap: 4px;
  }

  .calendar-day {
    min-height: 42px;
    border-radius: 8px;
  }
}

@media (max-width: 520px) {
  .recipe-row {
    grid-template-columns: minmax(0, 1fr) 62px 62px 44px;
    gap: 4px;
  }

  .add-recipe-row {
    grid-template-columns: 1fr;
  }

  .section-header {
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
