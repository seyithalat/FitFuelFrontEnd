<template>
  <div class="admin-section">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h2>Meal Oversight</h2>
      <button class="btn-secondary" @click="$emit('back')">← Back to Dashboard</button>
    </div>
    <div class="workout-card">
      <div v-if="meals.length === 0">No meals found</div>
      <div v-for="meal in meals" :key="meal.meal_id">
        <div v-for="item in (meal.meal_items || meal.mealitems || [])" :key="item.meal_item_id || item.id" class="exercise-item">
          <div style="flex: 1;">
            <div class="exercise-name">{{ (item.foods || item.food || {}).name || 'Food' }}</div>
            <div class="exercise-details">
              User ID: {{ meal.user_id }} | 
              Date: {{ formatDate(meal.date) }} | 
              Quantity: {{ item.quantity }}g
            </div>
          </div>
          <button class="btn-danger" @click="deleteMeal(meal.meal_id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from '../../services/api'

export default {
  name: 'MealOversight',
  emits: ['back'],
  setup() {
    const meals = ref([])

    const loadMeals = async () => {
      try {
        meals.value = await api.getAdminMeals()
      } catch (err) {
        console.error('Error loading meals:', err)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const deleteMeal = async (mealId) => {
      if (!confirm('Are you sure you want to delete this meal?')) return
      try {
        await api.deleteAdminMeal(mealId)
        await loadMeals()
      } catch (err) {
        alert('Failed to delete meal')
      }
    }

    onMounted(loadMeals)

    return {
      meals,
      formatDate,
      deleteMeal
    }
  }
}
</script>
