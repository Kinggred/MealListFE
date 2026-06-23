<script setup lang="ts">
import AddButton from '@/components/ui/AddButton.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppState from '@/components/ui/AppState.vue'
import SaveButton from '@/components/ui/SaveButton.vue'
import TrashButton from '@/components/ui/TrashButton.vue'
import RecipeImagePicker from '@/components/recipes/RecipeImagePicker.vue'
import RecipeIngredientCatalog from '@/components/recipes/RecipeIngredientCatalog.vue'
import RecipeIngredientCreatePanel from '@/components/recipes/RecipeIngredientCreatePanel.vue'
import RecipeIngredientPanel from '@/components/recipes/RecipeIngredientPanel.vue'
import RecipeList from '@/components/recipes/RecipeList.vue'
import { useRecipesManager } from '@/composables/useRecipesManager'

const {
  recipes,
  diets,
  selectedId,
  selectedRecipe,
  viewMode,
  sidePanelMode,
  loading,
  saving,
  error,
  ingredientSearch,
  imageUrlDraft,
  showImageOptions,
  selectedDietIds,
  form,
  ingredientForm,
  ingredientUnits,
  initialIngredients,
  visibleIngredients,
  previewImage,
  recipeImage,
  selectRecipe,
  newRecipe,
  backToRecipeList,
  openImageOptions,
  closeImageOptions,
  applyImageUrl,
  uploadImage,
  removeInitialIngredient,
  saveInitialIngredientAmount,
  saveRecipe,
  removeRecipe,
  addIngredientFromCatalog,
  openIngredientCatalog,
  openIngredientCreate,
  saveNewIngredient,
  saveIngredientAmount,
  removeIngredient,
  ingredientName,
  ingredientUnit,
} = useRecipesManager()
</script>

<template>
  <section class="recipes-page">
    <div class="recipes-header">
      <div>
        <h1>Recipes</h1>
        <p>{{ recipes.length }} recipes</p>
      </div>

      <AddButton v-if="viewMode === 'list'" label="New recipe" @click="newRecipe" />
    </div>

    <AppState v-if="loading">Loading...</AppState>

    <RecipeList
      v-else-if="viewMode === 'list'"
      :recipes="recipes"
      :selected-id="selectedId"
      :recipe-image="recipeImage"
      @select="selectRecipe"
    />

    <form v-else class="recipe-editor" @submit.prevent="saveRecipe">
      <div class="recipe-editor-body">
        <main class="recipe-content-panel">
          <div class="recipe-title-row">
            <RecipeImagePicker
              v-model:image-url="imageUrlDraft"
              :preview-image="previewImage"
              :show-options="showImageOptions"
              @toggle="openImageOptions"
              @close="closeImageOptions"
              @upload="uploadImage"
              @apply-url="applyImageUrl"
            />

            <div class="recipe-title-fields">
              <label>Name</label>
              <input v-model="form.name" required />
            </div>
          </div>

          <section class="recipe-text-editor">
            <label>Recipe text</label>
            <textarea v-model="form.content" class="recipe-text" rows="14" />
          </section>

          <p v-if="selectedRecipe" class="recipe-summary">
            {{ selectedRecipe.total_calories }} kcal · {{ selectedRecipe.total_cost }} cost
          </p>
        </main>

        <aside class="recipe-side-panel">
          <RecipeIngredientPanel
            v-if="sidePanelMode === 'ingredients'"
            :selected-recipe="selectedRecipe"
            :initial-ingredients="initialIngredients"
            :ingredient-name="ingredientName"
            :ingredient-unit="ingredientUnit"
            @add="openIngredientCatalog"
            @remove="removeIngredient"
            @remove-initial="removeInitialIngredient"
            @update-amount="saveIngredientAmount"
            @update-initial-amount="saveInitialIngredientAmount"
          />

          <RecipeIngredientCatalog
            v-else-if="sidePanelMode === 'catalog'"
            v-model:search="ingredientSearch"
            v-model:selected-diet-ids="selectedDietIds"
            :ingredients="visibleIngredients"
            :diets="diets"
            :saving="saving"
            @back="sidePanelMode = 'ingredients'"
            @create="openIngredientCreate"
            @add="addIngredientFromCatalog"
          />

          <RecipeIngredientCreatePanel
            v-else
            :ingredient="ingredientForm"
            :units="ingredientUnits"
            :saving="saving"
            @back="openIngredientCatalog"
            @save="saveNewIngredient"
          />
        </aside>
      </div>

      <AppState v-if="error" error>{{ error }}</AppState>

      <div class="recipe-editor-actions">
        <AppButton type="button" @click="backToRecipeList">Back to list</AppButton>

        <TrashButton
          v-if="selectedRecipe"
          label="Delete recipe"
          :disabled="saving"
          @click="removeRecipe"
        />

        <SaveButton type="submit" :disabled="saving" :label="saving ? 'Saving...' : 'Save'" />
      </div>
    </form>
  </section>
</template>

<style scoped>
.recipes-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.recipes-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 8px;
  padding: 18px 20px;
}

.recipes-header h1,
.recipes-header p,
.recipe-summary {
  margin: 0;
}

.recipes-header p,
.recipe-summary {
  color: var(--muted);
}

.recipe-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recipe-editor-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 520px);
  gap: 24px;
}

.recipe-content-panel,
.recipe-side-panel {
  box-sizing: border-box;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 8px;
  padding: 20px;
}

.recipe-content-panel,
.recipe-side-panel,
.recipe-text-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recipe-title-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 16px;
  align-items: flex-start;
}

.recipe-title-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: var(--muted);
  font-size: 14px;
}

input,
textarea {
  box-sizing: border-box;
  width: 100%;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  font: inherit;
  min-height: 44px;
}

.recipe-text {
  min-height: 320px;
  resize: vertical;
}

.recipe-editor-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 8px;
  padding: 14px 20px;
}

.recipe-editor-actions :deep(.save-button) {
  margin-left: auto;
}

@media (max-width: 980px) {
  .recipe-editor-body {
    grid-template-columns: 1fr;
  }

  .recipe-editor-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .recipes-page {
    gap: 14px;
  }

  .recipes-header,
  .recipe-content-panel,
  .recipe-side-panel,
  .recipe-editor-actions {
    padding: 14px;
  }

  .recipes-header {
    align-items: center;
  }

  .recipe-title-row {
    grid-template-columns: 1fr;
  }

  .recipe-text {
    min-height: 220px;
  }

  .recipe-editor-actions {
    display: grid;
    grid-template-columns: 44px 1fr;
    align-items: center;
  }

  .recipe-editor-actions :deep(.app-button) {
    grid-column: 1 / -1;
  }

  .recipe-editor-actions :deep(.save-button) {
    margin-left: 0;
    justify-self: end;
  }
}
</style>
