<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{
  previewImage: string
  showOptions: boolean
}>()

const imageUrl = defineModel<string>('imageUrl', { required: true })
const control = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const emit = defineEmits<{
  toggle: []
  close: []
  upload: [event: Event]
  applyUrl: []
}>()

function chooseFile() {
  fileInput.value?.click()
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!control.value || control.value.contains(event.target as Node)) return
  emit('close')
}

watch(
  () => props.showOptions,
  (showOptions) => {
    if (showOptions) {
      document.addEventListener('pointerdown', handleDocumentPointerDown)
    } else {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
    }
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})
</script>

<template>
  <div ref="control" class="recipe-image-control">
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

      <AppButton type="button" @click="chooseFile">Upload image</AppButton>

      <div class="image-url-row">
        <input v-model="imageUrl" placeholder="Image URL" />
        <AppButton type="button" @click="$emit('applyUrl')">Use URL</AppButton>
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
  min-height: 44px;
}

input {
  width: 100%;
}

@media (max-width: 640px) {
  .recipe-image-control {
    width: 100%;
  }

  .image-options {
    position: static;
    width: 100%;
    margin-top: 10px;
    box-shadow: none;
  }

  .image-url-row {
    grid-template-columns: 1fr;
  }
}
</style>
