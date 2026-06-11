<script setup lang="ts">
import { ref } from "vue"
import { createUser } from "@/api/users"

const emit = defineEmits<{
  registered: []
}>()

const username = ref("")
const email = ref("")
const password = ref("")
const loading = ref(false)
const error = ref("")

async function submit() {
  error.value = ""
  loading.value = true

  try {
    await createUser({
      username: username.value || null,
      email: email.value,
      password: password.value,
    })
    emit("registered")
  } catch {
    error.value = "Registration failed"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <label>Username</label>

    <input
      v-model="username"
      autocomplete="username"
      placeholder="john"
    />

    <label>Email</label>

    <input
      v-model="email"
      type="email"
      autocomplete="email"
      placeholder="john@example.com"
      required
    />

    <label>Password</label>

    <input
      v-model="password"
      type="password"
      autocomplete="new-password"
      placeholder="••••••••"
      required
    />

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <button :disabled="loading">
      {{ loading ? "Creating account..." : "Register" }}
    </button>
  </form>

</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

label {
  font-size: 14px;
  color: var(--muted);
}

input {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
}

input:focus {
  outline: none;
  border-color: #4f8ef7;
}

button {
  margin-top: 10px;
  border: none;
  border-radius: 8px;
  background: #4f8ef7;
  color: white;
  padding: 12px;
  font-size: 15px;
  cursor: pointer;
}

button:hover {
  background: #3d7ce7;
}

button:disabled {
  opacity: 0.7;
}

.error {
  color: #ff6b6b;
  font-size: 14px;
}
</style>
