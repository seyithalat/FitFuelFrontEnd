<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h1>FitFuel</h1>
        <h2>Login</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required>
          </div>
          <div class="error-message">{{ error }}</div>
          <button type="submit" class="btn-primary">Login</button>
          <p class="auth-link">Don't have an account? <a href="#" @click.prevent="$emit('show-register')">Register</a></p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Login',
  emits: ['login', 'show-register'],
  setup(props, { emit }) {
    const email = ref('')
    const password = ref('')
    const error = ref('')

    const handleSubmit = async () => {
      error.value = ''
      try {
        await emit('login', email.value, password.value)
      } catch (err) {
        error.value = err.message || 'Login failed'
      }
    }

    return {
      email,
      password,
      error,
      handleSubmit
    }
  }
}
</script>
