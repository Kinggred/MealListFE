import { computed, ref, type Ref } from "vue"
import { formatLocalDate } from "@/api/meals"

export function useCalendarRange(currentDate: Ref<Date>) {
  const selectedDate = ref(new Date())
  const isSelectingRange = ref(false)

  const selectionDateFrom = ref(formatLocalDate(selectedDate.value))
  const selectionDateTo = ref(formatLocalDate(selectedDate.value))

  const selectionStartDate = computed(() =>
    selectionDateFrom.value <= selectionDateTo.value
      ? selectionDateFrom.value
      : selectionDateTo.value,
  )

  const selectionEndDate = computed(() =>
    selectionDateFrom.value <= selectionDateTo.value
      ? selectionDateTo.value
      : selectionDateFrom.value,
  )

  function dateFromDay(day: number): Date {
    return new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth(),
      day,
    )
  }

  function startDaySelection(day: number) {
    const date = dateFromDay(day)
    const key = formatLocalDate(date)

    selectedDate.value = date
    selectionDateFrom.value = key
    selectionDateTo.value = key
    isSelectingRange.value = true
  }

  function extendDaySelection(day: number) {
    if (!isSelectingRange.value) return

    selectionDateTo.value = formatLocalDate(dateFromDay(day))
  }

  function finishDaySelection() {
    isSelectingRange.value = false
  }

  return {
    selectedDate,
    selectionStartDate,
    selectionEndDate,
    dateFromDay,
    startDaySelection,
    extendDaySelection,
    finishDaySelection,
  }
}
