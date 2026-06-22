<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

defineProps<{
  previewImage: string
  showOptions: boolean
}>()

const imageUrl = defineModel<string>('imageUrl', { required: true })
const fileInput = ref<HTMLInputElement | null>(null)

defineEmits<{
  toggle: []
  upload: [event: Event]
  applyUrl: []
}>()

function chooseFile() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="recipe-image-control">
    <button type="button" class="recipe-image-preview" @click="$emit('toggle')">
      <img v-if="previewImage" :src="previewImage" alt="" />
      <span v-else>Image</span>
    </button>

    <div v-if="showOptions" class="image-options">
      <input
        ref="fileInput"
        class="image-file-input"
        type="file"
        accept="image/*"
        @change="$emit('upload', $event)"
      />

      <AppButton @click="chooseFile">Upload image</AppButton>

      <div class="image-url-row">
        <input v-model="imageUrl" placeholder="Image URL" />
        <AppButton @click="$emit('applyUrl')">Use URL</AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipe-image-control {
  position: relative;
}

.recipe-image-preview {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--muted);
  border-radius: 50%;
  padding: 0;
  font-size: 13px;
  cursor: pointer;
}

.recipe-image-preview:hover {
  border-color: #4f8ef7;
}

.recipe-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-options {
  position: absolute;
  z-index: 2;
  top: 82px;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(360px, 70vw);
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
}

.image-file-input {
  display: none;
}

.image-url-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

input {
  box-sizing: border-box;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  padding: 10px;
  font: inherit;
}

input {
  width: 100%;
}
</style>
