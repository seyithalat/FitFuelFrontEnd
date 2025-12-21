<template>
  <div class="page-content">
    <div class="page-header">
      <h2>Admin Dashboard</h2>
    </div>
    <div v-if="loading" style="text-align: center; padding: 2rem;">Loading...</div>
    <div v-else-if="currentView === 'dashboard'" class="admin-content">
      <!-- Stats Overview -->
      <div class="dashboard-grid" style="margin-bottom: 2rem;">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>Total Users</h3>
            <p>{{ stats.totalUsers }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💪</div>
          <div class="stat-info">
            <h3>Total Workouts</h3>
            <p>{{ stats.totalWorkouts }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🍽️</div>
          <div class="stat-info">
            <h3>Total Meals</h3>
            <p>{{ stats.totalMeals }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <h3>Exercises</h3>
            <p>{{ stats.totalExercises }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🥗</div>
          <div class="stat-info">
            <h3>Foods</h3>
            <p>{{ stats.totalFoods }}</p>
          </div>
        </div>
      </div>

      <!-- Admin Sections -->
      <div class="admin-sections">
        <div class="admin-section-card" @click="currentView = 'users'">
          <h3>👥 User Management</h3>
          <p>View, edit, and manage all users</p>
        </div>
        <div class="admin-section-card" @click="currentView = 'workouts'">
          <h3>💪 Workout Oversight</h3>
          <p>View and manage all workouts</p>
        </div>
        <div class="admin-section-card" @click="currentView = 'meals'">
          <h3>🍽️ Meal Oversight</h3>
          <p>View and manage all meals</p>
        </div>
        <div class="admin-section-card" @click="currentView = 'exercises'">
          <h3>📝 Exercise Management</h3>
          <p>Add, edit, and remove exercises</p>
        </div>
        <div class="admin-section-card" @click="currentView = 'foods'">
          <h3>🥗 Food Management</h3>
          <p>Add, edit, and remove foods</p>
        </div>
      </div>

      <!-- Most Active Users -->
      <div v-if="stats.mostActiveUsers && stats.mostActiveUsers.length > 0" style="margin-top: 2rem;">
        <h3>Most Active Users</h3>
        <div class="workout-card">
          <div v-for="(user, index) in stats.mostActiveUsers" :key="user.user_id" class="exercise-item">
            <div>
              <div class="exercise-name">{{ index + 1 }}. {{ user.email }}</div>
              <div class="exercise-details">{{ user.workout_count || 0 }} workouts, {{ user.meal_count || 0 }} meals</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Management -->
    <UserManagement v-else-if="currentView === 'users'" @back="currentView = 'dashboard'" />

    <!-- Workout Oversight -->
    <WorkoutOversight v-else-if="currentView === 'workouts'" @back="currentView = 'dashboard'" />

    <!-- Meal Oversight -->
    <MealOversight v-else-if="currentView === 'meals'" @back="currentView = 'dashboard'" />

    <!-- Exercise Management -->
    <ExerciseManagement v-else-if="currentView === 'exercises'" @back="currentView = 'dashboard'" />

    <!-- Food Management -->
    <FoodManagement v-else-if="currentView === 'foods'" @back="currentView = 'dashboard'" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import UserManagement from './admin/UserManagement.vue'
import WorkoutOversight from './admin/WorkoutOversight.vue'
import MealOversight from './admin/MealOversight.vue'
import ExerciseManagement from './admin/ExerciseManagement.vue'
import FoodManagement from './admin/FoodManagement.vue'

export default {
  name: 'Admin',
  components: {
    UserManagement,
    WorkoutOversight,
    MealOversight,
    ExerciseManagement,
    FoodManagement
  },
  setup() {
    const loading = ref(false)
    const currentView = ref('dashboard')
    const stats = ref({
      totalUsers: 0,
      totalWorkouts: 0,
      totalMeals: 0,
      totalExercises: 0,
      totalFoods: 0,
      mostActiveUsers: []
    })

    const getCount = (statsData, ...possibleKeys) => {
      if (statsData?.totals) {
        for (const key of possibleKeys) {
          const value = statsData.totals[key]
          if (value !== undefined && value !== null) {
            if (typeof value === 'number') return value
            if (Array.isArray(value)) return value.length
          }
        }
      }
      
      for (const key of possibleKeys) {
        const value = statsData?.[key]
        if (value !== undefined && value !== null) {
          if (typeof value === 'number') return value
          if (Array.isArray(value)) return value.length
        }
      }
      return 0
    }

    const loadStats = async () => {
      loading.value = true
      try {
        const data = await api.getAdminStats()
        stats.value = {
          totalUsers: getCount(data, 'users', 'total_users', 'totalUsers', 'users_count', 'usersCount'),
          totalWorkouts: getCount(data, 'workouts', 'total_workouts', 'totalWorkouts', 'workouts_count', 'workoutsCount'),
          totalMeals: getCount(data, 'meals', 'total_meals', 'totalMeals', 'meals_count', 'mealsCount'),
          totalExercises: getCount(data, 'exercises', 'total_exercises', 'totalExercises', 'exercises_count', 'exercisesCount'),
          totalFoods: getCount(data, 'foods', 'total_foods', 'totalFoods', 'foods_count', 'foodsCount'),
          mostActiveUsers: data.most_active_users || []
        }
      } catch (err) {
        console.error('Error loading admin stats:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(loadStats)

    return {
      loading,
      currentView,
      stats
    }
  }
}
</script>

<style scoped>
.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.admin-section-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px var(--shadow);
}

.admin-section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.admin-section-card h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.admin-section-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style>
