import { ref, type Ref } from "vue"
import type { ShoppingList } from "@/types/ShoppingList"
import { getShoppingList, getShoppingListFile } from "@/api/meals"

export function useShoppingList(
  dateFrom: Ref<string>,
  dateTo: Ref<string>,
) {
  const shoppingList = ref<ShoppingList | null>(null)
  const shoppingListLoading = ref(false)
  const shoppingListError = ref<string | null>(null)

  async function generateShoppingList() {
    shoppingListLoading.value = true
    shoppingListError.value = null
    shoppingList.value = null

    try {
      shoppingList.value = await getShoppingList(dateFrom.value, dateTo.value)
    } catch (error) {
      console.error(error)
      shoppingListError.value = "Failed to generate shopping list"
    } finally {
      shoppingListLoading.value = false
    }
  }

  async function generateShoppingListFile() {
    shoppingListLoading.value = true
    shoppingListError.value = null

    try {
      const blob = await getShoppingListFile(dateFrom.value, dateTo.value)
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `shopping-list-${dateFrom.value}-${dateTo.value}.pdf`
      document.body.appendChild(link)
      link.click()

      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      shoppingListError.value = "Failed to generate shopping list file"
    } finally {
      shoppingListLoading.value = false
    }
  }

  return {
    shoppingList,
    shoppingListLoading,
    shoppingListError,
    generateShoppingList,
    generateShoppingListFile,
  }
}
