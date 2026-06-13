<script setup lang="ts">
import { ref } from "vue"

import LoginForm from "./LoginForm.vue"
import RegisterForm from "./RegisterForm.vue"

const register = ref(false)
</script>

<template>

  <div class="page">

    <div class="card">

      <h1>MealList</h1>

      <p class="subtitle">
        Plan meals smarter
      </p>

      <LoginForm v-if="!register"/>

      <RegisterForm
        v-else
        @registered="register = false"
      />

      <div class="footer">

        <template v-if="!register">

          Don't have an account?

          <button
            class="link"
            @click="register=true">

            Register

          </button>

        </template>

        <template v-else>

          Already have an account?

          <button
            class="link"
            @click="register=false">

            Login

          </button>

        </template>

      </div>

    </div>

  </div>

</template>

<style scoped>

.page{

  height:100vh;

  display:flex;

  justify-content:center;

  align-items:center;

  background:var(--bg);

}

.card{

  width:420px;

  background:var(--card);

  border:1px solid var(--border);

  border-radius:14px;

  padding:40px;

  box-shadow:
    0 8px 30px rgba(0,0,0,.25);

}

h1{

  margin:0;

  text-align:center;

}

.subtitle{

  margin-top:8px;
  margin-bottom:30px;

  text-align:center;

  color:var(--muted);

}

.footer{

  margin-top:28px;

  text-align:center;

  color:var(--muted);

}

.link{

  border:none;

  background:none;

  color:#4F8EF7;

  cursor:pointer;

  margin-left:6px;

  font-size:inherit;

}

.link:hover{

  text-decoration:underline;

}

</style>
