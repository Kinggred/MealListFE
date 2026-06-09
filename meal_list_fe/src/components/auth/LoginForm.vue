<script setup lang="ts">
import { ref } from "vue"
import { useAuthStore } from "../../stores/auth"

const auth = useAuthStore()

const email = ref("")
const password = ref("")
const loading = ref(false)
const error = ref("")

async function submit() {
  error.value = ""
  loading.value = true

  try {
    await auth.loginUser({
      email: email.value,
      password: password.value,
    })
  } catch {
    error.value = "Invalid email or password"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="form" @submit.prevent="submit">

    <label>Email</label>

    <input
      v-model="email"
      type="email"
      placeholder="john@example.com"
    />

    <label>Password</label>

    <input
      v-model="password"
      type="password"
      placeholder="••••••••"
    />

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <button :disabled="loading">
      {{ loading ? "Signing in..." : "Login" }}
    </button>

  </form>
</template>

<style scoped>

.form{
  display:flex;
  flex-direction:column;
  gap:14px;
}

label{
  font-size:14px;
  color:var(--muted);
}

input{
  background:var(--bg);
  color:var(--text);

  border:1px solid var(--border);

  border-radius:8px;

  padding:12px;
  font-size:15px;
}

input:focus{
  outline:none;
  border-color:#4F8EF7;
}

button{

  margin-top:10px;

  border:none;

  border-radius:8px;

  background:#4F8EF7;

  color:white;

  padding:12px;

  font-size:15px;

  cursor:pointer;
}

button:hover{
  background:#3d7ce7;
}

button:disabled{
  opacity:.7;
}

.error{
  color:#ff6b6b;
  font-size:14px;
}

</style>
