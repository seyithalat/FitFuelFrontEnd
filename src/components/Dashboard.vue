<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h2>Dashboard</h2>
        <p class="page-subtitle">Welcome back, {{ userEmail }}!</p>
      </div>
    </div>
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-icon">💪</div>
        <div class="stat-info">
          <h3>Last Workout</h3>
          <p>{{ lastWorkout }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🍽️</div>
        <div class="stat-info">
          <h3>Meals Today</h3>
          <p>{{ mealsToday }}</p>
        </div>
      </div>
    </div>
    <div class="quick-actions">
      <h3>Quick Actions</h3>
      <div class="action-buttons">
        <button class="action-btn" @click="$emit('navigate', 'workouts')">
          <span>➕</span>
          <span>Create Workout</span>
        </button>
        <button class="action-btn" @click="$emit('navigate', 'meals')">
          <span>🍽️</span>
          <span>Log Meal</span>
        </button>
        <button class="action-btn" @click="$emit('navigate', 'ai')">
          <span>🤖</span>
          <span>Generate AI Workout</span>
        </button>
        <button class="action-btn" @click="$emit('navigate', 'ai')">
          <span>🍳</span>
          <span>Generate AI Recipe</span>
        </button>
        <button class="action-btn" @click="$emit('navigate', 'calendar')">
          <span>📅</span>
          <span>View Calendar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api, getCurrentUser } from '../services/api'

export default {
  name: 'Dashboard',
  emits: ['navigate'],
  setup() {
    const userEmail = ref('User')
    const lastWorkout = ref('No workouts yet')
    const mealsToday = ref(0)

    const loadData = async () => {
      const user = getCurrentUser()
      if (!user) return

      userEmail.value = user.email || 'User'

      try {
        // Load workouts
        const workouts = await api.getWorkouts()
        const userWorkouts = workouts.filter(w => w.user_id === user.user_id)
        const last = userWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        
        if (last) {
          lastWorkout.value = new Date(last.date).toLocaleDateString()
        }

        // Load meals
        const meals = await api.getMeals()
        const userMeals = meals.filter(m => m.user_id === user.user_id)
        const today = new Date().toDateString()
        const todayMeals = userMeals.filter(m => {
          const mealDate = new Date(m.date).toDateString()
          return mealDate === today
        })
        mealsToday.value = todayMeals.length
      } catch (error) {
        console.error('Error loading dashboard:', error)
      }
    }

    onMounted(loadData)

    return {
      userEmail,
      lastWorkout,
      mealsToday
    }
  }
}
</script>
