<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h1>FitFuel</h1>
        <h2>Register</h2>
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
          <button type="submit" class="btn-primary">Register</button>
          <p class="auth-link">Already have an account? <a href="#" @click.prevent="$emit('show-login')">Login</a></p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Register',
  emits: ['register', 'show-login'],
  setup(props, { emit }) {
    const email = ref('')
    const password = ref('')
    const error = ref('')

    const handleSubmit = async () => {
      error.value = ''
      try {
        await emit('register', email.value, password.value)
      } catch (err) {
        error.value = err.message || 'Registration failed'
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
